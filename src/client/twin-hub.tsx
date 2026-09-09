/**
 * 数字分身主面板（v2，客户端）：单一 conversation.view Tab。
 *
 * 内部集成六个子视图：今日待办 · 学习队列 · 关系档案 · 影子测试 · 监控 · 人格卡。
 * 通过内部 Tab 栏切换，不增加会话 Tab 栏宽度。
 *
 * 「任务看板」是 dsh-task-board 独立插件自注册的同级 conversation.view（order 22），
 * 不嵌入本 Tab——保持插件职责与挂载独立（决策五：任务中心化，但看板与分身是
 * 平级组织维度，不是父子）。
 */
import { useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { DashboardPage } from './dashboard.tsx'
import { LearningPage } from './learning.tsx'
import { ProfilesPage } from './profiles.tsx'
import { ShadowPage } from './shadow.tsx'
import { MonitorPage } from './monitor.tsx'
import { CardsPage } from './cards.tsx'

export const inject = ['slots']

type SubTab = 'todo' | 'learning' | 'profiles' | 'shadow' | 'monitor' | 'cards'

const SUB_TABS: Array<{ id: SubTab; label: string }> = [
  { id: 'todo', label: '今日待办' },
  { id: 'learning', label: '学习队列' },
  { id: 'profiles', label: '关系档案' },
  { id: 'shadow', label: '影子测试' },
  { id: 'monitor', label: '监控' },
  { id: 'cards', label: '人格卡' },
]

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: '18px 20px 140px' },
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid var(--dsw-alias-border-l2)',
    marginBottom: 14,
  },
  tabBtn: {
    padding: '8px 18px',
    fontSize: 13,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--dsw-alias-label-secondary)',
    borderBottom: '2px solid transparent',
    transition: 'color .15s, border-color .15s',
  },
  tabBtnOn: {
    padding: '8px 18px',
    fontSize: 13,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--dsw-alias-state-business-primary)',
    fontWeight: 600,
    borderBottom: '2px solid var(--dsw-alias-state-business-primary)',
    transition: 'color .15s, border-color .15s',
  },
}

export function applyTwinHub(ctx: ClientContext): void {
  ctx.slots.inject('conversation.view', () =>
    ctx.slots.register(
      // order 19：紧跟宿主对话/轨迹，排在记忆(20)/御驿(20)之前——
      // 运营中心是主人高频入口，不应沉底
      { name: 'conversation.view', id: 'twin-hub', order: 19, label: () => '数字分身' },
      TwinHubPage,
    ),
  )
  // alpha.2 全局面板（特性检测双写）：宿主具备 main/sidebar.panellist slot 时，
  // 数字分身主面板同时挂为侧边栏全局面板——浏览器侧边栏直达运营中心。
  // alpha.1 无此 slot（spec 缺失或返回 undefined），静默跳过，零副作用。
  const slots = ctx.slots as ClientContext['slots'] & { spec?: (name: string) => unknown }
  if (typeof slots.spec !== 'function') return
  try {
    if (slots.spec('main') !== undefined) {
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'twin-dashboard' }, TwinHubPage),
      )
    }
    if (slots.spec('sidebar.panellist') !== undefined) {
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'twin-dashboard', order: 19, label: () => '数字分身' },
          ({ size, active }) => hubIcon(size, active),
        ),
      )
    }
  } catch { /* 新 API 不可用时静默回退旧注册 */ }
}

/** 侧边栏面板图标（数字分身：人形+光环），active 时用业务主色。 */
function hubIcon(size: number, active: boolean): JSX.Element {
  const color = active ? 'var(--dsw-alias-state-business-primary)' : 'var(--dsw-alias-label-secondary)'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path d="M4 20c1.8-3.4 4.6-5 8-5s6.2 1.6 8 5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TwinHubPage() {
  const [tab, setTab] = useState<SubTab>('todo')
  return (
    <div style={s.wrap}>
      <div style={s.tabBar}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            style={tab === t.id ? s.tabBtnOn : s.tabBtn}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'todo' && <DashboardPage />}
      {tab === 'learning' && <LearningPage />}
      {tab === 'profiles' && <ProfilesPage />}
      {tab === 'shadow' && <ShadowPage />}
      {tab === 'monitor' && <MonitorPage />}
      {tab === 'cards' && <CardsPage />}
    </div>
  )
}
