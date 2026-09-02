export interface ExemplarDraft {
    id: string;
    ts: string;
    situation: string;
    say: string;
    avoidSay: string;
    sourceRef?: string;
    /** 入池前已脱敏（真实敏感值不得进入样例） */
    sanitized: boolean;
    /** 指纹（同 say 去重） */
    fp: string;
    state: '候选' | '已确认' | '已驳回';
    confirmedAt?: string;
    category?: '拒绝边界' | '承诺措辞' | '澄清确认' | '一般';
}
export interface DraftStore {
    drafts: ExemplarDraft[];
}
export declare function loadDrafts(): DraftStore;
export declare function saveDrafts(store: DraftStore): void;
/** 规则式抽取：返回候选（未脱敏标注、未去重） */
export declare function mineExemplars(texts: string[]): ExemplarDraft[];
/** 批量入池（同 say 指纹去重） */
export declare function addDrafts(drafts: ExemplarDraft[]): {
    added: number;
    duplicates: number;
};
/** 挖掘入口：文本数组 → 规则抽取 → 入池 */
export declare function mineAndPool(texts: string[]): {
    added: number;
    duplicates: number;
    scanned: number;
};
export declare function listDrafts(state?: ExemplarDraft['state']): ExemplarDraft[];
/**
 * 确认入卡：把草稿转成样例卡对照例并合并进当前卡（confirm + 回归通过由调用方保证——
 * 传 regressionReportId 即视为回归已过）。未提供时草稿标记已确认但仍停留候选池。
 */
export declare function confirmDraft(draftId: string, opts?: {
    regressionReportId?: string;
    avoidSay?: string;
}): {
    ok: boolean;
    error?: string;
};
export declare function rejectDraft(draftId: string): {
    ok: boolean;
    error?: string;
};
