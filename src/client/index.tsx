/**
 * dsh-twin 设置向导（客户端）
 *
 * 注册为顶级设置 Tab（settings.section，id=twin）：模板 / 知识（分身初始化与数据管理），支持导入导出人格卡。人格编辑入口与运行监控在数字分身 Tab。
 * 通过 /dsh-twin/config 读写；人格由宿主端注入 system prompt，知识写入 dsh-memory。
 * 插件=纯框架，人格=数据（twin-config.json），可导入导出随身携带。
 * 本 Tab 只承担初始配置（向导性质）；日常运营（修订确认/人格卡/学习队列）在主对话窗口「数字分身」Tab。
 */
import { useState, useEffect, useCallback } from 'react'
import { applyTwinHub } from './twin-hub.tsx'
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
  // v2/v3：数字分身主面板（单一 conversation.view slot，内含今日待办/学习队列/关系档案/影子测试/人格卡）
  applyTwinHub(ctx)
}

type Config = {
  template: string
  knowledge: { seeds: string[] }
  becomeDefaultPreset?: boolean
}

interface CardsState {
  ok: boolean
  file: { current: { identity: { fields: Array<{ key: string; value: string; visibility: string; builtIn?: boolean }> } }; revisionNo: number; status: string }
  hasEffective: boolean
}

/** 模板预设：生成初版人格卡（内置字段）+ 建议知识种子 */
const PRESETS = [
  { id: 'custom', label: '自定义', desc: '生成空白人格卡，到人格卡逐项填写。', toolHint: '自定义角色：请按需在「手机连接 → 访客权限」开放工具。', fields: {} as Record<string, string>, seeds: [] as string[] },
  { id: 'assistant', label: '私人助理', desc: '替我安排日程、整理信息、处理琐事。', toolHint: '私人助理建议：访客常开 `web*`、`todo*`（联网搜索/任务清单）。', fields: { role: '私人助理', background: '我的日常助理，帮我安排日程、整理信息、处理琐事。', tone: '亲切', style: '主动、贴心，替我把事情安排好。', values: '以主人利益为先，靠谱、主动。', workingStyle: '先听清需求再行动；能代办的代办，不确定的先确认。', escalation: '涉及金钱、对外承诺、对外发布内容时转主人。', avoid: '不擅自对外承诺、不替主人做主决定。' }, seeds: ['主人的日程与偏好以最近对话为准。'] },
  { id: 'expert', label: '专家顾问', desc: '在擅长领域提供有依据的分析与建议。', toolHint: '专家顾问建议：访客常开 `web*`（联网检索）。', fields: { role: '领域专家顾问', background: '在我擅长的领域提供专业、有依据的分析与建议。', tone: '专业', style: '严谨、条理清晰，先给结论再给依据。', values: '诚实、有据，不编造。', workingStyle: '先给结论再讲依据；明确标出不确定的地方。', escalation: '未掌握的事实要如实说明，并给出进一步查证方向。', avoid: '不臆测、不夸大。' }, seeds: ['我的分析基于可靠来源，结论会给出依据。'] },
  { id: 'service', label: '客服分身', desc: '解答常见问题、指引流程、转达诉求。', toolHint: '客服分身建议：访客默认纯对话即可，一般无需开放工具。', fields: { role: '客户服务', background: '负责解答客户常见问题、指引流程、转达诉求。', tone: '亲切', style: '礼貌、耐心，用简单直白的语言。', values: '耐心、礼貌，不与客户起冲突。', workingStyle: '先共情、再解答；自己解决不了就转人工。', escalation: '投诉、退换货、超出权限的事项转人工处理。', avoid: '不承诺做不到的事、不与客户争执。' }, seeds: ['常见问题优先给出简短、可执行的解决路径。'] },
]

const emptyConfig: Config = { template: 'custom', knowledge: { seeds: [] } }

async function api(path: string, method = 'GET', body?: unknown) {
  const opts: RequestInit = { method, headers: { Accept: 'application/json' } }
  if (body) {
    opts.headers = { ...opts.headers, 'Content-Type': 'application/json' }
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(path, opts)
  const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }))
  // 非 2xx 时后端返回 {ok:false,...}；res.json() 失败（如代理错误页）也要给出可读错误
  if (!res.ok && data.ok !== false) return { ok: false, error: `HTTP ${res.status}` }
  return data
}

function TwinSettingsPage() {
  const [cfg, setCfg] = useState<Config>(emptyConfig)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [toolHint, setToolHint] = useState('')
  const [stats, setStats] = useState<{ memoryTotal: number; memoryTypes: Record<string, number>; hasPersona: boolean } | null>(null)
  const [cardsState, setCardsState] = useState<CardsState | null>(null)
  const [tab, setTab] = useState<'persona' | 'knowledge'>('persona')

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
      const c = await api('/dsh-twin/cards', 'GET')
      if (c.ok) setCardsState(c as CardsState)
    } catch {
      /* 忽略人格卡加载失败 */
    }
    setLoaded(true)
  }, [])

  useEffect(() => { load() }, [load])

  /** 模板 → 生成候选人格卡（内置字段预填；主人保存动作即确认，回归通过后生效） */
  async function applyPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id)
    if (!preset) return
    if (!window.confirm(`套用模板「${preset.label}」会生成一版候选人格卡（已含主人确认，回归通过后生效），并把模板知识种子合并到下方知识列表。继续吗？`)) return
    const fields = BUILT_IN_FIELDS
      .map(d => ({ key: d.key, value: (preset.fields[d.key] ?? '').slice(0, 2000), visibility: d.visibility, builtIn: true }))
      .filter(f => f.value !== '')
    const d = await api('/dsh-twin/cards', 'POST', {
      cards: { identity: { fields }, policy: { rules: [] }, exemplars: { items: [] }, state: { items: [] } },
      confirm: true,
    })
    if (d.ok) {
      setCfg((prev) => ({
        ...prev,
        template: id,
        knowledge: { seeds: [...new Set([...preset.seeds, ...(prev.knowledge?.seeds ?? [])])] },
      }))
      setToolHint(preset.toolHint)
      setStatus(`已生成「${preset.label}」候选人格卡：回归通过后生效。到主对话窗口「数字分身」Tab → 人格卡 继续完善；知识种子需点「保存并生效」写入记忆库。`)
      load()
    } else {
      setStatus('模板生成失败：' + (d.error || '未知错误'))
    }
  }

  async function handleSave() {
    setSaving(true)
    setStatus('')
    try {
      // 人格字段不再经此保存（唯一入口：人格卡）；这里只落 模板选择 / 知识种子 / 默认预设开关
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

  // 预览实际注入 system prompt 的人格段 + 安全边界段（保存闭环：调完立刻看到生效内容）
  const [preview, setPreview] = useState<{ persona: string; guard: string } | null>(null)
  async function refreshPreview() {
    try {
      const d = await api('/dsh-twin/preview', 'GET')
      if (d.ok) setPreview({ persona: d.persona ?? '', guard: d.guard ?? '' })
    } catch { /* 预览失败静默 */ }
  }
  function handlePreviewToggle() {
    if (preview) { setPreview(null); return }
    void refreshPreview()
  }

  async function handleExport() {
    // 导出当前人格卡（唯一人格事实源）；拿到别的机器导入的必须是实际数据
    let exported: unknown = null
    try {
      const d = await api('/dsh-twin/cards', 'GET')
      if (d.ok && d.file) exported = d.file.current
    } catch { /* 拉取失败导出空 */ }
    const blob = new Blob([JSON.stringify(exported ?? { identity: { fields: [] }, policy: { rules: [] }, exemplars: { items: [] }, state: { items: [] } }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'twin-cards.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('已导出 twin-cards.json（可在另一台电脑导入）')
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
  reader.onload = async () => {
    try {
      const data = JSON.parse(String(reader.result))
      if (!window.confirm('导入会生成一版候选人格卡（覆盖现有编辑，需确认+回归通过后生效）——请勿导入来路不明的文件。确定继续吗？')) return
      if (data?.identity?.fields) {
        // 新格式：人格卡导出
        const d = await api('/dsh-twin/cards', 'POST', { cards: data, confirm: true })
        setStatus(d.ok ? '已导入为候选人格卡（回归通过后生效）' : '导入失败：' + (d.error || '未知错误'))
      } else {
        // 旧 twin-config 格式：后端兼容路径自动映射为卡
        const d = await api('/dsh-twin/config', 'POST', data)
        setStatus(d.ok ? '已导入（人格已自动映射到人格卡）' : '导入失败：' + (d.error || '未知错误'))
      }
      load()
      e.target.value = ''
    } catch (err) {
      setStatus('导入失败：' + String(err))
      e.target.value = ''
    }
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
        // 段内换行必须压平：textarea 以行为界编辑种子，含换行的条目会在下次编辑时被拆散变异。
        const flatten = (x: string) => x.trim().replace(/\s*\r?\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
        const paras = text.split(/\r?\n\s*\r?\n/).map(flatten).filter(Boolean)
        const chunks = paras.length > 1 ? paras : text.split(/\r?\n/).map(flatten).filter(Boolean)
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
    sub: { fontSize: '13px', color: 'var(--dsw-alias-label-secondary)', margin: '0 0 16px 0' },
    section: { marginBottom: '18px' },
    secTitle: { fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--dsw-alias-label-primary)' },
    label: { display: 'block', fontSize: '12px', color: 'var(--dsw-alias-label-secondary)', margin: '8px 0 4px 0' },
    input: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
    textarea: { width: '100%', boxSizing: 'border-box', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', minHeight: '54px', resize: 'vertical' },
    chipRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
    chip: { padding: '5px 12px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-bg-layer-2)' },
    chipOn: { padding: '5px 12px', border: '1px solid #4a6cf7', borderRadius: '16px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-interactive-bg-active)', color: 'var(--dsw-alias-state-business-primary)', fontWeight: 600 },
    templateGrid: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' },
    templateCard: { width: '160px', padding: '12px 12px 10px', border: '1px solid #e5e7eb', borderRadius: '10px', textAlign: 'center' as const, cursor: 'pointer', background: 'var(--dsw-alias-bg-layer-2)', transition: 'all 0.15s' },
    templateCardOn: { borderColor: 'var(--dsw-alias-state-business-primary)', background: 'var(--dsw-alias-interactive-bg-active)', boxShadow: '0 0 0 2px rgba(74,108,247,0.15)' },
    templateName: { fontSize: '13px', fontWeight: 600, color: 'var(--dsw-alias-label-primary)', marginBottom: '4px' },
    templateDesc: { fontSize: '11px', color: 'var(--dsw-alias-label-tertiary)', lineHeight: 1.4, minHeight: '28px' },
    templateCheck: { fontSize: '12px', color: 'var(--dsw-alias-state-business-primary)', fontWeight: 600, marginTop: '6px' },
    btn: { padding: '8px 18px', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-state-business-primary)', color: '#fff' },
    ghost: { padding: '8px 18px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', background: 'var(--dsw-alias-bg-layer-2)', color: 'var(--dsw-alias-label-primary)' },
    row: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' },
    tabBar: { display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '14px' },
    tab: { padding: '8px 14px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dsw-alias-label-secondary)', borderBottom: '2px solid transparent' },
    tabOn: { padding: '8px 14px', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dsw-alias-state-business-primary)', fontWeight: 600, borderBottom: '2px solid #4a6cf7' },
    hint: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid #eee', borderRadius: '6px', padding: '8px 10px', marginTop: '4px' },
    status: { fontSize: '13px', marginTop: '10px', color: 'var(--dsw-alias-state-business-primary)' },
  } as Record<string, React.CSSProperties>

  return (
    <div style={s.wrap}>
      <h1 style={s.h}>数字分身设置</h1>
      <p style={s.sub}>分身的初始化与数据管理：模板一键生成初版人格卡、知识种子写入共享记忆、人格卡导入导出。人格编辑与运行监控在主对话窗口「数字分身」Tab。</p>

      <div style={s.tabBar}>
        {([['persona', '人格'], ['knowledge', '知识']] as const).map(([id, label]) => (
          <button key={id} style={tab === id ? s.tabOn : s.tab} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'persona' && (
        <div style={s.section}>
          <div style={s.secTitle}>模板预设（一键生成初版人格卡）</div>
          <div style={s.templateGrid}>
            {PRESETS.map((p) => (
              <div key={p.id} style={cfg.template === p.id ? { ...s.templateCard, ...s.templateCardOn } : s.templateCard} onClick={() => applyPreset(p.id)}>
                <div style={s.templateName}>{p.label}</div>
                <div style={s.templateDesc}>{p.desc}</div>
                {cfg.template === p.id && <div style={s.templateCheck}>✓ 已选</div>}
              </div>
            ))}
          </div>
          {toolHint && <div style={s.hint}>🛡️ {toolHint}</div>}
          <div style={s.secTitle}>当前人格（只读摘要）</div>
          {cardsState ? (
            <div style={s.hint}>
              人格卡修订 {cardsState.file.revisionNo} · {cardsState.file.status}{cardsState.hasEffective ? '（生效中）' : '（候选——回归通过后生效）'}
              <br />
              {cardsState.file.current.identity.fields.filter((f) => f.value !== '').length > 0
                ? cardsState.file.current.identity.fields.filter((f) => f.value !== '').map((f) => `${f.key}=${f.value.length > 14 ? f.value.slice(0, 14) + '…' : f.value}`).join(' · ')
                : '（身份字段全空——可先用上方模板生成，或到人格卡填写）'}
              <br />
              编辑人格请到 <b>主对话窗口「数字分身」Tab → 人格卡</b>（此处不再提供第二个人格编辑器，避免双源冲突）。
            </div>
          ) : (
            <div style={s.hint}>人格卡尚未加载（服务端不可用？）。</div>
          )}
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
          <div style={{ ...s.hint, marginTop: 10 }}>
            此处编辑的是「种子」；保存后写入共享记忆库。要查看 / 编辑 / 删除已入库的
            单条记忆（含分身对话中沉淀的记忆），请到左侧「记忆」标签页（dsh-memory 提供）。
          </div>
        </div>
      )}

      {stats && (
        <div style={s.hint}>
          状态：记忆 {stats.memoryTotal} 条{stats.memoryTotal > 0 ? `（${Object.entries(stats.memoryTypes).map(([k, v]) => `${k}×${v}`).join('，')}）` : ''} · 人格{stats.hasPersona ? '已配置' : '未配置'}
        </div>
      )}

      <label style={{ ...s.hint, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={cfg.becomeDefaultPreset === true}
          onChange={(e) => setCfg((prev) => ({ ...prev, becomeDefaultPreset: e.target.checked }))}
        />
        把「数字分身」设为默认 agent 预设
      </label>
      {cfg.becomeDefaultPreset === true && (
        <div style={{ ...s.hint, color: 'var(--dsw-alias-state-success-primary)' }}>
          ✓ 数字分身预设已包含全部工具（shell / 文件系统 / 电脑操作 / 联网等）。勾选后所有新会话都以你的分身身份工作：人格、记忆、工具完全一致。访客会话仍按访客权限白名单受限，不受影响。
        </div>
      )}

      <div style={s.row}>
        <button style={s.btn} disabled={!loaded || saving} onClick={handleSave}>{saving ? '保存中…' : '保存并生效'}</button>
        <button style={s.ghost} onClick={handlePreviewToggle}>{preview ? '收起预览' : '预览注入的人格'}</button>
        <button style={s.ghost} onClick={handleExport}>导出人格卡</button>
        <label style={s.ghost}>
          导入人格
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>
      {preview && (
        <pre style={{ ...s.hint, whiteSpace: 'pre-wrap', background: 'rgba(127,127,127,0.12)', padding: 10, borderRadius: 8, maxHeight: 260, overflow: 'auto' }}>
          {preview.persona || '（人格为空：名字/风格等字段全空时不注入人格段）'}
          {preview.guard ? `\n\n${preview.guard}` : ''}
        </pre>
      )}
      {status && <div style={s.status}>{status}</div>}
    </div>
  )
}
