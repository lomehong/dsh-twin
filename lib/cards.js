/**
 * 四张人格卡（实施计划 T3 / 设计文档 v0.2 决策一）
 *
 * 人格不是一段描述，是四张卡：身份卡（公开/私密分级）/ 策略卡（结构化规则）
 * / 样例卡（对照式示例）/ 状态卡（自动衰减）。四张卡到系统提示词的合成是
 * 纯函数投影（见 ./projection.ts）——任何行为都能溯源到"哪张卡的哪一条"。
 *
 * 生效纪律（决策五/六）：保存产生候选修订；生效 = 主人确认 + 回归通过双条件，
 * 测试绿灯不能自动兑换成上线。每次保存生成不可变修订快照（最近 10 个）。
 *
 * 存储：$DSH_HOME/dsh-twin/cards.json（当前卡 + 状态）+ cards-history.json（修订史）。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { dshHome, normalizePersonaLine, normalizePersonaText, twinWarn } from "./sanitize.js";
/**
 * 内置身份字段（原「分身设置」人格 Tab 的九个固设置项）。
 * 定义在 ./built-in-fields.ts（客户端共用）；此处 re-export 供既有引用。
 * - 恒存在：normalizeCards 对缺失项自动补空值——「字段不在」在模型层不可能发生；
 * - 不可删除：保存入口忽略对内置字段的删除，UI 层也不提供删除按钮；
 * - 可见性默认值与 legacy renderPersona 行为逐一对齐：背景（主人私有事实）私密，
 *   其余为行为类/公开信息（价值观是分身对任何对话对象的准则，不是隐私）。
 */
export { BUILT_IN_FIELDS } from "./built-in-fields.js";
import { BUILT_IN_FIELDS, BUILT_IN_KEYS } from "./built-in-fields.js";
/* ── 归一化（白名单 + 清洗；防提示注入：行首 # 中和、控制字符清除、长度上限） ── */
/** 卡字段额外防线：normalizePersonaText 的尾部 trim 会让首行 # 中和失效，这里对整串再剥一次行首井号 */
function stripLeadingHash(s) {
    return s.replace(/^#{1,6}\s*/, '');
}
function cleanMulti(input, max) {
    return stripLeadingHash(normalizePersonaText(input)).slice(0, max);
}
function sanitizeId(input, prefix, index) {
    const s = normalizePersonaLine(input).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    return s !== '' ? s : `${prefix}-${index + 1}`;
}
/** 归一化整份卡（幂等；未知键丢弃——向前兼容由版本号管理） */
/** 内置字段恒存在：缺失补空值；输出固定为「内置按 BUILT_IN_FIELDS 顺序在前、自定义在后」。 */
function applyBuiltInIdentity(fields) {
    const byKey = new Map(fields.filter(f => BUILT_IN_KEYS.has(f.key)).map(f => [f.key, f]));
    const builtIn = BUILT_IN_FIELDS.map(def => {
        const existing = byKey.get(def.key);
        if (existing !== undefined)
            return { ...existing, builtIn: true };
        return { key: def.key, value: '', visibility: def.visibility, builtIn: true };
    });
    const custom = fields.filter(f => !BUILT_IN_KEYS.has(f.key));
    return [...builtIn, ...custom];
}
/** 卡内容是否实质为空（内置字段全空值、无自定义字段、无任何规则/样例/状态条目）。 */
export function isEffectivelyEmpty(cards) {
    const identityFilled = cards.identity.fields.some(f => f.value.trim() !== '');
    return (!identityFilled &&
        cards.policy.rules.length === 0 &&
        cards.exemplars.items.length === 0 &&
        cards.state.items.length === 0);
}
export function normalizeCards(input) {
    const out = {
        identity: { fields: [] },
        policy: { rules: [] },
        exemplars: { items: [] },
        state: { items: [] },
    };
    if (input === null || typeof input !== 'object')
        return out;
    const src = input;
    if (src.identity !== null && typeof src.identity === 'object') {
        const fields = src.identity.fields;
        if (Array.isArray(fields)) {
            fields.slice(0, 30).forEach((f, i) => {
                if (f === null || typeof f !== 'object')
                    return;
                const rec = f;
                const value = (typeof rec.value === 'string' ? stripLeadingHash(normalizePersonaText(rec.value)) : '').slice(0, 2000);
                const rawKey = normalizePersonaLine(rec.key);
                if (rawKey === '' && value === '')
                    return; // 空键空值条目丢弃（先于自动 id）
                const key = sanitizeId(rawKey, 'field', i);
                const builtIn = typeof rec.key === 'string' && BUILT_IN_KEYS.has(rec.key);
                out.identity.fields.push({
                    key,
                    value,
                    visibility: rec.visibility === '私密' ? '私密' : '公开',
                    ...(builtIn ? { builtIn: true } : {}),
                });
            });
        }
    }
    // 内置字段恒存在：被删/缺失的补空值，并保持「内置固定顺序在前、自定义在后」
    out.identity.fields = applyBuiltInIdentity(out.identity.fields);
    if (src.policy !== null && typeof src.policy === 'object') {
        const rules = src.policy.rules;
        if (Array.isArray(rules)) {
            rules.slice(0, 50).forEach((r, i) => {
                if (r === null || typeof r !== 'object')
                    return;
                const rec = r;
                const when = cleanMulti(rec.when, 300);
                const act = cleanMulti(rec.act, 500);
                if (when === '' && act === '')
                    return;
                const rule = {
                    id: sanitizeId(rec.id, 'rule', i),
                    when,
                    act,
                    enabled: rec.enabled !== false,
                };
                if (rec.escalate !== undefined && cleanMulti(rec.escalate, 300) !== '') {
                    rule.escalate = cleanMulti(rec.escalate, 300);
                }
                out.policy.rules.push(rule);
            });
        }
    }
    if (src.exemplars !== null && typeof src.exemplars === 'object') {
        const items = src.exemplars.items;
        if (Array.isArray(items)) {
            items.slice(0, 50).forEach((x, i) => {
                if (x === null || typeof x !== 'object')
                    return;
                const rec = x;
                const item = {
                    id: sanitizeId(rec.id, 'ex', i),
                    situation: cleanMulti(rec.situation, 300),
                    say: cleanMulti(rec.say, 600),
                    avoidSay: cleanMulti(rec.avoidSay, 600),
                    source: rec.source === '纠正' ? '纠正' : '语料',
                };
                if (item.say === '' && item.avoidSay === '')
                    return;
                if (typeof rec.confirmedAt === 'string' && rec.confirmedAt !== '')
                    item.confirmedAt = rec.confirmedAt;
                out.exemplars.items.push(item);
            });
        }
    }
    if (src.state !== null && typeof src.state === 'object') {
        const items = src.state.items;
        if (Array.isArray(items)) {
            items.slice(0, 50).forEach((x, i) => {
                if (x === null || typeof x !== 'object')
                    return;
                const rec = x;
                const content = cleanMulti(rec.content, 500);
                if (content === '')
                    return;
                const item = {
                    id: sanitizeId(rec.id, 'st', i),
                    content,
                    statementType: rec.statementType === '事实' ? '事实' : '候选',
                };
                if (typeof rec.source === 'string' && rec.source !== '')
                    item.source = rec.source.slice(0, 60);
                if (typeof rec.decayAt === 'string' && rec.decayAt !== '')
                    item.decayAt = rec.decayAt;
                out.state.items.push(item);
            });
        }
    }
    return out;
}
/* ── 存储 ── */
function cardsPath() {
    return join(twinDataDir(), 'cards.json');
}
function historyPath() {
    return join(twinDataDir(), 'cards-history.json');
}
function twinDataDir() {
    // 与 src/index.ts 的 pluginDataDir 约定一致：$DSH_HOME/dsh-twin/
    return join(dshHome(), 'dsh-twin');
}
const EMPTY_CARDS = {
    identity: { fields: [] },
    policy: { rules: [] },
    exemplars: { items: [] },
    state: { items: [] },
};
export function loadCardsState() {
    const path = cardsPath();
    if (!existsSync(path))
        return { file: { current: EMPTY_CARDS, revisionNo: 0, status: '候选' }, hasEffective: false, history: [] };
    try {
        const file = JSON.parse(readFileSync(path, 'utf8'));
        const current = normalizeCards(file.current);
        const status = file.status === '生效' ? '生效' : '候选';
        return {
            file: { ...file, current, status },
            hasEffective: status === '生效',
            history: loadHistory(),
        };
    }
    catch (e) {
        twinWarn('cards.json 解析失败，已按空卡处理:', e instanceof Error ? e.message : String(e));
        return { file: { current: EMPTY_CARDS, revisionNo: 0, status: '候选' }, hasEffective: false, history: [] };
    }
}
/** 当前应渲染的卡：生效且非空才返回；无生效卡或空生效卡返回 null（调用方回落 legacy 渲染）。
 *  空生效卡必须回落：status='生效' 只是保存时的双条件标签，内容全空的卡（如迁移前的
 *  误保存）若也短路渲染，会把主人在「分身设置」配置的人格整个顶掉。 */
export function effectiveCards() {
    const st = loadCardsState();
    if (!st.hasEffective)
        return null;
    // 内置字段恒存在后 fields.length 恒 ≥9，「空卡」必须按值语义判定（isEffectivelyEmpty）
    return isEffectivelyEmpty(st.file.current) ? null : st.file.current;
}
/**
 * 保存四张卡：入口归一化 → 修订快照 → 生效判定。
 * 生效条件 = confirm && regressionPassed；否则停留候选，旧生效卡继续渲染。
 */
export function saveCards(input) {
    const cards = normalizeCards(input.cards);
    const confirmed = input.confirm === true;
    const regressionPassed = input.regressionPassed === true;
    const regressionReportId = typeof input.regressionReportId === 'string' && input.regressionReportId.trim() !== ''
        ? input.regressionReportId.trim().slice(0, 60)
        : undefined;
    const effective = confirmed && regressionPassed;
    const prev = loadCardsState();
    const prevNo = prev.file.revisionNo;
    const revisionNo = prevNo + 1;
    const file = {
        current: cards,
        revisionNo,
        status: effective ? '生效' : '候选',
        ...(confirmed ? { confirmedAt: new Date().toISOString() } : {}),
        ...(regressionReportId !== undefined ? { regressionReportId } : {}),
    };
    const path = cardsPath();
    mkdirSync(dirname(path), { recursive: true });
    const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(file, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmp, path);
    archiveRevision({ revisionNo, ts: new Date().toISOString(), confirmed, regressionPassed, cards });
    const reason = effective
        ? '主人确认 + 回归通过，新卡已生效'
        : confirmed
            ? '已保存为候选修订：回归未通过（测试绿灯不兑换授权），旧生效卡继续渲染'
            : '已保存为候选修订：待主人确认';
    return { file, effective, reason };
}
/* ── 修订历史（最近 10 个，不可变快照） ── */
function loadHistory() {
    const path = historyPath();
    if (!existsSync(path))
        return [];
    try {
        const raw = JSON.parse(readFileSync(path, 'utf8'));
        return Array.isArray(raw) ? raw : [];
    }
    catch {
        return [];
    }
}
function archiveRevision(rev) {
    const path = historyPath();
    mkdirSync(dirname(path), { recursive: true });
    const hist = [...loadHistory(), rev].slice(-10);
    const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(hist, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmp, path);
}
export function listRevisions() {
    return loadHistory().map(r => ({ revisionNo: r.revisionNo, ts: r.ts, confirmed: r.confirmed, regressionPassed: r.regressionPassed }));
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
export function migrateTwinConfigToCards(cfg) {
    if (cfg === null || typeof cfg !== 'object')
        return { ok: false, error: 'twin-config 为空或非对象', mapping: [] };
    const c = cfg;
    const mapping = [];
    const cards = {
        identity: { fields: [] },
        policy: { rules: [] },
        exemplars: { items: [] },
        state: { items: [] },
    };
    const TONE_LABEL = {
        professional: '专业', friendly: '亲切', concise: '简洁', humorous: '幽默',
    };
    const push = (key, raw, note) => {
        const def = BUILT_IN_FIELDS.find(f => f.key === key);
        const value = (typeof raw === 'string' ? normalizePersonaText(raw) : '').slice(0, 2000);
        if (value === '' || def === undefined)
            return;
        cards.identity.fields.push({ key, value, visibility: def.visibility, builtIn: true });
        mapping.push(`${note} → 身份卡 ${def.label}（${def.visibility}）`);
    };
    push('name', c.identity?.name, 'identity.name');
    push('role', c.identity?.role, 'identity.role');
    push('background', c.identity?.background, 'identity.background');
    const toneRaw = normalizePersonaLine(c.persona?.tone);
    const toneValue = TONE_LABEL[toneRaw] ?? toneRaw;
    if (toneValue !== '') {
        cards.identity.fields.push({ key: 'tone', value: toneValue, visibility: '公开', builtIn: true });
        mapping.push('persona.tone → 身份卡 语气（公开）');
    }
    push('style', c.persona?.style, 'persona.style');
    push('values', c.persona?.values, 'persona.values');
    push('workingStyle', c.persona?.rules, 'persona.rules（做事方式，文本保真；可在人格卡拆成规则）');
    push('escalation', c.persona?.escalation, 'persona.escalation');
    push('avoid', c.persona?.avoid, 'persona.avoid');
    mapping.push('知识种子不迁移：保存时已写入 dsh-memory 记忆库，不属人格卡');
    mapping.push('样例卡为空：旧配置没有对照样例，从主人语料/纠正中积累');
    return { ok: true, cards, mapping };
}
