/**
 * 「今日待办」主窗口 Tab（v2，客户端）：分身的日常维护入口。
 *
 * 只做一件事：把散落在各页的“需要主人决策/处置”聚合成一个数字 + 动作，
 * 让主人每天只需要看这一页。全部数据来自既有聚合路由，无新增后端。
 *
 * 空态即目标：“今天没有需要你处理的事”——日常 $0 维护成本。
 */
import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'


interface LedgerApproval {
  id: string
  recordId: string
  actionType: string
  targetScope: string
  createdAt: string
  expiresAt: string
}

interface DashboardData {
  candidates: Array<{ id: string; kind: string; payload: Record<string, unknown>; createdAt: string }>
  openLoops: Array<{ actorId: string; displayName?: string; memoryId: string; content: string; openedAt: string }>
  pendingShadow: Array<{ id: string; visitorInput: string }>
  ledger: { pendingApprovals: number; blocked: number; total: number }
  approvals: LedgerApproval[]
  regressions: Array<{ id: string; at: string; total: number; passed: number }>
  reaches: Array<{ id: string; at: string; kind: string; title: string; status: string }>
}

const EMPTY: DashboardData = { candidates: [], openLoops: [], pendingShadow: [], ledger: { pendingApprovals: 0, blocked: 0, total: 0 }, approvals: [], regressions: [], reaches: [] }


async function api<T>(path: string): Promise<T> {
  const r = await fetch(path)
  return (await r.json()) as T
}

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '18px 20px' },
  h: { fontSize: '19px', fontWeight: 700, margin: '0 0 2px', color: 'var(--dsw-alias-label-primary)' },
  sub: { fontSize: '13px', color: 'var(--dsw-alias-label-tertiary)', margin: '0 0 16px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 },
  card: { background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '14px 16px', position: 'relative' },
  num: { fontSize: 30, fontWeight: 800, lineHeight: 1.1 },
  nm: { fontSize: 12.5, color: 'var(--dsw-alias-label-secondary)', marginTop: 4 },
  ctx: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', marginTop: 6 },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%' },
  section: { fontSize: 13.5, fontWeight: 700, margin: '16px 0 8px', color: 'var(--dsw-alias-label-primary)' },
  item: { background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '9px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  itemText: { flex: '1 1 200px', fontSize: 13, color: 'var(--dsw-alias-label-primary)' },
  itemMeta: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
  btn: { padding: '5px 12px', border: 'none', borderRadius: 6, background: 'var(--dsw-alias-state-business-primary)', color: 'var(--dsw-alias-label-primary-inverted)', fontSize: 12, cursor: 'pointer' },
  btnGhost: { padding: '5px 12px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-label-secondary)', fontSize: 12, cursor: 'pointer' },
  btnDanger: { padding: '5px 12px', border: '1px solid var(--dsw-alias-state-error-primary)', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, cursor: 'pointer' },
  row: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const },
  empty: { textAlign: 'center' as const, padding: '34px 16px', background: 'var(--dsw-alias-bg-layer-1)', border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 12, marginTop: 6 },
  emptyIcon: { fontSize: 30, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: 600, color: 'var(--dsw-alias-label-primary)', marginBottom: 4 },
  emptySub: { fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)' },
  chip: { fontSize: 11, padding: '1px 8px', borderRadius: 4, border: '1px solid var(--dsw-alias-border-l2)', color: 'var(--dsw-alias-label-secondary)' },
  status: { fontSize: 12.5, marginTop: 10, color: 'var(--dsw-alias-state-success-primary)' },
  err: { fontSize: 12.5, marginTop: 10, color: 'var(--dsw-alias-state-error-primary)' },
}

export function DashboardPage() {
  const [d, setD] = useState<DashboardData>(EMPTY)
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  // 数据源插件缺席登记（宪章 §3.2 显式降级）：缺席卡显示「未安装」而非绿色 0
  // ——"没有待办"（一切正常）与"数据源不在"（增强未启用）是两回事。
  const [missing, setMissing] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    try {
      const [learning, profiles, shadow, ledger, approvals, regressions, proactive] = await Promise.all([
        api<{ candidates: Array<{ id: string; kind: string; payload: Record<string, unknown>; createdAt: string }> }>('/dsh-twin/learning').catch(() => null),
        api<{ profiles: Array<{ entity: { id: string; displayName?: string }; openLoops: Array<{ memoryId: string; content: string; openedAt: string }> }> }>('/dsh-actors/profiles').catch(() => null),
        api<{ pairs: Array<{ id: string; visitorInput: string }> }>('/dsh-regression/shadow/pending').catch(() => null),
        api<{ stats?: { pendingApprovals: number; byStatus?: Record<string, number>; total?: number } }>('/dsh-ledger/stats').catch(() => null),
        api<{ approvals: Array<LedgerApproval> }>('/dsh-ledger/approvals').catch(() => null),
        api<{ reports: Array<{ id: string; at: string; total: number; passed: number }> }>('/dsh-regression/reports').catch(() => null),
        api<{ reaches: Array<{ id: string; at: string; kind: string; title: string; status: string }> }>('/dsh-twin/proactive').catch(() => null),
      ])
      setMissing({
        learning: learning === null,
        actors: profiles === null,
        shadow: shadow === null,
        ledger: ledger === null,
        regression: regressions === null,
      })
      const openLoops = (profiles?.profiles ?? []).flatMap(p =>
        (p.openLoops ?? []).map(o => ({ actorId: p.entity.id, displayName: p.entity.displayName, memoryId: o.memoryId, content: o.content, openedAt: o.openedAt })),
      )
      setD({
        candidates: (learning?.candidates ?? []).filter(c => c.id).slice(0, 20),
        openLoops,
        pendingShadow: shadow?.pairs ?? [],
        ledger: {
          pendingApprovals: approvals?.approvals?.length ?? ledger?.stats?.pendingApprovals ?? 0,
          blocked: ledger?.stats?.byStatus?.['已阻断'] ?? 0,
          total: ledger?.stats?.total ?? 0,
        },
        approvals: approvals?.approvals ?? [],
        regressions: (regressions?.reports ?? []).slice(0, 1),
        reaches: (proactive?.reaches ?? []).slice(-8),
      })
      setLoaded(true)
      setErr('')
    } catch (e) {
      setErr(String(e))
      setLoaded(true)
    }
  }, [])
  useEffect(() => { void load() }, [load])

  const total = d.candidates.length + d.openLoops.length + d.pendingShadow.length + d.ledger.pendingApprovals

  async function confirmAll() {
    if (d.candidates.length === 0) return
    setBusy(true)
    for (const c of d.candidates) {
      await fetch('/dsh-twin/learning/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: c.id, by: '主人' }) })
    }
    setBusy(false)
    setMsg(`已确认 ${d.candidates.length} 个候选（仍待回归通过后应用）`)
    void load()
  }
  async function rejectAll() {
    if (d.candidates.length === 0) return
    if (!window.confirm(`批量驳回 ${d.candidates.length} 个候选？`)) return
    setBusy(true)
    for (const c of d.candidates) {
      await fetch('/dsh-twin/learning/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: c.id, by: '主人' }) })
    }
    setBusy(false)
    setMsg(`已驳回 ${d.candidates.length} 个候选`)
    void load()
  }
  // F-04 审批闭环：批准/驳回账本令牌；批准后解析 digest 中的看板任务号并自动重跑
  // （授权在位时重试裁决即放行——grantCovers 命中）。回调失败不影响已落账的裁决。
  const decide = async (approvalId: string, approved: boolean): Promise<void> => {
    setBusy(true)
    try {
      const resp = await fetch('/dsh-ledger/approve', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, via: 'web' }),
      })
      const payload = await resp.json() as { ok?: boolean; record?: { target?: { digest?: string } }; error?: string }
      if (approved === false) {
        await fetch('/dsh-ledger/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approvalId }) })
      }
      if (approved) {
        const digest = payload.record?.target?.digest ?? ''
        const m = /TB-[A-Za-z0-9_-]+/.exec(digest)
        if (m !== null) {
          await fetch('/dsh-task-board/action', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'run', id: m[0] }),
          }).catch(() => undefined)
        }
      }
      setMsg(approved ? '已批准并机械落账；关联看板任务已自动重试' : '已驳回（记入账本历史）')
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function closeLoop(memoryId: string) {
    await fetch('/dsh-memory/openloop/close', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memoryId, via: '主人确认' }) })
    void load()
  }

  // 主题色语义：卡片数字颜色
  const numColor = (n: number) => n > 0 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-state-success-primary)'

  // 数据源缺席的卡片：数字显示「—」、灰点，注明“提供方插件未安装”
  // ——不把“增强未启用”伪装成“一切正常”（宪章 §3.2 显式降级）。
  function StatCard({ name, ctx, count, absent }: { name: string; ctx: string; count: number; absent: boolean }): JSX.Element {
    return (
      <div style={s.card}>
        <div style={{ ...s.dot, background: absent ? 'var(--dsw-alias-label-tertiary)' : count > 0 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-state-success-primary)' }} />
        <div style={{ ...s.num, color: absent ? 'var(--dsw-alias-label-tertiary)' : numColor(count) }}>{absent ? '—' : count}</div>
        <div style={s.nm}>{name}</div>
        <div style={s.ctx}>{absent ? '提供方插件未安装 · 增强未启用' : ctx}</div>
      </div>
    )
  }

  const missingAny = Object.values(missing).some(v => v === true)

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>今日待办</h1>
      <p style={s.sub}>分身需要你决策/处置的事项汇总——处理完这里，其余都在自动运转。</p>

      <div style={s.cards}>
        <StatCard name="待确认候选" ctx="学习队列 · 达到证据门槛" count={d.candidates.length} absent={missing.learning === true} />
        <StatCard name="待闭环事项" ctx="关系档案 · 承诺出口即开环" count={d.openLoops.length} absent={missing.actors === true} />
        <StatCard name="待判定盲测" ctx="影子测试 · 判断哪句像你" count={d.pendingShadow.length} absent={missing.shadow === true} />
        <StatCard name="待批审批" ctx="委托账本 · 批准即机械落账" count={d.ledger.pendingApprovals} absent={missing.ledger === true} />
      </div>

      {d.approvals.length > 0 && (
        <>
          <div style={s.section}>待批审批（{d.approvals.length}）</div>
          {d.approvals.map(a => (
            <div key={a.id} style={s.item}>
              <span style={s.chip}>{a.actionType}</span>
              <span style={s.itemText}>
                {a.targetScope}
                {a.expiresAt ? ` · 令牌有效期至 ${a.expiresAt.slice(11, 16)}` : ''}
              </span>
              <button style={s.btn} disabled={busy} onClick={() => void decide(a.id, true)}>批准</button>
              <button style={s.btnDanger} disabled={busy} onClick={() => void decide(a.id, false)}>驳回</button>
            </div>
          ))}
        </>
      )}

      {loaded && total === 0 && !missingAny && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>✓</div>
          <div style={s.emptyText}>今天没有需要你处理的事</div>
          <div style={s.emptySub}>信号自动沉淀，候选自动达门槛，一切如常。</div>
        </div>
      )}
      {loaded && total === 0 && missingAny && (
        <div style={{ ...s.empty, borderColor: 'var(--dsw-alias-border-l1)' }}>
          <div style={s.emptySub}>部分增强插件未安装，相关卡片以「—」显示；安装后自动点亮。</div>
        </div>
      )}

      {d.candidates.length > 0 && (
        <>
          <div style={s.section}>待确认候选（{d.candidates.length}）</div>
          <div style={{ ...s.row, marginBottom: 8 }}>
            <button style={s.btn} disabled={busy} onClick={() => void confirmAll()}>全部确认（签名）</button>
            <button style={s.btnDanger} disabled={busy} onClick={() => void rejectAll()}>全部驳回</button>
          </div>
          {d.candidates.map(c => (
            <div key={c.id} style={s.item}>
              <span style={s.chip}>{c.kind}</span>
              <span style={s.itemText}>{String(c.payload.situation ?? c.payload.when ?? c.id)}</span>
              <span style={s.itemMeta}>{c.createdAt.slice(0, 10)}</span>
            </div>
          ))}
        </>
      )}

      {d.openLoops.length > 0 && (
        <>
          <div style={s.section}>待闭环事项（{d.openLoops.length}）</div>
          {d.openLoops.map(o => (
            <div key={o.memoryId} style={s.item}>
              <span style={s.chip}>{o.displayName ?? o.actorId}</span>
              <span style={s.itemText}>{o.content}</span>
              <button style={s.btnGhost} onClick={() => void closeLoop(o.memoryId)}>标记闭环</button>
            </div>
          ))}
        </>
      )}

      {d.pendingShadow.length > 0 && (
        <>
          <div style={s.section}>待判定盲测对（{d.pendingShadow.length}）</div>
          {d.pendingShadow.slice(0, 3).map(p => (
            <div key={p.id} style={s.item}>
              <span style={s.itemText}>“{p.visitorInput.slice(0, 40)}”</span>
              <span style={s.itemMeta}>详见「影子测试」Tab</span>
            </div>
          ))}
        </>
      )}

      {d.regressions.length > 0 && (
        <>
          <div style={s.section}>最近一次回归</div>
          <div style={s.item}>
            <span style={s.chip}>{d.regressions[0]!.id}</span>
            <span style={s.itemText}>
              通过 {d.regressions[0]!.passed}/{d.regressions[0]!.total}
              {d.regressions[0]!.passed === d.regressions[0]!.total ? ' · 全绿' : ' · 有失败'}
            </span>
            <span style={s.itemMeta}>{d.regressions[0]!.at.slice(0, 16).replace('T', ' ')}</span>
          </div>
        </>
      )}

      {d.ledger.total > 0 && (
        <div style={{ ...s.item, marginTop: 14 }}>
          <span style={s.chip}>账本</span>
          <span style={s.itemText}>累计裁决 {d.ledger.total} 笔 · 已阻断 {d.ledger.blocked}</span>
        </div>
      )}

      {d.reaches.length > 0 && (
        <>
          <div style={s.section}>主动触达记录（最近 {d.reaches.length}）</div>
          {d.reaches.map(r => (
            <div key={r.id} style={s.item}>
              <span style={s.chip}>{r.kind}</span>
              <span style={s.itemText}>{r.title}</span>
              <span style={{ ...s.chip, color: r.status === '已触达' ? 'var(--dsw-alias-state-success-primary)' : r.status === '被阻断' ? 'var(--dsw-alias-state-error-primary)' : 'var(--dsw-alias-state-warn-primary)' }}>{r.status}</span>
            </div>
          ))}
        </>
      )}

      {err && <div style={s.err}>加载部分失败：{err}（数据源插件可能未全部装载）</div>}
      {msg && <div style={s.status}>{msg}</div>}
    </div>
  )
}
