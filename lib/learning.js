/**
 * 学习闭环服务（v2，实施计划 V2-M1b）
 *
 * 设计依据：docs/digital-twin-design-v2.html §3
 * - 信号分类：纠正 / 否决 / 事实更正 / 影子差异
 * - 证据权重门槛：同类指纹累计 ≥ N（默认 3）或主人显式归因才升格候选
 * - 流水线：捕获 → 候选生成 → 主人确认 → 回归门禁 → 入卡
 * - 一切入卡 = 主人签名 + 回归通过；单次信号永远只是「观察」
 *
 * 存储：$DSH_HOME/dsh-twin/learning-events.json（事件流水，只增不删）
 *       $DSH_HOME/dsh-twin/learning-candidates.json（候选池，每条带修订快照）
 *       $DSH_HOME/dsh-twin/exemplar-drafts.json（V2-M2a 样例候选池，本阶段预留）
 *
 * 入口纯函数 + IO 分离：所有晋升判定在 enqueue() 完成；落盘与候选生成
 * 分两步走，便于契约测试锁定判定不变量。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { dshHome, normalizePersonaLine } from "./sanitize.js";
const DEFAULT_N = {
    纠正: 3,
    否决: 2,
    事实更正: 1,
    影子差异: 5,
};
/** 指纹归一：NFC → 去标点空格 → 折叠空白 → 截断。幂等。 */
export function fingerprint(input) {
    const s = normalizePersonaLine(input);
    // 去标点 + 折叠空白（去标点后产生的连续空格也要折叠一次）
    return s.replace(/[\p{P}\p{S}]/gu, '').replace(/\s+/g, '').slice(0, 80);
}
function genId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function eventsPath() {
    return join(dshHome(), 'dsh-twin', 'learning-events.json');
}
function candidatesPath() {
    return join(dshHome(), 'dsh-twin', 'learning-candidates.json');
}
export function loadEvents() {
    const p = eventsPath();
    if (!existsSync(p))
        return { events: [] };
    try {
        const s = JSON.parse(readFileSync(p, 'utf8'));
        return Array.isArray(s.events) ? s : { events: [] };
    }
    catch {
        try {
            renameSync(p, `${p}.corrupt-${Date.now()}`);
        }
        catch { /* 备份失败 */ }
        return { events: [] };
    }
}
export function saveEvents(store) {
    const p = eventsPath();
    mkdirSync(dirname(p), { recursive: true });
    const tmp = `${p}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmp, p);
}
export function loadCandidates() {
    const p = candidatesPath();
    if (!existsSync(p))
        return { candidates: [] };
    try {
        const s = JSON.parse(readFileSync(p, 'utf8'));
        return Array.isArray(s.candidates) ? s : { candidates: [] };
    }
    catch {
        try {
            renameSync(p, `${p}.corrupt-${Date.now()}`);
        }
        catch { /* 备份失败 */ }
        return { candidates: [] };
    }
}
export function saveCandidates(store) {
    const p = candidatesPath();
    mkdirSync(dirname(p), { recursive: true });
    const tmp = `${p}.tmp-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmp, p);
}
/* ── 入队 + 指纹聚合 + 晋升（纯层：决议；不落盘） ── */
function kindIsCorrective(kind) {
    return kind === '纠正';
}
/**
 * 入队：归一化指纹 → 命中已有同类 → 权重+1 → 达到门槛 → 生成候选。
 * 显式归因可绕过门槛一次晋升。事件只增不删，候选独立存储可由主人确认/驳回。
 */
export function enqueue(input, existing, existingCandidates) {
    const sig = fingerprint(input.signal);
    if (sig === '')
        throw new Error('learning signal 指纹为空');
    // target 缺省 = 样例卡（纠正→样例卡 是设计的默认路由）
    const target = input.target ?? '样例卡';
    // kind 白名单外（含编码坏损）一律回落「纠正」；阈值查表失败兜底 2（介于纠正与批准之间偏保守）
    const kind = (DEFAULT_N[input.kind] !== undefined ? input.kind : '纠正');
    const threshold = input.threshold ?? (DEFAULT_N[kind] ?? 2);
    const explicit = input.explicitAttribution === true;
    // 同类判定：指纹相等（已归一）+ 同一 target
    const sameFamily = existing.events.filter(e => e.sig === sig && e.target === target && e.status !== '已驳回');
    const maxWeight = sameFamily.reduce((m, e) => Math.max(m, e.weight), 0);
    const weight = maxWeight + 1;
    const reachesThreshold = explicit || sameFamily.length + 1 >= threshold;
    const event = {
        id: genId('LE'),
        ts: new Date().toISOString(),
        kind,
        sig,
        target,
        ...(input.ref !== undefined && input.ref !== '' ? { ref: input.ref.slice(0, 200) } : {}),
        weight,
        by: input.by,
        status: reachesThreshold ? '候选修订' : '观察',
    };
    existing.events.push(event);
    let createdCandidate;
    if (reachesThreshold) {
        const candidate = buildCandidate(event, sig, target, input);
        createdCandidate = candidate;
        event.candidateId = candidate.id;
        existingCandidates.candidates.push(candidate);
        // 已有同类事件全部标 associated
        // 把已有同类事件一并关联到这个候选并升级状态（apply 时一起升级为已入卡）
        for (const e of sameFamily) {
            e.status = '候选修订';
            e.candidateId = candidate.id;
        }
    }
    return { event, ...(createdCandidate !== undefined ? { candidate: createdCandidate } : {}) };
}
/** 按事件与目标类型生成候选（v1 风格：先产生最低骨架；M2/M3 填充说人话的字段） */
function buildCandidate(event, sig, target, input) {
    const payload = target === '样例卡'
        ? { situation: sig, say: '', avoidSay: '', source: kindIsCorrective(input.kind) ? '纠正' : '语料', ...(input.ref !== undefined ? { sourceRef: input.ref } : {}) }
        : target === '策略卡'
            ? { op: '新增', when: sig, act: '', enabled: true }
            : { op: '替代', ...(input.ref !== undefined ? { memoryId: input.ref } : {}) };
    return {
        id: genId('LC'),
        kind: target,
        eventIds: [event.id],
        payload,
        status: '候选修订',
        createdAt: event.ts,
    };
}
/** 主人确认候选：标记 confirmedAt + 回归报告 id；不直接入卡——回归门禁由 confirmCandidate 评估。 */
export function confirmCandidate(candidateId, by, candidates) {
    const c = candidates.candidates.find(x => x.id === candidateId);
    if (c === undefined)
        return undefined;
    if (c.status === '已入卡' || c.status === '已驳回')
        return c;
    c.confirmedAt = new Date().toISOString();
    return c;
}
/** 驳回候选 + 标记事件状态 */
export function rejectCandidate(candidateId, candidates, events) {
    const c = candidates.candidates.find(x => x.id === candidateId);
    if (c === undefined)
        return undefined;
    c.status = '已驳回';
    // 同类此前被关联到本候选的事件一并驳回（candidateId 匹配，含 eventIds）
    for (const e of events.events) {
        if (e.candidateId === c.id || c.eventIds.includes(e.id))
            e.status = '已驳回';
    }
    return c;
}
/** 入卡：仅在 confirmedAt + regressionReportId 齐备时生效；否则仍保持候选修订。 */
export function applyCandidate(candidateId, regressionReportId, candidates, events) {
    const c = candidates.candidates.find(x => x.id === candidateId);
    if (c === undefined)
        return undefined;
    if (c.status !== '候选修订')
        return undefined;
    if (c.confirmedAt === undefined)
        return c; // 未确认：原样返回（未入卡），由路由层提示
    if (regressionReportId.trim() === '')
        return undefined; // 缺回归报告：硬拒绝
    c.status = '已入卡';
    c.regressionReportId = regressionReportId;
    c.appliedAt = new Date().toISOString();
    // 所有同类此前晋升的事件（candidateId 已被设置为此候选）一起升级为已入卡
    for (const e of events.events) {
        if (e.candidateId === c.id) {
            e.status = '已入卡';
            e.appliedAt = c.appliedAt;
        }
    }
    return c;
}
export function listEvents(q = {}) {
    const store = loadEvents();
    return store.events
        .filter(e => (q.status !== undefined ? e.status === q.status : true))
        .slice(-(q.limit ?? 50));
}
export function listCandidates() {
    return loadCandidates().candidates.slice(-50);
}
