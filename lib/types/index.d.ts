import type { Context } from '@deepseek-ai/cordis';
export declare const name = "dsh-twin";
export declare const provide: string[];
export interface TwinIdentity {
    name: string;
    role: string;
    background: string;
}
export interface TwinPersona {
    tone: string;
    style: string;
    values: string;
    rules: string;
    escalation: string;
    avoid: string;
}
export interface TwinKnowledge {
    seeds: string[];
}
export interface TwinConfig {
    template: string;
    identity: TwinIdentity;
    persona: TwinPersona;
    knowledge: TwinKnowledge;
    becomeDefaultPreset: boolean;
}
export interface MaterializeResult {
    materialized: boolean;
    dir: string;
    error?: string;
}
export interface SeedResult {
    available: boolean;
    seeded: number;
}
export interface ConsolidateResult {
    available: boolean;
    removed: number;
}
export interface HistoryEntry {
    ts: string;
    config: TwinConfig;
}
export declare function defaultConfig(): TwinConfig;
export declare function loadConfig(): TwinConfig;
export declare function saveConfig(cfg: TwinConfig): TwinConfig;
/** 保存前把旧配置归档为版本快照（保留最近 10 个）。 */
export declare function archiveHistory(cfg: TwinConfig): void;
export declare function listHistory(): Array<{
    index: number;
    ts: string;
}>;
export declare function restoreHistory(index: number): {
    ok: false;
    error: string;
} | {
    ok: true;
    config: TwinConfig;
};
export declare function renderPersona(cfg: Partial<TwinConfig>, { guestView }?: {
    guestView?: boolean;
}): string;
/** 物化时可选中依赖的探测结果（生产环境默认现场探测；测试可注入）。 */
export interface OptionalDeps {
    memory: boolean;
    yuyi: boolean;
}
/**
 * 把内置预设物化到用户 agent-presets 根（版本化幂等）。返回是否本次写入。
 *
 * 可选依赖（dsh-memory / dsh-yuyi）的工具行**不写死在预设本体**：行引用的包
 * 未安装时，上游 agent-presets 的 discovery 会把整份组合判为不可挂载
 *（"row … names a plugin that cannot be resolved"）。因此这里按安装状态
 * 逐行追加——装了才有行，没装预设依然可用。
 */
export declare function materializePreset(deps?: OptionalDeps): MaterializeResult;
export declare function ensureDefaultPreset(ctx: Context): void;
/** 把知识种子写入 dsh-memory（若已安装）；按内容去重。 */
export declare function seedMemory(ctx: Context, cfg: TwinConfig): Promise<SeedResult>;
/**
 * 规整 dsh-memory：合并「内容规整后相同且同作者」的近重复条目，保留时间最新者，
 * 并集 participants（仅限同作者组）。幂等、安全。
 * 信任域隔离（安全评审 M1）：绝不跨作者合并、绝不把 scope 往公开提升——
 * 访客投毒的同文条目不得借此提升可见性或挤掉主人记忆。
 */
export declare function consolidateMemory(ctx: Context): Promise<ConsolidateResult>;
export declare function normalizeConfigInput(body: unknown): TwinConfig;
/** 用量/状态统计：记忆条数、类型分布、人格是否已配、模板、预设 id。 */
export declare function collectStats(ctx: Context): {
    preset: string;
    template: string;
    memoryTotal: number;
    memoryTypes: Record<string, number>;
    hasPersona: boolean;
};
/** 真实运行监控：聚合所有会话的 token 用量、耗时、turns、错误率（来自 dsh sessionStats/tokenUsage 投影）。 */
export declare function collectMonitor(ctx: Context): {
    sessionCount: number;
    twinSessionCount: number;
    tokens: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
        llmMs: number;
        toolMs: number;
        turns: number;
        steps: number;
        decodeTokens: number;
        errors: number;
    };
    llmMs: number;
    toolMs: number;
    turns: number;
    steps: number;
    errors: number;
    errorRate: number;
    top: {
        session: string;
        title: string;
        twin: boolean;
        tokens: number;
        turns: number;
        llmMs: number;
        errors: number;
    }[];
};
/**
 * 决定当前会话渲染主人视图还是访客视图（fail-closed）。
 * - 未安装 im-channel：不存在访客入口（纯网页部署），一律主人视图——否则
 *   background 对主人也永久不可见，安全收益为零、纯损功能。
 * - 已安装 im-channel：访客入口存在。只有被 driver 显式标注为主人的会话才
 *   渲染主人视图；未标注（旧版 im-channel / 未接入 noteActor 的通道）一律
 *   按访客视图——宁可少注入 background，不可把它泄露给无法证明身份的对话者。
 *   （im-channel ≥ 含 noteActor 配合的版本时，IM 会话两种角色都会被标注，
 *   各得正确视图；网页端会话会失去 background 注入，属既定安全取舍，
 *   主人可用知识种子把等效上下文喂回记忆层。）
 */
export declare function resolveGuestView(input: {
    imChannelInstalled: boolean;
    actorIsMaster?: boolean | undefined;
}): boolean;
export declare function apply(ctx: Context): void;
