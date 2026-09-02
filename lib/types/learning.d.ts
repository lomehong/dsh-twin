export type SignalKind = '纠正' | '否决' | '事实更正' | '影子差异';
export type LearningStatus = '观察' | '候选修订' | '已入卡' | '已驳回';
export type TargetKind = '样例卡' | '策略卡' | '记忆';
export interface LearningEvent {
    id: string;
    ts: string;
    kind: SignalKind;
    /** 归一化后的信号要点（用作同类聚合的指纹） */
    sig: string;
    /** 影响的卡/记忆目标 */
    target: TargetKind;
    /** 关联引用（被否决的 record id / 纠正的对话摘要 / 样例指纹等） */
    ref?: string;
    /** 权重：单次 = 1，每次同类累计 +1（达到 N 时晋升） */
    weight: number;
    /** 主人显式归因（一次即晋升） */
    by: string;
    status: LearningStatus;
    /** 晋升后绑定：候选修订 id / 入卡版本号 */
    candidateId?: string;
    appliedAt?: string;
}
export interface LearningStore {
    events: LearningEvent[];
}
/** 指纹归一：NFC → 去标点空格 → 折叠空白 → 截断。幂等。 */
export declare function fingerprint(input: unknown): string;
export declare function loadEvents(): LearningStore;
export declare function saveEvents(store: LearningStore): void;
export interface LearningCandidate {
    id: string;
    kind: TargetKind;
    /** 关联的事件 id（创建候选时记录的若干事件 id） */
    eventIds: string[];
    /** 候选正文（已按目标格式规整）：样例卡对照例 / 策略卡修订 / 记忆替代 */
    payload: ExemplarCandidate | PolicyCandidate | MemoryCandidate;
    status: LearningStatus;
    createdAt: string;
    /** 主人确认时间 */
    confirmedAt?: string;
    /** 回归通过报告 id（v1 已有）；通过即入卡 */
    regressionReportId?: string;
    /** 入卡时间 */
    appliedAt?: string;
}
export interface ExemplarCandidate {
    situation: string;
    say: string;
    avoidSay: string;
    source: '纠正' | '语料';
    sourceRef?: string;
}
export interface PolicyCandidate {
    /** 修订类型：新增 / 修改 / 废弃 */
    op: '新增' | '修改' | '废弃';
    id?: string;
    when?: string;
    act?: string;
    escalate?: string;
    enabled?: boolean;
}
export interface MemoryCandidate {
    op: '替代' | '新增';
    memoryId?: string;
    content?: string;
    statementType?: string;
    source?: string;
}
export interface CandidateStore {
    candidates: LearningCandidate[];
}
export declare function loadCandidates(): CandidateStore;
export declare function saveCandidates(store: CandidateStore): void;
export interface EnqueueInput {
    kind: SignalKind;
    /** 原始信号文本（用于指纹与候选 situation） */
    signal: string;
    target: TargetKind;
    /** 关联引用 */
    ref?: string;
    /** 主人显式归因：true = 一次即晋升；缺省按同类累计门槛 */
    explicitAttribution?: boolean;
    by: string;
    /** 自定义该类门槛（缺省 = DEFAULT_N[kind]） */
    threshold?: number;
}
export interface EnqueueResult {
    event: LearningEvent;
    /** 到达门槛时随事件一并生成的候选（仅在晋升时存在） */
    candidate?: LearningCandidate;
}
/**
 * 入队：归一化指纹 → 命中已有同类 → 权重+1 → 达到门槛 → 生成候选。
 * 显式归因可绕过门槛一次晋升。事件只增不删，候选独立存储可由主人确认/驳回。
 */
export declare function enqueue(input: EnqueueInput, existing: LearningStore, existingCandidates: CandidateStore): EnqueueResult;
/** 主人确认候选：标记 confirmedAt + 回归报告 id；不直接入卡——回归门禁由 confirmCandidate 评估。 */
export declare function confirmCandidate(candidateId: string, by: string, candidates: CandidateStore): LearningCandidate | undefined;
/** 驳回候选 + 标记事件状态 */
export declare function rejectCandidate(candidateId: string, candidates: CandidateStore, events: LearningStore): LearningCandidate | undefined;
/** 入卡：仅在 confirmedAt + regressionReportId 齐备时生效；否则仍保持候选修订。 */
export declare function applyCandidate(candidateId: string, regressionReportId: string, candidates: CandidateStore, events: LearningStore): LearningCandidate | undefined;
export interface LearningQuery {
    status?: LearningStatus;
    limit?: number;
}
export declare function listEvents(q?: LearningQuery): LearningEvent[];
export declare function listCandidates(): LearningCandidate[];
