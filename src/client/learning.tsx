/**
 * 学习队列 Tab（v2，客户端）：信号入队 + 候选列表 + 主人确认/驳回 + 应用回归报告。
 * GET /dsh-twin/learning（事件 + 候选），POST /dsh-twin/learning/... 四个动作。
 */
import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export const inject = ['slots']

interface Signal { kind: '纠正' | '否决' | '事实更正' | '影子差异'; label: string }
const SIGNAL_KINDS: Signal[] = [
  { kind: '纠正', label: '纠正（会话内「这话不该这么回」）' },
  { kind: '否决', label: '否决（账本 feedback=推翻）' },
  { kind: '事实更正', label: '事实更正（主人订正记忆）' },
  { kind: '影子差异', label: '影子差异（盲测分歧对）' },
]
const TARGETS = [
  { id: '样例卡', label: '→ 样例卡（对照例）' },
  { id: '策略卡', label: '→ 策略卡（规则修订）' },
  { id: '记忆', label: '→ 记忆（替代/新增）' },
] as const

interface EventResp {
  id: string
  ts: string
  kind: string
  sig: string
  target: string
  status: string
  weight: number
  candidateId?: string
}

interface CandidateResp {
  id: string
  kind: string
  eventIds: string[]
  payload: Record<string, unknown>
  status: string
  createdAt: string
  confirmedAt?: string
}

interface CombinedResp {
  ok: boolean
  events: EventResp[]
  candidates: CandidateResp[]
  error?: string
}

async function api(path: string, method: 'GET' | 'POST', body?: unknown): Promise<any> {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const r = await fetch(path, opts)
  const d = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }))
  return d
}

export function applyLearning(ctx: ClientContext): void {
  ctx.slots.inject('conversation.view', () =>
    ctx.slots.register(
      { name: 'conversation.view', id: 'twin-learning', order: 22, label: () => '学习队列' },
      LearningPage,
    ),
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '20px', maxWidth: '720px' },
  h: { fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' },
  sub: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)', margin: '0 0 16px 0' },
  secTitle: { fontSize: '14px', fontWeight: 700, margin: '18px 0 8px 0', color: 'var(--dsw-alias-label-primary)' },
  label: { display: 'block', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', margin: '6px 0 4px 0' },
  input: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
  textarea: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minHeight: '60px', resize: 'vertical' },
  select: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', marginRight: 8 },
  row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const, marginTop: 8 },
  btn: { padding: '8px 18px', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-state-business-primary)', color: '#fff' },
  ghost: { padding: '8px 18px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' },
  ok: { padding: '6px 14px', border: '1px solid #1d7a53', borderRadius: '4px', background: 'var(--dsw-alias-state-success-tertiary)', color: 'var(--dsw-alias-state-success-primary)', fontSize: '13px', cursor: 'pointer' },
  bad: { padding: '6px 14px', border: '1px solid #b03a44', borderRadius: '4px', background: 'var(--dsw-alias-interactive-bg-hover-danger)', color: 'var(--dsw-alias-state-error-primary)', fontSize: '13px', cursor: 'pointer' },
  hint: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid #eee', borderRadius: '6px', padding: '8px 10px', marginTop: 8 },
  card: { border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 10, background: 'var(--dsw-alias-bg-layer-2)' },
  badge: { display: 'inline-block', padding: '1px 8px', borderRadius: 4, fontSize: '11px', fontWeight: 600 },
  status: { fontSize: '13px', marginTop: 10, color: 'var(--dsw-alias-state-business-primary)' },
}

function statusBadge(st: string): React.CSSProperties {
  const palette: Record<string, { bg: string; fg: string; b: string }> = {
    '观察': { bg: 'var(--dsw-alias-bg-layer-1)', fg: 'var(--dsw-alias-label-tertiary)', b: 'var(--dsw-alias-border-l1)' },
    '候选修订': { bg: '#eef0fb', fg: '#3f51c1', b: 'var(--dsw-alias-border-l2)' },
    '已入卡': { bg: 'var(--dsw-alias-state-success-tertiary)', fg: 'var(--dsw-alias-state-success-primary)', b: '#c2e0cd' },
    '已驳回': { bg: 'var(--dsw-alias-interactive-bg-hover-danger)', fg: 'var(--dsw-alias-state-error-primary)', b: '#ecc8cb' },
  }
  const c = palette[st] ?? palette['观察']!
  return { ...s.badge, background: c.bg, color: c.fg, border: `1px solid ${c.b}` }
}

function LearningPage() {
  const [data, setData] = useState<CombinedResp>({ ok: true, events: [], candidates: [] })
  const [kind, setKind] = useState<Signal['kind']>('纠正')
  const [target, setTarget] = useState<'样例卡' | '策略卡' | '记忆'>('样例卡')
  const [signal, setSignal] = useState('')
  const [ref, setRef] = useState('')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [regressionReportId, setRegressionReportId] = useState('')

  const load = useCallback(async () => {
    const d = await api('/dsh-twin/learning', 'GET')
    if (d && d.ok) setData(d)
  }, [])
  useEffect(() => { void load() }, [load])

  async function enqueue() {
    setMsg(null)
    if (signal.trim() === '') { setMsg({ text: '信号不能为空', ok: false }); return }
    const d = await api('/dsh-twin/learning/enqueue', 'POST', { kind, target, signal, ref: ref.trim() || undefined, by: '主人' })
    if (d.ok) {
      setMsg({ text: d.promoted ? `已入队并晋升为候选：${d.candidate.id}` : `已入队为观察：${d.event.id}（同类累计 ${d.weight}/${d.threshold}）`, ok: d.promoted })
      setSignal(''); setRef(''); void load()
    } else { setMsg({ text: d.error ?? '入队失败', ok: false }) }
  }

  async function confirm(cid: string) {
    const d = await api('/dsh-twin/learning/confirm', 'POST', { candidateId: cid, by: '主人' })
    if (d.ok) {
      setMsg({ text: `已确认候选 ${cid}——下一步在回归通过后由「应用」按钮入卡`, ok: true })
      void load()
    } else { setMsg({ text: d.error ?? '确认失败', ok: false }) }
  }
  async function reject(cid: string) {
    const d = await api('/dsh-twin/learning/reject', 'POST', { candidateId: cid, by: '主人' })
    if (d.ok) { setMsg({ text: `已驳回 ${cid}`, ok: true }); void load() }
    else { setMsg({ text: d.error ?? '驳回失败', ok: false }) }
  }
  async function apply(cid: string) {
    if (!window.confirm(`确认将候选 ${cid} 应用到四张卡？需填写回归报告 id。`)) return
    if (regressionReportId.trim() === '') {
      // 触发一次自动回归：返回 reportId 后用户再点应用
      const r = await api('/dsh-regression/run', 'POST', { runner: 'scripted' })
      const rid = r?.report?.id ?? ''
      if (rid) setRegressionReportId(rid)
      setMsg({ text: rid ? `已自动跑回归：${rid}——再次点击「应用」完成入卡` : '回归未生成报告（请手填 regressionReportId 后再试）', ok: !!rid })
      return
    }
    const d = await api('/dsh-twin/learning/apply', 'POST', { candidateId: cid, regressionReportId })
    if (d.ok) { setMsg({ text: `已应用候选 ${cid} 到四张卡`, ok: true }); setRegressionReportId(''); void load() }
    else { setMsg({ text: d.error ?? '应用失败', ok: false }) }
  }

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>学习队列</h1>
      <p style={s.sub}>把分散的信号变成有门槛、有签名、有回归的修订流水线。单次信号只成为观察，达到门槛或主人显式归因才生成候选；确认 + 回归通过才入卡。</p>

      <div style={s.secTitle}>入队一个信号</div>
      <label style={s.label}>信号类型</label>
      <select style={s.select} value={kind} onChange={(e) => setKind(e.target.value as any)}>
        {SIGNAL_KINDS.map(k => <option key={k.kind} value={k.kind}>{k.label}</option>)}
      </select>
      <label style={s.label}>信号原文（系统会归一化为指纹）</label>
      <textarea style={s.textarea} value={signal} onChange={(e) => setSignal(e.target.value)} placeholder="例：客户坚持要八折时，分身直接答应了（纠正）" />
      <label style={s.label}>路由到</label>
      <select style={s.select} value={target} onChange={(e) => setTarget(e.target.value as any)}>
        {TARGETS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <label style={s.label}>关联引用（可选：被否决的 record id / 影子对 id）</label>
      <input style={s.input} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="可选" />
      <div style={s.row}>
        <button style={s.btn} onClick={enqueue}>入队</button>
        <button style={s.ghost} onClick={() => void load()}>刷新</button>
        {regressionReportId && <span style={s.hint}>待应用 reportId: <code>{regressionReportId}</code></span>}
      </div>

      {msg && <div style={{ ...s.status, color: msg.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)' }}>{msg.text}</div>}

      <div style={s.secTitle}>候选池（{data.candidates.filter(c => c.status === '候选修订').length}）</div>
      {data.candidates.filter(c => c.status === '候选修订' || c.status === '已驳回' || c.status === '已入卡').slice(-20).reverse().map(c => (
        <div key={c.id} style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={statusBadge(c.status)}>{c.status}</span>
            <code style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' }}>{c.id}</code>
            <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-secondary)' }}>· {c.kind} · 关联事件 {c.eventIds.length}</span>
          </div>
          <pre style={{ fontSize: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 120, margin: 0 }}>
            {JSON.stringify(c.payload, null, 2)}
          </pre>
          {c.status === '候选修订' && (
            <div style={s.row}>
              <button style={s.ok} onClick={() => void confirm(c.id)}>主人确认</button>
              <button style={s.bad} onClick={() => void reject(c.id)}>驳回</button>
              <button style={s.ghost} onClick={() => void apply(c.id)}>{regressionReportId ? '应用（已有 reportId）' : '应用（先自动跑回归）'}</button>
            </div>
          )}
          {c.status === '已入卡' && <div style={s.hint}>已入卡 · 报告 {c.regressionReportId ?? '—'}</div>}
        </div>
      ))}
      {data.candidates.filter(c => c.status === '候选修订').length === 0 && (
        <div style={s.hint}>暂无候选。先在“入队”里写一条信号，或使用上一栏的“纠正”按钮（与账本反馈按钮接线后会在这里自动出现否决信号）。</div>
      )}

      <div style={s.secTitle}>事件流水（最近 {data.events.length}）</div>
      {data.events.slice(-15).reverse().map(e => (
        <div key={e.id} style={{ ...s.card, padding: '6px 10px' }}>
          <span style={statusBadge(e.status)}>{e.status}</span>
          <code style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', marginLeft: 8 }}>{e.id}</code>
          <span style={{ fontSize: 12, color: 'var(--dsw-alias-label-secondary)', marginLeft: 8 }}>{e.kind} → {e.target} · w={e.weight}</span>
          <div style={{ fontSize: 12, color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>{e.sig}</div>
        </div>
      ))}
    </div>
  )
}