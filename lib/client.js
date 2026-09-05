window.__ModuleLoader__.load({
	id: "@dsh-extra/dsh-twin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react8 = require("react");

// src/client/twin-hub.tsx
var import_react7 = require("react");

// src/client/dashboard.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY = { candidates: [], openLoops: [], pendingShadow: [], ledger: { pendingApprovals: 0, blocked: 0, total: 0 }, regressions: [], reaches: [] };
async function api(path) {
  const r = await fetch(path);
  return await r.json();
}
var s = {
  wrap: { padding: "18px 20px", maxWidth: "860px" },
  h: { fontSize: "19px", fontWeight: 700, margin: "0 0 2px", color: "var(--dsw-alias-label-primary)" },
  sub: { fontSize: "13px", color: "var(--dsw-alias-label-tertiary)", margin: "0 0 16px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 },
  card: { background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 10, padding: "14px 16px", position: "relative" },
  num: { fontSize: 30, fontWeight: 800, lineHeight: 1.1 },
  nm: { fontSize: 12.5, color: "var(--dsw-alias-label-secondary)", marginTop: 4 },
  ctx: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", marginTop: 6 },
  dot: { position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: "50%" },
  section: { fontSize: 13.5, fontWeight: 700, margin: "16px 0 8px", color: "var(--dsw-alias-label-primary)" },
  item: { background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 8, padding: "9px 12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  itemText: { flex: "1 1 200px", fontSize: 13, color: "var(--dsw-alias-label-primary)" },
  itemMeta: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)" },
  btn: { padding: "5px 12px", border: "none", borderRadius: 6, background: "var(--dsw-alias-state-business-primary)", color: "var(--dsw-alias-label-primary-inverted)", fontSize: 12, cursor: "pointer" },
  btnGhost: { padding: "5px 12px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 6, background: "transparent", color: "var(--dsw-alias-label-secondary)", fontSize: 12, cursor: "pointer" },
  btnDanger: { padding: "5px 12px", border: "1px solid var(--dsw-alias-state-error-primary)", borderRadius: 6, background: "transparent", color: "var(--dsw-alias-state-error-primary)", fontSize: 12, cursor: "pointer" },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  empty: { textAlign: "center", padding: "34px 16px", background: "var(--dsw-alias-bg-layer-1)", border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 12, marginTop: 6 },
  emptyIcon: { fontSize: 30, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: 4 },
  emptySub: { fontSize: 12.5, color: "var(--dsw-alias-label-tertiary)" },
  chip: { fontSize: 11, padding: "1px 8px", borderRadius: 4, border: "1px solid var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-secondary)" },
  status: { fontSize: 12.5, marginTop: 10, color: "var(--dsw-alias-state-success-primary)" },
  err: { fontSize: 12.5, marginTop: 10, color: "var(--dsw-alias-state-error-primary)" }
};
function DashboardPage() {
  const [d, setD] = (0, import_react.useState)(EMPTY);
  const [loaded, setLoaded] = (0, import_react.useState)(false);
  const [err, setErr] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)("");
  const [missing, setMissing] = (0, import_react.useState)({});
  const load = (0, import_react.useCallback)(async () => {
    try {
      const [learning, profiles, shadow, ledger, regressions, proactive] = await Promise.all([
        api("/dsh-twin/learning").catch(() => null),
        api("/dsh-actors/profiles").catch(() => null),
        api("/dsh-regression/shadow/pending").catch(() => null),
        api("/dsh-ledger/stats").catch(() => null),
        api("/dsh-regression/reports").catch(() => null),
        api("/dsh-twin/proactive").catch(() => null)
      ]);
      setMissing({
        learning: learning === null,
        actors: profiles === null,
        shadow: shadow === null,
        ledger: ledger === null,
        regression: regressions === null
      });
      const openLoops = (profiles?.profiles ?? []).flatMap(
        (p) => (p.openLoops ?? []).map((o) => ({ actorId: p.entity.id, displayName: p.entity.displayName, memoryId: o.memoryId, content: o.content, openedAt: o.openedAt }))
      );
      setD({
        candidates: (learning?.candidates ?? []).filter((c) => c.id).slice(0, 20),
        openLoops,
        pendingShadow: shadow?.pairs ?? [],
        ledger: {
          pendingApprovals: ledger?.stats?.pendingApprovals ?? 0,
          blocked: ledger?.stats?.byStatus?.["\u5DF2\u963B\u65AD"] ?? 0,
          total: ledger?.stats?.total ?? 0
        },
        regressions: (regressions?.reports ?? []).slice(0, 1),
        reaches: (proactive?.reaches ?? []).slice(-8)
      });
      setLoaded(true);
      setErr("");
    } catch (e) {
      setErr(String(e));
      setLoaded(true);
    }
  }, []);
  (0, import_react.useEffect)(() => {
    void load();
  }, [load]);
  const total = d.candidates.length + d.openLoops.length + d.pendingShadow.length + d.ledger.pendingApprovals;
  async function confirmAll() {
    if (d.candidates.length === 0) return;
    setBusy(true);
    for (const c of d.candidates) {
      await fetch("/dsh-twin/learning/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId: c.id, by: "\u4E3B\u4EBA" }) });
    }
    setBusy(false);
    setMsg(`\u5DF2\u786E\u8BA4 ${d.candidates.length} \u4E2A\u5019\u9009\uFF08\u4ECD\u5F85\u56DE\u5F52\u901A\u8FC7\u540E\u5E94\u7528\uFF09`);
    void load();
  }
  async function rejectAll() {
    if (d.candidates.length === 0) return;
    if (!window.confirm(`\u6279\u91CF\u9A73\u56DE ${d.candidates.length} \u4E2A\u5019\u9009\uFF1F`)) return;
    setBusy(true);
    for (const c of d.candidates) {
      await fetch("/dsh-twin/learning/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId: c.id, by: "\u4E3B\u4EBA" }) });
    }
    setBusy(false);
    setMsg(`\u5DF2\u9A73\u56DE ${d.candidates.length} \u4E2A\u5019\u9009`);
    void load();
  }
  async function closeLoop(memoryId) {
    await fetch("/dsh-memory/openloop/close", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memoryId, via: "\u4E3B\u4EBA\u786E\u8BA4" }) });
    void load();
  }
  const numColor = (n) => n > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)";
  function StatCard({ name, ctx, count, absent }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.dot, background: absent ? "var(--dsw-alias-label-tertiary)" : count > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)" } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.num, color: absent ? "var(--dsw-alias-label-tertiary)" : numColor(count) }, children: absent ? "\u2014" : count }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.nm, children: name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.ctx, children: absent ? "\u63D0\u4F9B\u65B9\u63D2\u4EF6\u672A\u5B89\u88C5 \xB7 \u589E\u5F3A\u672A\u542F\u7528" : ctx })
    ] });
  }
  const missingAny = Object.values(missing).some((v) => v === true);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { style: s.h, children: "\u4ECA\u65E5\u5F85\u529E" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: s.sub, children: "\u5206\u8EAB\u9700\u8981\u4F60\u51B3\u7B56/\u5904\u7F6E\u7684\u4E8B\u9879\u6C47\u603B\u2014\u2014\u5904\u7406\u5B8C\u8FD9\u91CC\uFF0C\u5176\u4F59\u90FD\u5728\u81EA\u52A8\u8FD0\u8F6C\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.cards, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, { name: "\u5F85\u786E\u8BA4\u5019\u9009", ctx: "\u5B66\u4E60\u961F\u5217 \xB7 \u8FBE\u5230\u8BC1\u636E\u95E8\u69DB", count: d.candidates.length, absent: missing.learning === true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, { name: "\u5F85\u95ED\u73AF\u4E8B\u9879", ctx: "\u5173\u7CFB\u6863\u6848 \xB7 \u627F\u8BFA\u51FA\u53E3\u5373\u5F00\u73AF", count: d.openLoops.length, absent: missing.actors === true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, { name: "\u5F85\u5224\u5B9A\u76F2\u6D4B", ctx: "\u5F71\u5B50\u6D4B\u8BD5 \xB7 \u5224\u65AD\u54EA\u53E5\u50CF\u4F60", count: d.pendingShadow.length, absent: missing.shadow === true }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, { name: "\u5F85\u6279\u5BA1\u6279", ctx: "\u59D4\u6258\u8D26\u672C \xB7 \u6279\u51C6\u5373\u673A\u68B0\u843D\u8D26", count: d.ledger.pendingApprovals, absent: missing.ledger === true })
    ] }),
    loaded && total === 0 && !missingAny && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.empty, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.emptyIcon, children: "\u2713" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.emptyText, children: "\u4ECA\u5929\u6CA1\u6709\u9700\u8981\u4F60\u5904\u7406\u7684\u4E8B" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.emptySub, children: "\u4FE1\u53F7\u81EA\u52A8\u6C89\u6DC0\uFF0C\u5019\u9009\u81EA\u52A8\u8FBE\u95E8\u69DB\uFF0C\u4E00\u5207\u5982\u5E38\u3002" })
    ] }),
    loaded && total === 0 && missingAny && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.empty, borderColor: "var(--dsw-alias-border-l1)" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.emptySub, children: "\u90E8\u5206\u589E\u5F3A\u63D2\u4EF6\u672A\u5B89\u88C5\uFF0C\u76F8\u5173\u5361\u7247\u4EE5\u300C\u2014\u300D\u663E\u793A\uFF1B\u5B89\u88C5\u540E\u81EA\u52A8\u70B9\u4EAE\u3002" }) }),
    d.candidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
        "\u5F85\u786E\u8BA4\u5019\u9009\uFF08",
        d.candidates.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { ...s.row, marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn, disabled: busy, onClick: () => void confirmAll(), children: "\u5168\u90E8\u786E\u8BA4\uFF08\u7B7E\u540D\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btnDanger, disabled: busy, onClick: () => void rejectAll(), children: "\u5168\u90E8\u9A73\u56DE" })
      ] }),
      d.candidates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.chip, children: c.kind }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemText, children: String(c.payload.situation ?? c.payload.when ?? c.id) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemMeta, children: c.createdAt.slice(0, 10) })
      ] }, c.id))
    ] }),
    d.openLoops.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
        "\u5F85\u95ED\u73AF\u4E8B\u9879\uFF08",
        d.openLoops.length,
        "\uFF09"
      ] }),
      d.openLoops.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.chip, children: o.displayName ?? o.actorId }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemText, children: o.content }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btnGhost, onClick: () => void closeLoop(o.memoryId), children: "\u6807\u8BB0\u95ED\u73AF" })
      ] }, o.memoryId))
    ] }),
    d.pendingShadow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
        "\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\uFF08",
        d.pendingShadow.length,
        "\uFF09"
      ] }),
      d.pendingShadow.slice(0, 3).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: s.itemText, children: [
          "\u201C",
          p.visitorInput.slice(0, 40),
          "\u201D"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemMeta, children: "\u8BE6\u89C1\u300C\u5F71\u5B50\u6D4B\u8BD5\u300DTab" })
      ] }, p.id))
    ] }),
    d.regressions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.section, children: "\u6700\u8FD1\u4E00\u6B21\u56DE\u5F52" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.chip, children: d.regressions[0].id }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: s.itemText, children: [
          "\u901A\u8FC7 ",
          d.regressions[0].passed,
          "/",
          d.regressions[0].total,
          d.regressions[0].passed === d.regressions[0].total ? " \xB7 \u5168\u7EFF" : " \xB7 \u6709\u5931\u8D25"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemMeta, children: d.regressions[0].at.slice(0, 16).replace("T", " ") })
      ] })
    ] }),
    d.ledger.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { ...s.item, marginTop: 14 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.chip, children: "\u8D26\u672C" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: s.itemText, children: [
        "\u7D2F\u8BA1\u88C1\u51B3 ",
        d.ledger.total,
        " \u7B14 \xB7 \u5DF2\u963B\u65AD ",
        d.ledger.blocked
      ] })
    ] }),
    d.reaches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
        "\u4E3B\u52A8\u89E6\u8FBE\u8BB0\u5F55\uFF08\u6700\u8FD1 ",
        d.reaches.length,
        "\uFF09"
      ] }),
      d.reaches.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.chip, children: r.kind }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: s.itemText, children: r.title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { ...s.chip, color: r.status === "\u5DF2\u89E6\u8FBE" ? "var(--dsw-alias-state-success-primary)" : r.status === "\u88AB\u963B\u65AD" ? "var(--dsw-alias-state-error-primary)" : "var(--dsw-alias-state-warn-primary)" }, children: r.status })
      ] }, r.id))
    ] }),
    err && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.err, children: [
      "\u52A0\u8F7D\u90E8\u5206\u5931\u8D25\uFF1A",
      err,
      "\uFF08\u6570\u636E\u6E90\u63D2\u4EF6\u53EF\u80FD\u672A\u5168\u90E8\u88C5\u8F7D\uFF09"
    ] }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.status, children: msg })
  ] });
}

// src/client/learning.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var SIGNAL_KINDS = [
  { kind: "\u7EA0\u6B63", label: "\u7EA0\u6B63\uFF08\u4F1A\u8BDD\u5185\u300C\u8FD9\u8BDD\u4E0D\u8BE5\u8FD9\u4E48\u56DE\u300D\uFF09" },
  { kind: "\u5426\u51B3", label: "\u5426\u51B3\uFF08\u8D26\u672C feedback=\u63A8\u7FFB\uFF09" },
  { kind: "\u4E8B\u5B9E\u66F4\u6B63", label: "\u4E8B\u5B9E\u66F4\u6B63\uFF08\u4E3B\u4EBA\u8BA2\u6B63\u8BB0\u5FC6\uFF09" },
  { kind: "\u5F71\u5B50\u5DEE\u5F02", label: "\u5F71\u5B50\u5DEE\u5F02\uFF08\u76F2\u6D4B\u5206\u6B67\u5BF9\uFF09" }
];
var TARGETS = [
  { id: "\u6837\u4F8B\u5361", label: "\u2192 \u6837\u4F8B\u5361\uFF08\u5BF9\u7167\u4F8B\uFF09" },
  { id: "\u7B56\u7565\u5361", label: "\u2192 \u7B56\u7565\u5361\uFF08\u89C4\u5219\u4FEE\u8BA2\uFF09" },
  { id: "\u8BB0\u5FC6", label: "\u2192 \u8BB0\u5FC6\uFF08\u66FF\u4EE3/\u65B0\u589E\uFF09" }
];
async function api2(path, method, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body !== void 0) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  const d = await r.json().catch(() => ({ ok: false, error: `HTTP ${r.status}` }));
  return d;
}
var s2 = {
  wrap: { padding: "20px", maxWidth: "720px" },
  h: { fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "var(--dsw-alias-label-secondary)", margin: "0 0 16px 0" },
  secTitle: { fontSize: "14px", fontWeight: 700, margin: "18px 0 8px 0", color: "var(--dsw-alias-label-primary)" },
  label: { display: "block", fontSize: "12px", color: "var(--dsw-alias-label-secondary)", margin: "6px 0 4px 0" },
  input: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" },
  textarea: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", minHeight: "60px", resize: "vertical" },
  select: { padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", marginRight: 8 },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 },
  btn: { padding: "8px 18px", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-state-business-primary)", color: "#fff" },
  ghost: { padding: "8px 18px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" },
  ok: { padding: "6px 14px", border: "1px solid #1d7a53", borderRadius: "4px", background: "var(--dsw-alias-state-success-tertiary)", color: "var(--dsw-alias-state-success-primary)", fontSize: "13px", cursor: "pointer" },
  bad: { padding: "6px 14px", border: "1px solid #b03a44", borderRadius: "4px", background: "var(--dsw-alias-interactive-bg-hover-danger)", color: "var(--dsw-alias-state-error-primary)", fontSize: "13px", cursor: "pointer" },
  hint: { fontSize: "12px", color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-layer-1)", border: "1px solid #eee", borderRadius: "6px", padding: "8px 10px", marginTop: 8 },
  card: { border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 10, background: "var(--dsw-alias-bg-layer-2)" },
  badge: { display: "inline-block", padding: "1px 8px", borderRadius: 4, fontSize: "11px", fontWeight: 600 },
  status: { fontSize: "13px", marginTop: 10, color: "var(--dsw-alias-state-business-primary)" }
};
function statusBadge(st) {
  const palette = {
    "\u89C2\u5BDF": { bg: "var(--dsw-alias-bg-layer-1)", fg: "var(--dsw-alias-label-tertiary)", b: "var(--dsw-alias-border-l1)" },
    "\u5019\u9009\u4FEE\u8BA2": { bg: "#eef0fb", fg: "#3f51c1", b: "var(--dsw-alias-border-l2)" },
    "\u5DF2\u5165\u5361": { bg: "var(--dsw-alias-state-success-tertiary)", fg: "var(--dsw-alias-state-success-primary)", b: "#c2e0cd" },
    "\u5DF2\u9A73\u56DE": { bg: "var(--dsw-alias-interactive-bg-hover-danger)", fg: "var(--dsw-alias-state-error-primary)", b: "#ecc8cb" }
  };
  const c = palette[st] ?? palette["\u89C2\u5BDF"];
  return { ...s2.badge, background: c.bg, color: c.fg, border: `1px solid ${c.b}` };
}
function LearningPage() {
  const [data, setData] = (0, import_react2.useState)({ ok: true, events: [], candidates: [] });
  const [kind, setKind] = (0, import_react2.useState)("\u7EA0\u6B63");
  const [target, setTarget] = (0, import_react2.useState)("\u6837\u4F8B\u5361");
  const [signal, setSignal] = (0, import_react2.useState)("");
  const [ref, setRef] = (0, import_react2.useState)("");
  const [msg, setMsg] = (0, import_react2.useState)(null);
  const [regressionReportId, setRegressionReportId] = (0, import_react2.useState)("");
  const load = (0, import_react2.useCallback)(async () => {
    const d = await api2("/dsh-twin/learning", "GET");
    if (d && d.ok) setData(d);
  }, []);
  (0, import_react2.useEffect)(() => {
    void load();
  }, [load]);
  async function enqueue() {
    setMsg(null);
    if (signal.trim() === "") {
      setMsg({ text: "\u4FE1\u53F7\u4E0D\u80FD\u4E3A\u7A7A", ok: false });
      return;
    }
    const d = await api2("/dsh-twin/learning/enqueue", "POST", { kind, target, signal, ref: ref.trim() || void 0, by: "\u4E3B\u4EBA" });
    if (d.ok) {
      setMsg({ text: d.promoted ? `\u5DF2\u5165\u961F\u5E76\u664B\u5347\u4E3A\u5019\u9009\uFF1A${d.candidate.id}` : `\u5DF2\u5165\u961F\u4E3A\u89C2\u5BDF\uFF1A${d.event.id}\uFF08\u540C\u7C7B\u7D2F\u8BA1 ${d.weight}/${d.threshold}\uFF09`, ok: d.promoted });
      setSignal("");
      setRef("");
      void load();
    } else {
      setMsg({ text: d.error ?? "\u5165\u961F\u5931\u8D25", ok: false });
    }
  }
  async function confirm(cid) {
    const d = await api2("/dsh-twin/learning/confirm", "POST", { candidateId: cid, by: "\u4E3B\u4EBA" });
    if (d.ok) {
      setMsg({ text: `\u5DF2\u786E\u8BA4\u5019\u9009 ${cid}\u2014\u2014\u4E0B\u4E00\u6B65\u5728\u56DE\u5F52\u901A\u8FC7\u540E\u7531\u300C\u5E94\u7528\u300D\u6309\u94AE\u5165\u5361`, ok: true });
      void load();
    } else {
      setMsg({ text: d.error ?? "\u786E\u8BA4\u5931\u8D25", ok: false });
    }
  }
  async function reject(cid) {
    const d = await api2("/dsh-twin/learning/reject", "POST", { candidateId: cid, by: "\u4E3B\u4EBA" });
    if (d.ok) {
      setMsg({ text: `\u5DF2\u9A73\u56DE ${cid}`, ok: true });
      void load();
    } else {
      setMsg({ text: d.error ?? "\u9A73\u56DE\u5931\u8D25", ok: false });
    }
  }
  async function apply2(cid) {
    if (!window.confirm(`\u786E\u8BA4\u5C06\u5019\u9009 ${cid} \u5E94\u7528\u5230\u56DB\u5F20\u5361\uFF1F\u9700\u586B\u5199\u56DE\u5F52\u62A5\u544A id\u3002`)) return;
    if (regressionReportId.trim() === "") {
      const r = await api2("/dsh-regression/run", "POST", { runner: "scripted" });
      const rid = r?.report?.id ?? "";
      if (rid) setRegressionReportId(rid);
      setMsg({ text: rid ? `\u5DF2\u81EA\u52A8\u8DD1\u56DE\u5F52\uFF1A${rid}\u2014\u2014\u518D\u6B21\u70B9\u51FB\u300C\u5E94\u7528\u300D\u5B8C\u6210\u5165\u5361` : "\u56DE\u5F52\u672A\u751F\u6210\u62A5\u544A\uFF08\u8BF7\u624B\u586B regressionReportId \u540E\u518D\u8BD5\uFF09", ok: !!rid });
      return;
    }
    const d = await api2("/dsh-twin/learning/apply", "POST", { candidateId: cid, regressionReportId });
    if (d.ok) {
      setMsg({ text: `\u5DF2\u5E94\u7528\u5019\u9009 ${cid} \u5230\u56DB\u5F20\u5361`, ok: true });
      setRegressionReportId("");
      void load();
    } else {
      setMsg({ text: d.error ?? "\u5E94\u7528\u5931\u8D25", ok: false });
    }
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { style: s2.h, children: "\u5B66\u4E60\u961F\u5217" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: s2.sub, children: "\u628A\u5206\u6563\u7684\u4FE1\u53F7\u53D8\u6210\u6709\u95E8\u69DB\u3001\u6709\u7B7E\u540D\u3001\u6709\u56DE\u5F52\u7684\u4FEE\u8BA2\u6D41\u6C34\u7EBF\u3002\u5355\u6B21\u4FE1\u53F7\u53EA\u6210\u4E3A\u89C2\u5BDF\uFF0C\u8FBE\u5230\u95E8\u69DB\u6216\u4E3B\u4EBA\u663E\u5F0F\u5F52\u56E0\u624D\u751F\u6210\u5019\u9009\uFF1B\u786E\u8BA4 + \u56DE\u5F52\u901A\u8FC7\u624D\u5165\u5361\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.secTitle, children: "\u5165\u961F\u4E00\u4E2A\u4FE1\u53F7" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: s2.label, children: "\u4FE1\u53F7\u7C7B\u578B" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("select", { style: s2.select, value: kind, onChange: (e) => setKind(e.target.value), children: SIGNAL_KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: k.kind, children: k.label }, k.kind)) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: s2.label, children: "\u4FE1\u53F7\u539F\u6587\uFF08\u7CFB\u7EDF\u4F1A\u5F52\u4E00\u5316\u4E3A\u6307\u7EB9\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("textarea", { style: s2.textarea, value: signal, onChange: (e) => setSignal(e.target.value), placeholder: "\u4F8B\uFF1A\u5BA2\u6237\u575A\u6301\u8981\u516B\u6298\u65F6\uFF0C\u5206\u8EAB\u76F4\u63A5\u7B54\u5E94\u4E86\uFF08\u7EA0\u6B63\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: s2.label, children: "\u8DEF\u7531\u5230" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("select", { style: s2.select, value: target, onChange: (e) => setTarget(e.target.value), children: TARGETS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: t.id, children: t.label }, t.id)) }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("label", { style: s2.label, children: "\u5173\u8054\u5F15\u7528\uFF08\u53EF\u9009\uFF1A\u88AB\u5426\u51B3\u7684 record id / \u5F71\u5B50\u5BF9 id\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("input", { style: s2.input, value: ref, onChange: (e) => setRef(e.target.value), placeholder: "\u53EF\u9009" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.btn, onClick: enqueue, children: "\u5165\u961F" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.ghost, onClick: () => void load(), children: "\u5237\u65B0" }),
      regressionReportId && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: s2.hint, children: [
        "\u5F85\u5E94\u7528 reportId: ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { children: regressionReportId })
      ] })
    ] }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.status, color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" }, children: msg.text }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.secTitle, children: [
      "\u5019\u9009\u6C60\uFF08",
      data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2").length,
      "\uFF09"
    ] }),
    data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2" || c.status === "\u5DF2\u9A73\u56DE" || c.status === "\u5DF2\u5165\u5361").slice(-20).reverse().map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: statusBadge(c.status), children: c.status }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { style: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)" }, children: c.id }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" }, children: [
          "\xB7 ",
          c.kind,
          " \xB7 \u5173\u8054\u4E8B\u4EF6 ",
          c.eventIds.length
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("pre", { style: { fontSize: 12, background: "var(--dsw-alias-bg-layer-1)", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 120, margin: 0 }, children: JSON.stringify(c.payload, null, 2) }),
      c.status === "\u5019\u9009\u4FEE\u8BA2" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.ok, onClick: () => void confirm(c.id), children: "\u4E3B\u4EBA\u786E\u8BA4" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.bad, onClick: () => void reject(c.id), children: "\u9A73\u56DE" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.ghost, onClick: () => void apply2(c.id), children: regressionReportId ? "\u5E94\u7528\uFF08\u5DF2\u6709 reportId\uFF09" : "\u5E94\u7528\uFF08\u5148\u81EA\u52A8\u8DD1\u56DE\u5F52\uFF09" })
      ] }),
      c.status === "\u5DF2\u5165\u5361" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.hint, children: [
        "\u5DF2\u5165\u5361 \xB7 \u62A5\u544A ",
        c.regressionReportId ?? "\u2014"
      ] })
    ] }, c.id)),
    data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.hint, children: "\u6682\u65E0\u5019\u9009\u3002\u5148\u5728\u201C\u5165\u961F\u201D\u91CC\u5199\u4E00\u6761\u4FE1\u53F7\uFF0C\u6216\u4F7F\u7528\u4E0A\u4E00\u680F\u7684\u201C\u7EA0\u6B63\u201D\u6309\u94AE\uFF08\u4E0E\u8D26\u672C\u53CD\u9988\u6309\u94AE\u63A5\u7EBF\u540E\u4F1A\u5728\u8FD9\u91CC\u81EA\u52A8\u51FA\u73B0\u5426\u51B3\u4FE1\u53F7\uFF09\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.secTitle, children: [
      "\u4E8B\u4EF6\u6D41\u6C34\uFF08\u6700\u8FD1 ",
      data.events.length,
      "\uFF09"
    ] }),
    data.events.slice(-15).reverse().map((e) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { ...s2.card, padding: "6px 10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: statusBadge(e.status), children: e.status }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { style: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", marginLeft: 8 }, children: e.id }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)", marginLeft: 8 }, children: [
        e.kind,
        " \u2192 ",
        e.target,
        " \xB7 w=",
        e.weight
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-primary)", marginTop: 4 }, children: e.sig })
    ] }, e.id))
  ] });
}

// src/client/profiles.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var ROLE_LABEL = { master: "\u4E3B\u4EBA", colleague: "\u540C\u4E8B", customer: "\u5BA2\u6237", stranger: "\u751F\u4EBA", blocked: "\u9ED1\u540D\u5355" };
var ROLE_COLOR = { master: "var(--dsw-alias-state-success-primary)", colleague: "#3f51c1", customer: "var(--dsw-alias-state-warn-label)", stranger: "var(--dsw-alias-label-tertiary)", blocked: "var(--dsw-alias-state-error-primary)" };
var s3 = {
  wrap: { padding: "20px", maxWidth: "760px" },
  h: { fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "var(--dsw-alias-label-secondary)", margin: "0 0 16px 0" },
  card: { border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 12, background: "var(--dsw-alias-bg-layer-2)" },
  head: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  name: { fontSize: 15, fontWeight: 700 },
  roleBadge: { fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 4 },
  ch: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)" },
  sec: { fontSize: 12.5, fontWeight: 700, color: "var(--dsw-alias-label-primary)", margin: "10px 0 4px" },
  item: { fontSize: 13, color: "var(--dsw-alias-label-primary)", padding: "4px 0", borderBottom: "1px dashed #f0f0f0" },
  loop: { background: "var(--dsw-alias-state-warn-tertiary)", border: "1px solid #f0dfc0", borderRadius: 6, padding: "6px 10px", marginBottom: 6, fontSize: 13, color: "var(--dsw-alias-state-warn-label)" },
  loopBtn: { float: "right", fontSize: 11, padding: "1px 8px", border: "1px solid #1d7a53", borderRadius: 4, background: "var(--dsw-alias-state-success-tertiary)", color: "var(--dsw-alias-state-success-primary)", cursor: "pointer" },
  ts: { color: "var(--dsw-alias-label-tertiary)", fontSize: 11, marginRight: 6 },
  empty: { fontSize: 13, color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-layer-1)", border: "1px solid #eee", borderRadius: 6, padding: 12 },
  btn: { padding: "8px 18px", border: "none", borderRadius: 4, fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-state-business-primary)", color: "#fff" },
  inferred: { fontSize: 10.5, color: "var(--dsw-alias-state-warn-label)", border: "1px solid #ecd9c0", borderRadius: 3, padding: "0 4px", marginRight: 4 }
};
function ProfilesPage() {
  const [profiles, setProfiles] = (0, import_react3.useState)([]);
  const [loaded, setLoaded] = (0, import_react3.useState)(false);
  const [err, setErr] = (0, import_react3.useState)("");
  const load = (0, import_react3.useCallback)(async () => {
    try {
      const r = await fetch("/dsh-actors/profiles");
      const d = await r.json();
      if (d.ok) setProfiles(d.profiles);
      else setErr(d.error ?? "\u52A0\u8F7D\u5931\u8D25");
    } catch (e) {
      setErr(String(e));
    }
    setLoaded(true);
  }, []);
  (0, import_react3.useEffect)(() => {
    void load();
  }, [load]);
  async function closeLoop(memoryId) {
    await fetch("/dsh-memory/openloop/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memoryId, via: "\u4E3B\u4EBA\u786E\u8BA4" })
    });
    void load();
  }
  const withRelations = profiles.filter((p) => p.relationCount > 0 || p.openLoops.length > 0);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { style: s3.h, children: "\u5173\u7CFB\u6863\u6848" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: s3.sub, children: '\u6309\u5BF9\u8BDD\u8005\u805A\u5408\u89C2\u5BDF / \u63A8\u65AD / \u672A\u95ED\u73AF\u4E8B\u9879\u2014\u2014"\u540C\u4E00\u4E2A\u5BA2\u6237\u7B2C\u4E09\u6B21\u6765\u8BBF\uFF0C\u5B83\u8BB0\u5F97\u524D\u4E24\u6B21"\u9760\u7684\u5C31\u662F\u8FD9\u91CC\u3002\u5F00\u73AF\u7531\u4E3B\u4EBA\u786E\u8BA4\u95ED\u73AF\u3002' }),
    !loaded && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: s3.empty, children: "\u52A0\u8F7D\u4E2D\u2026" }),
    loaded && err !== "" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.empty, children: [
      "\u52A0\u8F7D\u5931\u8D25\uFF1A",
      err
    ] }),
    loaded && err === "" && withRelations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: s3.empty, children: "\u6682\u65E0\u5173\u7CFB\u8BB0\u5F55\u3002\u5206\u8EAB\u4E0E\u8BBF\u5BA2\u7684\u771F\u5B9E\u4EA4\u5F80\u4F1A\u81EA\u52A8\u6C89\u6DC0\u5230\u8FD9\u91CC\uFF08\u89C2\u5BDF \u2192 \u63A8\u65AD\u9700\u4E3B\u4EBA\u786E\u8BA4\u8F6C\u6B63\uFF09\u3002" }),
    withRelations.map((p) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.head, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: s3.name, children: p.entity.displayName || p.entity.id }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { ...s3.roleBadge, background: `${ROLE_COLOR[p.entity.role] ?? "var(--dsw-alias-label-tertiary)"}1a`, color: ROLE_COLOR[p.entity.role] ?? "var(--dsw-alias-label-secondary)" }, children: ROLE_LABEL[p.entity.role] ?? p.entity.role }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: s3.ch, children: p.entity.bindings.map((b) => b.channel).join(" \xB7 ") }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { ...s3.ch, marginLeft: "auto" }, children: p.entity.id })
      ] }),
      p.openLoops.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.sec, children: [
          "\u672A\u95ED\u73AF\uFF08",
          p.openLoops.length,
          "\uFF09"
        ] }),
        p.openLoops.map((o) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.loop, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.loopBtn, onClick: () => void closeLoop(o.memoryId), children: "\u6807\u8BB0\u95ED\u73AF" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "t", children: o.content }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { color: "var(--dsw-alias-label-tertiary)", fontSize: 11, marginLeft: 8 }, children: o.openedAt.slice(0, 10) })
        ] }, o.memoryId))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.sec, children: [
        "\u89C2\u5BDF / \u63A8\u65AD\uFF08\u6700\u8FD1 ",
        p.observations.length,
        "\uFF09"
      ] }),
      p.observations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { ...s3.item, color: "var(--dsw-alias-label-tertiary)" }, children: "\u6682\u65E0" }),
      p.observations.map((o) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: s3.ts, children: o.ts.slice(0, 10) }),
        o.kind === "\u63A8\u65AD" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: s3.inferred, children: "\u63A8\u65AD" }),
        o.content
      ] }, o.memoryId))
    ] }, p.entity.id)),
    loaded && err === "" && profiles.length > 0 && withRelations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.empty, children: [
      profiles.length,
      " \u4E2A\u5BF9\u8BDD\u8005\u5DF2\u6CE8\u518C\uFF0C\u4F46\u8FD8\u6CA1\u6709\u5173\u7CFB\u8BB0\u5F55\u3002"
    ] })
  ] });
}

// src/client/shadow.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var s4 = {
  wrap: { padding: "20px", maxWidth: "760px" },
  h: { fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "var(--dsw-alias-label-secondary)", margin: "0 0 16px 0" },
  statsRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  statCard: { flex: "1 1 140px", background: "var(--dsw-alias-bg-layer-2)", border: "1px solid #eee", borderRadius: 10, padding: 14, textAlign: "center" },
  statNum: { fontSize: 26, fontWeight: 800 },
  statNm: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", marginTop: 2 },
  sec: { fontSize: 13.5, fontWeight: 700, margin: "18px 0 8px", color: "var(--dsw-alias-label-primary)" },
  pair: { border: "1px solid #eee", borderRadius: 10, padding: 14, marginBottom: 12, background: "var(--dsw-alias-bg-layer-2)" },
  q: { fontSize: 13, color: "var(--dsw-alias-label-primary)", marginBottom: 8 },
  reply: { borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8, lineHeight: 1.6 },
  masterC: { background: "color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent)" },
  twinC: { background: "color-mix(in srgb, var(--dsw-alias-state-business-primary) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 35%, transparent)" },
  tag: { fontSize: 11, fontWeight: 700, display: "inline-block", marginBottom: 4 },
  btnRow: { display: "flex", gap: 8 },
  jbtn: { flex: 1, padding: "7px 0", border: "1px solid #ddd", borderRadius: 6, background: "var(--dsw-alias-bg-layer-2)", fontSize: 12.5, cursor: "pointer" },
  input: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, marginBottom: 8 },
  btn: { padding: "8px 18px", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer", background: "var(--dsw-alias-state-business-primary)", color: "#fff" },
  ghost: { padding: "8px 18px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, cursor: "pointer", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-layer-1)", border: "1px solid #eee", borderRadius: 6, padding: "8px 10px", marginTop: 8 },
  empty: { fontSize: 13, color: "var(--dsw-alias-label-tertiary)" }
};
function ShadowPage() {
  const [stats, setStats] = (0, import_react4.useState)(null);
  const [pending, setPending] = (0, import_react4.useState)([]);
  const [form, setForm] = (0, import_react4.useState)({ visitorInput: "", masterReply: "", twinReply: "" });
  const [msg, setMsg] = (0, import_react4.useState)(null);
  const load = (0, import_react4.useCallback)(async () => {
    const st = await fetch("/dsh-regression/shadow/stats").then((r) => r.json()).catch(() => null);
    if (st?.ok) setStats(st.stats);
    const pd = await fetch("/dsh-regression/shadow/pending").then((r) => r.json()).catch(() => null);
    if (pd?.ok) setPending(pd.pairs);
  }, []);
  (0, import_react4.useEffect)(() => {
    void load();
  }, [load]);
  async function addPair() {
    if (form.visitorInput.trim() === "" || form.masterReply.trim() === "" || form.twinReply.trim() === "") {
      setMsg({ text: "\u4E09\u9879\u90FD\u4E0D\u80FD\u4E3A\u7A7A", ok: false });
      return;
    }
    const r = await fetch("/dsh-regression/shadow/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const d = await r.json().catch(() => ({ ok: false }));
    if (d.ok) {
      setMsg({ text: "\u76F2\u6D4B\u5BF9\u5DF2\u6DFB\u52A0", ok: true });
      setForm({ visitorInput: "", masterReply: "", twinReply: "" });
      void load();
    } else {
      setMsg({ text: d.error ?? "\u6DFB\u52A0\u5931\u8D25", ok: false });
    }
  }
  async function judge(pairId, judged) {
    await fetch("/dsh-regression/shadow/judge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairId, judged })
    });
    void load();
  }
  const rate = stats?.confusionRate;
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h1", { style: s4.h, children: "\u5F71\u5B50\u6D4B\u8BD5" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: s4.sub, children: "\u76F2\u6D4B\u534F\u8BAE\uFF1A\u540C\u4E00\u8BBF\u5BA2\u8F93\u5165\uFF0C\u5DE6\u8FB9\u662F\u4E3B\u4EBA\u7684\u771F\u5B9E\u56DE\u590D\u3001\u53F3\u8FB9\u662F\u5206\u8EAB\u7684\u56DE\u590D\u2014\u2014\u4E3B\u4EBA\u9009\u54EA\u53E5\u662F\u81EA\u5DF1\u5199\u7684\u3002\u5206\u8FA8\u4E0D\u51FA\u7387\u8D8A\u9AD8\uFF0C\u8BF4\u660E\u8D8A\u50CF\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.statsRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "n", style: { ...s4.statNum, color: rate === null ? "var(--dsw-alias-label-tertiary)" : rate >= 0.5 ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-label)" }, children: rate === null ? "\u2014" : `${Math.round(rate * 100)}%` }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.statNm, children: "\u5206\u8FA8\u4E0D\u51FA\u7387\uFF0830 \u5929\uFF09" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { ...s4.statNum, color: "#3f51c1" }, children: stats?.samples ?? 0 }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.statNm, children: "\u5DF2\u5224\u5B9A\u6837\u672C" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { ...s4.statNum, color: "var(--dsw-alias-label-tertiary)" }, children: stats?.breakdown["\u672A\u5224\u5B9A"] ?? 0 }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.statNm, children: "\u5F85\u5224\u5B9A" })
      ] })
    ] }),
    pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.sec, children: "\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\uFF08\u5224\u5B9A\u540E\u4E0D\u53EF\u66F4\u6539\uFF09" }),
      pending.map((p) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.pair, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.q, children: [
          "\u8BBF\u5BA2\uFF1A",
          p.visitorInput
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { ...s4.reply, ...s4.masterC }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { ...s4.tag, color: "var(--dsw-alias-state-success-primary)" }, children: "\u56DE\u590D A" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("br", {}),
          p.masterReply
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { ...s4.reply, ...s4.twinC }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { ...s4.tag, color: "var(--dsw-alias-state-business-primary)" }, children: "\u56DE\u590D B" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("br", {}),
          p.twinReply
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.btnRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.jbtn, onClick: () => void judge(p.id, "\u4E3B\u4EBA"), children: "A \u662F\u6211\u5199\u7684" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.jbtn, onClick: () => void judge(p.id, "\u5206\u8EAB"), children: "B \u662F\u6211\u5199\u7684" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.jbtn, onClick: () => void judge(p.id, "\u5F03\u6743"), children: "\u5206\u4E0D\u51FA\u6765 / \u8DF3\u8FC7" })
        ] })
      ] }, p.id))
    ] }),
    pending.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.empty, children: "\u6682\u65E0\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\u3002\u76F2\u6D4B\u5BF9\u6765\u81EA\uFF1A\u6388\u6743\u8BED\u6599\u6316\u6398\u540E\u7684\u300C\u5F71\u5B50\u573A\u666F\u300D\uFF0C\u6216 HostRunner \u81EA\u52A8\u751F\u6210\uFF08\u63A5\u5165\u4E2D\uFF09\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.sec, children: "\u624B\u52A8\u6DFB\u52A0\u76F2\u6D4B\u5BF9" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("input", { style: s4.input, value: form.visitorInput, onChange: (e) => setForm((f) => ({ ...f, visitorInput: e.target.value })), placeholder: "\u8BBF\u5BA2\u8F93\u5165\uFF08\u4F8B\uFF1A\u4F60\u4EEC\u4EC0\u4E48\u65F6\u5019\u80FD\u7ED9\u65B9\u6848\uFF1F\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("input", { style: s4.input, value: form.masterReply, onChange: (e) => setForm((f) => ({ ...f, masterReply: e.target.value })), placeholder: "\u4E3B\u4EBA\u7684\u771F\u5B9E\u56DE\u590D" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("input", { style: s4.input, value: form.twinReply, onChange: (e) => setForm((f) => ({ ...f, twinReply: e.target.value })), placeholder: "\u5206\u8EAB\u7684\u56DE\u590D" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.btn, onClick: () => void addPair(), children: "\u6DFB\u52A0" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.ghost, onClick: () => void load(), children: "\u5237\u65B0" }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { ...s4.hint, color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" }, children: msg.text }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.hint, children: "\u9690\u79C1\uFF1A\u76F2\u6D4B\u5BF9\u4EC5\u672C\u5730\u5B58\u50A8\uFF080600\uFF09\uFF1B\u7EDF\u8BA1\u53EA\u843D\u6307\u6807\u4E0D\u843D\u539F\u6587\uFF1B\u5DF2\u5224\u5B9A\u4E14\u8D85 90 \u5929\u7684\u5BF9\u81EA\u52A8\u6E05\u7406\u3002" })
  ] });
}

// src/client/monitor.tsx
var import_react5 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var s5 = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 14 },
  card: { background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: "14px 16px" },
  num: { fontSize: 26, fontWeight: 800, lineHeight: 1.1, color: "var(--dsw-alias-label-primary)" },
  nm: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", marginTop: 4 },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", lineHeight: 1.6 },
  failover: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-layer-1)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 8, padding: "8px 10px", marginTop: 12 }
};
function FailoverCard() {
  const [state, setState] = (0, import_react5.useState)("checking");
  (0, import_react5.useEffect)(() => {
    let alive = true;
    fetch("/model-failover/api/status").then((r) => r.ok ? r.json() : Promise.reject(new Error(String(r.status)))).then((d) => {
      if (!alive) return;
      const entries = d?.status?.entries ?? [];
      setState(Array.isArray(entries) && entries.length > 0 ? "ok" : "unconfigured");
    }).catch(() => {
      if (alive) setState("missing");
    });
    return () => {
      alive = false;
    };
  }, []);
  if (state === "missing") return null;
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.failover, children: [
    "\u6A21\u578B\u964D\u7EA7\u94FE\uFF1A",
    state === "ok" && "\u5DF2\u914D\u7F6E\uFF08\u5957\u9910\u8D85\u9650/\u4F59\u989D\u4E0D\u8DB3\u65F6\u6309\u94FE\u81EA\u52A8\u5207\u6362\uFF0C\u7A97\u53E3\u91CD\u7F6E\u81EA\u52A8\u5207\u56DE\uFF09",
    state === "unconfigured" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_jsx_runtime5.Fragment, { children: "\u672A\u914D\u7F6E\u2014\u2014\u5206\u8EAB\u5728\u6A21\u578B\u5957\u9910\u8D85\u9650\u65F6\u4F1A\u76F4\u63A5\u62A5\u9519\u3002\u5EFA\u8BAE\u5728\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u5207\u6362\u300D\u914D\u7F6E\u964D\u7EA7\u94FE\u3002" }),
    state === "checking" && "\u68C0\u6D4B\u4E2D\u2026"
  ] });
}
function MonitorPage() {
  const [monitor, setMonitor] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    let alive = true;
    fetch("/dsh-twin/monitor").then((r) => r.json()).then((d) => {
      if (alive && d.ok && d.monitor) setMonitor(d.monitor);
    }).catch(() => {
    });
    return () => {
      alive = false;
    };
  }, []);
  const stat = (n, label, key) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.card, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.num, children: n }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.nm, children: label })
  ] }, key);
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
    monitor ? /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.grid, children: [
      stat(monitor.sessionCount, "\u4F1A\u8BDD\u603B\u6570", "sc"),
      stat(monitor.twinSessionCount, "\u5206\u8EAB\u4F1A\u8BDD", "tsc"),
      stat(monitor.turns, "Turns", "t"),
      stat(`${Math.round(monitor.errorRate * 100)}%`, `\u9519\u8BEF\u7387\uFF08${monitor.errors} \u6B21\uFF09`, "e"),
      stat(`${Math.round(monitor.llmMs / 1e3)}s`, "LLM \u7D2F\u8BA1\u8017\u65F6", "l"),
      stat(`${(monitor.tokens.input / 1e3).toFixed(0)}K / ${(monitor.tokens.output / 1e3).toFixed(1)}K`, "Tokens \u8F93\u5165/\u8F93\u51FA", "tk"),
      stat(`${monitor.tokens.cacheRead > 0 ? Math.round(monitor.tokens.cacheRead / Math.max(1, monitor.tokens.input) * 100) : 0}%`, "\u7F13\u5B58\u547D\u4E2D\u7387", "ch")
    ] }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { ...s5.hint, padding: "14px 16px", background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12 }, children: "\u6682\u65E0\u76D1\u63A7\u6570\u636E\u2014\u2014\u4F7F\u7528\u5206\u8EAB\u4F1A\u8BDD\u540E\u8FD9\u91CC\u4F1A\u51FA\u73B0\u8FD0\u884C\u7EDF\u8BA1\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FailoverCard, {})
  ] });
}

// src/client/cards.tsx
var import_react6 = require("react");

// src/built-in-fields.ts
var BUILT_IN_FIELDS2 = [
  { key: "name", label: "\u540D\u5B57", visibility: "\u516C\u5F00", control: "text" },
  { key: "role", label: "\u8EAB\u4EFD\u5B9A\u4F4D", visibility: "\u516C\u5F00", control: "text" },
  { key: "background", label: "\u80CC\u666F", visibility: "\u79C1\u5BC6", control: "textarea" },
  { key: "tone", label: "\u8BED\u6C14", visibility: "\u516C\u5F00", control: "tone" },
  { key: "style", label: "\u98CE\u683C", visibility: "\u516C\u5F00", control: "textarea" },
  { key: "values", label: "\u4EF7\u503C\u89C2", visibility: "\u516C\u5F00", control: "textarea" },
  { key: "workingStyle", label: "\u505A\u4E8B\u65B9\u5F0F", visibility: "\u79C1\u5BC6", control: "textarea" },
  { key: "escalation", label: "\u8FB9\u754C\u4E0E\u8F6C\u4EBA\u5DE5", visibility: "\u516C\u5F00", control: "textarea" },
  { key: "avoid", label: "\u7981\u5FCC", visibility: "\u516C\u5F00", control: "textarea" }
];
var BUILT_IN_KEYS = new Set(BUILT_IN_FIELDS2.map((f) => f.key));
var TONE_OPTIONS = [
  { value: "\u4E13\u4E1A", label: "\u4E13\u4E1A" },
  { value: "\u4EB2\u5207", label: "\u4EB2\u5207" },
  { value: "\u7B80\u6D01", label: "\u7B80\u6D01" },
  { value: "\u5E7D\u9ED8", label: "\u5E7D\u9ED8" }
];

// src/client/cards.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var EMPTY2 = {
  identity: { fields: BUILT_IN_FIELDS2.map((d) => ({ key: d.key, value: "", visibility: d.visibility, builtIn: true })) },
  policy: { rules: [] },
  exemplars: { items: [] },
  state: { items: [] }
};
var inputBase = {
  width: "100%",
  boxSizing: "border-box",
  padding: "6px 10px",
  border: "1px solid var(--dsw-alias-border-l2)",
  borderRadius: 8,
  fontSize: 13,
  background: "var(--dsw-alias-bg-layer-1)",
  color: "var(--dsw-alias-label-primary)"
};
var s6 = {
  wrap: { padding: "14px 20px 48px", maxWidth: 880 },
  titleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 2 },
  h: { fontSize: 18, fontWeight: 700, margin: 0, color: "var(--dsw-alias-label-primary)" },
  badge: { fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 999 },
  badgeOk: { background: "var(--dsw-alias-state-success-tertiary)", color: "var(--dsw-alias-state-success-primary)" },
  badgeWarn: { background: "var(--dsw-alias-state-warn-tertiary)", color: "var(--dsw-alias-state-warn-label)" },
  sub: { fontSize: 12.5, color: "var(--dsw-alias-label-tertiary)", margin: "0 0 10px", lineHeight: 1.6 },
  actionRow: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "10px 14px", marginBottom: 12, background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12 },
  switchLabel: { display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--dsw-alias-label-secondary)", cursor: "pointer" },
  btn: { padding: "7px 18px", border: "none", borderRadius: 8, background: "var(--dsw-alias-state-business-primary)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btn2: { padding: "6px 14px", border: "1px solid var(--dsw-alias-border-l2)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-secondary)", fontSize: 12.5, cursor: "pointer" },
  card: { background: "var(--dsw-alias-bg-layer-2)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 },
  cardHead: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 13.5, fontWeight: 700, color: "var(--dsw-alias-label-primary)", margin: 0 },
  cardSub: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", marginLeft: "auto" },
  grid: { display: "grid", gridTemplateColumns: "92px 1fr 84px", gap: "10px 10px", alignItems: "center" },
  fieldLabel: { fontSize: 12.5, color: "var(--dsw-alias-label-secondary)", textAlign: "right", whiteSpace: "nowrap" },
  input: inputBase,
  textarea: { ...inputBase, minHeight: 54, resize: "vertical" },
  select: { ...inputBase, width: "auto", padding: "5px 8px", fontSize: 12.5 },
  item: { border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 10, padding: 10, marginBottom: 8, background: "var(--dsw-alias-bg-layer-1)" },
  itemRow: { display: "flex", gap: 8, marginBottom: 6, alignItems: "center" },
  itemField: { flex: 1, ...inputBase },
  empty: { fontSize: 12.5, color: "var(--dsw-alias-label-tertiary)", padding: "12px 14px", border: "1px dashed var(--dsw-alias-border-l2)", borderRadius: 10, marginBottom: 8, lineHeight: 1.6 },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", lineHeight: 1.6, marginTop: 10 },
  del: { padding: "4px 10px", border: "none", borderRadius: 6, background: "transparent", color: "var(--dsw-alias-state-error-primary)", fontSize: 12, cursor: "pointer", flexShrink: 0 },
  msg: { fontSize: 12.5, padding: "8px 12px", borderRadius: 8, marginTop: 0 },
  pre: { background: "var(--dsw-alias-bg-layer-1)", border: "1px solid var(--dsw-alias-border-l1)", borderRadius: 8, padding: 10, fontSize: 12, whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto", color: "var(--dsw-alias-label-secondary)" },
  subHead: { fontSize: 12.5, fontWeight: 600, color: "var(--dsw-alias-label-secondary)", margin: "14px 0 8px" },
  details: { marginTop: 4 },
  detailsSummary: { fontSize: 12.5, color: "var(--dsw-alias-label-tertiary)", cursor: "pointer" },
  rev: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", lineHeight: 1.9, marginTop: 6 },
  previewGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }
};
function CardsPage() {
  const [cards, setCards] = (0, import_react6.useState)(EMPTY2);
  const [meta, setMeta] = (0, import_react6.useState)({ revisionNo: 0, status: "\u5019\u9009", hasEffective: false });
  const [history, setHistory] = (0, import_react6.useState)([]);
  const [confirm, setConfirm] = (0, import_react6.useState)(false);
  const [regressionPassed, setRegressionPassed] = (0, import_react6.useState)(false);
  const [msg, setMsg] = (0, import_react6.useState)(null);
  const [preview, setPreview] = (0, import_react6.useState)(null);
  const load = (0, import_react6.useCallback)(async () => {
    try {
      const r = await fetch("/dsh-twin/cards");
      const d = await r.json();
      if (d.ok) {
        setCards({ ...EMPTY2, ...d.file.current });
        setMeta({ revisionNo: d.file.revisionNo, status: d.file.status, hasEffective: d.hasEffective });
        setHistory(d.history ?? []);
      }
    } catch {
    }
    try {
      const r = await fetch("/dsh-twin/cards/preview");
      const d = await r.json();
      setPreview({ master: d.master, guest: d.guest });
    } catch {
    }
  }, []);
  (0, import_react6.useEffect)(() => {
    void load();
  }, [load]);
  const save = async (migrate) => {
    setMsg(null);
    try {
      const r = await fetch("/dsh-twin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards, confirm, regressionPassed, migrate })
      });
      const d = await r.json();
      if (d.ok) {
        setMsg({ text: (d.reason ?? "\u5DF2\u4FDD\u5B58") + (d.mapping !== void 0 && d.mapping.length > 0 ? "\uFF1B\u8FC1\u79FB\u6620\u5C04\uFF1A" + d.mapping.join("\uFF1B") : ""), ok: d.effective === true });
        await load();
      } else {
        setMsg({ text: d.error ?? "\u4FDD\u5B58\u5931\u8D25", ok: false });
      }
    } catch (e) {
      setMsg({ text: String(e), ok: false });
    }
  };
  const upd = (fn) => {
    const draft = JSON.parse(JSON.stringify(cards));
    fn(draft);
    setCards(draft);
  };
  const visSelect = (value, onChange, key) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("select", { style: s6.select, value, onChange: (e) => onChange(e.target.value), title: "\u516C\u5F00\uFF1A\u8BBF\u5BA2\u5BF9\u8BDD\u4E5F\u6CE8\u5165\uFF1B\u79C1\u5BC6\uFF1A\u4EC5\u4E3B\u4EBA\u81EA\u5DF1\u7684\u4F1A\u8BDD\u5305\u542B", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u516C\u5F00", children: "\u516C\u5F00" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u79C1\u5BC6", children: "\u79C1\u5BC6" })
  ] }, key);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.titleRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h1", { style: s6.h, children: "\u4EBA\u683C\u5361" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: { ...s6.badge, ...meta.hasEffective ? s6.badgeOk : s6.badgeWarn }, children: [
        meta.hasEffective ? "\u2713 \u751F\u6548" : "\u5019\u9009\u672A\u751F\u6548",
        " \xB7 \u4FEE\u8BA2 ",
        meta.revisionNo
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { style: s6.sub, children: "\u5206\u8EAB\u7684\u4EBA\u683C\u7531\u56DB\u5F20\u5361\u7EC4\u6210\uFF1A\u8EAB\u4EFD\u5361\uFF08\u662F\u8C01\uFF09\u3001\u7B56\u7565\u5361\uFF08\u9047\u4E8B\u600E\u4E48\u505A\uFF09\u3001\u6837\u4F8B\u5361\uFF08\u8FD9\u4E48\u8BF4\u3001\u4E0D\u8FD9\u4E48\u8BF4\uFF09\u3001\u72B6\u6001\u5361\uFF08\u8FD1\u671F\u4E0A\u4E0B\u6587\uFF0C\u81EA\u52A8\u8870\u51CF\uFF09\u3002 \u4FDD\u5B58\u9700\u540C\u65F6\u52FE\u9009\u300C\u4E3B\u4EBA\u786E\u8BA4\u300D\u4E0E\u300C\u56DE\u5F52\u901A\u8FC7\u300D\u624D\u4F1A\u751F\u6548\uFF0C\u5426\u5219\u4FDD\u5B58\u4E3A\u5019\u9009\u4FEE\u8BA2\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.actionRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { style: s6.switchLabel, title: "\u4E3B\u4EBA\u7684\u4FDD\u5B58\u52A8\u4F5C\u5373\u7B7E\u540D", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: confirm, onChange: (e) => setConfirm(e.target.checked) }),
        " \u4E3B\u4EBA\u786E\u8BA4"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { style: s6.switchLabel, title: "\u7531 dsh-regression \u7684\u56DE\u5F52\u62A5\u544A\u56DE\u586B", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: regressionPassed, onChange: (e) => setRegressionPassed(e.target.checked) }),
        " \u56DE\u5F52\u901A\u8FC7"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn, onClick: () => void save(false), children: "\u4FDD\u5B58\u4EBA\u683C\u5361" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => void save(true), children: "\u4ECE\u65E7\u914D\u7F6E\u8FC1\u79FB" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => void load(), children: "\u5237\u65B0" })
    ] }),
    msg !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...s6.msg, marginBottom: 12, background: msg.ok ? "var(--dsw-alias-state-success-tertiary)" : "var(--dsw-alias-state-warn-tertiary)", color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-label)" }, children: msg.text }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.cardHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: s6.cardTitle, children: "\u2460 \u8EAB\u4EFD\u5361" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: s6.cardSub, children: "\u{1F512} \u79C1\u5BC6\u5B57\u6BB5\u4E0D\u4F1A\u51FA\u73B0\u5728\u8BBF\u5BA2\u5BF9\u8BDD\u91CC" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.grid, children: BUILT_IN_FIELDS2.map((def) => {
        const f = cards.identity.fields.find((x) => x.key === def.key);
        const set = (patch) => upd((d) => {
          const t = d.identity.fields.findIndex((x) => x.key === def.key);
          if (t >= 0) d.identity.fields[t] = { ...d.identity.fields[t], ...patch, key: def.key, builtIn: true };
          else d.identity.fields.push({ key: def.key, value: "", visibility: def.visibility, builtIn: true, ...patch });
        });
        const ph = def.key === "name" ? "\u4F8B\u5982\uFF1A\u5C0F D" : def.key === "role" ? "\u4F8B\u5982\uFF1A\u79C1\u4EBA\u52A9\u7406 / \u7814\u53D1\u52A9\u624B / \u4E13\u5BB6\u987E\u95EE" : def.key === "background" ? "\u4F60\u662F\u8C01\u3001\u61C2\u4EC0\u4E48\u3001\u670D\u52A1\u8C01\u2026" : def.key === "tone" ? void 0 : `\u4F8B\u5982\uFF1A${def.label}\u2026`;
        return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "contents" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { style: s6.fieldLabel, children: [
            def.label,
            def.visibility === "\u79C1\u5BC6" ? " \u{1F512}" : ""
          ] }),
          def.control === "tone" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("select", { style: s6.select, value: f?.value ?? "", onChange: (e) => set({ value: e.target.value }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "", children: "\uFF08\u672A\u8BBE\u7F6E\uFF09" }),
            TONE_OPTIONS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: t.value, children: t.label }, t.value))
          ] }) : def.control === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "textarea",
            {
              style: { ...s6.textarea, minHeight: 48 },
              value: f?.value ?? "",
              placeholder: ph,
              onChange: (e) => set({ value: e.target.value })
            }
          ) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { style: s6.input, value: f?.value ?? "", placeholder: ph, onChange: (e) => set({ value: e.target.value }) }),
          visSelect(f?.visibility ?? def.visibility, (v) => set({ visibility: v }), def.key)
        ] }, def.key);
      }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.hint, children: "\u4E5D\u9879\u4E3A\u56FA\u5B9A\u5B57\u6BB5\uFF08\u4E0D\u53EF\u5220\u9664\uFF09\u3002\u300C\u505A\u4E8B\u65B9\u5F0F / \u8FB9\u754C\u4E0E\u8F6C\u4EBA\u5DE5\u300D\u60F3\u53D8\u6210\u53EF\u6D4B\u8BD5\u7684\u89C4\u5219\u65F6\uFF0C\u5728\u7B56\u7565\u5361\u9010\u6761\u5F55\u5165\uFF0C\u7136\u540E\u6E05\u7A7A\u8FD9\u91CC\u5BF9\u5E94\u6587\u672C\u5373\u53EF\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.subHead, children: "\u81EA\u5B9A\u4E49\u5B57\u6BB5\uFF08\u53EF\u9009\u7684\u957F\u5C3E\u4FE1\u606F\uFF0C\u5982\uFF1A\u6BD5\u4E1A\u9662\u6821\u3001\u65B9\u8A00\uFF09" }),
      cards.identity.fields.map((f, i) => BUILT_IN_FIELDS2.some((d) => d.key === f.key) ? null : /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.itemRow, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: { ...s6.itemField, maxWidth: 160 },
            value: f.key,
            placeholder: "\u5B57\u6BB5\u540D",
            onChange: (e) => upd((d) => {
              d.identity.fields[i].key = e.target.value;
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: f.value,
            placeholder: "\u5185\u5BB9",
            onChange: (e) => upd((d) => {
              d.identity.fields[i].value = e.target.value;
            })
          }
        ),
        visSelect(f.visibility, (v) => upd((d) => {
          d.identity.fields[i].visibility = v;
        }), `c-${i}`),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.del, onClick: () => upd((d) => {
          d.identity.fields.splice(i, 1);
        }), children: "\u5220\u9664" })
      ] }, `c-${i}`)),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => upd((d) => {
        d.identity.fields.push({ key: "", value: "", visibility: "\u516C\u5F00" });
      }), children: "+ \u6DFB\u52A0\u81EA\u5B9A\u4E49\u5B57\u6BB5" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.cardHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: s6.cardTitle, children: "\u2461 \u7B56\u7565\u5361" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: s6.cardSub, children: "\u4EC0\u4E48\u60C5\u51B5 \u2192 \u505A\u4EC0\u4E48 \u2192 \u5FC5\u8981\u65F6\u5347\u7EA7\u7ED9\u4E3B\u4EBA\uFF1B\u6BCF\u6761\u53EF\u72EC\u7ACB\u542F\u505C" })
      ] }),
      cards.policy.rules.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.empty, children: "\u8FD8\u6CA1\u6709\u89C4\u5219\u3002\u89C4\u5219\u8BA9\u5206\u8EAB\u5728\u7279\u5B9A\u573A\u666F\u6709\u786E\u5B9A\u52A8\u4F5C\u2014\u2014\u4F8B\u5982\uFF1A\u5F53\u300C\u5BA2\u4EBA\u95EE\u80FD\u4E0D\u80FD\u964D\u4EF7\u300D\u2192\u300C\u53EA\u767B\u8BB0\u8BC9\u6C42\uFF0C\u4E0D\u627F\u8BFA\u300D\u2192 \u5347\u7EA7\u300C\u8F6C\u4E3B\u4EBA\u300D\u3002" }),
      cards.policy.rules.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: r.when,
            placeholder: "\u5F53\u2026\uFF08\u89E6\u53D1\u6761\u4EF6\uFF0C\u5982\uFF1A\u5BA2\u4EBA\u95EE\u80FD\u4E0D\u80FD\u964D\u4EF7\uFF09",
            onChange: (e) => upd((d) => {
              d.policy.rules[i].when = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: r.act,
            placeholder: "\u5C31\u2026\uFF08\u52A8\u4F5C\uFF0C\u5982\uFF1A\u53EA\u767B\u8BB0\u8BC9\u6C42\uFF0C\u4E0D\u627F\u8BFA\uFF09",
            onChange: (e) => upd((d) => {
              d.policy.rules[i].act = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: r.escalate ?? "",
            placeholder: "\u5FC5\u8981\u65F6\u5347\u7EA7\u7ED9\u4E3B\u4EBA\uFF08\u53EF\u9009\uFF0C\u5982\uFF1A\u5BF9\u65B9\u575A\u6301 \u2192 \u8F6C\u4E3B\u4EBA\uFF09",
            onChange: (e) => upd((d) => {
              d.policy.rules[i].escalate = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...s6.itemRow, marginBottom: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("label", { style: s6.switchLabel, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "checkbox", checked: r.enabled, onChange: (e) => upd((d) => {
              d.policy.rules[i].enabled = e.target.checked;
            }) }),
            " \u542F\u7528"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { ...s6.del, marginLeft: "auto" }, onClick: () => upd((d) => {
            d.policy.rules.splice(i, 1);
          }), children: "\u5220\u9664" })
        ] })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => upd((d) => {
        d.policy.rules.push({ id: `rule-${Date.now()}`, when: "", act: "", enabled: true });
      }), children: "+ \u6DFB\u52A0\u89C4\u5219" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.cardHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: s6.cardTitle, children: "\u2462 \u6837\u4F8B\u5361" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: s6.cardSub, children: "\u7528\u5BF9\u7167\u793A\u4F8B\u6821\u51C6\u5206\u8EAB\u7684\u8BF4\u6CD5" })
      ] }),
      cards.exemplars.items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.empty, children: "\u8FD8\u6CA1\u6709\u6837\u4F8B\u3002\u6837\u4F8B\u662F\u300C\u8FD9\u4E2A\u573A\u666F\u8BE5\u8FD9\u4E48\u8BF4\u3001\u4E0D\u8BE5\u90A3\u4E48\u8BF4\u300D\u7684\u5BF9\u7167\u2014\u2014\u5BF9\u8BDD\u4E2D\u7684\u7EA0\u6B63\u79EF\u7D2F 3 \u6B21\u4F1A\u81EA\u52A8\u8FDB\u6765\uFF0C\u4E5F\u53EF\u4EE5\u624B\u52A8\u6DFB\u52A0\u3002" }),
      cards.exemplars.items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: x.situation,
            placeholder: "\u573A\u666F\uFF08\u5982\uFF1A\u5BA2\u6237\u50AC\u4EA4\u4ED8\u65F6\u95F4\uFF09",
            onChange: (e) => upd((d) => {
              d.exemplars.items[i].situation = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: { ...s6.itemField, color: "var(--dsw-alias-state-success-primary)" },
            value: x.say,
            placeholder: "\u2713 \u8BE5\u8FD9\u4E48\u8BF4",
            onChange: (e) => upd((d) => {
              d.exemplars.items[i].say = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.itemRow, children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: { ...s6.itemField, color: "var(--dsw-alias-state-error-primary)" },
            value: x.avoidSay,
            placeholder: "\u2715 \u4E0D\u8FD9\u4E48\u8BF4",
            onChange: (e) => upd((d) => {
              d.exemplars.items[i].avoidSay = e.target.value;
            })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { ...s6.itemRow, marginBottom: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("select", { style: s6.select, value: x.source, onChange: (e) => upd((d) => {
            d.exemplars.items[i].source = e.target.value;
          }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u8BED\u6599", children: "\u6765\u81EA\u8BED\u6599" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u7EA0\u6B63", children: "\u6765\u81EA\u7EA0\u6B63" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: { ...s6.del, marginLeft: "auto" }, onClick: () => upd((d) => {
            d.exemplars.items.splice(i, 1);
          }), children: "\u5220\u9664" })
        ] })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => upd((d) => {
        d.exemplars.items.push({ id: `ex-${Date.now()}`, situation: "", say: "", avoidSay: "", source: "\u7EA0\u6B63" });
      }), children: "+ \u6DFB\u52A0\u6837\u4F8B" })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.cardHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: s6.cardTitle, children: "\u2463 \u72B6\u6001\u5361" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: s6.cardSub, children: "\u8FD1\u671F\u4E0A\u4E0B\u6587\uFF0C\u5230\u671F\u81EA\u52A8\u4E0D\u518D\u6CE8\u5165" })
      ] }),
      cards.state.items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.empty, children: "\u6682\u65E0\u6761\u76EE\u3002\u65E5\u5E38\u5BF9\u8BDD\u4E2D\u7684\u4E34\u65F6\u72B6\u6001\u4F1A\u81EA\u52A8\u6C47\u5165\u5E76\u8870\u51CF\uFF0C\u4E00\u822C\u65E0\u9700\u624B\u52A8\u7EF4\u62A4\u3002" }),
      cards.state.items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.itemRow, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("select", { style: s6.select, value: x.statementType, onChange: (e) => upd((d) => {
          d.state.items[i].statementType = e.target.value;
        }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u5019\u9009", children: "\u5019\u9009" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("option", { value: "\u4E8B\u5B9E", children: "\u4E8B\u5B9E" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: s6.itemField,
            value: x.content,
            placeholder: "\u5185\u5BB9",
            onChange: (e) => upd((d) => {
              d.state.items[i].content = e.target.value;
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "input",
          {
            style: { ...s6.select, maxWidth: 150 },
            type: "date",
            title: "\u8870\u51CF\u65F6\u95F4\uFF08\u5230\u671F\u540E\u4E0D\u518D\u6CE8\u5165\uFF09",
            value: (x.decayAt ?? "").slice(0, 10),
            onChange: (e) => upd((d) => {
              d.state.items[i].decayAt = e.target.value === "" ? void 0 : e.target.value + "T00:00:00Z";
            })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.del, onClick: () => upd((d) => {
          d.state.items.splice(i, 1);
        }), children: "\u5220\u9664" })
      ] }, i)),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { style: s6.btn2, onClick: () => upd((d) => {
        d.state.items.push({ id: `st-${Date.now()}`, content: "", statementType: "\u5019\u9009" });
      }), children: "+ \u6DFB\u52A0\u72B6\u6001\u6761\u76EE" })
    ] }),
    preview !== null && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.cardHead, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { style: s6.cardTitle, children: "\u6295\u5F71\u9884\u89C8" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: s6.cardSub, children: "\u5206\u8EAB\u7CFB\u7EDF\u63D0\u793A\u8BCD\u91CC\u5B9E\u9645\u6CE8\u5165\u7684\u5185\u5BB9\uFF08\u5DE6\uFF1A\u4E3B\u4EBA\u89C6\u89D2\uFF1B\u53F3\uFF1A\u8BBF\u5BA2\u89C6\u89D2\uFF09" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.previewGrid, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...s6.hint, marginTop: 0, marginBottom: 4 }, children: "\u4E3B\u4EBA\u89C6\u56FE" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.pre, children: preview.master === "" ? "\uFF08\u7A7A\uFF09" : preview.master })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: { ...s6.hint, marginTop: 0, marginBottom: 4 }, children: "\u8BBF\u5BA2\u89C6\u56FE" }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.pre, children: preview.guest === "" ? "\uFF08\u7A7A\uFF09" : preview.guest })
        ] })
      ] })
    ] }),
    history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("details", { style: s6.details, children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("summary", { style: s6.detailsSummary, children: [
        "\u4FEE\u8BA2\u53F2\uFF08\u6700\u8FD1 ",
        history.length,
        " \u4E2A\uFF0C\u4E0D\u53EF\u53D8\u5FEB\u7167\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.rev, children: history.slice().reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
        "#",
        r.revisionNo,
        " \xB7 ",
        r.ts.slice(0, 19).replace("T", " "),
        " \xB7",
        " ",
        r.confirmed && r.regressionPassed ? "\u5DF2\u751F\u6548" : r.confirmed ? "\u5019\u9009\uFF08\u5F85\u56DE\u5F52\uFF09" : "\u5019\u9009\uFF08\u5F85\u786E\u8BA4\uFF09"
      ] }, r.revisionNo)) })
    ] })
  ] });
}

// src/client/twin-hub.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var SUB_TABS = [
  { id: "todo", label: "\u4ECA\u65E5\u5F85\u529E" },
  { id: "learning", label: "\u5B66\u4E60\u961F\u5217" },
  { id: "profiles", label: "\u5173\u7CFB\u6863\u6848" },
  { id: "shadow", label: "\u5F71\u5B50\u6D4B\u8BD5" },
  { id: "monitor", label: "\u76D1\u63A7" },
  { id: "cards", label: "\u4EBA\u683C\u5361" }
];
var s7 = {
  wrap: { padding: "18px 20px", maxWidth: "860px" },
  tabBar: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid var(--dsw-alias-border-l2)",
    marginBottom: 14
  },
  tabBtn: {
    padding: "8px 18px",
    fontSize: 13,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "var(--dsw-alias-label-secondary)",
    borderBottom: "2px solid transparent",
    transition: "color .15s, border-color .15s"
  },
  tabBtnOn: {
    padding: "8px 18px",
    fontSize: 13,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "var(--dsw-alias-state-business-primary)",
    fontWeight: 600,
    borderBottom: "2px solid var(--dsw-alias-state-business-primary)",
    transition: "color .15s, border-color .15s"
  }
};
function applyTwinHub(ctx) {
  ctx.slots.inject(
    "conversation.view",
    () => ctx.slots.register(
      // order 19：紧跟宿主对话/轨迹，排在记忆(20)/御驿(20)之前——
      // 运营中心是主人高频入口，不应沉底
      { name: "conversation.view", id: "twin-hub", order: 19, label: () => "\u6570\u5B57\u5206\u8EAB" },
      TwinHubPage
    )
  );
}
function TwinHubPage() {
  const [tab, setTab] = (0, import_react7.useState)("todo");
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.tabBar, children: SUB_TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
      "button",
      {
        style: tab === t.id ? s7.tabBtnOn : s7.tabBtn,
        onClick: () => setTab(t.id),
        children: t.label
      },
      t.id
    )) }),
    tab === "todo" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(DashboardPage, {}),
    tab === "learning" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(LearningPage, {}),
    tab === "profiles" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ProfilesPage, {}),
    tab === "shadow" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(ShadowPage, {}),
    tab === "monitor" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(MonitorPage, {}),
    tab === "cards" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(CardsPage, {})
  ] });
}

// src/client/index.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "twin",
        order: 25,
        label: () => "\u5206\u8EAB\u8BBE\u7F6E"
      },
      TwinSettingsPage
    )
  );
  applyTwinHub(ctx);
}
var PRESETS = [
  { id: "custom", label: "\u81EA\u5B9A\u4E49", desc: "\u751F\u6210\u7A7A\u767D\u4EBA\u683C\u5361\uFF0C\u5230\u4EBA\u683C\u5361\u9010\u9879\u586B\u5199\u3002", toolHint: "\u81EA\u5B9A\u4E49\u89D2\u8272\uFF1A\u8BF7\u6309\u9700\u5728\u300C\u624B\u673A\u8FDE\u63A5 \u2192 \u8BBF\u5BA2\u6743\u9650\u300D\u5F00\u653E\u5DE5\u5177\u3002", fields: {}, seeds: [] },
  { id: "assistant", label: "\u79C1\u4EBA\u52A9\u7406", desc: "\u66FF\u6211\u5B89\u6392\u65E5\u7A0B\u3001\u6574\u7406\u4FE1\u606F\u3001\u5904\u7406\u7410\u4E8B\u3002", toolHint: "\u79C1\u4EBA\u52A9\u7406\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u5E38\u5F00 `web*`\u3001`todo*`\uFF08\u8054\u7F51\u641C\u7D22/\u4EFB\u52A1\u6E05\u5355\uFF09\u3002", fields: { role: "\u79C1\u4EBA\u52A9\u7406", background: "\u6211\u7684\u65E5\u5E38\u52A9\u7406\uFF0C\u5E2E\u6211\u5B89\u6392\u65E5\u7A0B\u3001\u6574\u7406\u4FE1\u606F\u3001\u5904\u7406\u7410\u4E8B\u3002", tone: "\u4EB2\u5207", style: "\u4E3B\u52A8\u3001\u8D34\u5FC3\uFF0C\u66FF\u6211\u628A\u4E8B\u60C5\u5B89\u6392\u597D\u3002", values: "\u4EE5\u4E3B\u4EBA\u5229\u76CA\u4E3A\u5148\uFF0C\u9760\u8C31\u3001\u4E3B\u52A8\u3002", workingStyle: "\u5148\u542C\u6E05\u9700\u6C42\u518D\u884C\u52A8\uFF1B\u80FD\u4EE3\u529E\u7684\u4EE3\u529E\uFF0C\u4E0D\u786E\u5B9A\u7684\u5148\u786E\u8BA4\u3002", escalation: "\u6D89\u53CA\u91D1\u94B1\u3001\u5BF9\u5916\u627F\u8BFA\u3001\u5BF9\u5916\u53D1\u5E03\u5185\u5BB9\u65F6\u8F6C\u4E3B\u4EBA\u3002", avoid: "\u4E0D\u64C5\u81EA\u5BF9\u5916\u627F\u8BFA\u3001\u4E0D\u66FF\u4E3B\u4EBA\u505A\u4E3B\u51B3\u5B9A\u3002" }, seeds: ["\u4E3B\u4EBA\u7684\u65E5\u7A0B\u4E0E\u504F\u597D\u4EE5\u6700\u8FD1\u5BF9\u8BDD\u4E3A\u51C6\u3002"] },
  { id: "expert", label: "\u4E13\u5BB6\u987E\u95EE", desc: "\u5728\u64C5\u957F\u9886\u57DF\u63D0\u4F9B\u6709\u4F9D\u636E\u7684\u5206\u6790\u4E0E\u5EFA\u8BAE\u3002", toolHint: "\u4E13\u5BB6\u987E\u95EE\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u5E38\u5F00 `web*`\uFF08\u8054\u7F51\u68C0\u7D22\uFF09\u3002", fields: { role: "\u9886\u57DF\u4E13\u5BB6\u987E\u95EE", background: "\u5728\u6211\u64C5\u957F\u7684\u9886\u57DF\u63D0\u4F9B\u4E13\u4E1A\u3001\u6709\u4F9D\u636E\u7684\u5206\u6790\u4E0E\u5EFA\u8BAE\u3002", tone: "\u4E13\u4E1A", style: "\u4E25\u8C28\u3001\u6761\u7406\u6E05\u6670\uFF0C\u5148\u7ED9\u7ED3\u8BBA\u518D\u7ED9\u4F9D\u636E\u3002", values: "\u8BDA\u5B9E\u3001\u6709\u636E\uFF0C\u4E0D\u7F16\u9020\u3002", workingStyle: "\u5148\u7ED9\u7ED3\u8BBA\u518D\u8BB2\u4F9D\u636E\uFF1B\u660E\u786E\u6807\u51FA\u4E0D\u786E\u5B9A\u7684\u5730\u65B9\u3002", escalation: "\u672A\u638C\u63E1\u7684\u4E8B\u5B9E\u8981\u5982\u5B9E\u8BF4\u660E\uFF0C\u5E76\u7ED9\u51FA\u8FDB\u4E00\u6B65\u67E5\u8BC1\u65B9\u5411\u3002", avoid: "\u4E0D\u81C6\u6D4B\u3001\u4E0D\u5938\u5927\u3002" }, seeds: ["\u6211\u7684\u5206\u6790\u57FA\u4E8E\u53EF\u9760\u6765\u6E90\uFF0C\u7ED3\u8BBA\u4F1A\u7ED9\u51FA\u4F9D\u636E\u3002"] },
  { id: "service", label: "\u5BA2\u670D\u5206\u8EAB", desc: "\u89E3\u7B54\u5E38\u89C1\u95EE\u9898\u3001\u6307\u5F15\u6D41\u7A0B\u3001\u8F6C\u8FBE\u8BC9\u6C42\u3002", toolHint: "\u5BA2\u670D\u5206\u8EAB\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u9ED8\u8BA4\u7EAF\u5BF9\u8BDD\u5373\u53EF\uFF0C\u4E00\u822C\u65E0\u9700\u5F00\u653E\u5DE5\u5177\u3002", fields: { role: "\u5BA2\u6237\u670D\u52A1", background: "\u8D1F\u8D23\u89E3\u7B54\u5BA2\u6237\u5E38\u89C1\u95EE\u9898\u3001\u6307\u5F15\u6D41\u7A0B\u3001\u8F6C\u8FBE\u8BC9\u6C42\u3002", tone: "\u4EB2\u5207", style: "\u793C\u8C8C\u3001\u8010\u5FC3\uFF0C\u7528\u7B80\u5355\u76F4\u767D\u7684\u8BED\u8A00\u3002", values: "\u8010\u5FC3\u3001\u793C\u8C8C\uFF0C\u4E0D\u4E0E\u5BA2\u6237\u8D77\u51B2\u7A81\u3002", workingStyle: "\u5148\u5171\u60C5\u3001\u518D\u89E3\u7B54\uFF1B\u81EA\u5DF1\u89E3\u51B3\u4E0D\u4E86\u5C31\u8F6C\u4EBA\u5DE5\u3002", escalation: "\u6295\u8BC9\u3001\u9000\u6362\u8D27\u3001\u8D85\u51FA\u6743\u9650\u7684\u4E8B\u9879\u8F6C\u4EBA\u5DE5\u5904\u7406\u3002", avoid: "\u4E0D\u627F\u8BFA\u505A\u4E0D\u5230\u7684\u4E8B\u3001\u4E0D\u4E0E\u5BA2\u6237\u4E89\u6267\u3002" }, seeds: ["\u5E38\u89C1\u95EE\u9898\u4F18\u5148\u7ED9\u51FA\u7B80\u77ED\u3001\u53EF\u6267\u884C\u7684\u89E3\u51B3\u8DEF\u5F84\u3002"] }
];
var emptyConfig = { template: "custom", knowledge: { seeds: [] } };
async function api3(path, method = "GET", body) {
  const opts = { method, headers: { Accept: "application/json" } };
  if (body) {
    opts.headers = { ...opts.headers, "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (!res.ok && data.ok !== false) return { ok: false, error: `HTTP ${res.status}` };
  return data;
}
function TwinSettingsPage() {
  const [cfg, setCfg] = (0, import_react8.useState)(emptyConfig);
  const [loaded, setLoaded] = (0, import_react8.useState)(false);
  const [saving, setSaving] = (0, import_react8.useState)(false);
  const [status, setStatus] = (0, import_react8.useState)("");
  const [toolHint, setToolHint] = (0, import_react8.useState)("");
  const [stats, setStats] = (0, import_react8.useState)(null);
  const [cardsState, setCardsState] = (0, import_react8.useState)(null);
  const [tab, setTab] = (0, import_react8.useState)("persona");
  const load = (0, import_react8.useCallback)(async () => {
    try {
      const d = await api3("/dsh-twin/config", "GET");
      if (d.ok && d.config) {
        const fresh = !d.config.hasPersona;
        setCfg({ ...emptyConfig, ...d.config, becomeDefaultPreset: d.config.becomeDefaultPreset ?? fresh });
        const t = d.config.template;
        setToolHint(PRESETS.find((p) => p.id === t)?.toolHint ?? "");
      }
    } catch {
    }
    try {
      const s9 = await api3("/dsh-twin/stats", "GET");
      if (s9.ok && s9.stats) setStats(s9.stats);
    } catch {
    }
    try {
      const c = await api3("/dsh-twin/cards", "GET");
      if (c.ok) setCardsState(c);
    } catch {
    }
    setLoaded(true);
  }, []);
  (0, import_react8.useEffect)(() => {
    load();
  }, [load]);
  async function applyPreset(id) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    if (!window.confirm(`\u5957\u7528\u6A21\u677F\u300C${preset.label}\u300D\u4F1A\u751F\u6210\u4E00\u7248\u5019\u9009\u4EBA\u683C\u5361\uFF08\u5DF2\u542B\u4E3B\u4EBA\u786E\u8BA4\uFF0C\u56DE\u5F52\u901A\u8FC7\u540E\u751F\u6548\uFF09\uFF0C\u5E76\u628A\u6A21\u677F\u77E5\u8BC6\u79CD\u5B50\u5408\u5E76\u5230\u4E0B\u65B9\u77E5\u8BC6\u5217\u8868\u3002\u7EE7\u7EED\u5417\uFF1F`)) return;
    const fields = BUILT_IN_FIELDS.map((d2) => ({ key: d2.key, value: (preset.fields[d2.key] ?? "").slice(0, 2e3), visibility: d2.visibility, builtIn: true })).filter((f) => f.value !== "");
    const d = await api3("/dsh-twin/cards", "POST", {
      cards: { identity: { fields }, policy: { rules: [] }, exemplars: { items: [] }, state: { items: [] } },
      confirm: true
    });
    if (d.ok) {
      setCfg((prev) => ({
        ...prev,
        template: id,
        knowledge: { seeds: [.../* @__PURE__ */ new Set([...preset.seeds, ...prev.knowledge?.seeds ?? []])] }
      }));
      setToolHint(preset.toolHint);
      setStatus(`\u5DF2\u751F\u6210\u300C${preset.label}\u300D\u5019\u9009\u4EBA\u683C\u5361\uFF1A\u56DE\u5F52\u901A\u8FC7\u540E\u751F\u6548\u3002\u5230\u4E3B\u5BF9\u8BDD\u7A97\u53E3\u300C\u6570\u5B57\u5206\u8EAB\u300DTab \u2192 \u4EBA\u683C\u5361 \u7EE7\u7EED\u5B8C\u5584\uFF1B\u77E5\u8BC6\u79CD\u5B50\u9700\u70B9\u300C\u4FDD\u5B58\u5E76\u751F\u6548\u300D\u5199\u5165\u8BB0\u5FC6\u5E93\u3002`);
      load();
    } else {
      setStatus("\u6A21\u677F\u751F\u6210\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
    }
  }
  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const d = await api3("/dsh-twin/config", "POST", cfg);
      if (d.ok) {
        setCfg({ ...emptyConfig, ...d.config });
        const mem = d.memory && d.memory.seeded > 0 ? `\uFF08\u5DF2\u5199\u5165 ${d.memory.seeded} \u6761\u5171\u4EAB\u8BB0\u5FC6\uFF09` : "";
        setStatus(`\u5DF2\u4FDD\u5B58${mem}`);
      } else {
        setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
      }
    } catch (e) {
      setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e));
    }
    setSaving(false);
  }
  const [preview, setPreview] = (0, import_react8.useState)(null);
  async function refreshPreview() {
    try {
      const d = await api3("/dsh-twin/preview", "GET");
      if (d.ok) setPreview({ persona: d.persona ?? "", guard: d.guard ?? "" });
    } catch {
    }
  }
  function handlePreviewToggle() {
    if (preview) {
      setPreview(null);
      return;
    }
    void refreshPreview();
  }
  async function handleExport() {
    let exported = null;
    try {
      const d = await api3("/dsh-twin/cards", "GET");
      if (d.ok && d.file) exported = d.file.current;
    } catch {
    }
    const blob = new Blob([JSON.stringify(exported ?? { identity: { fields: [] }, policy: { rules: [] }, exemplars: { items: [] }, state: { items: [] } }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "twin-cards.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("\u5DF2\u5BFC\u51FA twin-cards.json\uFF08\u53EF\u5728\u53E6\u4E00\u53F0\u7535\u8111\u5BFC\u5165\uFF09");
  }
  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!window.confirm("\u5BFC\u5165\u4F1A\u751F\u6210\u4E00\u7248\u5019\u9009\u4EBA\u683C\u5361\uFF08\u8986\u76D6\u73B0\u6709\u7F16\u8F91\uFF0C\u9700\u786E\u8BA4+\u56DE\u5F52\u901A\u8FC7\u540E\u751F\u6548\uFF09\u2014\u2014\u8BF7\u52FF\u5BFC\u5165\u6765\u8DEF\u4E0D\u660E\u7684\u6587\u4EF6\u3002\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F")) return;
        if (data?.identity?.fields) {
          const d = await api3("/dsh-twin/cards", "POST", { cards: data, confirm: true });
          setStatus(d.ok ? "\u5DF2\u5BFC\u5165\u4E3A\u5019\u9009\u4EBA\u683C\u5361\uFF08\u56DE\u5F52\u901A\u8FC7\u540E\u751F\u6548\uFF09" : "\u5BFC\u5165\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
        } else {
          const d = await api3("/dsh-twin/config", "POST", data);
          setStatus(d.ok ? "\u5DF2\u5BFC\u5165\uFF08\u4EBA\u683C\u5DF2\u81EA\u52A8\u6620\u5C04\u5230\u4EBA\u683C\u5361\uFF09" : "\u5BFC\u5165\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
        }
        load();
        e.target.value = "";
      } catch (err) {
        setStatus("\u5BFC\u5165\u5931\u8D25\uFF1A" + String(err));
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }
  function handleImportKnowledge(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const flatten = (x) => x.trim().replace(/\s*\r?\n\s*/g, " ").replace(/\s+/g, " ").trim();
        const paras = text.split(/\r?\n\s*\r?\n/).map(flatten).filter(Boolean);
        const chunks = paras.length > 1 ? paras : text.split(/\r?\n/).map(flatten).filter(Boolean);
        setCfg((prev) => {
          const set = new Set(prev.knowledge?.seeds ?? []);
          for (const c of chunks) if (!set.has(c)) set.add(c);
          return { ...prev, knowledge: { seeds: [...set] } };
        });
        setStatus(`\u5DF2\u4ECE ${file.name} \u5BFC\u5165 ${chunks.length} \u6761\u77E5\u8BC6\u5757\uFF08\u8BF7\u70B9\u201C\u4FDD\u5B58\u5E76\u751F\u6548\u201D\u5199\u5165\u8BB0\u5FC6\u5E93\uFF09`);
      } catch (err) {
        setStatus("\u5BFC\u5165\u5931\u8D25\uFF1A" + String(err));
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }
  const s8 = {
    wrap: { padding: "20px", maxWidth: "720px" },
    h: { fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" },
    sub: { fontSize: "13px", color: "var(--dsw-alias-label-secondary)", margin: "0 0 16px 0" },
    section: { marginBottom: "18px" },
    secTitle: { fontSize: "14px", fontWeight: 700, margin: "0 0 8px 0", color: "var(--dsw-alias-label-primary)" },
    label: { display: "block", fontSize: "12px", color: "var(--dsw-alias-label-secondary)", margin: "8px 0 4px 0" },
    input: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" },
    textarea: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", minHeight: "54px", resize: "vertical" },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" },
    chip: { padding: "5px 12px", border: "1px solid #ddd", borderRadius: "16px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-bg-layer-2)" },
    chipOn: { padding: "5px 12px", border: "1px solid #4a6cf7", borderRadius: "16px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-interactive-bg-active)", color: "var(--dsw-alias-state-business-primary)", fontWeight: 600 },
    templateGrid: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" },
    templateCard: { width: "160px", padding: "12px 12px 10px", border: "1px solid #e5e7eb", borderRadius: "10px", textAlign: "center", cursor: "pointer", background: "var(--dsw-alias-bg-layer-2)", transition: "all 0.15s" },
    templateCardOn: { borderColor: "var(--dsw-alias-state-business-primary)", background: "var(--dsw-alias-interactive-bg-active)", boxShadow: "0 0 0 2px rgba(74,108,247,0.15)" },
    templateName: { fontSize: "13px", fontWeight: 600, color: "var(--dsw-alias-label-primary)", marginBottom: "4px" },
    templateDesc: { fontSize: "11px", color: "var(--dsw-alias-label-tertiary)", lineHeight: 1.4, minHeight: "28px" },
    templateCheck: { fontSize: "12px", color: "var(--dsw-alias-state-business-primary)", fontWeight: 600, marginTop: "6px" },
    btn: { padding: "8px 18px", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-state-business-primary)", color: "#fff" },
    ghost: { padding: "8px 18px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-primary)" },
    row: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "12px" },
    tabBar: { display: "flex", gap: "4px", borderBottom: "1px solid #e5e7eb", marginBottom: "14px" },
    tab: { padding: "8px 14px", fontSize: "13px", border: "none", background: "transparent", cursor: "pointer", color: "var(--dsw-alias-label-secondary)", borderBottom: "2px solid transparent" },
    tabOn: { padding: "8px 14px", fontSize: "13px", border: "none", background: "transparent", cursor: "pointer", color: "var(--dsw-alias-state-business-primary)", fontWeight: 600, borderBottom: "2px solid #4a6cf7" },
    hint: { fontSize: "12px", color: "var(--dsw-alias-label-tertiary)", background: "var(--dsw-alias-bg-layer-1)", border: "1px solid #eee", borderRadius: "6px", padding: "8px 10px", marginTop: "4px" },
    status: { fontSize: "13px", marginTop: "10px", color: "var(--dsw-alias-state-business-primary)" }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h1", { style: s8.h, children: "\u6570\u5B57\u5206\u8EAB\u8BBE\u7F6E" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { style: s8.sub, children: "\u5206\u8EAB\u7684\u521D\u59CB\u5316\u4E0E\u6570\u636E\u7BA1\u7406\uFF1A\u6A21\u677F\u4E00\u952E\u751F\u6210\u521D\u7248\u4EBA\u683C\u5361\u3001\u77E5\u8BC6\u79CD\u5B50\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\u3001\u4EBA\u683C\u5361\u5BFC\u5165\u5BFC\u51FA\u3002\u4EBA\u683C\u7F16\u8F91\u4E0E\u8FD0\u884C\u76D1\u63A7\u5728\u4E3B\u5BF9\u8BDD\u7A97\u53E3\u300C\u6570\u5B57\u5206\u8EAB\u300DTab\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.tabBar, children: [["persona", "\u4EBA\u683C"], ["knowledge", "\u77E5\u8BC6"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { style: tab === id ? s8.tabOn : s8.tab, onClick: () => setTab(id), children: label }, id)) }),
    tab === "persona" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.secTitle, children: "\u6A21\u677F\u9884\u8BBE\uFF08\u4E00\u952E\u751F\u6210\u521D\u7248\u4EBA\u683C\u5361\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.templateGrid, children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: cfg.template === p.id ? { ...s8.templateCard, ...s8.templateCardOn } : s8.templateCard, onClick: () => applyPreset(p.id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.templateName, children: p.label }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.templateDesc, children: p.desc }),
        cfg.template === p.id && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.templateCheck, children: "\u2713 \u5DF2\u9009" })
      ] }, p.id)) }),
      toolHint && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.hint, children: [
        "\u{1F6E1}\uFE0F ",
        toolHint
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.secTitle, children: "\u5F53\u524D\u4EBA\u683C\uFF08\u53EA\u8BFB\u6458\u8981\uFF09" }),
      cardsState ? /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.hint, children: [
        "\u4EBA\u683C\u5361\u4FEE\u8BA2 ",
        cardsState.file.revisionNo,
        " \xB7 ",
        cardsState.file.status,
        cardsState.hasEffective ? "\uFF08\u751F\u6548\u4E2D\uFF09" : "\uFF08\u5019\u9009\u2014\u2014\u56DE\u5F52\u901A\u8FC7\u540E\u751F\u6548\uFF09",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("br", {}),
        cardsState.file.current.identity.fields.filter((f) => f.value !== "").length > 0 ? cardsState.file.current.identity.fields.filter((f) => f.value !== "").map((f) => `${f.key}=${f.value.length > 14 ? f.value.slice(0, 14) + "\u2026" : f.value}`).join(" \xB7 ") : "\uFF08\u8EAB\u4EFD\u5B57\u6BB5\u5168\u7A7A\u2014\u2014\u53EF\u5148\u7528\u4E0A\u65B9\u6A21\u677F\u751F\u6210\uFF0C\u6216\u5230\u4EBA\u683C\u5361\u586B\u5199\uFF09",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("br", {}),
        "\u7F16\u8F91\u4EBA\u683C\u8BF7\u5230 ",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { children: "\u4E3B\u5BF9\u8BDD\u7A97\u53E3\u300C\u6570\u5B57\u5206\u8EAB\u300DTab \u2192 \u4EBA\u683C\u5361" }),
        "\uFF08\u6B64\u5904\u4E0D\u518D\u63D0\u4F9B\u7B2C\u4E8C\u4E2A\u4EBA\u683C\u7F16\u8F91\u5668\uFF0C\u907F\u514D\u53CC\u6E90\u51B2\u7A81\uFF09\u3002"
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.hint, children: "\u4EBA\u683C\u5361\u5C1A\u672A\u52A0\u8F7D\uFF08\u670D\u52A1\u7AEF\u4E0D\u53EF\u7528\uFF1F\uFF09\u3002" })
    ] }),
    tab === "knowledge" && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.secTitle, children: "\u77E5\u8BC6\uFF08\u5171\u4EAB\u8BB0\u5FC6\u79CD\u5B50\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { style: s8.label, children: "\u8BB0\u5FC6\uFF08\u6BCF\u884C\u4E00\u6761\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "textarea",
        {
          style: { ...s8.textarea, minHeight: "80px" },
          value: (cfg.knowledge?.seeds ?? []).join("\n"),
          onChange: (e) => setCfg((prev) => ({ ...prev, knowledge: { seeds: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })),
          placeholder: "\u4F8B\u5982\uFF1A\n\u6211\u662F\u67D0\u516C\u53F8\u7814\u53D1\u8D1F\u8D23\u4EBA\n\u6211\u4EEC\u9879\u76EE\u7528 TypeScript\n\u6BCF\u5468\u4E94\u4E0B\u5348\u5F00\u5468\u4F1A"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { style: { ...s8.ghost, display: "inline-block", marginTop: "8px" }, children: [
        "\u5BFC\u5165\u77E5\u8BC6\u6587\u4EF6(.txt/.md)",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "file", accept: ".txt,.md,.markdown,text/plain", style: { display: "none" }, onChange: handleImportKnowledge })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { ...s8.hint, marginTop: 10 }, children: "\u6B64\u5904\u7F16\u8F91\u7684\u662F\u300C\u79CD\u5B50\u300D\uFF1B\u4FDD\u5B58\u540E\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\u5E93\u3002\u8981\u67E5\u770B / \u7F16\u8F91 / \u5220\u9664\u5DF2\u5165\u5E93\u7684 \u5355\u6761\u8BB0\u5FC6\uFF08\u542B\u5206\u8EAB\u5BF9\u8BDD\u4E2D\u6C89\u6DC0\u7684\u8BB0\u5FC6\uFF09\uFF0C\u8BF7\u5230\u5DE6\u4FA7\u300C\u8BB0\u5FC6\u300D\u6807\u7B7E\u9875\uFF08dsh-memory \u63D0\u4F9B\uFF09\u3002" })
    ] }),
    stats && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.hint, children: [
      "\u72B6\u6001\uFF1A\u8BB0\u5FC6 ",
      stats.memoryTotal,
      " \u6761",
      stats.memoryTotal > 0 ? `\uFF08${Object.entries(stats.memoryTypes).map(([k, v]) => `${k}\xD7${v}`).join("\uFF0C")}\uFF09` : "",
      " \xB7 \u4EBA\u683C",
      stats.hasPersona ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { style: { ...s8.hint, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "input",
        {
          type: "checkbox",
          checked: cfg.becomeDefaultPreset === true,
          onChange: (e) => setCfg((prev) => ({ ...prev, becomeDefaultPreset: e.target.checked }))
        }
      ),
      "\u628A\u300C\u6570\u5B57\u5206\u8EAB\u300D\u8BBE\u4E3A\u9ED8\u8BA4 agent \u9884\u8BBE"
    ] }),
    cfg.becomeDefaultPreset === true && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: { ...s8.hint, color: "var(--dsw-alias-state-success-primary)" }, children: "\u2713 \u6570\u5B57\u5206\u8EAB\u9884\u8BBE\u5DF2\u5305\u542B\u5168\u90E8\u5DE5\u5177\uFF08shell / \u6587\u4EF6\u7CFB\u7EDF / \u7535\u8111\u64CD\u4F5C / \u8054\u7F51\u7B49\uFF09\u3002\u52FE\u9009\u540E\u6240\u6709\u65B0\u4F1A\u8BDD\u90FD\u4EE5\u4F60\u7684\u5206\u8EAB\u8EAB\u4EFD\u5DE5\u4F5C\uFF1A\u4EBA\u683C\u3001\u8BB0\u5FC6\u3001\u5DE5\u5177\u5B8C\u5168\u4E00\u81F4\u3002\u8BBF\u5BA2\u4F1A\u8BDD\u4ECD\u6309\u8BBF\u5BA2\u6743\u9650\u767D\u540D\u5355\u53D7\u9650\uFF0C\u4E0D\u53D7\u5F71\u54CD\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { style: s8.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { style: s8.btn, disabled: !loaded || saving, onClick: handleSave, children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5E76\u751F\u6548" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { style: s8.ghost, onClick: handlePreviewToggle, children: preview ? "\u6536\u8D77\u9884\u89C8" : "\u9884\u89C8\u6CE8\u5165\u7684\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { style: s8.ghost, onClick: handleExport, children: "\u5BFC\u51FA\u4EBA\u683C\u5361" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { style: s8.ghost, children: [
        "\u5BFC\u5165\u4EBA\u683C",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("input", { type: "file", accept: "application/json", style: { display: "none" }, onChange: handleImport })
      ] })
    ] }),
    preview && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("pre", { style: { ...s8.hint, whiteSpace: "pre-wrap", background: "rgba(127,127,127,0.12)", padding: 10, borderRadius: 8, maxHeight: 260, overflow: "auto" }, children: [
      preview.persona || "\uFF08\u4EBA\u683C\u4E3A\u7A7A\uFF1A\u540D\u5B57/\u98CE\u683C\u7B49\u5B57\u6BB5\u5168\u7A7A\u65F6\u4E0D\u6CE8\u5165\u4EBA\u683C\u6BB5\uFF09",
      preview.guard ? `

${preview.guard}` : ""
    ] }),
    status && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { style: s8.status, children: status })
  ] });
}
		return module.exports;
	}
});
//# sourceMappingURL=client.js.map
