/**
 * 人格卡面板（原「四张卡」设置 Tab，v0.3 结构化人格）。
 *
 * v2 UI 重组后不再注册 settings.section：卡片是日常运营对象（修订确认、
 * 修订史、双视图预览），挂在主对话窗口「数字分身」Tab 的子标签下。
 * v2.1 UI 重构：卡片化分区 + 字段网格（label/控件/可见性三列，不再折行）、
 * 空状态引导、说明去术语化，全部使用 dsw 主题令牌。
 *
 * 数据链路不变：
 * - 加载 GET /dsh-twin/cards（当前卡 + 状态 + 修订史 + 投影摘要）
 * - 保存链路：归一化 → 候选修订 →（主人确认 + 回归通过）才生效
 * - 迁移按钮：POST migrate=true，从 legacy twin-config 确定性映射
 * - 预览：GET /dsh-twin/cards/preview 双视图对照
 */
import { useState, useEffect, useCallback } from 'react'
import { BUILT_IN_FIELDS, TONE_OPTIONS } from '../built-in-fields.ts'

interface IdentityField { key: string; value: string; visibility: string; builtIn?: boolean }
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
  identity: { fields: BUILT_IN_FIELDS.map(d => ({ key: d.key, value: '', visibility: d.visibility, builtIn: true })) },
  policy: { rules: [] },
  exemplars: { items: [] },
  state: { items: [] },
}

/* ── 样式：全部走 dsw 主题令牌 ── */
const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '6px 10px',
  border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8,
  fontSize: 13, background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)',
}
const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '14px 20px 48px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 },
  h: { fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--dsw-alias-label-primary)' },
  badge: { fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999 },
  badgeOk: { background: 'var(--dsw-alias-state-success-tertiary)', color: 'var(--dsw-alias-state-success-primary)' },
  badgeWarn: { background: 'var(--dsw-alias-state-warn-tertiary)', color: 'var(--dsw-alias-state-warn-label)' },
  sub: { fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)', margin: '0 0 10px', lineHeight: 1.6 },
  actionRow: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const, padding: '10px 14px', marginBottom: 12, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12 },
  switchLabel: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer' },
  btn: { padding: '7px 18px', border: 'none', borderRadius: 8, background: 'var(--dsw-alias-state-business-primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btn2: { padding: '6px 14px', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-secondary)', fontSize: 12.5, cursor: 'pointer' },
  card: { background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 },
  cardHead: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 13.5, fontWeight: 700, color: 'var(--dsw-alias-label-primary)', margin: 0 },
  cardSub: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: '92px 1fr 84px', gap: '10px 10px', alignItems: 'center' },
  fieldLabel: { fontSize: 12.5, color: 'var(--dsw-alias-label-secondary)', textAlign: 'right', whiteSpace: 'nowrap' as const },
  input: inputBase,
  textarea: { ...inputBase, minHeight: 54, resize: 'vertical' as const },
  select: { ...inputBase, width: 'auto', padding: '5px 8px', fontSize: 12.5 },
  item: { border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: 10, marginBottom: 8, background: 'var(--dsw-alias-bg-layer-1)' },
  itemRow: { display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' },
  itemField: { flex: 1, ...inputBase },
  empty: { fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)', padding: '12px 14px', border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 10, marginBottom: 8, lineHeight: 1.6 },
  hint: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', lineHeight: 1.6, marginTop: 10 },
  del: { padding: '4px 10px', border: 'none', borderRadius: 6, background: 'transparent', color: 'var(--dsw-alias-state-error-primary)', fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  msg: { fontSize: 12.5, padding: '8px 12px', borderRadius: 8, marginTop: 0 },
  pre: { background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: 10, fontSize: 12, whiteSpace: 'pre-wrap' as const, maxHeight: 240, overflow: 'auto', color: 'var(--dsw-alias-label-secondary)' },
  subHead: { fontSize: 12.5, fontWeight: 600, color: 'var(--dsw-alias-label-secondary)', margin: '14px 0 8px' },
  details: { marginTop: 4 },
  detailsSummary: { fontSize: 12.5, color: 'var(--dsw-alias-label-tertiary)', cursor: 'pointer' },
  rev: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', lineHeight: 1.9, marginTop: 6 },
  previewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
}

function CardsPage() {
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
        setCards({ ...EMPTY, ...d.file.current })
        setMeta({ revisionNo: d.file.revisionNo, status: d.file.status, hasEffective: d.hasEffective })
        setHistory(d.history ?? [])
      }
    } catch { /* 服务不可用保持空态 */ }
    try {
      const r = await fetch('/dsh-twin/cards/preview')
      const d = (await r.json()) as { master: string; guest: string }
      setPreview({ master: d.master, guest: d.guest })
    } catch { /* 预览失败静默 */ }
  }, [])
  useEffect(() => { void load() }, [load])

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

  // ── 通用列表编辑辅助 ──
  const upd = (fn: (draft: Cards) => void) => {
    const draft: Cards = JSON.parse(JSON.stringify(cards)) as Cards
    fn(draft)
    setCards(draft)
  }

  const visSelect = (value: string, onChange: (v: string) => void, key: React.Key) => (
    <select key={key} style={s.select} value={value} onChange={(e) => onChange(e.target.value)} title="公开：访客对话也注入；私密：仅主人自己的会话包含">
      <option value="公开">公开</option>
      <option value="私密">私密</option>
    </select>
  )

  return (
    <div style={s.wrap}>
      {/* 页头 */}
      <div style={s.titleRow}>
        <h1 style={s.h}>人格卡</h1>
        <span style={{ ...s.badge, ...(meta.hasEffective ? s.badgeOk : s.badgeWarn) }}>
          {meta.hasEffective ? '✓ 生效' : '候选未生效'} · 修订 {meta.revisionNo}
        </span>
      </div>
      <p style={s.sub}>
        分身的人格由四张卡组成：身份卡（是谁）、策略卡（遇事怎么做）、样例卡（这么说、不这么说）、状态卡（近期上下文，自动衰减）。
        保存需同时勾选「主人确认」与「回归通过」才会生效，否则保存为候选修订。
      </p>

      {/* 操作行 */}
      <div style={s.actionRow}>
        <label style={s.switchLabel} title="主人的保存动作即签名">
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> 主人确认
        </label>
        <label style={s.switchLabel} title="由 dsh-regression 的回归报告回填">
          <input type="checkbox" checked={regressionPassed} onChange={(e) => setRegressionPassed(e.target.checked)} /> 回归通过
        </label>
        <button style={s.btn} onClick={() => void save(false)}>保存人格卡</button>
        <button style={s.btn2} onClick={() => void save(true)}>从旧配置迁移</button>
        <button style={s.btn2} onClick={() => void load()}>刷新</button>
      </div>
      {msg !== null && (
        <div style={{ ...s.msg, marginBottom: 12, background: msg.ok ? 'var(--dsw-alias-state-success-tertiary)' : 'var(--dsw-alias-state-warn-tertiary)', color: msg.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-label)' }}>{msg.text}</div>
      )}

      {/* ① 身份卡 */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <h2 style={s.cardTitle}>① 身份卡</h2>
          <span style={s.cardSub}>🔒 私密字段不会出现在访客对话里</span>
        </div>
        <div style={s.grid}>
          {BUILT_IN_FIELDS.map((def) => {
            const f = cards.identity.fields.find(x => x.key === def.key)
            const set = (patch: Partial<IdentityField>) => upd(d => {
              const t = d.identity.fields.findIndex(x => x.key === def.key)
              if (t >= 0) d.identity.fields[t] = { ...d.identity.fields[t]!, ...patch, key: def.key, builtIn: true }
              else d.identity.fields.push({ key: def.key, value: '', visibility: def.visibility, builtIn: true, ...patch })
            })
            const ph = def.key === 'name' ? '例如：小 D' : def.key === 'role' ? '例如：私人助理 / 研发助手 / 专家顾问' : def.key === 'background' ? '你是谁、懂什么、服务谁…' : def.key === 'tone' ? undefined : `例如：${def.label}…`
            return (
              <div key={def.key} style={{ display: 'contents' }}>
                <span style={s.fieldLabel}>{def.label}{def.visibility === '私密' ? ' 🔒' : ''}</span>
                {def.control === 'tone' ? (
                  <select style={s.select} value={f?.value ?? ''} onChange={(e) => set({ value: e.target.value })}>
                    <option value="">（未设置）</option>
                    {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                ) : def.control === 'textarea' ? (
                  <textarea style={{ ...s.textarea, minHeight: 48 }} value={f?.value ?? ''} placeholder={ph}
                    onChange={(e) => set({ value: e.target.value })} />
                ) : (
                  <input style={s.input} value={f?.value ?? ''} placeholder={ph} onChange={(e) => set({ value: e.target.value })} />
                )}
                {visSelect(f?.visibility ?? def.visibility, (v) => set({ visibility: v }), def.key)}
              </div>
            )
          })}
        </div>
        <div style={s.hint}>
          九项为固定字段（不可删除）。「做事方式 / 边界与转人工」想变成可测试的规则时，在策略卡逐条录入，然后清空这里对应文本即可。
        </div>

        <div style={s.subHead}>自定义字段（可选的长尾信息，如：毕业院校、方言）</div>
        {cards.identity.fields.map((f, i) => (
          BUILT_IN_FIELDS.some(d => d.key === f.key) ? null : (
            <div key={`c-${i}`} style={s.itemRow}>
              <input style={{ ...s.itemField, maxWidth: 160 }} value={f.key} placeholder="字段名"
                onChange={(e) => upd(d => { d.identity.fields[i]!.key = e.target.value })} />
              <input style={s.itemField} value={f.value} placeholder="内容"
                onChange={(e) => upd(d => { d.identity.fields[i]!.value = e.target.value })} />
              {visSelect(f.visibility, (v) => upd(d => { d.identity.fields[i]!.visibility = v }), `c-${i}`)}
              <button style={s.del} onClick={() => upd(d => { d.identity.fields.splice(i, 1) })}>删除</button>
            </div>
          )
        ))}
        <button style={s.btn2} onClick={() => upd(d => { d.identity.fields.push({ key: '', value: '', visibility: '公开' }) })}>+ 添加自定义字段</button>
      </div>

      {/* ② 策略卡 */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <h2 style={s.cardTitle}>② 策略卡</h2>
          <span style={s.cardSub}>什么情况 → 做什么 → 必要时升级给主人；每条可独立启停</span>
        </div>
        {cards.policy.rules.length === 0 && (
          <div style={s.empty}>
            还没有规则。规则让分身在特定场景有确定动作——例如：当「客人问能不能降价」→「只登记诉求，不承诺」→ 升级「转主人」。
          </div>
        )}
        {cards.policy.rules.map((r, i) => (
          <div key={i} style={s.item}>
            <div style={s.itemRow}>
              <input style={s.itemField} value={r.when} placeholder="当…（触发条件，如：客人问能不能降价）"
                onChange={(e) => upd(d => { d.policy.rules[i]!.when = e.target.value })} />
            </div>
            <div style={s.itemRow}>
              <input style={s.itemField} value={r.act} placeholder="就…（动作，如：只登记诉求，不承诺）"
                onChange={(e) => upd(d => { d.policy.rules[i]!.act = e.target.value })} />
            </div>
            <div style={s.itemRow}>
              <input style={s.itemField} value={r.escalate ?? ''} placeholder="必要时升级给主人（可选，如：对方坚持 → 转主人）"
                onChange={(e) => upd(d => { d.policy.rules[i]!.escalate = e.target.value })} />
            </div>
            <div style={{ ...s.itemRow, marginBottom: 0 }}>
              <label style={s.switchLabel}>
                <input type="checkbox" checked={r.enabled} onChange={(e) => upd(d => { d.policy.rules[i]!.enabled = e.target.checked })} /> 启用
              </label>
              <button style={{ ...s.del, marginLeft: 'auto' }} onClick={() => upd(d => { d.policy.rules.splice(i, 1) })}>删除</button>
            </div>
          </div>
        ))}
        <button style={s.btn2} onClick={() => upd(d => { d.policy.rules.push({ id: `rule-${Date.now()}`, when: '', act: '', enabled: true }) })}>+ 添加规则</button>
      </div>

      {/* ③ 样例卡 */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <h2 style={s.cardTitle}>③ 样例卡</h2>
          <span style={s.cardSub}>用对照示例校准分身的说法</span>
        </div>
        {cards.exemplars.items.length === 0 && (
          <div style={s.empty}>
            还没有样例。样例是「这个场景该这么说、不该那么说」的对照——对话中的纠正积累 3 次会自动进来，也可以手动添加。
          </div>
        )}
        {cards.exemplars.items.map((x, i) => (
          <div key={i} style={s.item}>
            <div style={s.itemRow}>
              <input style={s.itemField} value={x.situation} placeholder="场景（如：客户催交付时间）"
                onChange={(e) => upd(d => { d.exemplars.items[i]!.situation = e.target.value })} />
            </div>
            <div style={s.itemRow}>
              <input style={{ ...s.itemField, color: 'var(--dsw-alias-state-success-primary)' }} value={x.say} placeholder="✓ 该这么说"
                onChange={(e) => upd(d => { d.exemplars.items[i]!.say = e.target.value })} />
            </div>
            <div style={s.itemRow}>
              <input style={{ ...s.itemField, color: 'var(--dsw-alias-state-error-primary)' }} value={x.avoidSay} placeholder="✕ 不这么说"
                onChange={(e) => upd(d => { d.exemplars.items[i]!.avoidSay = e.target.value })} />
            </div>
            <div style={{ ...s.itemRow, marginBottom: 0 }}>
              <select style={s.select} value={x.source} onChange={(e) => upd(d => { d.exemplars.items[i]!.source = e.target.value })}>
                <option value="语料">来自语料</option>
                <option value="纠正">来自纠正</option>
              </select>
              <button style={{ ...s.del, marginLeft: 'auto' }} onClick={() => upd(d => { d.exemplars.items.splice(i, 1) })}>删除</button>
            </div>
          </div>
        ))}
        <button style={s.btn2} onClick={() => upd(d => { d.exemplars.items.push({ id: `ex-${Date.now()}`, situation: '', say: '', avoidSay: '', source: '纠正' }) })}>+ 添加样例</button>
      </div>

      {/* ④ 状态卡 */}
      <div style={s.card}>
        <div style={s.cardHead}>
          <h2 style={s.cardTitle}>④ 状态卡</h2>
          <span style={s.cardSub}>近期上下文，到期自动不再注入</span>
        </div>
        {cards.state.items.length === 0 && (
          <div style={s.empty}>暂无条目。日常对话中的临时状态会自动汇入并衰减，一般无需手动维护。</div>
        )}
        {cards.state.items.map((x, i) => (
          <div key={i} style={s.itemRow}>
            <select style={s.select} value={x.statementType} onChange={(e) => upd(d => { d.state.items[i]!.statementType = e.target.value })}>
              <option value="候选">候选</option>
              <option value="事实">事实</option>
            </select>
            <input style={s.itemField} value={x.content} placeholder="内容"
              onChange={(e) => upd(d => { d.state.items[i]!.content = e.target.value })} />
            <input style={{ ...s.select, maxWidth: 150 }} type="date" title="衰减时间（到期后不再注入）" value={(x.decayAt ?? '').slice(0, 10)}
              onChange={(e) => upd(d => { d.state.items[i]!.decayAt = e.target.value === '' ? undefined : e.target.value + 'T00:00:00Z' })} />
            <button style={s.del} onClick={() => upd(d => { d.state.items.splice(i, 1) })}>删除</button>
          </div>
        ))}
        <button style={s.btn2} onClick={() => upd(d => { d.state.items.push({ id: `st-${Date.now()}`, content: '', statementType: '候选' }) })}>+ 添加状态条目</button>
      </div>

      {/* 投影预览 */}
      {preview !== null && (
        <div style={s.card}>
          <div style={s.cardHead}>
            <h2 style={s.cardTitle}>投影预览</h2>
            <span style={s.cardSub}>分身系统提示词里实际注入的内容（左：主人视角；右：访客视角）</span>
          </div>
          <div style={s.previewGrid}>
            <div>
              <div style={{ ...s.hint, marginTop: 0, marginBottom: 4 }}>主人视图</div>
              <div style={s.pre}>{preview.master === '' ? '（空）' : preview.master}</div>
            </div>
            <div>
              <div style={{ ...s.hint, marginTop: 0, marginBottom: 4 }}>访客视图</div>
              <div style={s.pre}>{preview.guest === '' ? '（空）' : preview.guest}</div>
            </div>
          </div>
        </div>
      )}

      {/* 修订史 */}
      {history.length > 0 && (
        <details style={s.details}>
          <summary style={s.detailsSummary}>修订史（最近 {history.length} 个，不可变快照）</summary>
          <div style={s.rev}>
            {history.slice().reverse().map((r) => (
              <div key={r.revisionNo}>
                #{r.revisionNo} · {r.ts.slice(0, 19).replace('T', ' ')} ·{' '}
                {r.confirmed && r.regressionPassed ? '已生效' : r.confirmed ? '候选（待回归）' : '候选（待确认）'}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

export { CardsPage }
