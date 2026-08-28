/**
 * dsh-twin 转人工工具的 agent preset 入口：preset 行
 * （`name: '@dsh-extra/dsh-twin/tools'`）引用本模块，digital-twin 预设
 * 组合出的会话获得 `escalate_to_owner` 工具——让「边界与转人工」人格字段
 * 从提示词承诺变成真实能力（遇到权限不足/敏感操作/投诉时真正通知主人）。
 *
 * 通知通道：im-channel 提供的 pushToUser + botsStatus（含 isMaster 绑定），
 * 与 dsh-model-failover 的 Owner 通知同款；im-channel 缺席时工具降级返回
 * 明确错误，绝不让注册或执行炸掉会话。
 *
 * @module @dsh-extra/dsh-twin/tools
 */
import type { Context } from '@deepseek-ai/cordis'

/* ─────────────── 类型（结构化声明，避免引入重型 dsh 包） ─────────────── */

interface ImChannelBindingLike {
  userId: string
  isMaster?: boolean
}

interface ImBotStatusLike {
  kind: string
  bindings?: ImChannelBindingLike[]
}

/** im-channel 服务在位时的最小结构视图。 */
interface ImChannelLike {
  botsStatus(): ImBotStatusLike[]
  pushToUser(kind: string, userId: string, text: string, options?: { markdown?: boolean }): Promise<boolean> | boolean
}

/** 宿主 tools 服务（ctx.tools 或 ctx.get('tools')）的最小结构视图。 */
interface ToolsLike {
  register(tool: {
    name: string
    description: string
    parameters: object
    execute: (args: unknown) => Promise<unknown>
  }): void
}

export interface EscalateArgs {
  reason?: string
  detail?: string
}

export type EscalateResult = { ok: false; error: string } | { ok: true; delivered: number; targets: number }

export const name = 'tool-twin-escalate'
export const inject = ['tools']

/* ── 进程级频控：滑动窗口内限制升级通知次数，防止（被注入诱导的）会话刷屏主人 ── */
const ESCALATE_WINDOW_MS = 10 * 60 * 1000
const ESCALATE_MAX_PER_WINDOW = 3
const escalateAttempts: number[] = []

/** 测试钩子：清空频控窗口。 */
export function resetEscalateThrottle(): void {
  escalateAttempts.length = 0
}

/** 经 im-channel 把升级请求推给所有已绑定的主人（跨渠道去重，上限 3 个目标）。 */
export async function escalateToOwner(ctx: Context, { reason, detail }: EscalateArgs): Promise<EscalateResult> {
  const im = (ctx as unknown as { get?(name: string): unknown }).get?.('im-channel') as ImChannelLike | undefined
  if (!im || typeof im.botsStatus !== 'function' || typeof im.pushToUser !== 'function') {
    return { ok: false, error: 'im-channel 未安装或未提供通知服务（转人工需要企业微信/飞书/微信通道）' }
  }
  let targets: Array<{ kind: string; userId: string }>
  try {
    targets = []
    for (const bot of im.botsStatus()) {
      for (const b of (bot.bindings ?? [])) {
        if (b.isMaster && b.userId) targets.push({ kind: bot.kind, userId: b.userId })
      }
    }
  } catch (e) {
    return { ok: false, error: '读取主人绑定失败: ' + (e instanceof Error ? e.message : String(e)) }
  }
  // 跨渠道去重（同一主人可能绑多渠道），上限 3 防止异常绑定刷屏
  const seen = new Set<string>()
  targets = targets.filter((t) => (seen.has(t.userId) ? false : (seen.add(t.userId), true))).slice(0, 3)
  if (targets.length === 0) {
    return { ok: false, error: '未找到主人绑定（主人在 IM 里发送 /bind 绑定后转人工才可用）' }
  }
  // 频控：到达推送阶段才计数（绑定缺失/读取失败不计）。进程级全局限流——
  // 多个访客共享预算是刻意的：保护的是主人注意力的总量。
  const now = Date.now()
  while (escalateAttempts.length > 0 && now - escalateAttempts[0] > ESCALATE_WINDOW_MS) {
    escalateAttempts.shift()
  }
  if (escalateAttempts.length >= ESCALATE_MAX_PER_WINDOW) {
    return {
      ok: false,
      error: `转人工过于频繁：${ESCALATE_WINDOW_MS / 60000} 分钟内最多 ${ESCALATE_MAX_PER_WINDOW} 次，请稍后再试或自行向主人求助`,
    }
  }
  escalateAttempts.push(now)
  const text = `【数字分身 · 转人工】${String(reason || '').trim()}${detail ? '\n' + String(detail).trim() : ''}\n（来自数字分身的升级请求，请主人跟进处理；对方已在等待）`
  let delivered = 0
  for (const t of targets) {
    try {
      const ok = await im.pushToUser(t.kind, t.userId, text, { markdown: true })
      if (ok) delivered += 1
    } catch { /* 单目标失败不阻断其余目标 */ }
  }
  if (delivered === 0) return { ok: false, error: '通知发送失败（所有渠道均不可达）' }
  return { ok: true, delivered, targets: targets.length }
}

export function apply(ctx: Context): void {
  const host = ctx as unknown as { tools?: ToolsLike; get?(name: string): unknown }
  const tools = (host.tools ?? host.get?.('tools')) as ToolsLike | undefined
  if (!tools || typeof tools.register !== 'function') return
  // 注册失败降级为跳过：绝不让工具注册问题炸掉会话创建（对齐 im-channel 遮蔽注册的守则）
  try {
    tools.register({
      name: 'escalate_to_owner',
      description:
        '转人工：把当前对话升级给主人处理。遇到权限不足、敏感或高风险操作、需要主人决策、访客投诉或你无法解决的问题时调用。' +
        '会把原因推送给主人（IM 通知），调用成功后应告知对方「已转达主人，会尽快跟进」。',
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['reason'],
        properties: {
          reason: { type: 'string', description: '一句话说明为什么需要主人处理（将原文推送给主人）' },
          detail: { type: 'string', description: '可选：需要主人知道的上下文或对方诉求摘要' },
        },
      },
      execute: async (args) => escalateToOwner(ctx, (args ?? {}) as EscalateArgs),
    })
  } catch (e) {
    try { console.warn('[dsh-twin] escalate_to_owner 工具注册失败（跳过）:', e instanceof Error ? e.message : String(e)) } catch { /* 忽略 */ }
  }
}
