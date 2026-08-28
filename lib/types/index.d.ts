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
/** 把内置预设物化到用户 agent-presets 根（版本化幂等）。返回是否本次写入。 */
export declare function materializePreset(): MaterializeResult;
export declare function ensureDefaultPreset(ctx: Context): void;
/** 把知识种子写入 dsh-memory（若已安装）；按内容去重。 */
export declare function seedMemory(ctx: Context, cfg: TwinConfig): Promise<SeedResult>;
/**
 * 规整 dsh-memory：合并「内容规整后相同」的近重复条目，保留时间最新者，
 * 并集 participants，scope 按最公开者取值。幂等、安全——只在确实重复时删除。
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
export declare function apply(ctx: Context): void;
