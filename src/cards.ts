/**
 * 四张人格卡（实施计划 T3 / 设计文档 v0.2 决策一）
 *
 * 人格不是一段描述，是四张卡：身份卡（公开/私密分级）/ 策略卡（结构化规则）
 * / 样例卡（对照式示例）/ 状态卡（自动衰减）。四张卡到系统提示词的合成是
 * 纯函数投影（见 ./projection.ts）——任何行为都能溯源到"哪张卡的哪一条"。
 *
 * 生效纪律（决策五/六）：保存产生候选修订；生效 = 主人确认 + 回归通过双条件，
 * 测试绿灯不能自动兑换成上线。每次保存生成不可变修订快照（最近 10 个）。
 *
 * 存储：$DSH_HOME/dsh-twin/cards.json（当前卡 + 状态）+ cards-history.json（修订史）。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { dshHome, normalizePersonaLine, normalizePersonaText, twinWarn } from './sanitize.ts'

/* ── 类型 ── */

export interface IdentityField {
  key: string
  value: string
  visibility: '公开' | '私密'
}

export interface PolicyRule {
  id: string
  /** 触发条件 */
  when: string
  /** 动作 */
  act: string
  /** 升级路径（触发后转人工等） */
  escalate?: string
  enabled: boolean
}

export interface Exemplar {
  id: string
  situation: string
  /** 该这么说 */
  say: string
  /** 不这么说 */
  avoidSay: string
  source: '语料' | '纠正'
  confirmedAt?: string
}

export interface StateItem {
  id: string
  content: string
  statementType: '候选' | '事实'
  source?: string
  /** 衰减时间（ISO）：到期不再注入 */
  decayAt?: string
}

export interface TwinCards {
  identity: { fields: IdentityField[] }
  policy: { rules: PolicyRule[] }
  exemplars: { items: Exemplar[] }
  state: { items: StateItem[] }
}

export type CardsStatus = '候选' | '生效'

export interface CardsFile {
  current: TwinCards
  revisionNo: number
  status: CardsStatus
  /** 生效 = 主人确认 + 回归通过；两者缺一即停留在候选 */
  confirmedAt?: string
  regressionReportId?: string
  /** v0.2 迁移来源标记 */
  migratedFrom?: 'twin-config.json'
}

export interface CardsRevision {
  revisionNo: number
  ts: string
  confirmed: boolean
  regressionPassed: boolean
  cards: TwinCards
}

/* ── 归一化（白名单 + 清洗；防提示注入：行首 # 中和、控制字符清除、长度上限） ── */

/** 卡字段额外防线：normalizePersonaText 的尾部 trim 会让首行 # 中和失效，这里对整串再剥一次行首井号 */
function stripLeadingHash(s: string): string {
  return s.replace(/^#{1,6}\s*/, '')
}

function cleanMulti(input: unknown, max: number): string {
  return stripLeadingHash(normalizePersonaText(input)).slice(0, max)
}

function sanitizeId(input: unknown, prefix: string, index: number): string {
  const s = normalizePersonaLine(input).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)
  return s !== '' ? s : `${prefix}-${index + 1}`
}

/** 归一化整份卡（幂等；未知键丢弃——向前兼容由版本号管理） */
export function normalizeCards(input: unknown): TwinCards {
  const out: TwinCards = {
    identity: { fields: [] },
    policy: { rules: [] },
    exemplars: { items: [] },
    state: { items: [] },
  }
  if (input === null || typeof input !== 'object') return out
  const src = input as Record<string, unknown>

  if (src.identity !== null && typeof src.identity === 'object') {
    const fields = (src.identity as { fields?: unknown }).fields
    if (Array.isArray(fields)) {
      fields.slice(0, 20).forEach((f, i) => {
        if (f === null || typeof f !== 'object') return
        const rec = f as Record<string, unknown>
        const value = (typeof rec.value === 'string' ? stripLeadingHash(normalizePersonaText(rec.value)) : '').slice(0, 2000)
        const rawKey = normalizePersonaLine(rec.key)
        if (rawKey === '' && value === '') return // 空键空值条目丢弃（先于自动 id）
        const key = sanitizeId(rawKey, 'field', i)
        out.identity.fields.push({
          key,
          value,
          visibility: rec.visibility === '私密' ? '私密' : '公开',
        })
      })
    }
  }

  if (src.policy !== null && typeof src.policy === 'object') {
    const rules = (src.policy as { rules?: unknown }).rules
    if (Array.isArray(rules)) {
      rules.slice(0, 50).forEach((r, i) => {
        if (r === null || typeof r !== 'object') return
        const rec = r as Record<string, unknown>
        const when = cleanMulti(rec.when, 300)
        const act = cleanMulti(rec.act, 500)
        if (when === '' && act === '') return
        const rule: PolicyRule = {
          id: sanitizeId(rec.id, 'rule', i),
          when,
          act,
          enabled: rec.enabled !== false,
        }
        if (rec.escalate !== undefined && cleanMulti(rec.escalate, 300) !== '') {
          rule.escalate = cleanMulti(rec.escalate, 300)
        }
        out.policy.rules.push(rule)
      })
    }
  }

  if (src.exemplars !== null && typeof src.exemplars === 'object') {
    const items = (src.exemplars as { items?: unknown }).items
    if (Array.isArray(items)) {
      items.slice(0, 50).forEach((x, i) => {
        if (x === null || typeof x !== 'object') return
        const rec = x as Record<string, unknown>
        const item: Exemplar = {
          id: sanitizeId(rec.id, 'ex', i),
          situation: cleanMulti(rec.situation, 300),
          say: cleanMulti(rec.say, 600),
          avoidSay: cleanMulti(rec.avoidSay, 600),
          source: rec.source === '纠正' ? '纠正' : '语料',
        }
        if (item.say === '' && item.avoidSay === '') return
        if (typeof rec.confirmedAt === 'string' && rec.confirmedAt !== '') item.confirmedAt = rec.confirmedAt
        out.exemplars.items.push(item)
      })
    }
  }

  if (src.state !== null && typeof src.state === 'object') {
    const items = (src.state as { items?: unknown }).items
    if (Array.isArray(items)) {
      items.slice(0, 50).forEach((x, i) => {
        if (x === null || typeof x !== 'object') return
        const rec = x as Record<string, unknown>
        const content = cleanMulti(rec.content, 500)
        if (content === '') return
        const item: StateItem = {
          id: sanitizeId(rec.id, 'st', i),
          content,
          statementType: rec.statementType === '事实' ? '事实' : '候选',
        }
        if (typeof rec.source === 'string' && rec.source !== '') item.source = rec.source.slice(0, 60)
        if (typeof rec.decayAt === 'string' && rec.decayAt !== '') item.decayAt = rec.decayAt
        out.state.items.push(item)
      })
    }
  }
  return out
}

/* ── 存储 ── */

function cardsPath(): string {
  return join(twinDataDir(), 'cards.json')
}
function historyPath(): string {
  return join(twinDataDir(), 'cards-history.json')
}

function twinDataDir(): string {
  // 与 src/index.ts 的 pluginDataDir 约定一致：$DSH_HOME/dsh-twin/
  return join(dshHome(), 'dsh-twin')
}

export interface CardsState {
  file: CardsFile
  /** 尚无生效卡（回落 legacy twin-config 渲染） */
  hasEffective: boolean
  history: CardsRevision[]
}

const EMPTY_CARDS: TwinCards = {
  identity: { fields: [] },
  policy: { rules: [] },
  exemplars: { items: [] },
  state: { items: [] },
}

export function loadCardsState(): CardsState {
  const path = cardsPath()
  if (!existsSync(path)) return { file: { current: EMPTY_CARDS, revisionNo: 0, status: '候选' }, hasEffective: false, history: [] }
  try {
    const file = JSON.parse(readFileSync(path, 'utf8')) as CardsFile
    const current = normalizeCards(file.current)
    const status: CardsStatus = file.status === '生效' ? '生效' : '候选'
    return {
      file: { ...file, current, status },
      hasEffective: status === '生效',
      history: loadHistory(),
    }
  } catch (e) {
    twinWarn('cards.json 解析失败，已按空卡处理:', e instanceof Error ? e.message : String(e))
    return { file: { current: EMPTY_CARDS, revisionNo: 0, status: '候选' }, hasEffective: false, history: [] }
  }
}

/** 当前应渲染的卡：生效卡优先；无生效卡返回 null（调用方回落 legacy 渲染） */
export function effectiveCards(): TwinCards | null {
  const st = loadCardsState()
  return st.hasEffective ? st.file.current : null
}

export interface SaveCardsResult {
  file: CardsFile
  /** 生效与否：主人确认 + 回归通过双条件 */
  effective: boolean
  reason: string
}

export interface SaveCardsInput {
  cards: unknown
  /** 主人已确认（向导保存按钮即确认） */
  confirm?: boolean
  /** 回归通过（由 dsh-regression 报告回填；缺省视为未通过） */
  regressionPassed?: boolean
  regressionReportId?: unknown
}

/**
 * 保存四张卡：入口归一化 → 修订快照 → 生效判定。
 * 生效条件 = confirm && regressionPassed；否则停留候选，旧生效卡继续渲染。
 */
export function saveCards(input: SaveCardsInput): SaveCardsResult {
  const cards = normalizeCards(input.cards)
  const confirmed = input.confirm === true
  const regressionPassed = input.regressionPassed === true
  const regressionReportId =
    typeof input.regressionReportId === 'string' && input.regressionReportId.trim() !== ''
      ? input.regressionReportId.trim().slice(0, 60)
      : undefined
  const effective = confirmed && regressionPassed

  const prev = loadCardsState()
  const prevNo = prev.file.revisionNo
  const revisionNo = prevNo + 1
  const file: CardsFile = {
    current: cards,
    revisionNo,
    status: effective ? '生效' : '候选',
    ...(confirmed ? { confirmedAt: new Date().toISOString() } : {}),
    ...(regressionReportId !== undefined ? { regressionReportId } : {}),
  }
  const path = cardsPath()
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(file, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, path)

  archiveRevision({ revisionNo, ts: new Date().toISOString(), confirmed, regressionPassed, cards })

  const reason = effective
    ? '主人确认 + 回归通过，新卡已生效'
    : confirmed
      ? '已保存为候选修订：回归未通过（测试绿灯不兑换授权），旧生效卡继续渲染'
      : '已保存为候选修订：待主人确认'
  return { file, effective, reason }
}

/* ── 修订历史（最近 10 个，不可变快照） ── */

function loadHistory(): CardsRevision[] {
  const path = historyPath()
  if (!existsSync(path)) return []
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown
    return Array.isArray(raw) ? (raw as CardsRevision[]) : []
  } catch {
    return []
  }
}

function archiveRevision(rev: CardsRevision): void {
  const path = historyPath()
  mkdirSync(dirname(path), { recursive: true })
  const hist = [...loadHistory(), rev].slice(-10)
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(hist, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, path)
}

export function listRevisions(): Array<{ revisionNo: number; ts: string; confirmed: boolean; regressionPassed: boolean }> {
  return loadHistory().map(r => ({ revisionNo: r.revisionNo, ts: r.ts, confirmed: r.confirmed, regressionPassed: r.regressionPassed }))
}

/* ── 迁移：v0.2 twin-config.json → 四张卡（确定性映射，零字段丢失） ── */

interface LegacyTwinConfigShape {
  identity?: { name?: unknown; role?: unknown; background?: unknown }
  persona?: { tone?: unknown; style?: unknown; values?: unknown; rules?: unknown; escalation?: unknown; avoid?: unknown }
  knowledge?: { seeds?: unknown }
}

export interface MigrationResult {
  ok: boolean
  cards?: TwinCards
  error?: string
  /** 迁移映射说明（审计用） */
  mapping: string[]
}

/**
 * 确定性迁移映射：
 * - identity.name / role → 身份卡公开字段；background → 身份卡私密字段（主人背景）
 * - persona.tone / style → 身份卡公开字段（语气/风格）
 * - persona.values / rules / avoid → 策略卡规则（enabled）
 * - persona.escalation → 策略卡升级路径条目
 * - knowledge.seeds → 状态卡候选条目（source=seed）
 * - 样例卡为空（旧配置没有对照样例）
 */
export function migrateTwinConfigToCards(cfg: unknown): MigrationResult {
  if (cfg === null || typeof cfg !== 'object') return { ok: false, error: 'twin-config 为空或非对象', mapping: [] }
  const c = cfg as LegacyTwinConfigShape
  const mapping: string[] = []
  const cards: TwinCards = {
    identity: { fields: [] },
    policy: { rules: [] },
    exemplars: { items: [] },
    state: { items: [] },
  }

  const name = normalizePersonaLine(c.identity?.name)
  const role = normalizePersonaLine(c.identity?.role)
  const background = normalizePersonaText(c.identity?.background)
  const tone = normalizePersonaLine(c.persona?.tone)
  const style = normalizePersonaText(c.persona?.style)
  const values = normalizePersonaText(c.persona?.values)
  const rules = normalizePersonaText(c.persona?.rules)
  const avoid = normalizePersonaText(c.persona?.avoid)
  const escalation = normalizePersonaText(c.persona?.escalation)

  if (name !== '') {
    cards.identity.fields.push({ key: 'name', value: name, visibility: '公开' })
    mapping.push('identity.name → 身份卡 name（公开）')
  }
  if (role !== '') {
    cards.identity.fields.push({ key: 'role', value: role, visibility: '公开' })
    mapping.push('identity.role → 身份卡 role（公开）')
  }
  if (background !== '') {
    cards.identity.fields.push({ key: 'background', value: background, visibility: '私密' })
    mapping.push('identity.background → 身份卡 background（私密：主人背景属主人私有事实）')
  }
  if (tone !== '') {
    cards.identity.fields.push({ key: 'tone', value: tone, visibility: '公开' })
    mapping.push('persona.tone → 身份卡 tone（公开）')
  }
  if (style !== '') {
    cards.identity.fields.push({ key: 'style', value: style, visibility: '公开' })
    mapping.push('persona.style → 身份卡 style（公开）')
  }
  if (values !== '') {
    cards.policy.rules.push({ id: 'values', when: '始终', act: `价值观与原则：${values}`, enabled: true })
    mapping.push('persona.values → 策略卡 values（始终生效）')
  }
  if (rules !== '') {
    cards.policy.rules.push({ id: 'rules', when: '处理事务时', act: `决策与做事方式：${rules}`, enabled: true })
    mapping.push('persona.rules → 策略卡 rules')
  }
  if (avoid !== '') {
    cards.policy.rules.push({ id: 'avoid', when: '始终', act: `禁忌——以下绝不做：${avoid}`, enabled: true })
    mapping.push('persona.avoid → 策略卡 avoid（红线类）')
  }
  if (escalation !== '') {
    cards.policy.rules.push({ id: 'escalation', when: '权限不足 / 敏感操作 / 访客投诉', act: '礼貌说明权限不足并拒绝，或转达主人处理', escalate: escalation, enabled: true })
    mapping.push('persona.escalation → 策略卡 escalation（触发 → 转人工）')
  }
  if (Array.isArray(c.knowledge?.seeds)) {
    let n = 0
    for (const seed of c.knowledge.seeds as unknown[]) {
      if (typeof seed !== 'string' || seed.trim() === '') continue
      cards.state.items.push({ id: `seed-${n + 1}`, content: normalizePersonaLine(seed).slice(0, 500), statementType: '候选', source: 'seed' })
      n += 1
    }
    mapping.push(`knowledge.seeds → 状态卡 ${n} 条候选（source=seed）`)
  }
  mapping.push('样例卡为空：旧配置没有对照样例，v2 从主人语料/纠正中积累')
  return { ok: true, cards, mapping }
}
