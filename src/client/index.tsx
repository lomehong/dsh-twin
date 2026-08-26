/**
 * dsh-twin 设置向导（客户端）
 *
 * 注册为顶级设置 Tab（settings.section，id=twin）：模板 / 人格 / 知识，并支持导入导出人格数据。
 * 通过 /dsh-twin/config 读写；人格由宿主端注入 system prompt，知识写入 dsh-memory。
 * 插件=纯框架，人格=数据（twin-config.json），可导入导出随身携带。
 */
import { useState, useEffect, useCallback } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'

export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      {
        name: 'settings.section',
        id: 'twin',
        order: 25,
        label: () => '分身设置',
      },
      TwinSettingsPage,
    ),
  )
}

type Config = {
  template: string
  identity: { name: string; role: string; background: string }
  persona: { tone: string; style: string; values: string; rules: string; escalation: string; avoid: string }
  knowledge: { seeds: string[] }
}

const TONES = [
  { id: 'professional', label: '专业' },
  { id: 'friendly', label: '亲切' },
  { id: 'concise', label: '简洁' },
  { id: 'humorous', label: '幽默' },
]

const PRESETS = [
  { id: 'custom', label: '自定义', toolHint: '自定义角色：请按需在「手机连接 → 访客权限」开放工具。', config: { identity: { name: '', role: '', background: '' }, persona: { tone: 'professional', style: '', values: '', rules: '', escalation: '', avoid: '' }, knowledge: { seeds: [] } } },
  { id: 'assistant', label: '私人助理', toolHint: '私人助理建议：访客常开 `web*`、`todo*`（联网搜索/任务清单）。', config: { identity: { name: '', role: '私人助理', background: '我的日常助理，帮我安排日程、整理信息、处理琐事。' }, persona: { tone: 'friendly', style: '主动、贴心，替我把事情安排好。', values: '以主人利益为先，靠谱、主动。', rules: '先听清需求再行动；能代办的代办，不确定的先确认。', escalation: '涉及金钱、对外承诺、对外发布内容时转主人。', avoid: '不擅自对外承诺、不替主人做主决定。' }, knowledge: { seeds: ['主人的日程与偏好以最近对话为准。'] } } },
  { id: 'expert', label: '专家顾问', toolHint: '专家顾问建议：访客常开 `web*`（联网检索）。', config: { identity: { name: '', role: '领域专家顾问', background: '在我擅长的领域提供专业、有依据的分析与建议。' }, persona: { tone: 'professional', style: '严谨、条理清晰，先给结论再给依据。', values: '诚实、有据，不编造。', rules: '先给结论再讲依据；明确标出不确定的地方。', escalation: '未掌握的事实要如实说明，并给出进一步查证方向。', avoid: '不臆测、不夸大。' }, knowledge: { seeds: ['我的分析基于可靠来源，结论会给出依据。'] } } },
  { id: 'service', label: '客服分身', toolHint: '客服分身建议：访客默认纯对话即可，一般无需开放工具。', config: { identity: { name: '', role: '客户服务', background: '负责解答客户常见问题、指引流程、转达诉求。' }, persona: { tone: 'friendly', style: '礼貌、耐心，用简单直白的语言。', values: '耐心、礼貌、不与客户起冲突。', rules: '先共情、再解答；自己解决不了就转人工。', escalation: '投诉、退换货、超出权限的事项转人工处理。', avoid: '不承诺做不到的事、不与客户争执。' }, knowledge: { seeds: ['常见问题优先给出简短、可执行的解决路径。'] } } },
]

const emptyConfig: Config = PRESETS[0].config as Config

async function api(path: string, method = 'GET', body?: unknown) {
  const opts: RequestInit = { method, headers: { Accept: 'application/json' } }
  if (body) {
    opts.headers = { ...opts.headers, 'Content-Type': 'application/json' }
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(path, opts)
  return res.json()
}

function TwinSettingsPage() {
  const [cfg, setCfg] = useState<Config>(emptyConfig)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [toolHint, setToolHint] = useState('')
  const [stats, setStats] = useState<{ memoryTotal: number; memoryTypes: Record<string, number>; hasPersona: boolean } | null>(null)
  const [history, setHistory] = useState<{ index: number; ts: string }[]>([])
  const [monitor, setMonitor] = useState<{ sessionCount: number; twinSessionCount: number; tokens: Record<string, number>; llmMs: number; turns: number; steps: number; errors: number; errorRate: number } | null>(null)
  const [tab, setTab] = useState<'persona' | 'knowledge' | 'monitor' | 'history'>('persona')

  const load = useCallback(async () => {
    try {
      const d = await api('/dsh-twin/config', 'GET')
      if (d.ok && d.config) {
        setCfg({ ...emptyConfig, ...d.config })
        const t = d.config.template
        setToolHint(PRESETS.find((p) => p.id === t)?.toolHint ?? '')
      }
    } catch {
      /* 保持默认 */
    }
    try {
      const s = await api('/dsh-twin/stats', 'GET')
      if (s.ok && s.stats) setStats(s.stats)
    } catch {
      /* 忽略统计失败 */
    }
    try {
      const h = await api('/dsh-twin/history', 'GET')
      if (h.ok && h.history) setHistory(h.history)
    } catch {
      /* 忽略历史 */
    }
    try {
      const m = await api('/dsh-twin/monitor', 'GET')
      if (m.ok && m.monitor) setMonitor(m.monitor)
    } catch {
      /* 忽略监控 */
    }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  async function restoreVersion(index: number) {
    if (!window.confirm('确定要恢复到该历史版本吗？当前「分身设置」配置会被替换。')) return
    const d = await api('/dsh-twin/history/restore', 'POST', { index })
    if (d.ok && d.config) {
      setCfg({ ...emptyConfig, ...d.config })
      setStatus('已恢复历史版本')
      load()
    } else {
      setStatus('恢复失败：' + (d.error || '未知错误'))
    }
  }

  function applyPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    setCfg((prev) => ({
      ...preset.config,
      template: id,
      identity: { ...prev.identity, ...preset.config.identity },
      persona: { ...prev.persona, ...preset.config.persona },
      knowledge: { ...(prev.knowledge ?? { seeds: [] }), seeds: preset.config.knowledge.seeds },
    }))
    setToolHint(preset.toolHint)
    setStatus(`已套用模板：${preset.label}`)
  }

  async function handleSave() {
    setSaving(true)
    setStatus('')
    try {
      const d = await api('/dsh-twin/config', 'POST', cfg)
      if (d.ok) {
        setCfg({ ...emptyConfig, ...d.config })
        const mem = d.memory && d.memory.seeded > 0 ? `（已写入 ${d.memory.seeded} 条共享记忆）` : ''
        setStatus(`已保存${mem}`)
      } else {
        setStatus('保存失败：' + (d.error || '未知错误'))
      }
    } catch (e) {
      setStatus('保存失败：' + String(e))
    }
    setSaving(false)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'twin-config.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('已导出 twin-config.json（可在另一台电脑导入）')
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result))
        setCfg({ ...emptyConfig, ...data })
        // 直接保存到宿主，让配置立即生效
        const d = await api('/dsh-twin/config', 'POST', { ...emptyConfig, ...data })
        setStatus(d.ok ? '已导入并生效' : '导入失败：' + (d.error || '未知错误'))
      } catch (err) {
        setStatus('导入失败：' + String(err))
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  function handleImportKnowledge(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        // 文档按「空行分段」切块（比一行一条更符合语义）；无空行时回落为按行。
        const paras = text.split(/\r?\n\s*\r?\n/).map((x) => x.trim()).filter(Boolean)
        const chunks = paras.length > 1 ? paras : text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)
        setCfg((prev) => {
          const set = new Set(prev.knowledge?.seeds ?? [])
          for (const c of chunks) if (!set.has(c)) set.add(c)
          return { ...prev, knowledge: { seeds: [...set] } }
        })
        setStatus(`已从 ${file.name} 导入 ${chunks.length} 条知识块（请点“保存并生效”写入记忆库）`)
      } catch (err) {
        setStatus('导入失败：' + String(err))
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const s = {
    wrap: { padding: '20px', maxWidth: '720px' },
    h: { fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' },
    sub: { fontSize: '13px', color: '#888', margin: '0 0 16px 0' },
    section: { marginBottom: '18px' },
    secTitle: { fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: '#444' },
    label: { display: 'block', fontSize: '12px', color: '#666', margin: '8px 0 4px 0' },
    input: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
    textarea: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minHeight: '54px', resize: 'vertical' },
    chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
    chip: { padding: '5px 12px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', background: '#fff' },
    chipOn: { padding: '5px 12px', border: '1px solid #4a6cf7', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', background: '#eef1ff', color: '#4a6cf7', fontWeight: 600 },
    btn: { padding: '8px 18px', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: '#4a6cf7', color: '#fff' },
    ghost: { padding: '8px 18px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: '#fff', color: '#444' },
    row: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' },
    tabBar: { display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '14px' },
    tab: { padding: '8px 14px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', borderBottom: '2px solid transparent' },
    tabOn: { padding: '8px 14px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#4a6cf7', fontWeight: 600, borderBottom: '2px solid #4a6cf7' },
    hint: { fontSize: '12px', color: '#8a8f9c', background: '#f6f7f9', border: '1px solid #eee', borderRadius: '6px', padding: '8px 10px', marginTop: '4px' },
    status: { fontSize: '13px', marginTop: '10px', color: '#4a6cf7' },
  } as Record<string, React.CSSProperties>

  const setI = (k: keyof Config['identity'], v: string) => setCfg((prev) => ({ ...prev, identity: { ...prev.identity, [k]: v } }))
  const setP = (k: keyof Config['persona'], v: string) => setCfg((prev) => ({ ...prev, persona: { ...prev.persona, [k]: v } }))

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>数字分身设置</h1>
      <p style={s.sub}>配置你的数字分身：模板 / 人格 / 知识。保存后立即生效（人格注入提示词、知识写入共享记忆）。插件是纯框架，人格是数据，可导入导出随身携带。</p>

      <div style={s.section}>
        <div style={s.secTitle}>模板预设</div>
        <div style={s.chipRow}>
          {PRESETS.map((p) => (
            <button key={p.id} style={cfg.template === p.id ? s.chipOn : s.chip} onClick={() => applyPreset(p.id)}>{p.label}</button>
          ))}
        </div>
        {toolHint && <div style={s.hint}>🛡️ {toolHint}</div>}
      </div>

      <div style={s.tabBar}>
        {([['persona', '人格'], ['knowledge', '知识'], ['monitor', '监控'], ['history', '历史']] as const).map(([id, label]) => (
          <button key={id} style={tab === id ? s.tabOn : s.tab} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'persona' && (
        <div style={s.section}>
          <div style={s.secTitle}>人格</div>
          <label style={s.label}>名字</label>
          <input style={s.input} value={cfg.identity.name} onChange={(e) => setI('name', e.target.value)} placeholder="例如：小 D" />
          <label style={s.label}>身份定位</label>
          <input style={s.input} value={cfg.identity.role} onChange={(e) => setI('role', e.target.value)} placeholder="例如：私人助理 / 研发助手 / 专家顾问" />
          <label style={s.label}>背景</label>
          <textarea style={s.textarea} value={cfg.identity.background} onChange={(e) => setI('background', e.target.value)} placeholder="你是谁、懂什么、服务谁…" />
          <label style={s.label}>语气</label>
          <div style={s.chipRow}>
            {TONES.map((t) => (
              <button key={t.id} style={cfg.persona.tone === t.id ? s.chipOn : s.chip} onClick={() => setP('tone', t.id)}>{t.label}</button>
            ))}
          </div>
          <label style={s.label}>风格补充</label>
          <textarea style={s.textarea} value={cfg.persona.style} onChange={(e) => setP('style', e.target.value)} placeholder="例如：先给结论再给依据 / 别用太专业的黑话…" />
          <label style={s.label}>价值观与原则</label>
          <textarea style={s.textarea} value={cfg.persona.values} onChange={(e) => setP('values', e.target.value)} placeholder="例如：以主人利益为先；诚实有据、不编造。" />
          <label style={s.label}>决策与做事方式</label>
          <textarea style={s.textarea} value={cfg.persona.rules} onChange={(e) => setP('rules', e.target.value)} placeholder="例如：先听清需求再行动；能代办的代办，不确定的先确认。" />
          <label style={s.label}>边界与转人工</label>
          <textarea style={s.textarea} value={cfg.persona.escalation} onChange={(e) => setP('escalation', e.target.value)} placeholder="例如：涉及金钱/对外承诺/对外发布时转主人。" />
          <label style={s.label}>禁忌</label>
          <textarea style={s.textarea} value={cfg.persona.avoid} onChange={(e) => setP('avoid', e.target.value)} placeholder="例如：不擅自对外承诺、不替主人做主决定。" />
        </div>
      )}

      {tab === 'knowledge' && (
        <div style={s.section}>
          <div style={s.secTitle}>知识（共享记忆种子）</div>
          <label style={s.label}>记忆（每行一条）</label>
          <textarea
            style={{ ...s.textarea, minHeight: '80px' }}
            value={(cfg.knowledge?.seeds ?? []).join('\n')}
            onChange={(e) => setCfg((prev) => ({ ...prev, knowledge: { seeds: e.target.value.split('\n').map((x) => x.trim()).filter(Boolean) } }))}
            placeholder={'例如：\n我是某公司研发负责人\n我们项目用 TypeScript\n每周五下午开周会'}
          />
          <label style={{ ...s.ghost, display: 'inline-block', marginTop: '8px' }}>
            导入知识文件(.txt/.md)
            <input type="file" accept=".txt,.md,.markdown,text/plain" style={{ display: 'none' }} onChange={handleImportKnowledge} />
          </label>
        </div>
      )}

      {tab === 'monitor' && (
        <div style={s.section}>
          <div style={s.secTitle}>运行监控</div>
          {monitor ? (
            <div style={s.hint}>
              会话 {monitor.sessionCount}（分身 {monitor.twinSessionCount}）· Turns {monitor.turns} · Steps {monitor.steps} · 错误 {monitor.errors}（{Math.round(monitor.errorRate * 100)}%）· LLM 耗时 {Math.round(monitor.llmMs / 1000)}s
              <br />
              Tokens：输入 {monitor.tokens.input} · 输出 {monitor.tokens.output} · 缓存读 {monitor.tokens.cacheRead} · 缓存写 {monitor.tokens.cacheWrite}
            </div>
          ) : (
            <div style={s.hint}>暂无监控数据（使用分身会话后出现）。</div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div style={s.section}>
          <div style={s.secTitle}>历史版本</div>
          {history.length > 0 ? (
            <div style={s.hint}>
              最近 {history.length} 个：{history.map((v) => (
                <button key={v.index} style={{ ...s.ghost, padding: '2px 8px', fontSize: '12px', margin: '0 4px 4px 0' }} onClick={() => restoreVersion(v.index)}>
                  恢复 {new Date(v.ts).toLocaleString()}
                </button>
              ))}
            </div>
          ) : (
            <div style={s.hint}>暂无历史版本（保存过「分身设置」会生成）。</div>
          )}
        </div>
      )}

      {stats && (
        <div style={s.hint}>
          状态：记忆 {stats.memoryTotal} 条{stats.memoryTotal > 0 ? `（${Object.entries(stats.memoryTypes).map(([k, v]) => `${k}×${v}`).join('，')}）` : ''} · 人格{stats.hasPersona ? '已配置' : '未配置'}
        </div>
      )}

      <div style={s.row}>
        <button style={s.btn} disabled={!loaded || saving} onClick={handleSave}>{saving ? '保存中…' : '保存并生效'}</button>
        <button style={s.ghost} onClick={handleExport}>导出人格</button>
        <label style={s.ghost}>
          导入人格
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
      {status && <div style={s.status}>{status}</div>}
    </div>
  )
}
