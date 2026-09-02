/**
 * 学习闭环服务（v2，实施计划 V2-M1b）
 *
 * 设计依据：docs/digital-twin-design-v2.html §3
 * - 信号分类：纠正 / 否决 / 事实更正 / 影子差异
 * - 证据权重门槛：同类指纹累计 ≥ N（默认 3）或主人显式归因才升格候选
 * - 流水线：捕获 → 候选生成 → 主人确认 → 回归门禁 → 入卡
 * - 一切入卡 = 主人签名 + 回归通过；单次信号永远只是「观察」
 *
 * 存储：$DSH_HOME/dsh-twin/learning-events.json（事件流水，只增不删）
 *       $DSH_HOME/dsh-twin/learning-candidates.json（候选池，每条带修订快照）
 *       $DSH_HOME/dsh-twin/exemplar-drafts.json（V2-M2a 样例候选池，本阶段预留）
 *
 * 入口纯函数 + IO 分离：所有晋升判定在 enqueue() 完成；落盘与候选生成
 * 分两步走，便于契约测试锁定判定不变量。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { dshHome, normalizePersonaLine, normalizePersonaText } from './sanitize.ts'

/* ── 信号 ── */

export type SignalKind = '纠正' | '否决' | '事实更正' | '影子差异'
export type LearningStatus = '观察' | '候选修订' | '已入卡' | '已驳回'
export type TargetKind = '样例卡' | '策略卡' | '记忆'

export interface LearningEvent {
  id: string
  ts: string
  kind: SignalKind
  /** 归一化后的信号要点（用作同类聚合的指纹） */
  sig: string
  /** 影响的卡/记忆目标 */
  target: TargetKind
  /** 关联引用（被否决的 record id / 纠正的对话摘要 / 样例指纹等） */
  ref?: string
  /** 权重：单次 = 1，每次同类累计 +1（达到 N 时晋升） */
  weight: number
  /** 主人显式归因（一次即晋升） */
  by: string
  status: LearningStatus
  /** 晋升后绑定：候选修订 id / 入卡版本号 */
  candidateId?: string
  appliedAt?: string
}

export interface LearningStore {
  events: LearningEvent[]
}

const DEFAULT_N: Record<SignalKind, number> = {
  纠正: 3,
  否决: 2,
  事实更正: 1,
  影子差异: 5,
}

/** 指纹归一：NFC → 去标点空格 → 折叠空白 → 截断。幂等。 */
export function fingerprint(input: unknown): string {
  const s = normalizePersonaLine(input)
  // 去标点 + 折叠空白（去标点后产生的连续空格也要折叠一次）
  return s.replace(/[\p{P}\p{S}]/gu, '').replace(/\s+/g, '').slice(0, 80)
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function eventsPath(): string {
  return join(dshHome(), 'dsh-twin', 'learning-events.json')
}

function candidatesPath(): string {
  return join(dshHome(), 'dsh-twin', 'learning-candidates.json')
}

export function loadEvents(): LearningStore {
  const p = eventsPath()
  if (!existsSync(p)) return { events: [] }
  try {
    const s = JSON.parse(readFileSync(p, 'utf8')) as LearningStore
    return Array.isArray(s.events) ? s : { events: [] }
  } catch {
    try { renameSync(p, `${p}.corrupt-${Date.now()}`) } catch { /* 备份失败 */ }
    return { events: [] }
  }
}

export function saveEvents(store: LearningStore): void {
  const p = eventsPath()
  mkdirSync(dirname(p), { recursive: true })
  const tmp = `${p}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, p)
}

export interface LearningCandidate {
  id: string
  kind: TargetKind
  /** 关联的事件 id（创建候选时记录的若干事件 id） */
  eventIds: string[]
  /** 候选正文（已按目标格式规整）：样例卡对照例 / 策略卡修订 / 记忆替代 */
  payload: ExemplarCandidate | PolicyCandidate | MemoryCandidate
  status: LearningStatus
  createdAt: string
  /** 主人确认时间 */
  confirmedAt?: string
  /** 回归通过报告 id（v1 已有）；通过即入卡 */
  regressionReportId?: string
  /** 入卡时间 */
  appliedAt?: string
}

export interface ExemplarCandidate {
  situation: string
  say: string
  avoidSay: string
  source: '纠正' | '语料'
  sourceRef?: string
}

export interface PolicyCandidate {
  /** 修订类型：新增 / 修改 / 废弃 */
  op: '新增' | '修改' | '废弃'
  id?: string
  when?: string
  act?: string
  escalate?: string
  enabled?: boolean
}

export interface MemoryCandidate {
  op: '替代' | '新增'
  memoryId?: string
  content?: string
  statementType?: string
  source?: string
}

export interface CandidateStore {
  candidates: LearningCandidate[]
}

export function loadCandidates(): CandidateStore {
  const p = candidatesPath()
  if (!existsSync(p)) return { candidates: [] }
  try {
    const s = JSON.parse(readFileSync(p, 'utf8')) as CandidateStore
    return Array.isArray(s.candidates) ? s : { candidates: [] }
  } catch {
    try { renameSync(p, `${p}.corrupt-${Date.now()}`) } catch { /* 备份失败 */ }
    return { candidates: [] }
  }
}

export function saveCandidates(store: CandidateStore): void {
  const p = candidatesPath()
  mkdirSync(dirname(p), { recursive: true })
  const tmp = `${p}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, p)
}

/* ── 入队 + 指纹聚合 + 晋升（纯层：决议；不落盘） ── */

export interface EnqueueInput {
  kind: SignalKind
  /** 原始信号文本（用于指纹与候选 situation） */
  signal: string
  target: TargetKind
  /** 关联引用 */
  ref?: string
  /** 主人显式归因：true = 一次即晋升；缺省按同类累计门槛 */
  explicitAttribution?: boolean
  by: string
  /** 自定义该类门槛（缺省 = DEFAULT_N[kind]） */
  threshold?: number
}

export interface EnqueueResult {
  event: LearningEvent
  /** 到达门槛时随事件一并生成的候选（仅在晋升时存在） */
  candidate?: LearningCandidate
}

/**
 * 入队：归一化指纹 → 命中已有同类 → 权重+1 → 达到门槛 → 生成候选。
 * 显式归因可绕过门槛一次晋升。事件只增不删，候选独立存储可由主人确认/驳回。
 */
export function enqueue(input: EnqueueInput, existing: LearningStore, existingCandidates: CandidateStore): EnqueueResult {
  const sig = fingerprint(input.signal)
  if (sig === '') throw new Error('learning signal 指纹为空')
  // target 缺省 = 样例卡（纠正→样例卡 是设计的默认路由）
  const target: TargetKind = input.target ?? '样例卡'
  const threshold = input.threshold ?? DEFAULT_N[input.kind]
  const explicit = input.explicitAttribution === true
  // 同类判定：指纹相等（已归一）+ 同一 target
  const sameFamily = existing.events.filter(e => e.sig === sig && e.target === target && e.status !== '已驳回')
  const maxWeight = sameFamily.reduce((m, e) => Math.max(m, e.weight), 0)
  const weight = maxWeight + 1
  const reachesThreshold = explicit || sameFamily.length + 1 >= threshold

  const event: LearningEvent = {
    id: genId('LE'),
    ts: new Date().toISOString(),
    kind: input.kind,
    sig,
    target,
    ...(input.ref !== undefined && input.ref !== '' ? { ref: input.ref.slice(0, 200) } : {}),
    weight,
    by: input.by,
    status: reachesThreshold ? '候选修订' : '观察',
  }
  existing.events.push(event)

  let createdCandidate: LearningCandidate | undefined
  if (reachesThreshold) {
    const candidate = buildCandidate(event, sig, target, input)
    createdCandidate = candidate
    event.candidateId = candidate.id
    existingCandidates.candidates.push(candidate)
    // 已有同类事件全部标 associated
    // 把已有同类事件一并关联到这个候选并升级状态（apply 时一起升级为已入卡）
    for (const e of sameFamily) {
      e.status = '候选修订'
      e.candidateId = candidate.id
    }
  }
  return { event, ...(createdCandidate !== undefined ? { candidate: createdCandidate } : {}) }
}

/** 按事件与目标类型生成候选（v1 风格：先产生最低骨架；M2/M3 填充说人话的字段） */
function buildCandidate(event: LearningEvent, sig: string, target: TargetKind, input: EnqueueInput): LearningCandidate {
  const payload: ExemplarCandidate | PolicyCandidate | MemoryCandidate =
    target === '样例卡'
      ? { situation: sig, say: '', avoidSay: '', source: input.kind === '纠正' ? '纠正' : '语料', ...(input.ref !== undefined ? { sourceRef: input.ref } : {}) }
      : target === '策略卡'
        ? { op: '新增', when: sig, act: '', enabled: true }
        : { op: '替代', ...(input.ref !== undefined ? { memoryId: input.ref } : {}) }
  return {
    id: genId('LC'),
    kind: target,
    eventIds: [event.id],
    payload,
    status: '候选修订',
    createdAt: event.ts,
  }
}

/** 主人确认候选：标记 confirmedAt + 回归报告 id；不直接入卡——回归门禁由 confirmCandidate 评估。 */
export function confirmCandidate(candidateId: string, by: string, candidates: CandidateStore): LearningCandidate | undefined {
  const c = candidates.candidates.find(x => x.id === candidateId)
  if (c === undefined) return undefined
  if (c.status === '已入卡' || c.status === '已驳回') return c
  c.confirmedAt = new Date().toISOString()
  return c
}

/** 驳回候选 + 标记事件状态 */
export function rejectCandidate(candidateId: string, candidates: CandidateStore, events: LearningStore): LearningCandidate | undefined {
  const c = candidates.candidates.find(x => x.id === candidateId)
  if (c === undefined) return undefined
  c.status = '已驳回'
  // 同类此前被关联到本候选的事件一并驳回（candidateId 匹配，含 eventIds）
  for (const e of events.events) {
    if (e.candidateId === c.id || c.eventIds.includes(e.id)) e.status = '已驳回'
  }
  return c
}

/** 入卡：仅在 confirmedAt + regressionReportId 齐备时生效；否则仍保持候选修订。 */
export function applyCandidate(
  candidateId: string,
  regressionReportId: string,
  candidates: CandidateStore,
  events: LearningStore,
): LearningCandidate | undefined {
  const c = candidates.candidates.find(x => x.id === candidateId)
  if (c === undefined) return undefined
  if (c.status !== '候选修订') return undefined
  if (c.confirmedAt === undefined) return c // 未确认：原样返回（未入卡），由路由层提示
  if (regressionReportId.trim() === '') return undefined // 缺回归报告：硬拒绝
  c.status = '已入卡'
  c.regressionReportId = regressionReportId
  c.appliedAt = new Date().toISOString()
  // 所有同类此前晋升的事件（candidateId 已被设置为此候选）一起升级为已入卡
  for (const e of events.events) {
    if (e.candidateId === c.id) {
      e.status = '已入卡'
      e.appliedAt = c.appliedAt
    }
  }
  return c
}

/* ── 查询 ── */

export interface LearningQuery {
  status?: LearningStatus
  limit?: number
}

export function listEvents(q: LearningQuery = {}): LearningEvent[] {
  const store = loadEvents()
  return store.events
    .filter(e => (q.status !== undefined ? e.status === q.status : true))
    .slice(-(q.limit ?? 50))
}

export function listCandidates(): LearningCandidate[] {
  return loadCandidates().candidates.slice(-50)
}