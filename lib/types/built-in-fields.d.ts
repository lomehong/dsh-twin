/**
 * 内置身份字段定义（宿主端与客户端共享的唯一来源）。
 *
 * 原「分身设置」人格 Tab 的九个固设置项，v2 人格合并后成为身份卡的固定字段：
 * 恒存在、不可删除、键不可改，只有值与可见性可编辑。可见性默认值与 legacy
 * renderPersona 行为对齐——背景/做事方式是主人私有事实（私密），其余是行为类
 * 准则或公开信息（全会话可见）。
 */
export interface BuiltInFieldDef {
    key: string;
    label: string;
    visibility: '公开' | '私密';
    control: 'text' | 'textarea' | 'tone';
}
export declare const BUILT_IN_FIELDS: ReadonlyArray<BuiltInFieldDef>;
export declare const BUILT_IN_KEYS: ReadonlySet<string>;
/** 语气可选值（中文词，直接存入字段值） */
export declare const TONE_OPTIONS: ReadonlyArray<{
    value: string;
    label: string;
}>;
