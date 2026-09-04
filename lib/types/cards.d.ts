export interface IdentityField {
    key: string;
    value: string;
    visibility: '公开' | '私密';
    /** 内置字段（原设置窗口人格项）：恒存在、不可删除、键不可改，只有值与可见性可编辑 */
    builtIn?: boolean;
}
/**
 * 内置身份字段（原「分身设置」人格 Tab 的九个固设置项）。
 * 定义在 ./built-in-fields.ts（客户端共用）；此处 re-export 供既有引用。
 * - 恒存在：normalizeCards 对缺失项自动补空值——「字段不在」在模型层不可能发生；
 * - 不可删除：保存入口忽略对内置字段的删除，UI 层也不提供删除按钮；
 * - 可见性默认值与 legacy renderPersona 行为逐一对齐：背景（主人私有事实）私密，
 *   其余为行为类/公开信息（价值观是分身对任何对话对象的准则，不是隐私）。
 */
export { BUILT_IN_FIELDS } from './built-in-fields.ts';
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
/** 卡内容是否实质为空（内置字段全空值、无自定义字段、无任何规则/样例/状态条目）。 */
export declare function isEffectivelyEmpty(cards: TwinCards): boolean;
export declare function normalizeCards(input: unknown): TwinCards;
export interface CardsState {
    file: CardsFile;
    /** 尚无生效卡（回落 legacy twin-config 渲染） */
    hasEffective: boolean;
    history: CardsRevision[];
}
export declare function loadCardsState(): CardsState;
/** 当前应渲染的卡：生效且非空才返回；无生效卡或空生效卡返回 null（调用方回落 legacy 渲染）。
 *  空生效卡必须回落：status='生效' 只是保存时的双条件标签，内容全空的卡（如迁移前的
 *  误保存）若也短路渲染，会把主人在「分身设置」配置的人格整个顶掉。 */
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
/**
 * legacy twin-config → 人格卡一次性迁移（保真映射）。
 *
 * 与旧版差异（v2 合并设计）：九个人格项全部落为**身份卡内置字段**（builtIn），
 * 不再拆进策略卡——自由文本强拆 when→act→escalate 必然失真；规则化是人格卡页
 * 里「拆成可测试的规则 ↗」引导下主人的主动动作。知识种子不搬（保存时已写入
 * dsh-memory 记忆库，本就不属人格卡）。可见性默认值与 legacy renderPersona
 * 行为逐一对齐：background/workingStyle 私密（主人私有），其余公开（行为类）。
 */
export declare function migrateTwinConfigToCards(cfg: unknown): MigrationResult;
