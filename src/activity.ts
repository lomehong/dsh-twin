/**
 * 实例级活动感知（消费端）——主任拍板：看板 = 唯一活动权威。
 *
 * 主任在**任何通道**问「在忙什么」，分身都要能感知整个实例。架构上 twin
 * **不做聚合**：dsh-task-board 的 tick（15s）维护活动视图并在启动时提供
 * `activity()` 只读服务；twin 只是渲染者——systemPrompt 活动区段每轮对话
 * 同步读取看板缓存，无需任何工具调用。
 *
 * 视图结构（由 dsh-task-board 定义，此处按结构类型消费，宪章 §3.1 类型级参考）：
 * - runningTasks：进行中任务的执行现场（任务号/标题/执行会话）
 * - freeSessions：运行中且无任务归属的会话（标注「未归属任务」）
 * - pendingApprovals：待主任审批的任务
 * - recentCompleted：最近完成的任务（含结果摘要）
 *
 * 可见性（主任拍板 3）：访客完全不可见——其他工作现场的标题可能含主任敏感事务。
 * 空闲时返回空串：零 token 成本。
 *
 * @module dsh-twin/activity
 */

/** 活动视图的最小结构视图（与 dsh-task-board 的 BoardActivity 结构一致）。 */
export interface BoardActivity {
  at: string
  runningTasks: Array<{ taskId: string; title: string; sessionId?: string }>
  freeSessions: Array<{ sessionId: string; title?: string }>
  /** 自由会话里进行中的自主目标（objective 已由看板截断 40 字，封顶 3） */
  goals: Array<{ sessionId: string; title?: string; objective: string; roundsStarted: number; maxGoalRounds: number }>
  pendingApprovals: Array<{ taskId: string; title: string }>
  recentCompleted: Array<{ taskId: string; title: string; status: string; finishedAt?: string; summary?: string }>
}

/** dsh-task-board 状态服务的最小结构视图。 */
export interface BoardActivityProvider {
  activity?(): BoardActivity
}

let boardGetter: (() => BoardActivityProvider | undefined) | undefined

/**
 * 注入看板活动服务获取器（插件 apply 时由 index.ts 接线）。
 * getter 返回 undefined 或 activity 缺席 → 活动区段整体降级为空（访客/主任都不注入）。
 */
export function injectBoardGetter(getter: () => BoardActivityProvider | undefined): void {
  boardGetter = getter
}

/**
 * 渲染 systemPrompt 活动区段（同步，读看板缓存）。
 * - 访客视图：完全不可见（拍板 3）；
 * - 看板缺席/未刷新/空闲：空串，零 token 成本；
 * - 主任视图：全量（任务执行现场 + 未归属自由会话 + 待审批 + 最近完成）。
 */
export function renderActivitySection(opts: { guestView: boolean }): string {
  if (opts.guestView) return ''
  const act = boardGetter?.()?.activity?.()
  if (act === undefined || act === null) return ''

  const runningTasks = act.runningTasks ?? []
  const freeSessions = act.freeSessions ?? []
  const goals = act.goals ?? []
  const pendingApprovals = act.pendingApprovals ?? []
  const recentCompleted = act.recentCompleted ?? []
  if (runningTasks.length === 0 && freeSessions.length === 0 && goals.length === 0 && pendingApprovals.length === 0 && recentCompleted.length === 0) {
    return ''
  }

  const hhmm = (act.at ?? '').slice(11, 16)
  const lines = [
    `# 当前实例活动（看板快照${hhmm === '' ? '' : ` ${hhmm}`}）`,
    '以下现场都是你自己——同一分身在其他工作现场的实时状态。主任问「在忙什么」时，如实汇报全局活动，不要只谈当前对话。',
  ]
  if (runningTasks.length > 0) {
    lines.push(`- 进行中任务 ${runningTasks.length} 项：${runningTasks.map(t => `〈${t.title}〉${t.sessionId !== undefined ? '（执行会话运行中）' : ''}`).join('、')}`)
  }
  if (pendingApprovals.length > 0) {
    lines.push(`- 待主任审批 ${pendingApprovals.length} 项：${pendingApprovals.map(t => `〈${t.title}〉`).join('、')}`)
  }
  if (goals.length > 0) {
    lines.push(`- 自主目标 ${goals.length} 个（自由会话推进中）：${goals.map(g => `〈${g.objective}〉第 ${g.roundsStarted}/${g.maxGoalRounds} 轮`).join('、')}`)
  }
  if (freeSessions.length > 0) {
    const goalSessionIds = new Set(goals.map(g => g.sessionId))
    const plain = freeSessions.filter(x => !goalSessionIds.has(x.sessionId))
    if (plain.length > 0) {
      lines.push(`- 自由会话 ${plain.length} 个（未归属任务）：${plain.map(x => `〈${x.title ?? x.sessionId.slice(0, 8)}〉`).join('、')}`)
    }
  }
  if (recentCompleted.length > 0) {
    lines.push(`- 最近完成：${recentCompleted.map(t => `〈${t.title}〉${t.status}`).join('、')}`)
  }
  return lines.join('\n')
}
