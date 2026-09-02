/**
 * 样例候选池 + 语料挖掘器（v2，实施计划 V2-M2a/M2b）
 *
 * 候选池与样例卡分离（设计 v2 §4）：挖掘的量级与质量都不允许直通入卡；
 * 候选池是噪声隔离区，确认（+ 回归）是质量闸门。
 *
 * 挖掘为规则式（v2 范围）：从主人侧文本识别四类高价值场景
 * （拒绝/边界表态、承诺措辞、澄清类、纠正式改口）。语义挖掘留待后续评估。
 *
 * 授权语义：调用挖掘入口即视为对本次输入文本的授权（UI 粘贴/选择即同意）；
 * 不做后台自动挖语料（设计 v2 §10）。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { dshHome, normalizePersonaText } from "./sanitize.js";
import { loadCardsState, saveCards } from "./cards.js";
function draftsPath() {
    return join(dshHome(), 'dsh-twin', 'exemplar-drafts.json');
}
export function loadDrafts() {
    const p = draftsPath();
    if (!existsSync(p))
        return { drafts: [] };
    try {
        const s = JSON.parse(readFileSync(p, 'utf8'));
        return Array.isArray(s.drafts) ? s : { drafts: [] };
    }
    catch {
        try {
            renameSync(p, `${p}.corrupt-${Date.now()}`);
        }
        catch { /* 备份失败 */ }
        return { drafts: [] };
    }
}
export function saveDrafts(store) {
    const p = draftsPath();
    mkdirSync(dirname(p), { recursive: true });
    const tmp = `${p}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmp, p);
}
/* ── 规则式挖掘 ── */
const PATTERNS = [
    { category: '拒绝边界', test: /不能|无法|不行|不接|拒绝|没办法|做不到/ },
    { category: '承诺措辞', test: /承诺|保证|一定|马上安排|尽快|我来跟进/ },
    { category: '澄清确认', test: /先确认|需要确认|请提供|方便说下|具体是哪/ },
];
/** 规则式抽取：返回候选（未脱敏标注、未去重） */
export function mineExemplars(texts) {
    const out = [];
    for (const raw of texts) {
        const text = normalizePersonaText(raw).slice(0, 600);
        if (text.length < 4)
            continue;
        let category = '一般';
        for (const p of PATTERNS) {
            if (p.test.test(text)) {
                category = p.category;
                break;
            }
        }
        if (category === '一般')
            continue; // 只挖高价值场景
        out.push({
            id: `ED-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            ts: new Date().toISOString(),
            situation: category === '拒绝边界' ? '边界/拒绝类场景' : category === '承诺措辞' ? '承诺类场景' : '澄清类场景',
            say: text,
            avoidSay: '',
            sanitized: false,
            fp: createHash('sha256').update(text).digest('hex').slice(0, 16),
            state: '候选',
            category,
        });
    }
    return out;
}
/** 批量入池（同 say 指纹去重） */
export function addDrafts(drafts) {
    const store = loadDrafts();
    const seen = new Set(store.drafts.map(d => d.fp));
    let added = 0;
    let duplicates = 0;
    for (const d of drafts) {
        if (seen.has(d.fp)) {
            duplicates += 1;
            continue;
        }
        seen.add(d.fp);
        store.drafts.push(d);
        added += 1;
    }
    saveDrafts(store);
    return { added, duplicates };
}
/** 挖掘入口：文本数组 → 规则抽取 → 入池 */
export function mineAndPool(texts) {
    const drafts = mineExemplars(texts);
    const r = addDrafts(drafts);
    return { ...r, scanned: texts.length };
}
export function listDrafts(state) {
    const store = loadDrafts();
    return state !== undefined ? store.drafts.filter(d => d.state === state) : store.drafts;
}
/**
 * 确认入卡：把草稿转成样例卡对照例并合并进当前卡（confirm + 回归通过由调用方保证——
 * 传 regressionReportId 即视为回归已过）。未提供时草稿标记已确认但仍停留候选池。
 */
export function confirmDraft(draftId, opts = {}) {
    const store = loadDrafts();
    const d = store.drafts.find(x => x.id === draftId);
    if (d === undefined)
        return { ok: false, error: '草稿不存在' };
    if (d.state !== '候选')
        return { ok: false, error: `草稿已处于「${d.state}」` };
    d.state = '已确认';
    d.confirmedAt = new Date().toISOString();
    if (opts.avoidSay !== undefined && opts.avoidSay !== '')
        d.avoidSay = opts.avoidSay.slice(0, 600);
    saveDrafts(store);
    // 合并进当前卡（新修订；生效双条件由 cards 层判定——无回归报告时停留候选修订）
    const st = loadCardsState();
    const exemplar = {
        id: `ex-${d.id.slice(3)}`,
        situation: d.situation,
        say: d.say,
        avoidSay: d.avoidSay,
        source: '语料',
        confirmedAt: d.confirmedAt,
    };
    const merged = {
        ...st.file.current,
        exemplars: {
            items: [
                ...st.file.current.exemplars.items,
                exemplar,
            ],
        },
    };
    saveCards({
        cards: merged,
        confirm: true,
        regressionPassed: opts.regressionReportId !== undefined && opts.regressionReportId !== '',
        regressionReportId: opts.regressionReportId,
    });
    return { ok: true };
}
export function rejectDraft(draftId) {
    const store = loadDrafts();
    const d = store.drafts.find(x => x.id === draftId);
    if (d === undefined)
        return { ok: false, error: '草稿不存在' };
    d.state = '已驳回';
    saveDrafts(store);
    return { ok: true };
}
