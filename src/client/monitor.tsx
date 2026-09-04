/**
 * 运行监控面板（v2.1 从设置窗口迁入数字分身 Tab）：分身运行状态一览。
 *
 * 数据全部来自既有聚合路由，无新增后端：
 * - GET /dsh-twin/monitor（会话/轮次/步骤/错误率/LLM 耗时/Tokens）
 * - GET /model-failover/api/status（模型降级链，dsh-model-failover 已装时）
 */
import { useState, useEffect } from 'react'

interface MonitorData {
  sessionCount: number; twinSessionCount: number
  tokens: Record<string, number>; llmMs: number; turns: number; steps: number
  errors: number; errorRate: number
}

const s: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 },
  card: { background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: '14px 16px' },
  num: { fontSize: 26, fontWeight: 800, lineHeight: 1.1, color: 'var(--dsw-alias-label-primary)' },
  nm: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginTop: 4 },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', lineHeight: 1.6 },
  failover: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '8px 10px', marginTop: 12 },
}

/** 模型降级链状态卡：探测 dsh-model-failover 是否已装/已配链（套餐超限自动切换）。 */
function FailoverCard() {
  const [state, setState] = useState<'checking' | 'missing' | 'unconfigured' | 'ok'>('checking')
  useEffect(() => {
    let alive = true
    fetch('/model-failover/api/status')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (!alive) return
        const entries = d?.status?.entries ?? []
        setState(Array.isArray(entries) && entries.length > 0 ? 'ok' : 'unconfigured')
      })
      .catch(() => { if (alive) setState('missing') })
    return () => { alive = false }
  }, [])
  if (state === 'missing') return null
  return (
    <div style={s.failover}>
      模型降级链：
      {state === 'ok' && '已配置（套餐超限/余额不足时按链自动切换，窗口重置自动切回）'}
      {state === 'unconfigured' && <>未配置——分身在模型套餐超限时会直接报错。建议在「设置 → 模型切换」配置降级链。</>}
      {state === 'checking' && '检测中…'}
    </div>
  )
}

export function MonitorPage() {
  const [monitor, setMonitor] = useState<MonitorData | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/dsh-twin/monitor')
      .then((r) => r.json())
      .then((d) => { if (alive && d.ok && d.monitor) setMonitor(d.monitor) })
      .catch(() => { /* 忽略 */ })
    return () => { alive = false }
  }, [])

  const stat = (n: React.ReactNode, label: string, key: React.Key) => (
    <div key={key} style={s.card}>
      <div style={s.num}>{n}</div>
      <div style={s.nm}>{label}</div>
    </div>
  )

  return (
    <div>
      {monitor ? (
        <div style={s.grid}>
          {stat(monitor.sessionCount, '会话总数', 'sc')}
          {stat(monitor.twinSessionCount, '分身会话', 'tsc')}
          {stat(monitor.turns, 'Turns', 't')}
          {stat(`${Math.round(monitor.errorRate * 100)}%`, `错误率（${monitor.errors} 次）`, 'e')}
          {stat(`${Math.round(monitor.llmMs / 1000)}s`, 'LLM 累计耗时', 'l')}
          {stat(`${(monitor.tokens.input / 1000).toFixed(0)}K / ${(monitor.tokens.output / 1000).toFixed(1)}K`, 'Tokens 输入/输出', 'tk')}
          {stat(`${monitor.tokens.cacheRead > 0 ? Math.round((monitor.tokens.cacheRead / Math.max(1, monitor.tokens.input)) * 100) : 0}%`, '缓存命中率', 'ch')}
        </div>
      ) : (
        <div style={{ ...s.hint, padding: '14px 16px', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12 }}>
          暂无监控数据——使用分身会话后这里会出现运行统计。
        </div>
      )}
      <FailoverCard />
    </div>
  )
}
