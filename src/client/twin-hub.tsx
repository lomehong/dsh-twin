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
  wrap: { padding: '18px 20px', maxWidth: '860px' },
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
