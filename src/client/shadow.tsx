/**
 * 影子测试 Tab（v2，客户端）：盲测对呈现 + 主人判定 + 分辨不出率统计。
 * 数据来自 dsh-regression 的 shadow 路由。
 */
import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'


interface Pair {
  id: string
  visitorInput: string
  masterReply: string
  twinReply: string
  judged?: '主人' | '分身' | '弃权'
}
interface Stats {
  windowDays: number
  samples: number
  confusionRate: number | null
  breakdown: { 主人: number; 分身: number; 弃权: number; 未判定: number }
}


const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '20px', maxWidth: '760px' },
  h: { fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' },
  sub: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)', margin: '0 0 16px 0' },
  statsRow: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' as const },
  statCard: { flex: '1 1 140px', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid #eee', borderRadius: 10, padding: 14, textAlign: 'center' as const },
  statNum: { fontSize: 26, fontWeight: 800 },
  statNm: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 },
  sec: { fontSize: 13.5, fontWeight: 700, margin: '18px 0 8px', color: 'var(--dsw-alias-label-primary)' },
  pair: { border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 12, background: 'var(--dsw-alias-bg-layer-2)' },
  q: { fontSize: 13, color: 'var(--dsw-alias-label-primary)', marginBottom: 8 },
  reply: { borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8, lineHeight: 1.6 },
  masterC: { background: 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent)' },
  twinC: { background: 'color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent)' },
  tag: { fontSize: 11, fontWeight: 700, display: 'inline-block', marginBottom: 4 },
  btnRow: { display: 'flex', gap: 8 },
  jbtn: { flex: 1, padding: '7px 0', border: '1px solid #ddd', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-2)', fontSize: 12.5, cursor: 'pointer' },
  input: { width: '100%', boxSizing: 'border-box' as const, padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, marginBottom: 8 },
  btn: { padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer', background: 'var(--dsw-alias-state-business-primary)', color: '#fff' },
  ghost: { padding: '8px 18px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, cursor: 'pointer', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid #eee', borderRadius: 6, padding: '8px 10px', marginTop: 8 },
  empty: { fontSize: 13, color: 'var(--dsw-alias-label-tertiary)' },
}

export function ShadowPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<Pair[]>([])
  const [form, setForm] = useState({ visitorInput: '', masterReply: '', twinReply: '' })
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  const load = useCallback(async () => {
    const st = await fetch('/dsh-regression/shadow/stats').then(r => r.json()).catch(() => null)
    if (st?.ok) setStats(st.stats)
    const pd = await fetch('/dsh-regression/shadow/pending').then(r => r.json()).catch(() => null)
    if (pd?.ok) setPending(pd.pairs)
  }, [])
  useEffect(() => { void load() }, [load])

  async function addPair() {
    if (form.visitorInput.trim() === '' || form.masterReply.trim() === '' || form.twinReply.trim() === '') {
      setMsg({ text: '三项都不能为空', ok: false })
      return
    }
    const r = await fetch('/dsh-regression/shadow/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const d = await r.json().catch(() => ({ ok: false }))
    if (d.ok) {
      setMsg({ text: '盲测对已添加', ok: true })
      setForm({ visitorInput: '', masterReply: '', twinReply: '' })
      void load()
    } else {
      setMsg({ text: d.error ?? '添加失败', ok: false })
    }
  }

  async function judge(pairId: string, judged: '主人' | '分身' | '弃权') {
    await fetch('/dsh-regression/shadow/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairId, judged }),
    })
    void load()
  }

  const rate = stats?.confusionRate

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>影子测试</h1>
      <p style={s.sub}>盲测协议：同一访客输入，左边是主人的真实回复、右边是分身的回复——主人选哪句是自己写的。分辨不出率越高，说明越像。</p>

      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div className="n" style={{ ...s.statNum, color: rate === null ? 'var(--dsw-alias-label-tertiary)' : rate >= 0.5 ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-label)' }}>
            {rate === null ? '—' : `${Math.round(rate * 100)}%`}
          </div>
          <div style={s.statNm}>分辨不出率（30 天）</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: '#3f51c1' }}>{stats?.samples ?? 0}</div>
          <div style={s.statNm}>已判定样本</div>
        </div>
        <div style={s.statCard}>
          <div style={{ ...s.statNum, color: 'var(--dsw-alias-label-tertiary)' }}>{stats?.breakdown['未判定'] ?? 0}</div>
          <div style={s.statNm}>待判定</div>
        </div>
      </div>

      {pending.length > 0 && (
        <>
          <div style={s.sec}>待判定盲测对（判定后不可更改）</div>
          {pending.map(p => (
            <div key={p.id} style={s.pair}>
              <div style={s.q}>访客：{p.visitorInput}</div>
              <div style={{ ...s.reply, ...s.masterC }}>
                <span style={{ ...s.tag, color: 'var(--dsw-alias-state-success-primary)' }}>回复 A</span>
                <br />
                {p.masterReply}
              </div>
              <div style={{ ...s.reply, ...s.twinC }}>
                <span style={{ ...s.tag, color: 'var(--dsw-alias-state-business-primary)' }}>回复 B</span>
                <br />
                {p.twinReply}
              </div>
              <div style={s.btnRow}>
                <button style={s.jbtn} onClick={() => void judge(p.id, '主人')}>A 是我写的</button>
                <button style={s.jbtn} onClick={() => void judge(p.id, '分身')}>B 是我写的</button>
                <button style={s.jbtn} onClick={() => void judge(p.id, '弃权')}>分不出来 / 跳过</button>
              </div>
            </div>
          ))}
        </>
      )}
      {pending.length === 0 && (
        <div style={s.empty}>暂无待判定盲测对。盲测对来自：授权语料挖掘后的「影子场景」，或 HostRunner 自动生成（接入中）。</div>
      )}

      <div style={s.sec}>手动添加盲测对</div>
      <input style={s.input} value={form.visitorInput} onChange={e => setForm(f => ({ ...f, visitorInput: e.target.value }))} placeholder="访客输入（例：你们什么时候能给方案？）" />
      <input style={s.input} value={form.masterReply} onChange={e => setForm(f => ({ ...f, masterReply: e.target.value }))} placeholder="主人的真实回复" />
      <input style={s.input} value={form.twinReply} onChange={e => setForm(f => ({ ...f, twinReply: e.target.value }))} placeholder="分身的回复" />
      <button style={s.btn} onClick={() => void addPair()}>添加</button>
      <button style={s.ghost} onClick={() => void load()}>{'刷新'}</button>
      {msg && <div style={{ ...s.hint, color: msg.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)' }}>{msg.text}</div>}
      <div style={s.hint}>隐私：盲测对仅本地存储（0600）；统计只落指标不落原文；已判定且超 90 天的对自动清理。</div>
    </div>
  )
}
