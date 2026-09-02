/**
 * 四张卡 → 系统提示词投影（纯函数，实施计划 T3）
 *
 * render(cards, viewer) 是纯函数：同输入同输出、可快照比对——任何一次行为
 * 都能溯源到"哪张卡的哪一条导致了它"（设计文档 v0.2 决策一）。
 *
 * 投影规则：
 * - 身份卡：私密字段仅在主人视图出现（结构性缺失，不是"要求保密"）
 * - 策略卡：仅 enabled 规则；红线（escalate 非空）显式标注升级路径
 * - 样例卡：对照式呈现（这么说 / 不这么说），最多注入 6 条
 * - 状态卡：跳过已衰减（decayAt < now）条目
 * - 空段丢弃；整卡为空返回空字符串（调用方回落 legacy 渲染）
 */
import type { TwinCards } from './cards.ts';
export interface ProjectionViewer {
    role: 'master' | 'guest';
}
export interface ProjectionOptions {
    /** 注入时间（ISO），状态卡衰减判定用；缺省取当前时间 */
    now?: string;
    /** 通道（企微/飞书/网页），仅作标注，不影响内容裁剪 */
    channel?: string;
}
export declare function renderCards(cards: TwinCards, viewer: ProjectionViewer, opts?: ProjectionOptions): string;
/** 投影摘要（回归报告/预览用）：各卡注入条数 */
export declare function projectionSummary(cards: TwinCards, viewer: ProjectionViewer, opts?: ProjectionOptions): {
    identity: number;
    policy: number;
    exemplars: number;
    state: number;
    bytes: number;
};
