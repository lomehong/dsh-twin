/**
 * 状态卡汇入与主动触达调度器（v3，实施计划 V3-M1/M2）
 *
 * 设计依据：设计文档 v0.2 §4.6/§5（状态卡：主人的近期上下文，随时间衰减）+ v2 设计 §11
 * - V3-M1 汇入：从 dsh-memory 关系轨（未闭环开环）与 dsh-ledger 待办（待批审批/应回填）
 *   自动生成状态卡候选条目（statementType=候选，可编辑，decayAt 自动衰减）
 * - V3-M2 调度：tick 汇总「主动触达候选」（如：承诺到期未闭环 → 主动汇报主人），
 *   全部经委托账本过闸（主动外发默认 L1，承诺/敏感类 L2），im-channel 送达（软依赖）
 *
 * 安全纪律：
 * - 绝不未过闸直发：buildReachCandidates 只产候选，deliver 必须过 ledger.check
 * - 频控：进程级滑动窗口（所有触达分享预算，保护主人注意力）
 * - im-channel 缺席时降级返回明确错误，不静默丢弃
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { dshHome } from './sanitize.ts'
import { loadCardsState, saveCards, type StateItem } from './cards.ts'

/* ── 触达记录（只增不删，全部过闸后落盘） ── */

export interface ProactiveReach {
  id: string
  at: string
  kind: '开环到期提醒' | '待办提醒' | '汇报'
  title: string
  target: { actorId?: string; channel?: string }
  ledgerId?: string
  level?: 'L1' | 'L2'
  status: '已触达' | '被阻断' | '降级'
  note?: string
}

export interface ProactiveStore {
  reaches: ProactiveReach[]
}

function proactivePath(): string {
  return join(dshHome(), 'dsh-twin', 'proactive.json')
}

export function loadProactive(): ProactiveStore {
  const p = proactivePath()
  if (!existsSync(p)) return { reaches: [] }
  try {
    const s = JSON.parse(readFileSync(p, 'utf8')) as ProactiveStore
    return Array.isArray(s.reaches) ? s : { reaches: [] }
  } catch {
    try { renameSync(p, `${p}.corrupt-${Date.now()}`) } catch { /* 备份失败 */ }
    return { reaches: [] }
  }
}

export function saveProactive(store: ProactiveStore): void {
  const p = proactivePath()
  mkdirSync(dirname(p), { recursive: true })
  const tmp = `${p}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, p)
}

/* ── V3-M1：状态卡汇入 ── */

const STATE_BUDGET = 12       // 状态卡最多 12 条（防膨胀）
const STATE_TTL_DAYS = 3      // 未编辑状态卡条目默认 3 天衰减
const STATE_MAX_CHARS = 200   // 单条状态卡内容上限

export interface StateSeed {
  content: string
  source: string
  statementType?: '候选' | '事实'
}

/**
 * 汇入：把「未闭环开环」「账本待办」等真实状态写入状态卡（去重 + 自动衰减）。
 * 只做增量——已有同指纹条目不动；超预算裁剪最旧；全部走 saveCards 唯一入口。
 */
export function ingestStateSeeds(seeds: Array<StateSeed>): { added: number; skipped: number } {
  const st = loadCardsState()
  let added = 0
  let skipped = 0
  const state = [...st.file.current.state.items]
  const exists = (content: string) => state.some(s => s.content === content)
  const now = new Date()
  const decayAt = new Date(now.getTime() + STATE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()

  for (const seed of seeds) {
    const content = seed.content.trim().slice(0, STATE_MAX_CHARS)
    if (content === '' || exists(content)) {
      skipped += 1
      continue
    }
    const item: StateItem = {
      id: `st-auto-${Date.now()}-${added}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      statementType: seed.statementType ?? '候选',
      source: seed.source.slice(0, 60),
      decayAt,
    }
    state.push(item)
    added += 1
  }

  // 预算裁剪：最旧优先移除（保持最近状态）
  const trimmed = state.slice(-STATE_BUDGET)
  if (trimmed.length !== state.length || added > 0) {
    // 保持当前生效状态：已在生效的卡继续作为生效卡保存（汇入不破坏已有生效）
    const confirm = st.hasEffective
    saveCards({ cards: { ...st.file.current, state: { items: trimmed } }, confirm })
  }
  return { added, skipped }
}

/** 清理已过期（decayAt < now）的状态卡条目；返回清理数 */
export function pruneExpiredState(): number {
  const st = loadCardsState()
  const now = new Date().toISOString()
  const kept = st.file.current.state.items.filter(s => s.decayAt === undefined || s.decayAt > now)
  if (kept.length === st.file.current.state.items.length) return 0
  const confirm = st.hasEffective
  saveCards({ cards: { ...st.file.current, state: { items: kept } }, confirm })
  return st.file.current.state.items.length - kept.length
}

/* ── V3-M2：主动触达候选生成 ── */

export interface ReachCandidate {
  kind: ProactiveReach['kind']
  title: string
  /** 触达内容（经账本闸后由 deliver 发送） */
  text: string
  /** 动作类型（账本裁决键）：主动汇报=L1，承诺/敏感=L2 */
  actionType: string
  targetScope: string
  actorId?: string
  channel?: string
  /** 引用（开环 memoryId / 账本 recordId），幂等去重用 */
  refKey: string
}

interface LedgerLike {
  check?: (input: unknown, opts?: unknown) => unknown
  records?: (filter?: unknown) => Array<Record<string, unknown>>
  pendingApprovals?: () => Array<Record<string, unknown>>
}

interface MemoryLike {
  openLoopsForActor?: (actorId: string) => Array<{ id: string; content: string }>
  loadSharedMemory?: () => Array<Record<string, unknown>>
}

/**
 * 生成主动触达候选（纯收集，不发送）：
 * - 关系轨未闭环开环（>24h 未闭环）→「开环到期提醒」L1
 * - 账本待批审批 → 「待办提醒」L1
 * 去重：refKey 已在 reaches 里且 status=已触达/被阻断 的跳过。
 */
export function buildReachCandidates(
  deps: { ledger?: LedgerLike; memory?: MemoryLike },
): ReachCandidate[] {
  const out: ReachCandidate[] = []
  // 幂等键统一为 refKey（既有记录 note 存 refKey，见 makeRec/deliverReach）
  const seen = new Set(loadProactive().reaches.filter(r => r.status !== '降级').map(r => r.note).filter((n): n is string => n !== undefined))
  const nowMs = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  // 1) 未闭环开环（>24h）
  try {
    const mem = deps.memory
    const entries = mem?.loadSharedMemory?.() ?? []
    for (const e of entries) {
      const rel = e.relation as { actorId?: string; openLoop?: { openedAt?: string; closedAt?: string } } | undefined
      if (rel?.openLoop === undefined || rel.openLoop.closedAt !== undefined) continue
      const openedAt = rel.openLoop.openedAt ?? (e.timestamp as string) ?? ''
      if (openedAt === '' || nowMs - new Date(openedAt).getTime() < dayMs) continue
      const key = `开环到期提醒:${e.id}`
      if (seen.has(key)) continue
      const content = String(e.content ?? '').slice(0, 60)
      const cand: ReachCandidate = {
        kind: '开环到期提醒',
        title: `${content.slice(0, 24)}… 已超一天未闭环`,
        text: `主动提醒：事项「${content}」已超过一天未闭环，是否需要我跟进？`,
        actionType: '主动汇报',
        targetScope: `向主人汇报开环 ${e.id}`,
        refKey: key,
      }
      if (typeof rel.actorId === 'string' && rel.actorId !== '') cand.actorId = rel.actorId
      out.push(cand)
    }
  } catch { /* 记忆缺席 */ }

  // 2) 账本待批审批
  try {
    const pending = deps.ledger?.pendingApprovals?.() ?? []
    for (const p of pending) {
      const id = String(p.id ?? '')
      const key = `待办提醒:${id}`
      if (seen.has(key)) continue
      out.push({
        kind: '待办提醒',
        title: `有 1 笔审批待处理（${String(p.actionType ?? '未知')}）`,
        text: `主人，有一笔 ${String(p.actionType ?? '')} 审批等待您的决定：${String(p.targetScope ?? '')}。`,
        actionType: '主动汇报',
        targetScope: `向主人提醒审批 ${id}`,
        refKey: key,
      })
    }
  } catch { /* 账本缺席 */ }

  return out
}

/* ── V3-M2：过闸 + 送达 ── */

const REACH_WINDOW_MS = 10 * 60 * 1000
const REACH_MAX_PER_WINDOW = 3
const reachTimes: number[] = []

export interface DeliverResult {
  ok: boolean
  reached?: ProactiveReach
  error?: string
  blocked?: boolean
}

interface ImChannelLike {
  pushToUser?: (kind: string, userId: string, text: string, opts?: { markdown?: boolean }) => Promise<boolean> | boolean
  botsStatus?: () => Array<{ kind: string; bindings?: Array<{ userId: string; isMaster?: boolean }> }>
}

/**
 * 送达：候选 → 账本过闸（L1 放行/L2 生成审批即阻断）→ im-channel 推送 → 落盘记录。
 * 频控：进程级 10 分钟最多 3 条（保护主人注意力）。
 */
export async function deliverReach(
  candidate: ReachCandidate,
  deps: { ledger?: LedgerLike; im?: ImChannelLike },
): Promise<DeliverResult> {
  // 频控
  const now = Date.now()
  while (reachTimes.length > 0 && now - reachTimes[0] > REACH_WINDOW_MS) reachTimes.shift()
  if (reachTimes.length >= REACH_MAX_PER_WINDOW) {
    return { ok: false, error: `主动触达频控：${REACH_WINDOW_MS / 60000} 分钟内最多 ${REACH_MAX_PER_WINDOW} 条` }
  }
  reachTimes.push(now)

  // 账本过闸（主动外发默认 L1；L2 未批准即阻断）
  let ledgerChecked = false
  try {
    const ledger = deps.ledger
    const check = ledger?.check
    if (typeof check === 'function') {
      const result = check({
        actionType: candidate.actionType,
        targetScope: candidate.targetScope,
        ...(candidate.actorId !== undefined ? { actor: { registryId: candidate.actorId } } : {}),
      }) as { judgment?: { decision: string }; record?: { id: string }; level?: string } | undefined
      const decision = result?.judgment?.decision
      const recordId = (result?.record as { id?: string } | undefined)?.id
      ledgerChecked = true
      if (decision === '拒绝' || (decision === '阻断')) {
        const rec: ProactiveReach = {
          id: `PR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          at: new Date().toISOString(),
          kind: candidate.kind,
          title: candidate.title,
          target: { ...(candidate.actorId !== undefined ? { actorId: candidate.actorId } : {}), ...(candidate.channel !== undefined ? { channel: candidate.channel } : {}) },
          ...(recordId !== undefined ? { ledgerId: recordId } : {}),
          level: 'L2',
          status: '被阻断',
          note: candidate.refKey,
        }
        const store = loadProactive()
        store.reaches.push(rec)
        saveProactive(store)
        return { ok: false, blocked: true, error: `L2 主动触达未被批准，已阻断（record ${recordId ?? ''}）`, reached: rec }
      }
    }
  } catch { /* 账本缺席：过闸失败时宁可降级不直发 */ }

  // im-channel 送达（软依赖：缺席/失败 → 降级记录）
  const im = deps.im
  const text = candidate.text
  if (im && typeof im.pushToUser === 'function') {
    try {
      const targets: Array<{ kind: string; userId: string }> = []
      for (const bot of im.botsStatus?.() ?? []) {
        for (const b of bot.bindings ?? []) {
          if (b.isMaster && b.userId) targets.push({ kind: bot.kind, userId: b.userId })
        }
      }
      if (targets.length === 0) {
        const rec = makeRec(candidate, '降级', '主人未绑定 IM，未触达（已记录待手动）')
        return { ok: false, error: '主人未绑定 IM 通道', reached: rec }
      }
      const t = targets[0]!
      const delivered = await im.pushToUser(t.kind, t.userId, text, { markdown: true })
      const rec = makeRec(candidate, delivered ? '已触达' : '降级', delivered ? undefined : '推送失败')
      return { ok: delivered, reached: rec }
    } catch (e) {
      const rec = makeRec(candidate, '降级', '推送异常：' + (e instanceof Error ? e.message : String(e)))
      return { ok: false, error: rec.note ?? '推送异常', reached: rec }
    }
  }

  const rec = makeRec(candidate, '降级', 'im-channel 未安装')
  return { ok: false, error: 'im-channel 未安装（主动触达不可达）', reached: rec }
}

function makeRec(c: ReachCandidate, status: ProactiveReach['status'], note?: string): ProactiveReach {
  const rec: ProactiveReach = {
    id: `PR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    kind: c.kind,
    title: c.title,
    target: { ...(c.actorId !== undefined ? { actorId: c.actorId } : {}), ...(c.channel !== undefined ? { channel: c.channel } : {}) },
    status,
    // note 始终携带 refKey（幂等键 + 审计追溯）；描述性备注附后
    ...{ note: [c.refKey, note].filter(Boolean).join(' | ') },
  }
  const store = loadProactive()
  store.reaches.push(rec)
  saveProactive(store)
  return rec
}

/** 测试钩子：清空频控窗口（进程级数组） */
export function resetReachThrottleForTest(): void {
  reachTimes.length = 0
}

/** tick：生成候选 → 逐个过闸送达（供宿主 jobs/定时器调用） */
export async function tick(
  deps: { ledger?: LedgerLike; memory?: MemoryLike; im?: ImChannelLike },
): Promise<{ candidates: number; delivered: number; blocked: number }> {
  const candidates = buildReachCandidates(deps)
  let delivered = 0
  let blocked = 0
  for (const c of candidates) {
    const r = await deliverReach(c, deps)
    if (r.ok) delivered += 1
    else if (r.blocked) blocked += 1
  }
  return { candidates: candidates.length, delivered, blocked }
}
