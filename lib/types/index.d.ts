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
export interface PresetRow {
    id?: string;
    name: string;
    config?: unknown;
    disabled?: boolean;
    group?: boolean;
    isolate?: Record<string, boolean>;
}
export interface TwinPresetDefinition {
    id: string;
    name: string;
    description: string;
    order: number;
    plugins: PresetRow[];
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
export { normalizePersonaText as sanitizePersonaText, normalizePersonaLine as sanitizePersonaLine } from './sanitize.ts';
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
    computer: boolean;
    /** dsh-task-board 在场时追加 task_report 上报工具行（宪章第二阶段挂链） */
    board?: boolean;
    /** dsh-architect 在场时追加架构师检查工具行（阶段 3 工具化挂链） */
    architect?: boolean;
    /** dsh-mind 在场时追加心智工具行（mind_status/mind_timeline/mind_say，2026-09-28） */
    mind?: boolean;
}
/**
 * 组装 digital-twin 预设定义（0.1.7 编程注册形态，取代旧 .agent-presets 文件物化——
 * 该目录发现机制在 0.1.7 已移除，预设改由 agentPresets.register 提交）。
 *
 * **不变式（0.2.2 事故后加固）：每一行的 name 都必须在目标宿主上可解析——包在，
 * 且（带子路径时）该子路径在包 exports 里。** 宿主削减/重排包结构时，残留行会
 * `never started`，整份预设挂载被拒：
 *   - 0.2.2 收回 `dsh-tool-subagent-control/list-agents` → 本预设曾整份不可用；
 *   - 可选依赖行同理：装了包但没有 `./tools` 导出（dsh-mind 0.10.4）也会炸。
 * 可选依赖行因此按「可解析」而非「已安装」组装——装了但没有行所引用的子路径就
 * 不加行（等价旧物化追加逻辑的意图：缺行 ⇒ 少工具，绝不 ⇒ 预设不可用）。
 * 静态行（宿主自带包）由 `scripts/check-compat.mjs` 在发布前审计。
 */
export declare function presetDefinition(deps?: OptionalDeps): TwinPresetDefinition;
/**
 * 把 digital-twin 预设编程注册进 agentPresets 注册表（0.1.7 发布通道）。
 * 注册句柄挂在本插件 fiber 的 effect 上：插件卸载时同步注销预设。
 */
export declare function registerPreset(ctx: Context): void;
export declare function ensureDefaultPreset(ctx: Context): void;
/** 把知识种子写入 dsh-memory（若已安装）；按内容去重。
 *  种子带来源归因（origin=seed，来自分身设置向导），满足「来源登记 ≠ 事实晋升」的可追溯要求。 */
export declare function seedMemory(ctx: Context, cfg: TwinConfig): Promise<SeedResult>;
/**
 * 规整 dsh-memory（处置对照，移植自 Decision Assistant 共识维护）：
 * 归一化后陈述与范围完全相同的同作者条目 → 替代链去重：串行标记「已替代」指向时间更新者，
 * 保留最新条目为当前——不物理删除，历史可经 memory_read(includeSuperseded) 查回。
 * 参与者并集仍合并到保留条目（权限类原地变更）。
 * 信任域隔离（安全评审 M1）：绝不跨作者归并、绝不把 scope 往公开提升——
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
