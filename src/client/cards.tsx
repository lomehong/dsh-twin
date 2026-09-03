/**
 * 人格卡面板（原「四张卡」设置 Tab，v0.3 结构化人格）。
 *
 * v2 UI 重组后不再注册 settings.section：卡片是日常运营对象（修订确认、
 * 修订史、双视图预览），挂在主对话窗口「数字分身」Tab 的子标签下，
 * 与今日待办/学习队列同级。数据链路不变：
 * - 加载 GET /dsh-twin/cards（当前卡 + 状态 + 修订史 + 投影摘要）
 * - 结构化编辑四张卡（身份字段+可见性 / 策略规则 / 样例对照 / 状态条目）
 * - 保存链路：归一化 → 候选修订 →（确认 + 回归通过）才生效——页面上
 *   「主人确认」与「回归通过」是两个显式开关，缺一保存即为候选
 * - 迁移按钮：POST migrate=true，从 legacy twin-config 确定性映射
 * - 预览：GET /dsh-twin/cards/preview 双视图对照
 */
import { useState, useEffect, useCallback } from 'react'

interface IdentityField { key: string; value: string; visibility: string }
interface PolicyRule { id: string; when: string; act: string; escalate?: string; enabled: boolean }
interface Exemplar { id: string; situation: string; say: string; avoidSay: string; source: string }
interface StateItem { id: string; content: string; statementType: string; decayAt?: string }
interface Cards {
  identity: { fields: IdentityField[] }
  policy: { rules: PolicyRule[] }
  exemplars: { items: Exemplar[] }
  state: { items: StateItem[] }
}
interface CardsResp {
  ok: boolean
  file: { current: Cards; revisionNo: number; status: string }
  hasEffective: boolean
  history: Array<{ revisionNo: number; ts: string; confirmed: boolean; regressionPassed: boolean }>
  summary?: { master: { bytes: number }; guest: { bytes: number } }
  error?: string
}

const EMPTY: Cards = {
  identity: { fields: [{ key: 'name', value: '', visibility: '公开' }, { key: 'background', value: '', visibility: '私密' }] },
  policy: { rules: [] },
  exemplars: { items: [] },
  state: { items: [] },
}

const s: Record<string, React.CSSProperties> = {
  sec: { fontSize: 13, fontWeight: 700, margin: '18px 0 8px', color: 'var(--dsw-alias-label-primary)' },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginBottom: 10 },
  row: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' as const },
  input: { flex: '1 1 160px', padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 },
  small: { padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 },
  wide: { width: '100%', padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' as const },
  btn: { padding: '6px 14px', border: 'none', borderRadius: 6, background: 'var(--dsw-alias-state-business-primary)', color: '#fff', fontSize: 13, cursor: 'pointer' },
  btn2: { padding: '6px 14px', border: '1px solid #ddd', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-secondary)', fontSize: 13, cursor: 'pointer' },
  del: { padding: '4px 10px', border: '1px solid #eee', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, cursor: 'pointer' },
  status: { fontSize: 12.5, padding: '8px 10px', borderRadius: 6, margin: '10px 0' },
  rev: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', lineHeight: 1.8 },
  pre: { background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid #eee', borderRadius: 6, padding: 10, fontSize: 12, whiteSpace: 'pre-wrap' as const, maxHeight: 260, overflow: 'auto' },
}

export function CardsPage() {
  const [cards, setCards] = useState<Cards>(EMPTY)
  const [meta, setMeta] = useState<{ revisionNo: number; status: string; hasEffective: boolean }>({ revisionNo: 0, status: '候选', hasEffective: false })
  const [history, setHistory] = useState<Array<{ revisionNo: number; ts: string; confirmed: boolean; regressionPassed: boolean }>>([])
  const [confirm, setConfirm] = useState(false)
  const [regressionPassed, setRegressionPassed] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [preview, setPreview] = useState<{ master: string; guest: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/dsh-twin/cards')
      const d = (await r.json()) as CardsResp
      if (d.ok) {
        setCards(d.file.current)
        setMeta({ revisionNo: d.file.revisionNo, status: d.file.status, hasEffective: d.hasEffective })
        setHistory(d.history ?? [])
      } else {
        setMsg({ text: d.error ?? '加载失败', ok: false })
      }
    } catch (e) {
      setMsg({ text: String(e), ok: false })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const save = async (migrate: boolean) => {
    setMsg(null)
    try {
      const r = await fetch('/dsh-twin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards, confirm: confirm, regressionPassed: regressionPassed, migrate: migrate }),
      })
      const d = (await r.json()) as { ok: boolean; effective?: boolean; reason?: string; error?: string; mapping?: string[] }
      if (d.ok) {
        setMsg({ text: (d.reason ?? '已保存') + (d.mapping !== undefined && d.mapping.length > 0 ? '；迁移映射：' + d.mapping.join('；') : ''), ok: d.effective === true })
        await load()
      } else {
        setMsg({ text: d.error ?? '保存失败', ok: false })
      }
    } catch (e) {
      setMsg({ text: String(e), ok: false })
    }
  }

  const doPreview = async () => {
    const r = await fetch('/dsh-twin/cards/preview')
    const d = (await r.json()) as { master: string; guest: string }
    setPreview({ master: d.master, guest: d.guest })
  }

  // ── 通用列表编辑辅助 ──
  const upd = (fn: (draft: Cards) => void) => {
    const draft: Cards = JSON.parse(JSON.stringify(cards)) as Cards
    fn(draft)
    setCards(draft)
  }

  return (
    <div>
      <p style={s.hint}>
        人格卡是分身人格的结构化数据（身份/策略/样例/状态四张）：身份卡（公开/私密分级——私密字段访客视图结构性缺失）、策略卡（触发→动作→升级，逐条可测试）、
        样例卡（这么说/不这么说）、状态卡（随时间衰减）。生效 = <b>主人确认 + 回归通过</b> 双条件，缺一保存为候选修订。
      </p>
      <div style={{ ...s.status, background: meta.hasEffective ? 'var(--dsw-alias-state-success-tertiary)' : 'var(--dsw-alias-state-warn-tertiary)', color: meta.hasEffective ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-label)' }}>
        当前状态：{meta.hasEffective ? '✓ 生效' : '候选（旧生效卡或 legacy 渲染中）'} · 修订号 {meta.revisionNo}
      </div>

      {/* 身份卡 */}
      <div style={s.sec}>① 身份卡</div>
      {cards.identity.fields.map((f, i) => (
        <div key={i} style={s.row}>
          <input style={{ ...s.input, maxWidth: 140 }} value={f.key} placeholder="键（name/role…）"
            onChange={(e) => upd(d => { d.identity.fields[i]!.key = e.target.value })} />
          <input style={s.input} value={f.value} placeholder="值"
            onChange={(e) => upd(d => { d.identity.fields[i]!.value = e.target.value })} />
          <select style={s.small} value={f.visibility}
            onChange={(e) => upd(d => { d.identity.fields[i]!.visibility = e.target.value })}>
            <option value="公开">公开</option>
            <option value="私密">私密</option>
          </select>
          <button style={s.del} onClick={() => upd(d => { d.identity.fields.splice(i, 1) })}>删</button>
        </div>
      ))}
      <button style={s.btn2} onClick={() => upd(d => { d.identity.fields.push({ key: '', value: '', visibility: '公开' }) })}>+ 身份字段</button>

      {/* 策略卡 */}
      <div style={s.sec}>② 策略卡（触发 → 动作 → 升级）</div>
      {cards.policy.rules.map((r, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <div style={s.row}>
            <input style={s.wide} value={r.when} placeholder="触发条件（如：被问确定报价）"
              onChange={(e) => upd(d => { d.policy.rules[i]!.when = e.target.value })} />
          </div>
          <div style={s.row}>
            <input style={s.wide} value={r.act} placeholder="动作（如：给区间或转主人）"
              onChange={(e) => upd(d => { d.policy.rules[i]!.act = e.target.value })} />
          </div>
          <div style={s.row}>
            <input style={s.wide} value={r.escalate ?? ''} placeholder="升级路径（可选，如：对方坚持 → 转人工）"
              onChange={(e) => upd(d => { d.policy.rules[i]!.escalate = e.target.value })} />
          </div>
          <div style={s.row}>
            <label><input type="checkbox" checked={r.enabled} onChange={(e) => upd(d => { d.policy.rules[i]!.enabled = e.target.checked })} /> 启用</label>
            <button style={{ ...s.del, marginLeft: 'auto' }} onClick={() => upd(d => { d.policy.rules.splice(i, 1) })}>删</button>
          </div>
        </div>
      ))}
      <button style={s.btn2} onClick={() => upd(d => { d.policy.rules.push({ id: `rule-${Date.now()}`, when: '', act: '', enabled: true }) })}>+ 策略规则</button>

      {/* 样例卡 */}
      <div style={s.sec}>③ 样例卡（这么说 / 不这么说）</div>
      {cards.exemplars.items.map((x, i) => (
        <div key={i} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8, marginBottom: 8 }}>
          <div style={s.row}>
            <input style={s.wide} value={x.situation} placeholder="场景"
              onChange={(e) => upd(d => { d.exemplars.items[i]!.situation = e.target.value })} />
          </div>
          <div style={s.row}>
            <input style={s.wide} value={x.say} placeholder="✓ 该这么说"
              onChange={(e) => upd(d => { d.exemplars.items[i]!.say = e.target.value })} />
          </div>
          <div style={s.row}>
            <input style={s.wide} value={x.avoidSay} placeholder="✕ 不这么说"
              onChange={(e) => upd(d => { d.exemplars.items[i]!.avoidSay = e.target.value })} />
          </div>
          <div style={s.row}>
            <select style={s.small} value={x.source} onChange={(e) => upd(d => { d.exemplars.items[i]!.source = e.target.value })}>
              <option value="语料">语料</option>
              <option value="纠正">纠正</option>
            </select>
            <button style={{ ...s.del, marginLeft: 'auto' }} onClick={() => upd(d => { d.exemplars.items.splice(i, 1) })}>删</button>
          </div>
        </div>
      ))}
      <button style={s.btn2} onClick={() => upd(d => { d.exemplars.items.push({ id: `ex-${Date.now()}`, situation: '', say: '', avoidSay: '', source: '纠正' }) })}>+ 样例</button>

      {/* 状态卡 */}
      <div style={s.sec}>④ 状态卡（近期上下文，自动衰减）</div>
      {cards.state.items.map((x, i) => (
        <div key={i} style={s.row}>
          <select style={s.small} value={x.statementType} onChange={(e) => upd(d => { d.state.items[i]!.statementType = e.target.value })}>
            <option value="候选">候选</option>
            <option value="事实">事实</option>
          </select>
          <input style={s.input} value={x.content} placeholder="内容"
            onChange={(e) => upd(d => { d.state.items[i]!.content = e.target.value })} />
          <input style={{ ...s.small, maxWidth: 170 }} type="date" value={(x.decayAt ?? '').slice(0, 10)}
            onChange={(e) => upd(d => { d.state.items[i]!.decayAt = e.target.value === '' ? undefined : e.target.value + 'T00:00:00Z' })} />
          <button style={s.del} onClick={() => upd(d => { d.state.items.splice(i, 1) })}>删</button>
        </div>
      ))}
      <button style={s.btn2} onClick={() => upd(d => { d.state.items.push({ id: `st-${Date.now()}`, content: '', statementType: '候选' }) })}>+ 状态条目</button>

      {/* 保存链路 */}
      <div style={s.sec}>保存与生效</div>
      <div style={s.row}>
        <label><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> 主人确认（签名）</label>
        <label><input type="checkbox" checked={regressionPassed} onChange={(e) => setRegressionPassed(e.target.checked)} /> 回归通过（由 dsh-regression 报告回填）</label>
      </div>
      <div style={s.row}>
        <button style={s.btn} onClick={() => void save(false)}>保存人格卡</button>
        <button style={s.btn2} onClick={() => { if (window.confirm('从 legacy twin-config 迁移到人格卡？当前编辑内容将被覆盖。')) void save(true) }}>从旧配置迁移</button>
        <button style={s.btn2} onClick={() => void doPreview()}>预览双视图投影</button>
        <button style={s.btn2} onClick={() => void load()}>刷新</button>
      </div>
      {msg !== null && (
        <div style={{ ...s.status, background: msg.ok ? 'var(--dsw-alias-state-success-tertiary)' : 'var(--dsw-alias-state-warn-tertiary)', color: msg.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-label)' }}>{msg.text}</div>
      )}

      {preview !== null && (
        <div style={{ marginTop: 10 }}>
          <div style={s.sec}>投影预览</div>
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <div style={s.hint}>主人视图</div>
              <div style={s.pre}>{preview.master === '' ? '（空）' : preview.master}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.hint}>访客视图（私密字段结构性缺失）</div>
              <div style={s.pre}>{preview.guest === '' ? '（空）' : preview.guest}</div>
            </div>
          </div>
        </div>
      )}

      {/* 修订史 */}
      {history.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={s.sec}>修订史（最近 10 个，不可变快照）</div>
          <div style={s.rev}>
            {history.slice().reverse().map((r) => (
              <div key={r.revisionNo}>
                #{r.revisionNo} · {r.ts.slice(0, 19).replace('T', ' ')} ·{' '}
                {r.confirmed && r.regressionPassed ? '已生效' : r.confirmed ? '候选（待回归）' : '候选（待确认）'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
