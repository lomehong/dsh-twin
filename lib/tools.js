export const name = 'tool-twin-escalate';
export const inject = ['tools'];
/* ── 进程级频控：滑动窗口内限制升级通知次数，防止（被注入诱导的）会话刷屏主人 ── */
const ESCALATE_WINDOW_MS = 10 * 60 * 1000;
const ESCALATE_MAX_PER_WINDOW = 3;
const escalateAttempts = [];
/** 测试钩子：清空频控窗口。 */
export function resetEscalateThrottle() {
    escalateAttempts.length = 0;
}
/** 经 im-channel 把升级请求推给所有已绑定的主人（跨渠道去重，上限 3 个目标）。 */
export async function escalateToOwner(ctx, { reason, detail }) {
    const im = ctx.get?.('im-channel');
    if (!im || typeof im.botsStatus !== 'function' || typeof im.pushToUser !== 'function') {
        return { ok: false, error: 'im-channel 未安装或未提供通知服务（转人工需要企业微信/飞书/微信通道）' };
    }
    let targets;
    try {
        targets = [];
        for (const bot of im.botsStatus()) {
            for (const b of (bot.bindings ?? [])) {
                if (b.isMaster && b.userId)
                    targets.push({ kind: bot.kind, userId: b.userId });
            }
        }
    }
    catch (e) {
        return { ok: false, error: '读取主人绑定失败: ' + (e instanceof Error ? e.message : String(e)) };
    }
    // 跨渠道去重（同一主人可能绑多渠道），上限 3 防止异常绑定刷屏
    const seen = new Set();
    targets = targets.filter((t) => (seen.has(t.userId) ? false : (seen.add(t.userId), true))).slice(0, 3);
    if (targets.length === 0) {
        return { ok: false, error: '未找到主人绑定（主人在 IM 里发送 /bind 绑定后转人工才可用）' };
    }
    // 频控：到达推送阶段才计数（绑定缺失/读取失败不计）。进程级全局限流——
    // 多个访客共享预算是刻意的：保护的是主人注意力的总量。
    const now = Date.now();
    while (escalateAttempts.length > 0 && now - escalateAttempts[0] > ESCALATE_WINDOW_MS) {
        escalateAttempts.shift();
    }
    if (escalateAttempts.length >= ESCALATE_MAX_PER_WINDOW) {
        return {
            ok: false,
            error: `转人工过于频繁：${ESCALATE_WINDOW_MS / 60000} 分钟内最多 ${ESCALATE_MAX_PER_WINDOW} 次，请稍后再试或自行向主人求助`,
        };
    }
    escalateAttempts.push(now);
    const text = `【数字分身 · 转人工】${String(reason || '').trim()}${detail ? '\n' + String(detail).trim() : ''}\n（来自数字分身的升级请求，请主人跟进处理；对方已在等待）`;
    let delivered = 0;
    for (const t of targets) {
        try {
            const ok = await im.pushToUser(t.kind, t.userId, text, { markdown: true });
            if (ok)
                delivered += 1;
        }
        catch { /* 单目标失败不阻断其余目标 */ }
    }
    if (delivered === 0)
        return { ok: false, error: '通知发送失败（所有渠道均不可达）' };
    return { ok: true, delivered, targets: targets.length };
}
export function apply(ctx) {
    const host = ctx;
    const tools = (host.tools ?? host.get?.('tools'));
    if (!tools || typeof tools.register !== 'function')
        return;
    // 注册失败降级为跳过：绝不让工具注册问题炸掉会话创建（对齐 im-channel 遮蔽注册的守则）
    try {
        tools.register({
            name: 'escalate_to_owner',
            description: '转人工：把当前对话升级给主人处理。遇到权限不足、敏感或高风险操作、需要主人决策、访客投诉或你无法解决的问题时调用。' +
                '会把原因推送给主人（IM 通知），调用成功后应告知对方「已转达主人，会尽快跟进」。' +
                '主人随后在会话中明确批准或拒绝时：若共享记忆可用（memory_write 工具存在），用 memory_write 记录授权——' +
                'type=decision、statementType=授权，并填 authStatus（已授权/已拒绝）、authBy（主人 userid）、authVia（批准消息引用）、authRange（允许的对象与动作）；' +
                '此后同类不可逆动作应先经 memory_read(statementType=授权) 查得已有授权再执行，无授权则继续转人工。',
            parameters: {
                type: 'object',
                additionalProperties: false,
                required: ['reason'],
                properties: {
                    reason: { type: 'string', description: '一句话说明为什么需要主人处理（将原文推送给主人）' },
                    detail: { type: 'string', description: '可选：需要主人知道的上下文或对方诉求摘要' },
                },
            },
            // alpha.3 起 ToolDefinition.output 强制声明：canonical schema + render
            // （值→ContentBlock[]）+ 可选 presentationMeta。escalateToOwner 失败
            // 时把转人工失败原因也作为工具结果返回，便于上层与记忆系统记录。
            output: {
                schema: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['delivered'],
                    properties: {
                        delivered: { type: 'boolean', description: 'IM 推送是否成功送达主人' },
                        channel: { type: 'string', description: '送达渠道（im / terminal / none）' },
                        target: { type: 'string', description: '目标用户标识（master userId / fallback 标识）' },
                        reason: { type: 'string', description: '原样回显的 reason 入参（便于审计）' },
                        error: { type: 'string', description: '未送达时的错误消息（成功时缺失）' },
                    },
                },
                render: (_args, value) => {
                    const v = value;
                    if (v.delivered) {
                        return [{
                                type: 'text',
                                text: `已转达${v.target ? ` ${v.target}` : ''}（${v.channel ?? 'im'}）：${v.reason ?? ''}`,
                            }];
                    }
                    return [{
                            type: 'text',
                            text: `转人工未送达：${v.error ?? '未知原因'}。请改用 terminal 渠道或直接对话提醒主人。`,
                        }];
                },
            },
            execute: async (args) => {
                const r = await escalateToOwner(ctx, (args ?? {}));
                // alpha.4 ToolOutputDefinition 要求 schema/render 对齐——把 EscalateResult
                // 适配成 canonical { delivered, channel, target, reason, error? }：
                //   ok=true   → delivered=true, target=首位 owner 的 userId（次数取 delivered）
                //   ok=false  → delivered=false, error=错误消息
                if (!r.ok) {
                    return { delivered: false, channel: 'none', reason: args?.reason ?? '', error: r.error };
                }
                return {
                    delivered: true,
                    channel: 'im',
                    target: '', // escalateToOwner 没回具体 userId，留空字符串由 render 兜底
                    reason: args?.reason ?? '',
                };
            },
        });
    }
    catch (e) {
        try {
            console.warn('[dsh-twin] escalate_to_owner 工具注册失败（跳过）:', e instanceof Error ? e.message : String(e));
        }
        catch { /* 忽略 */ }
    }
}
