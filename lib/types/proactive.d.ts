export interface ProactiveReach {
    id: string;
    at: string;
    kind: '开环到期提醒' | '待办提醒' | '汇报';
    title: string;
    target: {
        actorId?: string;
        channel?: string;
    };
    ledgerId?: string;
    level?: 'L1' | 'L2';
    status: '已触达' | '被阻断' | '降级';
    note?: string;
}
export interface ProactiveStore {
    reaches: ProactiveReach[];
}
export declare function loadProactive(): ProactiveStore;
export declare function saveProactive(store: ProactiveStore): void;
export interface StateSeed {
    content: string;
    source: string;
    statementType?: '候选' | '事实';
}
/**
 * 汇入：把「未闭环开环」「账本待办」等真实状态写入状态卡（去重 + 自动衰减）。
 * 只做增量——已有同指纹条目不动；超预算裁剪最旧；全部走 saveCards 唯一入口。
 */
export declare function ingestStateSeeds(seeds: Array<StateSeed>): {
    added: number;
    skipped: number;
};
/** 清理已过期（decayAt < now）的状态卡条目；返回清理数 */
export declare function pruneExpiredState(): number;
export interface ReachCandidate {
    kind: ProactiveReach['kind'];
    title: string;
    /** 触达内容（经账本闸后由 deliver 发送） */
    text: string;
    /** 动作类型（账本裁决键）：主动汇报=L1，承诺/敏感=L2 */
    actionType: string;
    targetScope: string;
    actorId?: string;
    channel?: string;
    /** 引用（开环 memoryId / 账本 recordId），幂等去重用 */
    refKey: string;
}
interface LedgerLike {
    check?: (input: unknown, opts?: unknown) => unknown;
    records?: (filter?: unknown) => Array<Record<string, unknown>>;
    pendingApprovals?: () => Array<Record<string, unknown>>;
}
interface MemoryLike {
    openLoopsForActor?: (actorId: string) => Array<{
        id: string;
        content: string;
    }>;
    loadSharedMemory?: () => Array<Record<string, unknown>>;
}
/**
 * 生成主动触达候选（纯收集，不发送）：
 * - 关系轨未闭环开环（>24h 未闭环）→「开环到期提醒」L1
 * - 账本待批审批 → 「待办提醒」L1
 * 去重：refKey 已在 reaches 里且 status=已触达/被阻断 的跳过。
 */
export declare function buildReachCandidates(deps: {
    ledger?: LedgerLike;
    memory?: MemoryLike;
}): ReachCandidate[];
export interface DeliverResult {
    ok: boolean;
    reached?: ProactiveReach;
    error?: string;
    blocked?: boolean;
}
interface ImChannelLike {
    pushToUser?: (kind: string, userId: string, text: string, opts?: {
        markdown?: boolean;
    }) => Promise<boolean> | boolean;
    botsStatus?: () => Array<{
        kind: string;
        bindings?: Array<{
            userId: string;
            isMaster?: boolean;
        }>;
    }>;
}
/**
 * 送达：候选 → 账本过闸（L1 放行/L2 生成审批即阻断）→ im-channel 推送 → 落盘记录。
 * 频控：进程级 10 分钟最多 3 条（保护主人注意力）。
 */
export declare function deliverReach(candidate: ReachCandidate, deps: {
    ledger?: LedgerLike;
    im?: ImChannelLike;
}): Promise<DeliverResult>;
/** 测试钩子：清空频控窗口（进程级数组） */
export declare function resetReachThrottleForTest(): void;
/** tick：生成候选 → 逐个过闸送达（供宿主 jobs/定时器调用） */
export declare function tick(deps: {
    ledger?: LedgerLike;
    memory?: MemoryLike;
    im?: ImChannelLike;
}): Promise<{
    candidates: number;
    delivered: number;
    blocked: number;
}>;
export {};
