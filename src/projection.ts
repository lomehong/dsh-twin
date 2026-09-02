/**
 * 四张卡 → 系统提示词投影（纯函数，实施计划 T3）
 *
 * render(cards, viewer) 是纯函数：同输入同输出、可快照比对——任何一次行为
 * 都能溯源到"哪张卡的哪一条导致了它"（设计文档 v0.2 决策一）。
 *
 * 投影规则：
 * - 身份卡：私密字段仅在主人视图出现（结构性缺失，不是"要求保密"）
 * - 策略卡：仅 enabled 规则；红线（escalate 非空）显式标注升级路径
 * - 样例卡：对照式呈现（这么说 / 不这么说），最多注入 6 条
 * - 状态卡：跳过已衰减（decayAt < now）条目
 * - 空段丢弃；整卡为空返回空字符串（调用方回落 legacy 渲染）
 */
import type { TwinCards } from './cards.ts'

export interface ProjectionViewer {
  role: 'master' | 'guest'
}

export interface ProjectionOptions {
  /** 注入时间（ISO），状态卡衰减判定用；缺省取当前时间 */
  now?: string
  /** 通道（企微/飞书/网页），仅作标注，不影响内容裁剪 */
  channel?: string
}

export function renderCards(cards: TwinCards, viewer: ProjectionViewer, opts: ProjectionOptions = {}): string {
  const isMaster = viewer.role === 'master'
  const nowIso = opts.now ?? new Date().toISOString()
  const parts: string[] = []

  // ── 身份卡 ──
  const identityLines: string[] = []
  for (const f of cards.identity.fields) {
    if (f.value === '') continue
    if (f.visibility === '私密' && !isMaster) continue // 结构性缺失：访客视图根本不注入
    identityLines.push(`- ${f.key}：${f.value}${f.visibility === '私密' ? '（私密）' : ''}`)
  }
  if (identityLines.length > 0) {
    parts.push(['## 身份卡', ...identityLines].join('\n'))
  }

  // ── 策略卡 ──
  const policyLines: string[] = []
  for (const r of cards.policy.rules) {
    if (!r.enabled) continue
    let line = `- 触发「${r.when}」→ ${r.act}`
    if (r.escalate !== undefined && r.escalate !== '') line += `；升级路径：${r.escalate}`
    policyLines.push(line)
  }
  if (policyLines.length > 0) {
    parts.push(['## 策略卡（结构化规则，逐条可追溯）', ...policyLines].join('\n'))
  }

  // ── 样例卡 ──
  const exemplarLines: string[] = []
  for (const x of cards.exemplars.items.slice(0, 6)) {
    let line = `- 场景「${x.situation}」`
    if (x.say !== '') line += `：该这么说「${x.say}」`
    if (x.avoidSay !== '') line += `；不这么说「${x.avoidSay}」`
    exemplarLines.push(line)
  }
  if (exemplarLines.length > 0) {
    parts.push(['## 样例卡（校准示例）', ...exemplarLines].join('\n'))
  }

  // ── 状态卡 ──
  const stateLines: string[] = []
  for (const s of cards.state.items) {
    if (s.decayAt !== undefined && s.decayAt <= nowIso) continue // 自动衰减
    stateLines.push(`- [${s.statementType}] ${s.content}`)
  }
  if (stateLines.length > 0) {
    parts.push(['## 状态卡（近期上下文，随时间衰减）', ...stateLines].join('\n'))
  }

  if (parts.length === 0) return ''
  const header = isMaster ? '# 数字分身人格（主人视图）' : '# 数字分身人格（访客视图）'
  const tail = opts.channel !== undefined ? `\n（当前通道：${opts.channel}）` : ''
  return `${header}\n${parts.join('\n\n')}${tail}`
}

/** 投影摘要（回归报告/预览用）：各卡注入条数 */
export function projectionSummary(cards: TwinCards, viewer: ProjectionViewer, opts: ProjectionOptions = {}): {
  identity: number
  policy: number
  exemplars: number
  state: number
  bytes: number
} {
  const rendered = renderCards(cards, viewer, opts)
  const isMaster = viewer.role === 'master'
  const nowIso = opts.now ?? new Date().toISOString()
  return {
    identity: cards.identity.fields.filter(f => f.value !== '' && (isMaster || f.visibility !== '私密')).length,
    policy: cards.policy.rules.filter(r => r.enabled).length,
    exemplars: Math.min(cards.exemplars.items.length, 6),
    state: cards.state.items.filter(s => s.decayAt === undefined || s.decayAt > nowIso).length,
    bytes: Buffer.byteLength(rendered, 'utf8'),
  }
}
