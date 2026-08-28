export const name = 'tool-twin-escalate';
export const inject = ['tools'];
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
            execute: async (args) => escalateToOwner(ctx, (args ?? {})),
        });
    }
    catch (e) {
        try {
            console.warn('[dsh-twin] escalate_to_owner 工具注册失败（跳过）:', e instanceof Error ? e.message : String(e));
        }
        catch { /* 忽略 */ }
    }
}
