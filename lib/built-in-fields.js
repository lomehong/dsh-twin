/**
 * 内置身份字段定义（宿主端与客户端共享的唯一来源）。
 *
 * 原「分身设置」人格 Tab 的九个固设置项，v2 人格合并后成为身份卡的固定字段：
 * 恒存在、不可删除、键不可改，只有值与可见性可编辑。可见性默认值与 legacy
 * renderPersona 行为对齐——背景/做事方式是主人私有事实（私密），其余是行为类
 * 准则或公开信息（全会话可见）。
 */
export const BUILT_IN_FIELDS = [
    { key: 'name', label: '名字', visibility: '公开', control: 'text' },
    { key: 'role', label: '身份定位', visibility: '公开', control: 'text' },
    { key: 'background', label: '背景', visibility: '私密', control: 'textarea' },
    { key: 'tone', label: '语气', visibility: '公开', control: 'tone' },
    { key: 'style', label: '风格', visibility: '公开', control: 'textarea' },
    { key: 'values', label: '价值观', visibility: '公开', control: 'textarea' },
    { key: 'workingStyle', label: '做事方式', visibility: '私密', control: 'textarea' },
    { key: 'escalation', label: '边界与转人工', visibility: '公开', control: 'textarea' },
    { key: 'avoid', label: '禁忌', visibility: '公开', control: 'textarea' },
];
export const BUILT_IN_KEYS = new Set(BUILT_IN_FIELDS.map(f => f.key));
/** 语气可选值（中文词，直接存入字段值） */
export const TONE_OPTIONS = [
    { value: '专业', label: '专业' },
    { value: '亲切', label: '亲切' },
    { value: '简洁', label: '简洁' },
    { value: '幽默', label: '幽默' },
];
