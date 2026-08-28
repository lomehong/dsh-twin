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
import type { Context } from '@deepseek-ai/cordis';
export interface EscalateArgs {
    reason?: string;
    detail?: string;
}
export type EscalateResult = {
    ok: false;
    error: string;
} | {
    ok: true;
    delivered: number;
    targets: number;
};
export declare const name = "tool-twin-escalate";
export declare const inject: string[];
/** 经 im-channel 把升级请求推给所有已绑定的主人（跨渠道去重，上限 3 个目标）。 */
export declare function escalateToOwner(ctx: Context, { reason, detail }: EscalateArgs): Promise<EscalateResult>;
export declare function apply(ctx: Context): void;
