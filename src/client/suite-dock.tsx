/**
 * 套件状态坞（suite-dock，B 方案）：右缘一个窄竖签聚合 IM 渠道 / 御驿协同 /
 * 心智三个常驻入口——替代 im 横签与 yuyi 拉手在顶部角落的相互拥挤。
 *
 * 宪章合规：
 * - 跨插件只走同源 HTTP 探测（/im-channel/bots/status、/dsh-mind/status）与
 *   约定式 window 事件（suite-dock 契约，见 suite-dock-model.ts）；
 * - 每行独立显式降级：对应插件缺席（探测失败/无广播）该行隐藏，全缺席不渲染；
 * - dock 挂载期写 localStorage 心跳，im/yuyi 见心跳即隐藏自己的角标，
 *   dock 缺席（twin 未装）它们自动回归常驻——联邦语义不破坏。
 *
 * 方案 C：宿主具备 main/sidebar.panellist 槽位时，dock 注册为侧栏轨面板
 * （spec 特性检测双写，先例 dsh-mind/twin-hub），不再占 overlay。
 */
import { useEffect, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import {
  DOCK_STORAGE_KEY, EV_GONE, EV_MIND_COMPANION, EV_READY, EV_YUYI_OPEN, EV_YUYI_STATUS,
  dockFresh, imTraffic, mindTraffic, trafficColor, yuyiTraffic,
  type MindStatusLike, type Traffic,
} from './suite-dock-model.ts'

interface ImBotLite {
  kind: string
  label: string
  configured: boolean
  online: boolean
  account?: string
  boundUsers: number
  bindings?: Array<{ userId: string; isMaster: boolean; boundAt: string }>
}

const POLL_IM_MS = 30_000
const POLL_MIND_MS = 25_000
const HEARTBEAT_MS = 30_000
/** yuyi 状态等待窗：超时无广播视为 yuyi 客户端缺席。 */
const YUYI_WAIT_MS = 5_000

const S = {
  dock: {
    position: 'absolute', right: 0, bottom: 116, zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
    pointerEvents: 'auto',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 8px', minWidth: 34, justifyContent: 'center',
    border: '1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25))', borderRight: 'none',
    borderRadius: '10px 0 0 10px', cursor: 'pointer',
    background: 'var(--dsw-alias-bg-layer-2, rgba(30,32,36,.96))',
    color: 'var(--dsw-alias-label-secondary, #aaa)', fontSize: 12, lineHeight: 1,
  },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  badge: {
    position: 'absolute', top: -5, right: -4, minWidth: 15, height: 15, padding: '0 4px',
    borderRadius: 8, background: 'var(--dsw-alias-state-warn-primary, #b8860b)', color: '#fff',
    fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    position: 'absolute', right: 10, bottom: 8, width: 292, maxHeight: 420, overflowY: 'auto',
    padding: '12px 14px', borderRadius: 12, pointerEvents: 'auto',
    background: 'var(--dsw-alias-bg-base, rgba(24,26,30,.98))',
    border: '1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25))',
    boxShadow: '0 6px 24px rgba(0,0,0,.2)', color: 'var(--dsw-alias-label-primary, #eee)',
  },
} satisfies Record<string, React.CSSProperties>

/** 心跳：挂载期每 30s 写一次，卸载清除——im/yuyi 据此让位/回归。 */
function useDockHeartbeat(): void {
  useEffect(() => {
    const beat = (): void => {
      try {
        localStorage.setItem(DOCK_STORAGE_KEY, new Date().toISOString())
        window.dispatchEvent(new CustomEvent(EV_READY))
      } catch { /* 存储拒绝：dock 降级为仅事件通知 */ }
    }
    beat()
    const t = window.setInterval(beat, HEARTBEAT_MS)
    return () => {
      window.clearInterval(t)
      try {
        localStorage.removeItem(DOCK_STORAGE_KEY)
        window.dispatchEvent(new CustomEvent(EV_GONE))
      } catch { /* 同上 */ }
    }
  }, [])
}

/** 顶部一级 Tab 切换（DOM 契约，同 dsh-mind nav.ts 手法）。 */
function clickConversationTab(label: string): void {
  try {
    const strip = document.querySelector('[data-conversation-tabs]')
    const buttons = strip !== null
      ? Array.from(strip.querySelectorAll('button[role="tab"]'))
      : Array.from(document.querySelectorAll('button[role="tab"]'))
    buttons.find(b => (b.textContent ?? '').trim() === label)?.click()
  } catch { /* DOM 不在预期形态：静默 */ }
}

function Dot({ traffic }: { traffic: Traffic }): JSX.Element {
  return <span aria-hidden style={{ ...S.dot, background: trafficColor(traffic) }} />
}

/** 相对时间（im 绑定行用；与 ui-settings-im 同文案）。 */
function relativeTime(iso: string): string {
  const at = Date.parse(iso)
  if (!Number.isFinite(at)) return iso
  const m = Math.floor(Math.max(0, Date.now() - at) / 60_000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  const d = Math.floor(h / 24)
  return d <= 30 ? `${d} 天前` : new Date(at).toLocaleDateString()
}

/** 套件状态坞主体（overlay 竖签 / 展开卡共用）。 */
export function SuiteDock(): JSX.Element | null {
  useDockHeartbeat()
  const [imBots, setImBots] = useState<ImBotLite[] | undefined>(undefined)
  const [mind, setMind] = useState<MindStatusLike | undefined>(undefined)
  const [yuyi, setYuyi] = useState<{ configured?: boolean; connected?: boolean; panelOpen?: boolean } | undefined>(undefined)
  const [yuyiSeen, setYuyiSeen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [suppressed, setSuppressed] = useState(false)

  // IM：同源探测（缺席 = 探测失败 → 行隐藏）
  useEffect(() => {
    let cancelled = false
    const load = (): void => {
      void fetch('/im-channel/bots/status')
        .then(r => r.json() as Promise<{ ok: boolean; bots?: ImBotLite[] }>)
        .then(b => { if (!cancelled) setImBots(b.ok === true ? (b.bots ?? []) : undefined) })
        .catch(() => { if (!cancelled) setImBots(undefined) })
    }
    void load()
    const t = window.setInterval(load, POLL_IM_MS)
    return () => { cancelled = true; window.clearInterval(t) }
  }, [])

  // 心智：同源探测
  useEffect(() => {
    let cancelled = false
    const load = (): void => {
      void fetch('/dsh-mind/status')
        .then(r => r.json() as Promise<MindStatusLike>)
        .then(b => { if (!cancelled) setMind(b) })
        .catch(() => { if (!cancelled) setMind(undefined) })
    }
    void load()
    const t = window.setInterval(load, POLL_MIND_MS)
    return () => { cancelled = true; window.clearInterval(t) }
  }, [])

  // 御驿：约定事件（yuyi 客户端广播）；等待窗内无广播视为缺席
  useEffect(() => {
    const onStatus = (e: Event): void => {
      const detail = (e as CustomEvent<{ configured?: boolean; connected?: boolean; panelOpen?: boolean }>).detail
      setYuyiSeen(true)
      setYuyi(detail ?? {})
    }
    const onCompanion = (e: Event): void => {
      setSuppressed((e as CustomEvent<{ open?: boolean }>).detail?.open === true)
    }
    window.addEventListener(EV_YUYI_STATUS, onStatus)
    window.addEventListener(EV_MIND_COMPANION, onCompanion)
    const t = window.setTimeout(() => { if (!yuyiSeen) setYuyiSeen(true) }, YUYI_WAIT_MS)
    return () => {
      window.removeEventListener(EV_YUYI_STATUS, onStatus)
      window.removeEventListener(EV_MIND_COMPANION, onCompanion)
      window.clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const im = imTraffic(imBots)
  const yu = yuyiSeen ? yuyiTraffic(yuyi) : 'absent'
  const md = mindTraffic(mind)
  if (im === 'absent' && yu === 'absent' && md === 'absent') return null
  if (suppressed || yuyi?.panelOpen === true) return null // 御驿面板/存在体展开期暂避

  const asks = mind?.openAsks ?? 0

  return (
    <>
      {expanded && im !== 'absent' && (
        <div role="status" style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>IM 渠道</div>
          {(imBots ?? []).map(b => (
            <div key={b.kind} style={{ padding: '6px 0', borderTop: '1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.14))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <Dot traffic={b.configured ? (b.online ? 'ok' : 'degraded') : 'down'} />
                <span style={{ fontWeight: 500 }}>{b.label}</span>
                <span style={{ opacity: 0.65, fontSize: 11 }}>
                  {!b.configured ? '未配置' : b.online ? '在线' : '离线'}{b.account !== undefined && b.account !== '' ? ` · ${b.account}` : ''}
                </span>
                <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 11 }}>{b.boundUsers} 绑定</span>
              </div>
              {(b.bindings ?? []).slice(0, 3).map(bd => (
                <div key={`${bd.userId}`} style={{ display: 'flex', gap: 8, fontSize: 11, opacity: 0.7, padding: '2px 0 0 15px' }}>
                  <span>{bd.isMaster ? '👑 主人' : '访客'}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bd.userId}</span>
                  <span style={{ whiteSpace: 'nowrap' }}>{relativeTime(bd.boundAt)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div style={S.dock}>
        {im !== 'absent' && (
          <button
            type="button" title="IM 渠道（点击查看机器人状态）" aria-expanded={expanded}
            onClick={() => { setExpanded(o => !o) }} style={{ ...S.row, position: 'relative' }}
          >
            <span style={{ fontSize: 12 }}>IM</span>
            <Dot traffic={im} />
          </button>
        )}
        {yu !== 'absent' && (
          <button
            type="button" title="御驿协同（点击打开活动面板）"
            onClick={() => { window.dispatchEvent(new CustomEvent(EV_YUYI_OPEN)) }} style={S.row}
          >
            <span style={{ fontSize: 12 }}>驿</span>
            <Dot traffic={yu} />
          </button>
        )}
        {md !== 'absent' && (
          <button
            type="button" title={`心智（${asks > 0 ? `${asks} 件事等你给——` : ''}点击打开 TA 的房间）`}
            onClick={() => { clickConversationTab('心智') }} style={{ ...S.row, position: 'relative' }}
          >
            <span style={{ fontSize: 12 }}>心智</span>
            <Dot traffic={md} />
            {asks > 0 && <span aria-hidden style={S.badge}>{asks > 9 ? '9+' : asks}</span>}
          </button>
        )}
      </div>
    </>
  )
}

/**
 * 注册入口（方案 C 特性检测双写）：宿主具备 main/sidebar.panellist 时 dock
 * 进侧栏轨（不占 overlay）；否则驻留 shell.overlay 右缘。
 */
export function applySuiteDock(ctx: ClientContext): void {
  const slots = ctx.slots as ClientContext['slots'] & { spec?: (name: string) => unknown }
  const railMode = typeof slots.spec === 'function' && slots.spec('main') !== undefined
  try {
    if (railMode) {
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
        { name: 'sidebar.panellist', id: 'suite-dock', order: 18, label: () => '套件' },
        (props: { size: number }) => (
          <span style={{ fontSize: Math.min(13, props.size * 0.5), lineHeight: 1 }}>套件</span>
        ),
      ))
      ctx.slots.inject('main', () => ctx.slots.register(
        { name: 'main', key: 'suite-dock' },
        () => (
          <div style={{ padding: '18px 20px' }}>
            <SuiteDock />
          </div>
        ),
      ))
    } else {
      ctx.slots.inject('shell.overlay', () => ctx.slots.register(
        { name: 'shell.overlay', id: 'twin-suite-dock', order: 85, label: () => '套件状态坞' },
        () => <SuiteDock />,
      ))
    }
  } catch (e) {
    console.warn('[dsh-twin] 套件状态坞注册失败（显式降级）:', e instanceof Error ? e.message : String(e))
  }
}
