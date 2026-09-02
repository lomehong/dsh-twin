export interface IdentityField {
    key: string;
    value: string;
    visibility: '公开' | '私密';
}
export interface PolicyRule {
    id: string;
    /** 触发条件 */
    when: string;
    /** 动作 */
    act: string;
    /** 升级路径（触发后转人工等） */
    escalate?: string;
    enabled: boolean;
}
export interface Exemplar {
    id: string;
    situation: string;
    /** 该这么说 */
    say: string;
    /** 不这么说 */
    avoidSay: string;
    source: '语料' | '纠正';
    confirmedAt?: string;
}
export interface StateItem {
    id: string;
    content: string;
    statementType: '候选' | '事实';
    source?: string;
    /** 衰减时间（ISO）：到期不再注入 */
    decayAt?: string;
}
export interface TwinCards {
    identity: {
        fields: IdentityField[];
    };
    policy: {
        rules: PolicyRule[];
    };
    exemplars: {
        items: Exemplar[];
    };
    state: {
        items: StateItem[];
    };
}
export type CardsStatus = '候选' | '生效';
export interface CardsFile {
    current: TwinCards;
    revisionNo: number;
    status: CardsStatus;
    /** 生效 = 主人确认 + 回归通过；两者缺一即停留在候选 */
    confirmedAt?: string;
    regressionReportId?: string;
    /** v0.2 迁移来源标记 */
    migratedFrom?: 'twin-config.json';
}
export interface CardsRevision {
    revisionNo: number;
    ts: string;
    confirmed: boolean;
    regressionPassed: boolean;
    cards: TwinCards;
}
/** 归一化整份卡（幂等；未知键丢弃——向前兼容由版本号管理） */
export declare function normalizeCards(input: unknown): TwinCards;
export interface CardsState {
    file: CardsFile;
    /** 尚无生效卡（回落 legacy twin-config 渲染） */
    hasEffective: boolean;
    history: CardsRevision[];
}
export declare function loadCardsState(): CardsState;
/** 当前应渲染的卡：生效卡优先；无生效卡返回 null（调用方回落 legacy 渲染） */
export declare function effectiveCards(): TwinCards | null;
export interface SaveCardsResult {
    file: CardsFile;
    /** 生效与否：主人确认 + 回归通过双条件 */
    effective: boolean;
    reason: string;
}
export interface SaveCardsInput {
    cards: unknown;
    /** 主人已确认（向导保存按钮即确认） */
    confirm?: boolean;
    /** 回归通过（由 dsh-regression 报告回填；缺省视为未通过） */
    regressionPassed?: boolean;
    regressionReportId?: unknown;
}
/**
 * 保存四张卡：入口归一化 → 修订快照 → 生效判定。
 * 生效条件 = confirm && regressionPassed；否则停留候选，旧生效卡继续渲染。
 */
export declare function saveCards(input: SaveCardsInput): SaveCardsResult;
export declare function listRevisions(): Array<{
    revisionNo: number;
    ts: string;
    confirmed: boolean;
    regressionPassed: boolean;
}>;
export interface MigrationResult {
    ok: boolean;
    cards?: TwinCards;
    error?: string;
    /** 迁移映射说明（审计用） */
    mapping: string[];
}
/**
 * 确定性迁移映射：
 * - identity.name / role → 身份卡公开字段；background → 身份卡私密字段（主人背景）
 * - persona.tone / style → 身份卡公开字段（语气/风格）
 * - persona.values / rules / avoid → 策略卡规则（enabled）
 * - persona.escalation → 策略卡升级路径条目
 * - knowledge.seeds → 状态卡候选条目（source=seed）
 * - 样例卡为空（旧配置没有对照样例）
 */
export declare function migrateTwinConfigToCards(cfg: unknown): MigrationResult;
