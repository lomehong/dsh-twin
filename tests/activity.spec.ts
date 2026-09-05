/**
 * 活动感知区段测试（主任拍板：看板 = 唯一活动权威）：
 * - 主任视图全量（任务执行现场 / 待审批 / 自由会话 / 最近完成）；
 * - 访客完全不可见（拍板 3）；
 * - 看板缺席或空闲 → 空串零 token。
 */
import { describe, expect, it } from 'vitest'
import { injectBoardGetter, renderActivitySection, type BoardActivity, type BoardActivityProvider } from '../src/activity.ts'

function boardWith(activity: Partial<BoardActivity>): BoardActivityProvider {
  return {
    activity: () => ({
      at: '2026-09-05T08:00:00.000Z',
      runningTasks: [], freeSessions: [], pendingApprovals: [], recentCompleted: [],
      ...activity,
    }),
  }
}

describe('renderActivitySection', () => {
  it('看板缺席 → 空串', () => {
    injectBoardGetter(() => undefined)
    expect(renderActivitySection({ guestView: false })).toBe('')
  })

  it('空闲（全部维度为空）→ 空串零成本', () => {
    injectBoardGetter(() => boardWith({}))
    expect(renderActivitySection({ guestView: false })).toBe('')
  })

  it('主任视图：任务执行现场 / 自由会话 / 待审批 / 最近完成全量渲染', () => {
    injectBoardGetter(() => boardWith({
      runningTasks: [{ taskId: 'TB-1', title: '周报汇总', sessionId: 'session-1' }],
      freeSessions: [{ sessionId: 'session-free', title: '自由现场' }],
      pendingApprovals: [{ taskId: 'TB-2', title: '对外公告' }],
      recentCompleted: [{ taskId: 'TB-3', title: '数据整理', status: '成功', summary: '完成' }],
    }))
    const text = renderActivitySection({ guestView: false })
    expect(text).toContain('进行中任务 1 项')
    expect(text).toContain('〈周报汇总〉')
    expect(text).toContain('（执行会话运行中）')
    expect(text).toContain('待主任审批 1 项')
    expect(text).toContain('自由会话 1 个（未归属任务）')
    expect(text).toContain('〈自由现场〉')
    expect(text).toContain('最近完成')
    expect(text).toContain('不要只谈当前对话')
  })

  it('访客完全不可见（拍板 3）：有活动也是空串', () => {
    injectBoardGetter(() => boardWith({
      runningTasks: [{ taskId: 'TB-1', title: '机密事务', sessionId: 'session-1' }],
    }))
    expect(renderActivitySection({ guestView: true })).toBe('')
  })

  it('标题缺失的自由会话回退会话号前缀', () => {
    injectBoardGetter(() => boardWith({ freeSessions: [{ sessionId: 'abcdefgh-1234' }] }))
    const text = renderActivitySection({ guestView: false })
    expect(text).toContain('〈abcdefgh〉')
  })

  it('自主目标维度：渲染轮次与 objective，且该会话不再进自由会话行', () => {
    injectBoardGetter(() => boardWith({
      freeSessions: [{ sessionId: 'sess-goal', title: '长任务现场' }],
      goals: [{ sessionId: 'sess-goal', title: '长任务现场', objective: '整理本周全部会话要点并生成纪要', roundsStarted: 2, maxGoalRounds: 5 }],
    }))
    const text = renderActivitySection({ guestView: false })
    expect(text).toContain('自主目标 1 个（自由会话推进中）')
    expect(text).toContain('〈整理本周全部会话要点并生成纪要〉第 2/5 轮')
    expect(text).not.toContain('未归属任务')
  })
})
