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
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
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
}
var TONES = [
  { id: "professional", label: "\u4E13\u4E1A" },
  { id: "friendly", label: "\u4EB2\u5207" },
  { id: "concise", label: "\u7B80\u6D01" },
  { id: "humorous", label: "\u5E7D\u9ED8" }
];
var PRESETS = [
  { id: "custom", label: "\u81EA\u5B9A\u4E49", desc: "\u5B8C\u5168\u81EA\u5B9A\u4E49\uFF0C\u6309\u9700\u9010\u9879\u586B\u5199\u3002", toolHint: "\u81EA\u5B9A\u4E49\u89D2\u8272\uFF1A\u8BF7\u6309\u9700\u5728\u300C\u624B\u673A\u8FDE\u63A5 \u2192 \u8BBF\u5BA2\u6743\u9650\u300D\u5F00\u653E\u5DE5\u5177\u3002", config: { identity: { name: "", role: "", background: "" }, persona: { tone: "professional", style: "", values: "", rules: "", escalation: "", avoid: "" }, knowledge: { seeds: [] } } },
  { id: "assistant", label: "\u79C1\u4EBA\u52A9\u7406", desc: "\u66FF\u6211\u5B89\u6392\u65E5\u7A0B\u3001\u6574\u7406\u4FE1\u606F\u3001\u5904\u7406\u7410\u4E8B\u3002", toolHint: "\u79C1\u4EBA\u52A9\u7406\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u5E38\u5F00 `web*`\u3001`todo*`\uFF08\u8054\u7F51\u641C\u7D22/\u4EFB\u52A1\u6E05\u5355\uFF09\u3002", config: { identity: { name: "", role: "\u79C1\u4EBA\u52A9\u7406", background: "\u6211\u7684\u65E5\u5E38\u52A9\u7406\uFF0C\u5E2E\u6211\u5B89\u6392\u65E5\u7A0B\u3001\u6574\u7406\u4FE1\u606F\u3001\u5904\u7406\u7410\u4E8B\u3002" }, persona: { tone: "friendly", style: "\u4E3B\u52A8\u3001\u8D34\u5FC3\uFF0C\u66FF\u6211\u628A\u4E8B\u60C5\u5B89\u6392\u597D\u3002", values: "\u4EE5\u4E3B\u4EBA\u5229\u76CA\u4E3A\u5148\uFF0C\u9760\u8C31\u3001\u4E3B\u52A8\u3002", rules: "\u5148\u542C\u6E05\u9700\u6C42\u518D\u884C\u52A8\uFF1B\u80FD\u4EE3\u529E\u7684\u4EE3\u529E\uFF0C\u4E0D\u786E\u5B9A\u7684\u5148\u786E\u8BA4\u3002", escalation: "\u6D89\u53CA\u91D1\u94B1\u3001\u5BF9\u5916\u627F\u8BFA\u3001\u5BF9\u5916\u53D1\u5E03\u5185\u5BB9\u65F6\u8F6C\u4E3B\u4EBA\u3002", avoid: "\u4E0D\u64C5\u81EA\u5BF9\u5916\u627F\u8BFA\u3001\u4E0D\u66FF\u4E3B\u4EBA\u505A\u4E3B\u51B3\u5B9A\u3002" }, knowledge: { seeds: ["\u4E3B\u4EBA\u7684\u65E5\u7A0B\u4E0E\u504F\u597D\u4EE5\u6700\u8FD1\u5BF9\u8BDD\u4E3A\u51C6\u3002"] } } },
  { id: "expert", label: "\u4E13\u5BB6\u987E\u95EE", desc: "\u5728\u64C5\u957F\u9886\u57DF\u63D0\u4F9B\u6709\u4F9D\u636E\u7684\u5206\u6790\u4E0E\u5EFA\u8BAE\u3002", toolHint: "\u4E13\u5BB6\u987E\u95EE\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u5E38\u5F00 `web*`\uFF08\u8054\u7F51\u68C0\u7D22\uFF09\u3002", config: { identity: { name: "", role: "\u9886\u57DF\u4E13\u5BB6\u987E\u95EE", background: "\u5728\u6211\u64C5\u957F\u7684\u9886\u57DF\u63D0\u4F9B\u4E13\u4E1A\u3001\u6709\u4F9D\u636E\u7684\u5206\u6790\u4E0E\u5EFA\u8BAE\u3002" }, persona: { tone: "professional", style: "\u4E25\u8C28\u3001\u6761\u7406\u6E05\u6670\uFF0C\u5148\u7ED9\u7ED3\u8BBA\u518D\u7ED9\u4F9D\u636E\u3002", values: "\u8BDA\u5B9E\u3001\u6709\u636E\uFF0C\u4E0D\u7F16\u9020\u3002", rules: "\u5148\u7ED9\u7ED3\u8BBA\u518D\u8BB2\u4F9D\u636E\uFF1B\u660E\u786E\u6807\u51FA\u4E0D\u786E\u5B9A\u7684\u5730\u65B9\u3002", escalation: "\u672A\u638C\u63E1\u7684\u4E8B\u5B9E\u8981\u5982\u5B9E\u8BF4\u660E\uFF0C\u5E76\u7ED9\u51FA\u8FDB\u4E00\u6B65\u67E5\u8BC1\u65B9\u5411\u3002", avoid: "\u4E0D\u81C6\u6D4B\u3001\u4E0D\u5938\u5927\u3002" }, knowledge: { seeds: ["\u6211\u7684\u5206\u6790\u57FA\u4E8E\u53EF\u9760\u6765\u6E90\uFF0C\u7ED3\u8BBA\u4F1A\u7ED9\u51FA\u4F9D\u636E\u3002"] } } },
  { id: "service", label: "\u5BA2\u670D\u5206\u8EAB", desc: "\u89E3\u7B54\u5E38\u89C1\u95EE\u9898\u3001\u6307\u5F15\u6D41\u7A0B\u3001\u8F6C\u8FBE\u8BC9\u6C42\u3002", toolHint: "\u5BA2\u670D\u5206\u8EAB\u5EFA\u8BAE\uFF1A\u8BBF\u5BA2\u9ED8\u8BA4\u7EAF\u5BF9\u8BDD\u5373\u53EF\uFF0C\u4E00\u822C\u65E0\u9700\u5F00\u653E\u5DE5\u5177\u3002", config: { identity: { name: "", role: "\u5BA2\u6237\u670D\u52A1", background: "\u8D1F\u8D23\u89E3\u7B54\u5BA2\u6237\u5E38\u89C1\u95EE\u9898\u3001\u6307\u5F15\u6D41\u7A0B\u3001\u8F6C\u8FBE\u8BC9\u6C42\u3002" }, persona: { tone: "friendly", style: "\u793C\u8C8C\u3001\u8010\u5FC3\uFF0C\u7528\u7B80\u5355\u76F4\u767D\u7684\u8BED\u8A00\u3002", values: "\u8010\u5FC3\u3001\u793C\u8C8C\u3001\u4E0D\u4E0E\u5BA2\u6237\u8D77\u51B2\u7A81\u3002", rules: "\u5148\u5171\u60C5\u3001\u518D\u89E3\u7B54\uFF1B\u81EA\u5DF1\u89E3\u51B3\u4E0D\u4E86\u5C31\u8F6C\u4EBA\u5DE5\u3002", escalation: "\u6295\u8BC9\u3001\u9000\u6362\u8D27\u3001\u8D85\u51FA\u6743\u9650\u7684\u4E8B\u9879\u8F6C\u4EBA\u5DE5\u5904\u7406\u3002", avoid: "\u4E0D\u627F\u8BFA\u505A\u4E0D\u5230\u7684\u4E8B\u3001\u4E0D\u4E0E\u5BA2\u6237\u4E89\u6267\u3002" }, knowledge: { seeds: ["\u5E38\u89C1\u95EE\u9898\u4F18\u5148\u7ED9\u51FA\u7B80\u77ED\u3001\u53EF\u6267\u884C\u7684\u89E3\u51B3\u8DEF\u5F84\u3002"] } } }
];
var emptyConfig = PRESETS[0].config;
function FailoverCard() {
  const [state, setState] = (0, import_react.useState)("checking");
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      style: (
        // 本组件在模块作用域，够不到 TwinSettingsPage 内部的样式对象 s——内联等价样式
        // （historical s.hint + marginTop）。此前引用 s.hint 是 ReferenceError，监控 Tab 必崩。
        {
          fontSize: 12,
          color: "#8a8f9c",
          background: "#f6f7f9",
          border: "1px solid #eee",
          borderRadius: 6,
          padding: "8px 10px",
          marginTop: 8
        }
      ),
      children: [
        "\u6A21\u578B\u964D\u7EA7\u94FE\uFF1A",
        state === "ok" && "\u5DF2\u914D\u7F6E\uFF08\u5957\u9910\u8D85\u9650/\u4F59\u989D\u4E0D\u8DB3\u65F6\u6309\u94FE\u81EA\u52A8\u5207\u6362\uFF0C\u7A97\u53E3\u91CD\u7F6E\u81EA\u52A8\u5207\u56DE\uFF09",
        state === "unconfigured" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "\u672A\u914D\u7F6E\u2014\u2014\u5206\u8EAB\u5728\u6A21\u578B\u5957\u9910\u8D85\u9650\u65F6\u4F1A\u76F4\u63A5\u62A5\u9519\u3002\u5EFA\u8BAE\u5728\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u5207\u6362\u300D\u914D\u7F6E\u964D\u7EA7\u94FE\u3002" }),
        state === "checking" && "\u68C0\u6D4B\u4E2D\u2026"
      ]
    }
  );
}
async function api(path, method = "GET", body) {
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
  const [cfg, setCfg] = (0, import_react.useState)(emptyConfig);
  const [loaded, setLoaded] = (0, import_react.useState)(false);
  const [saving, setSaving] = (0, import_react.useState)(false);
  const [status, setStatus] = (0, import_react.useState)("");
  const [toolHint, setToolHint] = (0, import_react.useState)("");
  const [stats, setStats] = (0, import_react.useState)(null);
  const [history, setHistory] = (0, import_react.useState)([]);
  const [monitor, setMonitor] = (0, import_react.useState)(null);
  const [tab, setTab] = (0, import_react.useState)("persona");
  const load = (0, import_react.useCallback)(async () => {
    try {
      const d = await api("/dsh-twin/config", "GET");
      if (d.ok && d.config) {
        setCfg({ ...emptyConfig, ...d.config });
        const t = d.config.template;
        setToolHint(PRESETS.find((p) => p.id === t)?.toolHint ?? "");
      }
    } catch {
    }
    try {
      const s2 = await api("/dsh-twin/stats", "GET");
      if (s2.ok && s2.stats) setStats(s2.stats);
    } catch {
    }
    try {
      const h = await api("/dsh-twin/history", "GET");
      if (h.ok && h.history) setHistory(h.history);
    } catch {
    }
    try {
      const m = await api("/dsh-twin/monitor", "GET");
      if (m.ok && m.monitor) setMonitor(m.monitor);
    } catch {
    }
    setLoaded(true);
  }, []);
  (0, import_react.useEffect)(() => {
    load();
  }, [load]);
  async function restoreVersion(index) {
    if (!window.confirm("\u786E\u5B9A\u8981\u6062\u590D\u5230\u8BE5\u5386\u53F2\u7248\u672C\u5417\uFF1F\u5F53\u524D\u300C\u5206\u8EAB\u8BBE\u7F6E\u300D\u914D\u7F6E\u4F1A\u88AB\u66FF\u6362\u3002")) return;
    const d = await api("/dsh-twin/history/restore", "POST", { index });
    if (d.ok && d.config) {
      setCfg({ ...emptyConfig, ...d.config });
      setStatus("\u5DF2\u6062\u590D\u5386\u53F2\u7248\u672C");
      load();
    } else {
      setStatus("\u6062\u590D\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
    }
  }
  function applyPreset(id) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const hasInput = cfg.identity.name.trim() !== "" || cfg.identity.role.trim() !== "" || cfg.identity.background.trim() !== "" || cfg.persona.style.trim() !== "" || cfg.persona.values.trim() !== "" || cfg.persona.rules.trim() !== "" || cfg.persona.escalation.trim() !== "" || cfg.persona.avoid.trim() !== "" || (cfg.knowledge?.seeds ?? []).some((s2) => s2.trim() !== "");
    if (hasInput && !window.confirm("\u5957\u7528\u6A21\u677F\u4F1A\u8986\u76D6\u5F53\u524D\u5DF2\u586B\u7684\u4EBA\u683C\u5B57\u6BB5\u4E0E\u77E5\u8BC6\u79CD\u5B50\uFF0C\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F")) return;
    setCfg((prev) => ({
      ...preset.config,
      template: id,
      identity: { ...prev.identity, ...preset.config.identity },
      persona: { ...prev.persona, ...preset.config.persona },
      // 知识种子合并去重（模板种子 + 已有种子），而不是整体替换
      knowledge: {
        seeds: [.../* @__PURE__ */ new Set([...preset.config.knowledge.seeds ?? [], ...prev.knowledge?.seeds ?? []])]
      }
    }));
    setToolHint(preset.toolHint);
    setStatus(`\u5DF2\u8F7D\u5165\u6A21\u677F\uFF1A${preset.label}\uFF08\u5C1A\u672A\u4FDD\u5B58\uFF0C\u70B9\u300C\u4FDD\u5B58\u5E76\u751F\u6548\u300D\u540E\u5E94\u7528\uFF09`);
  }
  async function handleSave() {
    setSaving(true);
    setStatus("");
    try {
      const d = await api("/dsh-twin/config", "POST", cfg);
      if (d.ok) {
        setCfg({ ...emptyConfig, ...d.config });
        const mem = d.memory && d.memory.seeded > 0 ? `\uFF08\u5DF2\u5199\u5165 ${d.memory.seeded} \u6761\u5171\u4EAB\u8BB0\u5FC6\uFF09` : "";
        setStatus(`\u5DF2\u4FDD\u5B58${mem}`);
        refreshPreview();
      } else {
        setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
      }
    } catch (e) {
      setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e));
    }
    setSaving(false);
  }
  const [preview, setPreview] = (0, import_react.useState)(null);
  async function refreshPreview() {
    try {
      const d = await api("/dsh-twin/preview", "GET");
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
    let exported = cfg;
    try {
      const d = await api("/dsh-twin/config", "GET");
      if (d.ok && d.config) exported = d.config;
    } catch {
    }
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "twin-config.json";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("\u5DF2\u5BFC\u51FA twin-config.json\uFF08\u53EF\u5728\u53E6\u4E00\u53F0\u7535\u8111\u5BFC\u5165\uFF09");
  }
  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!window.confirm("\u5BFC\u5165\u4F1A\u7528\u6587\u4EF6\u5185\u5BB9\u8986\u76D6\u5F53\u524D\u300C\u5206\u8EAB\u8BBE\u7F6E\u300D\u3002\u4EBA\u683C\u6587\u672C\u5C06\u88AB\u539F\u6837\u6CE8\u5165\u7CFB\u7EDF\u63D0\u793A\u8BCD\u2014\u2014\u8BF7\u52FF\u5BFC\u5165\u6765\u8DEF\u4E0D\u660E\u7684\u6587\u4EF6\u3002\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F")) return;
        setCfg({ ...emptyConfig, ...data });
        const d = await api("/dsh-twin/config", "POST", { ...emptyConfig, ...data });
        setStatus(d.ok ? "\u5DF2\u5BFC\u5165\u5E76\u751F\u6548" : "\u5BFC\u5165\u5931\u8D25\uFF1A" + (d.error || "\u672A\u77E5\u9519\u8BEF"));
      } catch (err) {
        setStatus("\u5BFC\u5165\u5931\u8D25\uFF1A" + String(err));
      }
      e.target.value = "";
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
  const s = {
    wrap: { padding: "20px", maxWidth: "720px" },
    h: { fontSize: "18px", fontWeight: 700, margin: "0 0 4px 0" },
    sub: { fontSize: "13px", color: "#888", margin: "0 0 16px 0" },
    section: { marginBottom: "18px" },
    secTitle: { fontSize: "14px", fontWeight: 700, margin: "0 0 8px 0", color: "#444" },
    label: { display: "block", fontSize: "12px", color: "#666", margin: "8px 0 4px 0" },
    input: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" },
    textarea: { width: "100%", boxSizing: "border-box", padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", minHeight: "54px", resize: "vertical" },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" },
    chip: { padding: "5px 12px", border: "1px solid #ddd", borderRadius: "16px", fontSize: "13px", cursor: "pointer", background: "#fff" },
    chipOn: { padding: "5px 12px", border: "1px solid #4a6cf7", borderRadius: "16px", fontSize: "13px", cursor: "pointer", background: "#eef1ff", color: "#4a6cf7", fontWeight: 600 },
    templateGrid: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" },
    templateCard: { width: "160px", padding: "12px 12px 10px", border: "1px solid #e5e7eb", borderRadius: "10px", textAlign: "center", cursor: "pointer", background: "#fff", transition: "all 0.15s" },
    templateCardOn: { borderColor: "#4a6cf7", background: "#eef1ff", boxShadow: "0 0 0 2px rgba(74,108,247,0.15)" },
    templateName: { fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "4px" },
    templateDesc: { fontSize: "11px", color: "#8a8f9c", lineHeight: 1.4, minHeight: "28px" },
    templateCheck: { fontSize: "12px", color: "#4a6cf7", fontWeight: 600, marginTop: "6px" },
    btn: { padding: "8px 18px", border: "none", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "#4a6cf7", color: "#fff" },
    ghost: { padding: "8px 18px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px", cursor: "pointer", background: "#fff", color: "#444" },
    row: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "12px" },
    tabBar: { display: "flex", gap: "4px", borderBottom: "1px solid #e5e7eb", marginBottom: "14px" },
    tab: { padding: "8px 14px", fontSize: "13px", border: "none", background: "transparent", cursor: "pointer", color: "#666", borderBottom: "2px solid transparent" },
    tabOn: { padding: "8px 14px", fontSize: "13px", border: "none", background: "transparent", cursor: "pointer", color: "#4a6cf7", fontWeight: 600, borderBottom: "2px solid #4a6cf7" },
    hint: { fontSize: "12px", color: "#8a8f9c", background: "#f6f7f9", border: "1px solid #eee", borderRadius: "6px", padding: "8px 10px", marginTop: "4px" },
    status: { fontSize: "13px", marginTop: "10px", color: "#4a6cf7" }
  };
  const setI = (k, v) => setCfg((prev) => ({ ...prev, identity: { ...prev.identity, [k]: v } }));
  const setP = (k, v) => setCfg((prev) => ({ ...prev, persona: { ...prev.persona, [k]: v } }));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { style: s.h, children: "\u6570\u5B57\u5206\u8EAB\u8BBE\u7F6E" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: s.sub, children: "\u914D\u7F6E\u4F60\u7684\u6570\u5B57\u5206\u8EAB\uFF1A\u6A21\u677F / \u4EBA\u683C / \u77E5\u8BC6\u3002\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF08\u4EBA\u683C\u6CE8\u5165\u63D0\u793A\u8BCD\u3001\u77E5\u8BC6\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\uFF09\u3002\u63D2\u4EF6\u662F\u7EAF\u6846\u67B6\uFF0C\u4EBA\u683C\u662F\u6570\u636E\uFF0C\u53EF\u5BFC\u5165\u5BFC\u51FA\u968F\u8EAB\u643A\u5E26\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.tabBar, children: [["persona", "\u4EBA\u683C"], ["knowledge", "\u77E5\u8BC6"], ["monitor", "\u76D1\u63A7"], ["history", "\u5386\u53F2"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: tab === id ? s.tabOn : s.tab, onClick: () => setTab(id), children: label }, id)) }),
    tab === "persona" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.secTitle, children: "\u6A21\u677F\u9884\u8BBE" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.templateGrid, children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: cfg.template === p.id ? { ...s.templateCard, ...s.templateCardOn } : s.templateCard, onClick: () => applyPreset(p.id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.templateName, children: p.label }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.templateDesc, children: p.desc }),
        cfg.template === p.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.templateCheck, children: "\u2713 \u5DF2\u9009" })
      ] }, p.id)) }),
      toolHint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.hint, children: [
        "\u{1F6E1}\uFE0F ",
        toolHint
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.secTitle, children: "\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u540D\u5B57" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: s.input, value: cfg.identity.name, onChange: (e) => setI("name", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5C0F D" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u8EAB\u4EFD\u5B9A\u4F4D" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { style: s.input, value: cfg.identity.role, onChange: (e) => setI("role", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u79C1\u4EBA\u52A9\u7406 / \u7814\u53D1\u52A9\u624B / \u4E13\u5BB6\u987E\u95EE" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u80CC\u666F" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.identity.background, onChange: (e) => setI("background", e.target.value), placeholder: "\u4F60\u662F\u8C01\u3001\u61C2\u4EC0\u4E48\u3001\u670D\u52A1\u8C01\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u{1F512} \u4EC5\u6CE8\u5165\u4F60\u81EA\u5DF1\u7684\u4F1A\u8BDD\uFF1B\u8BBF\u5BA2\u4F1A\u8BDD\u4E0D\u542B\u6B64\u5185\u5BB9\u3002\u53EF\u5199\u79C1\u5BC6\u4E8B\u5B9E\uFF08\u65E5\u7A0B\u3001\u9879\u76EE\u3001\u5BB6\u5EAD\u5B89\u6392\u7B49\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u8BED\u6C14" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.chipRow, children: TONES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: cfg.persona.tone === t.id ? s.chipOn : s.chip, onClick: () => setP("tone", t.id), children: t.label }, t.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u98CE\u683C\u8865\u5145" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.persona.style, onChange: (e) => setP("style", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5148\u7ED9\u7ED3\u8BBA\u518D\u7ED9\u4F9D\u636E / \u522B\u7528\u592A\u4E13\u4E1A\u7684\u9ED1\u8BDD\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u4EF7\u503C\u89C2\u4E0E\u539F\u5219" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.persona.values, onChange: (e) => setP("values", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4EE5\u4E3B\u4EBA\u5229\u76CA\u4E3A\u5148\uFF1B\u8BDA\u5B9E\u6709\u636E\u3001\u4E0D\u7F16\u9020\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u26A0 \u4F1A\u6CE8\u5165\u6240\u6709\u4F1A\u8BDD\uFF08\u542B\u8BBF\u5BA2\uFF09\u2014\u2014\u5206\u8EAB\u5BF9\u4EFB\u4F55\u4EBA\u90FD\u575A\u5B88\u8FD9\u91CC\u7684\u539F\u5219\u3002\u53EA\u5199\u884C\u4E3A\u51C6\u5219\uFF0C\u52FF\u5199\u673A\u5BC6\uFF08\u673A\u5BC6\u8BF7\u5199\u5728\u4E0A\u65B9\u300C\u80CC\u666F\u300D\uFF0C\u4EC5\u4F60\u81EA\u5DF1\u7684\u4F1A\u8BDD\u53EF\u89C1\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u51B3\u7B56\u4E0E\u505A\u4E8B\u65B9\u5F0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.persona.rules, onChange: (e) => setP("rules", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5148\u542C\u6E05\u9700\u6C42\u518D\u884C\u52A8\uFF1B\u80FD\u4EE3\u529E\u7684\u4EE3\u529E\uFF0C\u4E0D\u786E\u5B9A\u7684\u5148\u786E\u8BA4\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u8FB9\u754C\u4E0E\u8F6C\u4EBA\u5DE5" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.persona.escalation, onChange: (e) => setP("escalation", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u6D89\u53CA\u91D1\u94B1/\u5BF9\u5916\u627F\u8BFA/\u5BF9\u5916\u53D1\u5E03\u65F6\u8F6C\u4E3B\u4EBA\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u7981\u5FCC" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { style: s.textarea, value: cfg.persona.avoid, onChange: (e) => setP("avoid", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4E0D\u64C5\u81EA\u5BF9\u5916\u627F\u8BFA\u3001\u4E0D\u66FF\u4E3B\u4EBA\u505A\u4E3B\u51B3\u5B9A\u3002" })
    ] }),
    tab === "knowledge" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.secTitle, children: "\u77E5\u8BC6\uFF08\u5171\u4EAB\u8BB0\u5FC6\u79CD\u5B50\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { style: s.label, children: "\u8BB0\u5FC6\uFF08\u6BCF\u884C\u4E00\u6761\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "textarea",
        {
          style: { ...s.textarea, minHeight: "80px" },
          value: (cfg.knowledge?.seeds ?? []).join("\n"),
          onChange: (e) => setCfg((prev) => ({ ...prev, knowledge: { seeds: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })),
          placeholder: "\u4F8B\u5982\uFF1A\n\u6211\u662F\u67D0\u516C\u53F8\u7814\u53D1\u8D1F\u8D23\u4EBA\n\u6211\u4EEC\u9879\u76EE\u7528 TypeScript\n\u6BCF\u5468\u4E94\u4E0B\u5348\u5F00\u5468\u4F1A"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { ...s.ghost, display: "inline-block", marginTop: "8px" }, children: [
        "\u5BFC\u5165\u77E5\u8BC6\u6587\u4EF6(.txt/.md)",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: ".txt,.md,.markdown,text/plain", style: { display: "none" }, onChange: handleImportKnowledge })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.hint, marginTop: 10 }, children: "\u6B64\u5904\u7F16\u8F91\u7684\u662F\u300C\u79CD\u5B50\u300D\uFF1B\u4FDD\u5B58\u540E\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\u5E93\u3002\u8981\u67E5\u770B / \u7F16\u8F91 / \u5220\u9664\u5DF2\u5165\u5E93\u7684 \u5355\u6761\u8BB0\u5FC6\uFF08\u542B\u5206\u8EAB\u5BF9\u8BDD\u4E2D\u6C89\u6DC0\u7684\u8BB0\u5FC6\uFF09\uFF0C\u8BF7\u5230\u5DE6\u4FA7\u300C\u8BB0\u5FC6\u300D\u6807\u7B7E\u9875\uFF08dsh-memory \u63D0\u4F9B\uFF09\u3002" })
    ] }),
    tab === "monitor" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.secTitle, children: "\u8FD0\u884C\u76D1\u63A7" }),
      monitor ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.hint, children: [
        "\u4F1A\u8BDD ",
        monitor.sessionCount,
        "\uFF08\u5206\u8EAB ",
        monitor.twinSessionCount,
        "\uFF09\xB7 Turns ",
        monitor.turns,
        " \xB7 Steps ",
        monitor.steps,
        " \xB7 \u9519\u8BEF ",
        monitor.errors,
        "\uFF08",
        Math.round(monitor.errorRate * 100),
        "%\uFF09\xB7 LLM \u8017\u65F6 ",
        Math.round(monitor.llmMs / 1e3),
        "s",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
        "Tokens\uFF1A\u8F93\u5165 ",
        monitor.tokens.input,
        " \xB7 \u8F93\u51FA ",
        monitor.tokens.output,
        " \xB7 \u7F13\u5B58\u8BFB ",
        monitor.tokens.cacheRead,
        " \xB7 \u7F13\u5B58\u5199 ",
        monitor.tokens.cacheWrite
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u6682\u65E0\u76D1\u63A7\u6570\u636E\uFF08\u4F7F\u7528\u5206\u8EAB\u4F1A\u8BDD\u540E\u51FA\u73B0\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FailoverCard, {})
    ] }),
    tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.secTitle, children: "\u5386\u53F2\u7248\u672C" }),
      history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.hint, children: [
        "\u6700\u8FD1 ",
        history.length,
        " \u4E2A\uFF1A",
        history.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { style: { ...s.ghost, padding: "2px 8px", fontSize: "12px", margin: "0 4px 4px 0" }, onClick: () => restoreVersion(v.index), children: [
          "\u6062\u590D ",
          new Date(v.ts).toLocaleString()
        ] }, v.index))
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u6682\u65E0\u5386\u53F2\u7248\u672C\uFF08\u4FDD\u5B58\u8FC7\u300C\u5206\u8EAB\u8BBE\u7F6E\u300D\u4F1A\u751F\u6210\uFF09\u3002" })
    ] }),
    stats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.hint, children: [
      "\u72B6\u6001\uFF1A\u8BB0\u5FC6 ",
      stats.memoryTotal,
      " \u6761",
      stats.memoryTotal > 0 ? `\uFF08${Object.entries(stats.memoryTypes).map(([k, v]) => `${k}\xD7${v}`).join("\uFF0C")}\uFF09` : "",
      " \xB7 \u4EBA\u683C",
      stats.hasPersona ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { ...s.hint, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          type: "checkbox",
          checked: cfg.becomeDefaultPreset === true,
          onChange: (e) => setCfg((prev) => ({ ...prev, becomeDefaultPreset: e.target.checked }))
        }
      ),
      "\u628A\u300C\u6570\u5B57\u5206\u8EAB\u300D\u8BBE\u4E3A\u9ED8\u8BA4 agent \u9884\u8BBE"
    ] }),
    cfg.becomeDefaultPreset === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.hint, color: "#c47f17" }, children: "\u26A0 \u52FE\u9009\u540E\u6240\u6709\u65B0\u4F1A\u8BDD\uFF08\u542B\u4F60\u81EA\u5DF1\u7684\u65E5\u5E38\u5DE5\u4F5C\u4F1A\u8BDD\uFF09\u90FD\u5C06\u4F7F\u7528 conversation-first \u5206\u8EAB\u9884\u8BBE\uFF08\u65E0 shell / \u6587\u4EF6\u7CFB\u7EDF\u76F4\u64CD\u5DE5\u5177\uFF09\u3002\u82E5\u4F60\u4E3B\u8981\u5728\u7F51\u9875\u7AEF\u505A\u5F00\u53D1\u5DE5\u4F5C\uFF0C \u5EFA\u8BAE\u4E0D\u52FE\u9009\uFF0C\u6539\u4E3A\u5728\u300C\u624B\u673A\u8FDE\u63A5 \u2192 im-channel \u8BBE\u7F6E\u300D\u91CC\u914D\u7F6E agentPreset: digital-twin\uFF0C \u53EA\u8BA9\u4F01\u5FAE\u4F1A\u8BDD\u8D70\u5206\u8EAB\u4EBA\u683C\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn, disabled: !loaded || saving, onClick: handleSave, children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5E76\u751F\u6548" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.ghost, onClick: handlePreviewToggle, children: preview ? "\u6536\u8D77\u9884\u89C8" : "\u9884\u89C8\u6CE8\u5165\u7684\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.ghost, onClick: handleExport, children: "\u5BFC\u51FA\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: s.ghost, children: [
        "\u5BFC\u5165\u4EBA\u683C",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "application/json", style: { display: "none" }, onChange: handleImport })
      ] })
    ] }),
    preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("pre", { style: { ...s.hint, whiteSpace: "pre-wrap", background: "rgba(127,127,127,0.12)", padding: 10, borderRadius: 8, maxHeight: 260, overflow: "auto" }, children: [
      preview.persona || "\uFF08\u4EBA\u683C\u4E3A\u7A7A\uFF1A\u540D\u5B57/\u98CE\u683C\u7B49\u5B57\u6BB5\u5168\u7A7A\u65F6\u4E0D\u6CE8\u5165\u4EBA\u683C\u6BB5\uFF09",
      preview.guard ? `

${preview.guard}` : ""
    ] }),
    status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.status, children: status })
  ] });
}
		return module.exports;
	}
});
//# sourceMappingURL=client.js.map
