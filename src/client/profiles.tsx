/**
 * 关系档案 Tab（v2，客户端）：按对话者聚合 观察时间线 / 开环清单 / 角色与渠道。
 * 数据来自 dsh-actors 聚合路由（软依赖 dsh-memory 关系轨）。
 */
import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'


interface Profile {
  entity: { id: string; role: string; displayName?: string; bindings: Array<{ channel: string; userId: string }> }
  relationCount: number
  openLoops: Array<{ memoryId: string; content: string; openedAt: string }>
  observations: Array<{ memoryId: string; kind: string; content: string; ts: string }>
}

const ROLE_LABEL: Record<string, string> = { master: '主人', colleague: '同事', customer: '客户', stranger: '生人', blocked: '黑名单' }
const ROLE_COLOR: Record<string, string> = { master: 'var(--dsw-alias-state-success-primary)', colleague: '#3f51c1', customer: 'var(--dsw-alias-state-warn-label)', stranger: 'var(--dsw-alias-label-tertiary)', blocked: 'var(--dsw-alias-state-error-primary)' }


const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '20px' },
  h: { fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' },
  sub: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)', margin: '0 0 16px 0' },
  card: { border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 12, background: 'var(--dsw-alias-bg-layer-2)' },
  head: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const },
  name: { fontSize: 15, fontWeight: 700 },
  roleBadge: { fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 4 },
  ch: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' },
  sec: { fontSize: 12.5, fontWeight: 700, color: 'var(--dsw-alias-label-primary)', margin: '10px 0 4px' },
  item: { fontSize: 13, color: 'var(--dsw-alias-label-primary)', padding: '4px 0', borderBottom: '1px dashed #f0f0f0' },
  loop: { background: 'var(--dsw-alias-state-warn-tertiary)', border: '1px solid #f0dfc0', borderRadius: 6, padding: '6px 10px', marginBottom: 6, fontSize: 13, color: 'var(--dsw-alias-state-warn-label)' },
  loopBtn: { float: 'right' as const, fontSize: 11, padding: '1px 8px', border: '1px solid #1d7a53', borderRadius: 4, background: 'var(--dsw-alias-state-success-tertiary)', color: 'var(--dsw-alias-state-success-primary)', cursor: 'pointer' },
  ts: { color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, marginRight: 6 },
  empty: { fontSize: 13, color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid #eee', borderRadius: 6, padding: 12 },
  btn: { padding: '8px 18px', border: 'none', borderRadius: 4, fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-state-business-primary)', color: '#fff' },
  inferred: { fontSize: 10.5, color: 'var(--dsw-alias-state-warn-label)', border: '1px solid #ecd9c0', borderRadius: 3, padding: '0 4px', marginRight: 4 },
}

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loaded, setLoaded] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await fetch('/dsh-actors/profiles')
      const d = await r.json()
      if (d.ok) setProfiles(d.profiles)
      else setErr(d.error ?? '加载失败')
    } catch (e) {
      setErr(String(e))
    }
    setLoaded(true)
  }, [])
  useEffect(() => { void load() }, [load])

  async function closeLoop(memoryId: string) {
    await fetch('/dsh-memory/openloop/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId, via: '主人确认' }),
    })
    void load()
  }

  const withRelations = profiles.filter(p => p.relationCount > 0 || p.openLoops.length > 0)

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>关系档案</h1>
      <p style={s.sub}>按对话者聚合观察 / 推断 / 未闭环事项——"同一个客户第三次来访，它记得前两次"靠的就是这里。开环由主人确认闭环。</p>
      {!loaded && <div style={s.empty}>加载中…</div>}
      {loaded && err !== '' && <div style={s.empty}>加载失败：{err}</div>}
      {loaded && err === '' && withRelations.length === 0 && (
        <div style={s.empty}>暂无关系记录。分身与访客的真实交往会自动沉淀到这里（观察 → 推断需主人确认转正）。</div>
      )}
      {withRelations.map(p => (
        <div key={p.entity.id} style={s.card}>
          <div style={s.head}>
            <span style={s.name}>{p.entity.displayName || p.entity.id}</span>
            <span style={{ ...s.roleBadge, background: `${ROLE_COLOR[p.entity.role] ?? 'var(--dsw-alias-label-tertiary)'}1a`, color: ROLE_COLOR[p.entity.role] ?? 'var(--dsw-alias-label-secondary)' }}>
              {ROLE_LABEL[p.entity.role] ?? p.entity.role}
            </span>
            <span style={s.ch}>{p.entity.bindings.map(b => b.channel).join(' · ')}</span>
            <span style={{ ...s.ch, marginLeft: 'auto' }}>{p.entity.id}</span>
          </div>
          {p.openLoops.length > 0 && (
            <>
              <div style={s.sec}>未闭环（{p.openLoops.length}）</div>
              {p.openLoops.map(o => (
                <div key={o.memoryId} style={s.loop}>
                  <button style={s.loopBtn} onClick={() => void closeLoop(o.memoryId)}>标记闭环</button>
                  <span className="t">{o.content}</span>
                  <span style={{ color: 'var(--dsw-alias-label-tertiary)', fontSize: 11, marginLeft: 8 }}>{o.openedAt.slice(0, 10)}</span>
                </div>
              ))}
            </>
          )}
          <div style={s.sec}>观察 / 推断（最近 {p.observations.length}）</div>
          {p.observations.length === 0 && <div style={{ ...s.item, color: 'var(--dsw-alias-label-tertiary)' }}>暂无</div>}
          {p.observations.map(o => (
            <div key={o.memoryId} style={s.item}>
              <span style={s.ts}>{o.ts.slice(0, 10)}</span>
              {o.kind === '推断' && <span style={s.inferred}>推断</span>}
              {o.content}
            </div>
          ))}
        </div>
      ))}
      {loaded && err === '' && profiles.length > 0 && withRelations.length === 0 && (
        <div style={s.empty}>{profiles.length} 个对话者已注册，但还没有关系记录。</div>
      )}
    </div>
  )
}
