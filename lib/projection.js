import { BUILT_IN_FIELDS } from "./cards.js";
/** 语气字段值 → 完整行为句（值存中文词，兼容 legacy 的英文 id）。文案与 renderPersona 的 toneMap 逐字一致。 */
const TONE_SENTENCE = {
    professional: '以专业、可靠、条理清晰的语气回答。',
    friendly: '以亲切、友好、接地气的语气回答。',
    concise: '回答尽量简洁、直接，少说废话。',
    humorous: '语气轻松幽默，偶尔带点玩笑。',
    专业: '以专业、可靠、条理清晰的语气回答。',
    亲切: '以亲切、友好、接地气的语气回答。',
    简洁: '回答尽量简洁、直接，少说废话。',
    幽默: '语气轻松幽默，偶尔带点玩笑。',
};
export function renderCards(cards, viewer, opts = {}) {
    const isMaster = viewer.role === 'master';
    const nowIso = opts.now ?? new Date().toISOString();
    const parts = [];
    // ── 身份卡 ──
    // 内置字段（原「分身设置」九项）：固定顺序、中文标签；语气渲染为完整行为句；
    // 私密内置字段（背景/做事方式）主人视图不加「（私密）」后缀——与 legacy 渲染
    // 逐字对齐，避免提示词噪声。自定义字段保持「key：value」原样。
    const identityLines = [];
    for (const f of cards.identity.fields) {
        if (f.value === '')
            continue;
        if (f.visibility === '私密' && !isMaster)
            continue; // 结构性缺失：访客视图根本不注入
        if (f.builtIn === true) {
            if (f.key === 'tone') {
                const sentence = TONE_SENTENCE[f.value];
                identityLines.push(sentence ?? `- 语气：${f.value}`);
                continue;
            }
            identityLines.push(`- ${BUILT_IN_FIELDS.find(d => d.key === f.key)?.label ?? f.key}：${f.value}`);
            continue;
        }
        identityLines.push(`- ${f.key}：${f.value}${f.visibility === '私密' ? '（私密）' : ''}`);
    }
    if (identityLines.length > 0) {
        parts.push(['## 身份卡', ...identityLines].join('\n'));
    }
    // ── 策略卡 ──
    const policyLines = [];
    for (const r of cards.policy.rules) {
        if (!r.enabled)
            continue;
        let line = `- 触发「${r.when}」→ ${r.act}`;
        if (r.escalate !== undefined && r.escalate !== '')
            line += `；升级路径：${r.escalate}`;
        policyLines.push(line);
    }
    if (policyLines.length > 0) {
        parts.push(['## 策略卡（结构化规则，逐条可追溯）', ...policyLines].join('\n'));
    }
    // ── 样例卡 ──
    const exemplarLines = [];
    for (const x of cards.exemplars.items.slice(0, 6)) {
        let line = `- 场景「${x.situation}」`;
        if (x.say !== '')
            line += `：该这么说「${x.say}」`;
        if (x.avoidSay !== '')
            line += `；不这么说「${x.avoidSay}」`;
        exemplarLines.push(line);
    }
    if (exemplarLines.length > 0) {
        parts.push(['## 样例卡（校准示例）', ...exemplarLines].join('\n'));
    }
    // ── 状态卡 ──
    const stateLines = [];
    for (const s of cards.state.items) {
        if (s.decayAt !== undefined && s.decayAt <= nowIso)
            continue; // 自动衰减
        stateLines.push(`- [${s.statementType}] ${s.content}`);
    }
    if (stateLines.length > 0) {
        parts.push(['## 状态卡（近期上下文，随时间衰减）', ...stateLines].join('\n'));
    }
    if (parts.length === 0)
        return '';
    const header = isMaster ? '# 数字分身人格（主人视图）' : '# 数字分身人格（访客视图）';
    const tail = opts.channel !== undefined ? `\n（当前通道：${opts.channel}）` : '';
    return `${header}\n${parts.join('\n\n')}${tail}`;
}
/** 投影摘要（回归报告/预览用）：各卡注入条数 */
export function projectionSummary(cards, viewer, opts = {}) {
    const rendered = renderCards(cards, viewer, opts);
    const isMaster = viewer.role === 'master';
    const nowIso = opts.now ?? new Date().toISOString();
    return {
        identity: cards.identity.fields.filter(f => f.value !== '' && (isMaster || f.visibility !== '私密')).length,
        policy: cards.policy.rules.filter(r => r.enabled).length,
        exemplars: Math.min(cards.exemplars.items.length, 6),
        state: cards.state.items.filter(s => s.decayAt === undefined || s.decayAt > nowIso).length,
        bytes: Buffer.byteLength(rendered, 'utf8'),
    };
}
