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
var import_react7 = require("react");

// src/client/cards.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var EMPTY = {
  identity: { fields: [{ key: "name", value: "", visibility: "\u516C\u5F00" }, { key: "background", value: "", visibility: "\u79C1\u5BC6" }] },
  policy: { rules: [] },
  exemplars: { items: [] },
  state: { items: [] }
};
var s = {
  sec: { fontSize: 13, fontWeight: 700, margin: "18px 0 8px", color: "var(--dsw-alias-label-primary)" },
  hint: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", marginBottom: 10 },
  row: { display: "flex", gap: 8, marginBottom: 6, alignItems: "center", flexWrap: "wrap" },
  input: { flex: "1 1 160px", padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 },
  small: { padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13 },
  wide: { width: "100%", padding: "5px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 13, boxSizing: "border-box" },
  btn: { padding: "6px 14px", border: "none", borderRadius: 6, background: "var(--dsw-alias-state-business-primary)", color: "#fff", fontSize: 13, cursor: "pointer" },
  btn2: { padding: "6px 14px", border: "1px solid #ddd", borderRadius: 6, background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-label-secondary)", fontSize: 13, cursor: "pointer" },
  del: { padding: "4px 10px", border: "1px solid #eee", borderRadius: 6, background: "var(--dsw-alias-bg-layer-2)", color: "var(--dsw-alias-state-error-primary)", fontSize: 12, cursor: "pointer" },
  status: { fontSize: 12.5, padding: "8px 10px", borderRadius: 6, margin: "10px 0" },
  rev: { fontSize: 12, color: "var(--dsw-alias-label-tertiary)", lineHeight: 1.8 },
  pre: { background: "var(--dsw-alias-bg-layer-1)", border: "1px solid #eee", borderRadius: 6, padding: 10, fontSize: 12, whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }
};
function applyCards(ctx) {
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register({ name: "settings.section", id: "twin-cards", order: 26, label: () => "\u56DB\u5F20\u5361" }, CardsPage)
  );
}
function CardsPage() {
  const [cards, setCards] = (0, import_react.useState)(EMPTY);
  const [meta, setMeta] = (0, import_react.useState)({ revisionNo: 0, status: "\u5019\u9009", hasEffective: false });
  const [history, setHistory] = (0, import_react.useState)([]);
  const [confirm, setConfirm] = (0, import_react.useState)(false);
  const [regressionPassed, setRegressionPassed] = (0, import_react.useState)(false);
  const [msg, setMsg] = (0, import_react.useState)(null);
  const [preview, setPreview] = (0, import_react.useState)(null);
  const load = (0, import_react.useCallback)(async () => {
    try {
      const r = await fetch("/dsh-twin/cards");
      const d = await r.json();
      if (d.ok) {
        setCards(d.file.current);
        setMeta({ revisionNo: d.file.revisionNo, status: d.file.status, hasEffective: d.hasEffective });
        setHistory(d.history ?? []);
      } else {
        setMsg({ text: d.error ?? "\u52A0\u8F7D\u5931\u8D25", ok: false });
      }
    } catch (e) {
      setMsg({ text: String(e), ok: false });
    }
  }, []);
  (0, import_react.useEffect)(() => {
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
  const doPreview = async () => {
    const r = await fetch("/dsh-twin/cards/preview");
    const d = await r.json();
    setPreview({ master: d.master, guest: d.guest });
  };
  const upd = (fn) => {
    const draft = JSON.parse(JSON.stringify(cards));
    fn(draft);
    setCards(draft);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: s.hint, children: [
      "\u56DB\u5F20\u5361\u662F\u5206\u8EAB\u4EBA\u683C\u7684\u7ED3\u6784\u5316\u6570\u636E\uFF1A\u8EAB\u4EFD\u5361\uFF08\u516C\u5F00/\u79C1\u5BC6\u5206\u7EA7\u2014\u2014\u79C1\u5BC6\u5B57\u6BB5\u8BBF\u5BA2\u89C6\u56FE\u7ED3\u6784\u6027\u7F3A\u5931\uFF09\u3001\u7B56\u7565\u5361\uFF08\u89E6\u53D1\u2192\u52A8\u4F5C\u2192\u5347\u7EA7\uFF0C\u9010\u6761\u53EF\u6D4B\u8BD5\uFF09\u3001 \u6837\u4F8B\u5361\uFF08\u8FD9\u4E48\u8BF4/\u4E0D\u8FD9\u4E48\u8BF4\uFF09\u3001\u72B6\u6001\u5361\uFF08\u968F\u65F6\u95F4\u8870\u51CF\uFF09\u3002\u751F\u6548 = ",
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "\u4E3B\u4EBA\u786E\u8BA4 + \u56DE\u5F52\u901A\u8FC7" }),
      " \u53CC\u6761\u4EF6\uFF0C\u7F3A\u4E00\u4FDD\u5B58\u4E3A\u5019\u9009\u4FEE\u8BA2\u3002"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { ...s.status, background: meta.hasEffective ? "var(--dsw-alias-state-success-tertiary)" : "var(--dsw-alias-state-warn-tertiary)", color: meta.hasEffective ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-label)" }, children: [
      "\u5F53\u524D\u72B6\u6001\uFF1A",
      meta.hasEffective ? "\u2713 \u751F\u6548" : "\u5019\u9009\uFF08\u65E7\u751F\u6548\u5361\u6216 legacy \u6E32\u67D3\u4E2D\uFF09",
      " \xB7 \u4FEE\u8BA2\u53F7 ",
      meta.revisionNo
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u2460 \u8EAB\u4EFD\u5361" }),
    cards.identity.fields.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: { ...s.input, maxWidth: 140 },
          value: f.key,
          placeholder: "\u952E\uFF08name/role\u2026\uFF09",
          onChange: (e) => upd((d) => {
            d.identity.fields[i].key = e.target.value;
          })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.input,
          value: f.value,
          placeholder: "\u503C",
          onChange: (e) => upd((d) => {
            d.identity.fields[i].value = e.target.value;
          })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "select",
        {
          style: s.small,
          value: f.visibility,
          onChange: (e) => upd((d) => {
            d.identity.fields[i].visibility = e.target.value;
          }),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u516C\u5F00", children: "\u516C\u5F00" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u79C1\u5BC6", children: "\u79C1\u5BC6" })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.del, onClick: () => upd((d) => {
        d.identity.fields.splice(i, 1);
      }), children: "\u5220" })
    ] }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => upd((d) => {
      d.identity.fields.push({ key: "", value: "", visibility: "\u516C\u5F00" });
    }), children: "+ \u8EAB\u4EFD\u5B57\u6BB5" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u2461 \u7B56\u7565\u5361\uFF08\u89E6\u53D1 \u2192 \u52A8\u4F5C \u2192 \u5347\u7EA7\uFF09" }),
    cards.policy.rules.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: r.when,
          placeholder: "\u89E6\u53D1\u6761\u4EF6\uFF08\u5982\uFF1A\u88AB\u95EE\u786E\u5B9A\u62A5\u4EF7\uFF09",
          onChange: (e) => upd((d) => {
            d.policy.rules[i].when = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: r.act,
          placeholder: "\u52A8\u4F5C\uFF08\u5982\uFF1A\u7ED9\u533A\u95F4\u6216\u8F6C\u4E3B\u4EBA\uFF09",
          onChange: (e) => upd((d) => {
            d.policy.rules[i].act = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: r.escalate ?? "",
          placeholder: "\u5347\u7EA7\u8DEF\u5F84\uFF08\u53EF\u9009\uFF0C\u5982\uFF1A\u5BF9\u65B9\u575A\u6301 \u2192 \u8F6C\u4EBA\u5DE5\uFF09",
          onChange: (e) => upd((d) => {
            d.policy.rules[i].escalate = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: r.enabled, onChange: (e) => upd((d) => {
            d.policy.rules[i].enabled = e.target.checked;
          }) }),
          " \u542F\u7528"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: { ...s.del, marginLeft: "auto" }, onClick: () => upd((d) => {
          d.policy.rules.splice(i, 1);
        }), children: "\u5220" })
      ] })
    ] }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => upd((d) => {
      d.policy.rules.push({ id: `rule-${Date.now()}`, when: "", act: "", enabled: true });
    }), children: "+ \u7B56\u7565\u89C4\u5219" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u2462 \u6837\u4F8B\u5361\uFF08\u8FD9\u4E48\u8BF4 / \u4E0D\u8FD9\u4E48\u8BF4\uFF09" }),
    cards.exemplars.items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 8 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: x.situation,
          placeholder: "\u573A\u666F",
          onChange: (e) => upd((d) => {
            d.exemplars.items[i].situation = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: x.say,
          placeholder: "\u2713 \u8BE5\u8FD9\u4E48\u8BF4",
          onChange: (e) => upd((d) => {
            d.exemplars.items[i].say = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.row, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.wide,
          value: x.avoidSay,
          placeholder: "\u2715 \u4E0D\u8FD9\u4E48\u8BF4",
          onChange: (e) => upd((d) => {
            d.exemplars.items[i].avoidSay = e.target.value;
          })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { style: s.small, value: x.source, onChange: (e) => upd((d) => {
          d.exemplars.items[i].source = e.target.value;
        }), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u8BED\u6599", children: "\u8BED\u6599" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u7EA0\u6B63", children: "\u7EA0\u6B63" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: { ...s.del, marginLeft: "auto" }, onClick: () => upd((d) => {
          d.exemplars.items.splice(i, 1);
        }), children: "\u5220" })
      ] })
    ] }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => upd((d) => {
      d.exemplars.items.push({ id: `ex-${Date.now()}`, situation: "", say: "", avoidSay: "", source: "\u7EA0\u6B63" });
    }), children: "+ \u6837\u4F8B" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u2463 \u72B6\u6001\u5361\uFF08\u8FD1\u671F\u4E0A\u4E0B\u6587\uFF0C\u81EA\u52A8\u8870\u51CF\uFF09" }),
    cards.state.items.map((x, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { style: s.small, value: x.statementType, onChange: (e) => upd((d) => {
        d.state.items[i].statementType = e.target.value;
      }), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u5019\u9009", children: "\u5019\u9009" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "\u4E8B\u5B9E", children: "\u4E8B\u5B9E" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: s.input,
          value: x.content,
          placeholder: "\u5185\u5BB9",
          onChange: (e) => upd((d) => {
            d.state.items[i].content = e.target.value;
          })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "input",
        {
          style: { ...s.small, maxWidth: 170 },
          type: "date",
          value: (x.decayAt ?? "").slice(0, 10),
          onChange: (e) => upd((d) => {
            d.state.items[i].decayAt = e.target.value === "" ? void 0 : e.target.value + "T00:00:00Z";
          })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.del, onClick: () => upd((d) => {
        d.state.items.splice(i, 1);
      }), children: "\u5220" })
    ] }, i)),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => upd((d) => {
      d.state.items.push({ id: `st-${Date.now()}`, content: "", statementType: "\u5019\u9009" });
    }), children: "+ \u72B6\u6001\u6761\u76EE" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u4FDD\u5B58\u4E0E\u751F\u6548" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: confirm, onChange: (e) => setConfirm(e.target.checked) }),
        " \u4E3B\u4EBA\u786E\u8BA4\uFF08\u7B7E\u540D\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: regressionPassed, onChange: (e) => setRegressionPassed(e.target.checked) }),
        " \u56DE\u5F52\u901A\u8FC7\uFF08\u7531 dsh-regression \u62A5\u544A\u56DE\u586B\uFF09"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn, onClick: () => void save(false), children: "\u4FDD\u5B58\u56DB\u5F20\u5361" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => {
        if (window.confirm("\u4ECE legacy twin-config \u8FC1\u79FB\u5230\u56DB\u5F20\u5361\uFF1F\u5F53\u524D\u7F16\u8F91\u5185\u5BB9\u5C06\u88AB\u8986\u76D6\u3002")) void save(true);
      }, children: "\u4ECE\u65E7\u914D\u7F6E\u8FC1\u79FB" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => void doPreview(), children: "\u9884\u89C8\u53CC\u89C6\u56FE\u6295\u5F71" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { style: s.btn2, onClick: () => void load(), children: "\u5237\u65B0" })
    ] }),
    msg !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { ...s.status, background: msg.ok ? "var(--dsw-alias-state-success-tertiary)" : "var(--dsw-alias-state-warn-tertiary)", color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-label)" }, children: msg.text }),
    preview !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u6295\u5F71\u9884\u89C8" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: s.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u4E3B\u4EBA\u89C6\u56FE" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.pre, children: preview.master === "" ? "\uFF08\u7A7A\uFF09" : preview.master })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.hint, children: "\u8BBF\u5BA2\u89C6\u56FE\uFF08\u79C1\u5BC6\u5B57\u6BB5\u7ED3\u6784\u6027\u7F3A\u5931\uFF09" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.pre, children: preview.guest === "" ? "\uFF08\u7A7A\uFF09" : preview.guest })
        ] })
      ] })
    ] }),
    history.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 10 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.sec, children: "\u4FEE\u8BA2\u53F2\uFF08\u6700\u8FD1 10 \u4E2A\uFF0C\u4E0D\u53EF\u53D8\u5FEB\u7167\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: s.rev, children: history.slice().reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
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
var import_react6 = require("react");

// src/client/dashboard.tsx
var import_react2 = require("react");
var import_jsx_runtime2 = require("react/jsx-runtime");
var EMPTY2 = { candidates: [], openLoops: [], pendingShadow: [], ledger: { pendingApprovals: 0, blocked: 0, total: 0 }, regressions: [], reaches: [] };
async function api(path) {
  const r = await fetch(path);
  return await r.json();
}
var s2 = {
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
  const [d, setD] = (0, import_react2.useState)(EMPTY2);
  const [loaded, setLoaded] = (0, import_react2.useState)(false);
  const [err, setErr] = (0, import_react2.useState)("");
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [msg, setMsg] = (0, import_react2.useState)("");
  const load = (0, import_react2.useCallback)(async () => {
    try {
      const [learning, profiles, shadow, ledger, regressions, proactive] = await Promise.all([
        api("/dsh-twin/learning").catch(() => null),
        api("/dsh-actors/profiles").catch(() => null),
        api("/dsh-regression/shadow/pending").catch(() => null),
        api("/dsh-ledger/stats").catch(() => null),
        api("/dsh-regression/reports").catch(() => null),
        api("/dsh-twin/proactive").catch(() => null)
      ]);
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
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h1", { style: s2.h, children: "\u4ECA\u65E5\u5F85\u529E" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { style: s2.sub, children: "\u5206\u8EAB\u9700\u8981\u4F60\u51B3\u7B56/\u5904\u7F6E\u7684\u4E8B\u9879\u6C47\u603B\u2014\u2014\u5904\u7406\u5B8C\u8FD9\u91CC\uFF0C\u5176\u4F59\u90FD\u5728\u81EA\u52A8\u8FD0\u8F6C\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.cards, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.dot, background: d.candidates.length > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.num, color: numColor(d.candidates.length) }, children: d.candidates.length }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.nm, children: "\u5F85\u786E\u8BA4\u5019\u9009" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.ctx, children: "\u5B66\u4E60\u961F\u5217 \xB7 \u8FBE\u5230\u8BC1\u636E\u95E8\u69DB" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.dot, background: d.openLoops.length > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.num, color: numColor(d.openLoops.length) }, children: d.openLoops.length }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.nm, children: "\u5F85\u95ED\u73AF\u4E8B\u9879" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.ctx, children: "\u5173\u7CFB\u6863\u6848 \xB7 \u627F\u8BFA\u51FA\u53E3\u5373\u5F00\u73AF" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.dot, background: d.pendingShadow.length > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.num, color: numColor(d.pendingShadow.length) }, children: d.pendingShadow.length }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.nm, children: "\u5F85\u5224\u5B9A\u76F2\u6D4B" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.ctx, children: "\u5F71\u5B50\u6D4B\u8BD5 \xB7 \u5224\u65AD\u54EA\u53E5\u50CF\u4F60" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.card, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.dot, background: d.ledger.pendingApprovals > 0 ? "var(--dsw-alias-state-warn-primary)" : "var(--dsw-alias-state-success-primary)" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...s2.num, color: numColor(d.ledger.pendingApprovals) }, children: d.ledger.pendingApprovals }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.nm, children: "\u5F85\u6279\u5BA1\u6279" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.ctx, children: "\u59D4\u6258\u8D26\u672C \xB7 \u6279\u51C6\u5373\u673A\u68B0\u843D\u8D26" })
      ] })
    ] }),
    loaded && total === 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.empty, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.emptyIcon, children: "\u2713" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.emptyText, children: "\u4ECA\u5929\u6CA1\u6709\u9700\u8981\u4F60\u5904\u7406\u7684\u4E8B" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.emptySub, children: "\u4FE1\u53F7\u81EA\u52A8\u6C89\u6DC0\uFF0C\u5019\u9009\u81EA\u52A8\u8FBE\u95E8\u69DB\uFF0C\u4E00\u5207\u5982\u5E38\u3002" })
    ] }),
    d.candidates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.section, children: [
        "\u5F85\u786E\u8BA4\u5019\u9009\uFF08",
        d.candidates.length,
        "\uFF09"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { ...s2.row, marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.btn, disabled: busy, onClick: () => void confirmAll(), children: "\u5168\u90E8\u786E\u8BA4\uFF08\u7B7E\u540D\uFF09" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.btnDanger, disabled: busy, onClick: () => void rejectAll(), children: "\u5168\u90E8\u9A73\u56DE" })
      ] }),
      d.candidates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.chip, children: c.kind }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemText, children: String(c.payload.situation ?? c.payload.when ?? c.id) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemMeta, children: c.createdAt.slice(0, 10) })
      ] }, c.id))
    ] }),
    d.openLoops.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.section, children: [
        "\u5F85\u95ED\u73AF\u4E8B\u9879\uFF08",
        d.openLoops.length,
        "\uFF09"
      ] }),
      d.openLoops.map((o) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.chip, children: o.displayName ?? o.actorId }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemText, children: o.content }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: s2.btnGhost, onClick: () => void closeLoop(o.memoryId), children: "\u6807\u8BB0\u95ED\u73AF" })
      ] }, o.memoryId))
    ] }),
    d.pendingShadow.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.section, children: [
        "\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\uFF08",
        d.pendingShadow.length,
        "\uFF09"
      ] }),
      d.pendingShadow.slice(0, 3).map((p) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: s2.itemText, children: [
          "\u201C",
          p.visitorInput.slice(0, 40),
          "\u201D"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemMeta, children: "\u8BE6\u89C1\u300C\u5F71\u5B50\u6D4B\u8BD5\u300DTab" })
      ] }, p.id))
    ] }),
    d.regressions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.section, children: "\u6700\u8FD1\u4E00\u6B21\u56DE\u5F52" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.chip, children: d.regressions[0].id }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: s2.itemText, children: [
          "\u901A\u8FC7 ",
          d.regressions[0].passed,
          "/",
          d.regressions[0].total,
          d.regressions[0].passed === d.regressions[0].total ? " \xB7 \u5168\u7EFF" : " \xB7 \u6709\u5931\u8D25"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemMeta, children: d.regressions[0].at.slice(0, 16).replace("T", " ") })
      ] })
    ] }),
    d.ledger.total > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { ...s2.item, marginTop: 14 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.chip, children: "\u8D26\u672C" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: s2.itemText, children: [
        "\u7D2F\u8BA1\u88C1\u51B3 ",
        d.ledger.total,
        " \u7B14 \xB7 \u5DF2\u963B\u65AD ",
        d.ledger.blocked
      ] })
    ] }),
    d.reaches.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.section, children: [
        "\u4E3B\u52A8\u89E6\u8FBE\u8BB0\u5F55\uFF08\u6700\u8FD1 ",
        d.reaches.length,
        "\uFF09"
      ] }),
      d.reaches.map((r) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.chip, children: r.kind }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: s2.itemText, children: r.title }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { ...s2.chip, color: r.status === "\u5DF2\u89E6\u8FBE" ? "var(--dsw-alias-state-success-primary)" : r.status === "\u88AB\u963B\u65AD" ? "var(--dsw-alias-state-error-primary)" : "var(--dsw-alias-state-warn-primary)" }, children: r.status })
      ] }, r.id))
    ] }),
    err && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: s2.err, children: [
      "\u52A0\u8F7D\u90E8\u5206\u5931\u8D25\uFF1A",
      err,
      "\uFF08\u6570\u636E\u6E90\u63D2\u4EF6\u53EF\u80FD\u672A\u5168\u90E8\u88C5\u8F7D\uFF09"
    ] }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: s2.status, children: msg })
  ] });
}

// src/client/learning.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
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
var s3 = {
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
  return { ...s3.badge, background: c.bg, color: c.fg, border: `1px solid ${c.b}` };
}
function LearningPage() {
  const [data, setData] = (0, import_react3.useState)({ ok: true, events: [], candidates: [] });
  const [kind, setKind] = (0, import_react3.useState)("\u7EA0\u6B63");
  const [target, setTarget] = (0, import_react3.useState)("\u6837\u4F8B\u5361");
  const [signal, setSignal] = (0, import_react3.useState)("");
  const [ref, setRef] = (0, import_react3.useState)("");
  const [msg, setMsg] = (0, import_react3.useState)(null);
  const [regressionReportId, setRegressionReportId] = (0, import_react3.useState)("");
  const load = (0, import_react3.useCallback)(async () => {
    const d = await api2("/dsh-twin/learning", "GET");
    if (d && d.ok) setData(d);
  }, []);
  (0, import_react3.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h1", { style: s3.h, children: "\u5B66\u4E60\u961F\u5217" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { style: s3.sub, children: "\u628A\u5206\u6563\u7684\u4FE1\u53F7\u53D8\u6210\u6709\u95E8\u69DB\u3001\u6709\u7B7E\u540D\u3001\u6709\u56DE\u5F52\u7684\u4FEE\u8BA2\u6D41\u6C34\u7EBF\u3002\u5355\u6B21\u4FE1\u53F7\u53EA\u6210\u4E3A\u89C2\u5BDF\uFF0C\u8FBE\u5230\u95E8\u69DB\u6216\u4E3B\u4EBA\u663E\u5F0F\u5F52\u56E0\u624D\u751F\u6210\u5019\u9009\uFF1B\u786E\u8BA4 + \u56DE\u5F52\u901A\u8FC7\u624D\u5165\u5361\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: s3.secTitle, children: "\u5165\u961F\u4E00\u4E2A\u4FE1\u53F7" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: s3.label, children: "\u4FE1\u53F7\u7C7B\u578B" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("select", { style: s3.select, value: kind, onChange: (e) => setKind(e.target.value), children: SIGNAL_KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: k.kind, children: k.label }, k.kind)) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: s3.label, children: "\u4FE1\u53F7\u539F\u6587\uFF08\u7CFB\u7EDF\u4F1A\u5F52\u4E00\u5316\u4E3A\u6307\u7EB9\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("textarea", { style: s3.textarea, value: signal, onChange: (e) => setSignal(e.target.value), placeholder: "\u4F8B\uFF1A\u5BA2\u6237\u575A\u6301\u8981\u516B\u6298\u65F6\uFF0C\u5206\u8EAB\u76F4\u63A5\u7B54\u5E94\u4E86\uFF08\u7EA0\u6B63\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: s3.label, children: "\u8DEF\u7531\u5230" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("select", { style: s3.select, value: target, onChange: (e) => setTarget(e.target.value), children: TARGETS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: t.id, children: t.label }, t.id)) }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("label", { style: s3.label, children: "\u5173\u8054\u5F15\u7528\uFF08\u53EF\u9009\uFF1A\u88AB\u5426\u51B3\u7684 record id / \u5F71\u5B50\u5BF9 id\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { style: s3.input, value: ref, onChange: (e) => setRef(e.target.value), placeholder: "\u53EF\u9009" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.btn, onClick: enqueue, children: "\u5165\u961F" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.ghost, onClick: () => void load(), children: "\u5237\u65B0" }),
      regressionReportId && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: s3.hint, children: [
        "\u5F85\u5E94\u7528 reportId: ",
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { children: regressionReportId })
      ] })
    ] }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { ...s3.status, color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" }, children: msg.text }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.secTitle, children: [
      "\u5019\u9009\u6C60\uFF08",
      data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2").length,
      "\uFF09"
    ] }),
    data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2" || c.status === "\u5DF2\u9A73\u56DE" || c.status === "\u5DF2\u5165\u5361").slice(-20).reverse().map((c) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: statusBadge(c.status), children: c.status }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { style: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)" }, children: c.id }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)" }, children: [
          "\xB7 ",
          c.kind,
          " \xB7 \u5173\u8054\u4E8B\u4EF6 ",
          c.eventIds.length
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("pre", { style: { fontSize: 12, background: "var(--dsw-alias-bg-layer-1)", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 120, margin: 0 }, children: JSON.stringify(c.payload, null, 2) }),
      c.status === "\u5019\u9009\u4FEE\u8BA2" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.row, children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.ok, onClick: () => void confirm(c.id), children: "\u4E3B\u4EBA\u786E\u8BA4" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.bad, onClick: () => void reject(c.id), children: "\u9A73\u56DE" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { style: s3.ghost, onClick: () => void apply2(c.id), children: regressionReportId ? "\u5E94\u7528\uFF08\u5DF2\u6709 reportId\uFF09" : "\u5E94\u7528\uFF08\u5148\u81EA\u52A8\u8DD1\u56DE\u5F52\uFF09" })
      ] }),
      c.status === "\u5DF2\u5165\u5361" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.hint, children: [
        "\u5DF2\u5165\u5361 \xB7 \u62A5\u544A ",
        c.regressionReportId ?? "\u2014"
      ] })
    ] }, c.id)),
    data.candidates.filter((c) => c.status === "\u5019\u9009\u4FEE\u8BA2").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: s3.hint, children: "\u6682\u65E0\u5019\u9009\u3002\u5148\u5728\u201C\u5165\u961F\u201D\u91CC\u5199\u4E00\u6761\u4FE1\u53F7\uFF0C\u6216\u4F7F\u7528\u4E0A\u4E00\u680F\u7684\u201C\u7EA0\u6B63\u201D\u6309\u94AE\uFF08\u4E0E\u8D26\u672C\u53CD\u9988\u6309\u94AE\u63A5\u7EBF\u540E\u4F1A\u5728\u8FD9\u91CC\u81EA\u52A8\u51FA\u73B0\u5426\u51B3\u4FE1\u53F7\uFF09\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: s3.secTitle, children: [
      "\u4E8B\u4EF6\u6D41\u6C34\uFF08\u6700\u8FD1 ",
      data.events.length,
      "\uFF09"
    ] }),
    data.events.slice(-15).reverse().map((e) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { ...s3.card, padding: "6px 10px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: statusBadge(e.status), children: e.status }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { style: { fontSize: 11, color: "var(--dsw-alias-label-tertiary)", marginLeft: 8 }, children: e.id }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary)", marginLeft: 8 }, children: [
        e.kind,
        " \u2192 ",
        e.target,
        " \xB7 w=",
        e.weight
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { fontSize: 12, color: "var(--dsw-alias-label-primary)", marginTop: 4 }, children: e.sig })
    ] }, e.id))
  ] });
}

// src/client/profiles.tsx
var import_react4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var ROLE_LABEL = { master: "\u4E3B\u4EBA", colleague: "\u540C\u4E8B", customer: "\u5BA2\u6237", stranger: "\u751F\u4EBA", blocked: "\u9ED1\u540D\u5355" };
var ROLE_COLOR = { master: "var(--dsw-alias-state-success-primary)", colleague: "#3f51c1", customer: "var(--dsw-alias-state-warn-label)", stranger: "var(--dsw-alias-label-tertiary)", blocked: "var(--dsw-alias-state-error-primary)" };
var s4 = {
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
  const [profiles, setProfiles] = (0, import_react4.useState)([]);
  const [loaded, setLoaded] = (0, import_react4.useState)(false);
  const [err, setErr] = (0, import_react4.useState)("");
  const load = (0, import_react4.useCallback)(async () => {
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
  (0, import_react4.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h1", { style: s4.h, children: "\u5173\u7CFB\u6863\u6848" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { style: s4.sub, children: '\u6309\u5BF9\u8BDD\u8005\u805A\u5408\u89C2\u5BDF / \u63A8\u65AD / \u672A\u95ED\u73AF\u4E8B\u9879\u2014\u2014"\u540C\u4E00\u4E2A\u5BA2\u6237\u7B2C\u4E09\u6B21\u6765\u8BBF\uFF0C\u5B83\u8BB0\u5F97\u524D\u4E24\u6B21"\u9760\u7684\u5C31\u662F\u8FD9\u91CC\u3002\u5F00\u73AF\u7531\u4E3B\u4EBA\u786E\u8BA4\u95ED\u73AF\u3002' }),
    !loaded && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.empty, children: "\u52A0\u8F7D\u4E2D\u2026" }),
    loaded && err !== "" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.empty, children: [
      "\u52A0\u8F7D\u5931\u8D25\uFF1A",
      err
    ] }),
    loaded && err === "" && withRelations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: s4.empty, children: "\u6682\u65E0\u5173\u7CFB\u8BB0\u5F55\u3002\u5206\u8EAB\u4E0E\u8BBF\u5BA2\u7684\u771F\u5B9E\u4EA4\u5F80\u4F1A\u81EA\u52A8\u6C89\u6DC0\u5230\u8FD9\u91CC\uFF08\u89C2\u5BDF \u2192 \u63A8\u65AD\u9700\u4E3B\u4EBA\u786E\u8BA4\u8F6C\u6B63\uFF09\u3002" }),
    withRelations.map((p) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.head, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: s4.name, children: p.entity.displayName || p.entity.id }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { ...s4.roleBadge, background: `${ROLE_COLOR[p.entity.role] ?? "var(--dsw-alias-label-tertiary)"}1a`, color: ROLE_COLOR[p.entity.role] ?? "var(--dsw-alias-label-secondary)" }, children: ROLE_LABEL[p.entity.role] ?? p.entity.role }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: s4.ch, children: p.entity.bindings.map((b) => b.channel).join(" \xB7 ") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { ...s4.ch, marginLeft: "auto" }, children: p.entity.id })
      ] }),
      p.openLoops.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.sec, children: [
          "\u672A\u95ED\u73AF\uFF08",
          p.openLoops.length,
          "\uFF09"
        ] }),
        p.openLoops.map((o) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.loop, children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { style: s4.loopBtn, onClick: () => void closeLoop(o.memoryId), children: "\u6807\u8BB0\u95ED\u73AF" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "t", children: o.content }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: { color: "var(--dsw-alias-label-tertiary)", fontSize: 11, marginLeft: 8 }, children: o.openedAt.slice(0, 10) })
        ] }, o.memoryId))
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.sec, children: [
        "\u89C2\u5BDF / \u63A8\u65AD\uFF08\u6700\u8FD1 ",
        p.observations.length,
        "\uFF09"
      ] }),
      p.observations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { ...s4.item, color: "var(--dsw-alias-label-tertiary)" }, children: "\u6682\u65E0" }),
      p.observations.map((o) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.item, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: s4.ts, children: o.ts.slice(0, 10) }),
        o.kind === "\u63A8\u65AD" && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { style: s4.inferred, children: "\u63A8\u65AD" }),
        o.content
      ] }, o.memoryId))
    ] }, p.entity.id)),
    loaded && err === "" && profiles.length > 0 && withRelations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: s4.empty, children: [
      profiles.length,
      " \u4E2A\u5BF9\u8BDD\u8005\u5DF2\u6CE8\u518C\uFF0C\u4F46\u8FD8\u6CA1\u6709\u5173\u7CFB\u8BB0\u5F55\u3002"
    ] })
  ] });
}

// src/client/shadow.tsx
var import_react5 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var s5 = {
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
  const [stats, setStats] = (0, import_react5.useState)(null);
  const [pending, setPending] = (0, import_react5.useState)([]);
  const [form, setForm] = (0, import_react5.useState)({ visitorInput: "", masterReply: "", twinReply: "" });
  const [msg, setMsg] = (0, import_react5.useState)(null);
  const load = (0, import_react5.useCallback)(async () => {
    const st = await fetch("/dsh-regression/shadow/stats").then((r) => r.json()).catch(() => null);
    if (st?.ok) setStats(st.stats);
    const pd = await fetch("/dsh-regression/shadow/pending").then((r) => r.json()).catch(() => null);
    if (pd?.ok) setPending(pd.pairs);
  }, []);
  (0, import_react5.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h1", { style: s5.h, children: "\u5F71\u5B50\u6D4B\u8BD5" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { style: s5.sub, children: "\u76F2\u6D4B\u534F\u8BAE\uFF1A\u540C\u4E00\u8BBF\u5BA2\u8F93\u5165\uFF0C\u5DE6\u8FB9\u662F\u4E3B\u4EBA\u7684\u771F\u5B9E\u56DE\u590D\u3001\u53F3\u8FB9\u662F\u5206\u8EAB\u7684\u56DE\u590D\u2014\u2014\u4E3B\u4EBA\u9009\u54EA\u53E5\u662F\u81EA\u5DF1\u5199\u7684\u3002\u5206\u8FA8\u4E0D\u51FA\u7387\u8D8A\u9AD8\uFF0C\u8BF4\u660E\u8D8A\u50CF\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.statsRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "n", style: { ...s5.statNum, color: rate === null ? "var(--dsw-alias-label-tertiary)" : rate >= 0.5 ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-warn-label)" }, children: rate === null ? "\u2014" : `${Math.round(rate * 100)}%` }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.statNm, children: "\u5206\u8FA8\u4E0D\u51FA\u7387\uFF0830 \u5929\uFF09" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { ...s5.statNum, color: "#3f51c1" }, children: stats?.samples ?? 0 }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.statNm, children: "\u5DF2\u5224\u5B9A\u6837\u672C" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.statCard, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { ...s5.statNum, color: "var(--dsw-alias-label-tertiary)" }, children: stats?.breakdown["\u672A\u5224\u5B9A"] ?? 0 }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.statNm, children: "\u5F85\u5224\u5B9A" })
      ] })
    ] }),
    pending.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.sec, children: "\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\uFF08\u5224\u5B9A\u540E\u4E0D\u53EF\u66F4\u6539\uFF09" }),
      pending.map((p) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.pair, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.q, children: [
          "\u8BBF\u5BA2\uFF1A",
          p.visitorInput
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { ...s5.reply, ...s5.masterC }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { ...s5.tag, color: "var(--dsw-alias-state-success-primary)" }, children: "\u56DE\u590D A" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("br", {}),
          p.masterReply
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { ...s5.reply, ...s5.twinC }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { style: { ...s5.tag, color: "var(--dsw-alias-state-business-primary)" }, children: "\u56DE\u590D B" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("br", {}),
          p.twinReply
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: s5.btnRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { style: s5.jbtn, onClick: () => void judge(p.id, "\u4E3B\u4EBA"), children: "A \u662F\u6211\u5199\u7684" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { style: s5.jbtn, onClick: () => void judge(p.id, "\u5206\u8EAB"), children: "B \u662F\u6211\u5199\u7684" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { style: s5.jbtn, onClick: () => void judge(p.id, "\u5F03\u6743"), children: "\u5206\u4E0D\u51FA\u6765 / \u8DF3\u8FC7" })
        ] })
      ] }, p.id))
    ] }),
    pending.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.empty, children: "\u6682\u65E0\u5F85\u5224\u5B9A\u76F2\u6D4B\u5BF9\u3002\u76F2\u6D4B\u5BF9\u6765\u81EA\uFF1A\u6388\u6743\u8BED\u6599\u6316\u6398\u540E\u7684\u300C\u5F71\u5B50\u573A\u666F\u300D\uFF0C\u6216 HostRunner \u81EA\u52A8\u751F\u6210\uFF08\u63A5\u5165\u4E2D\uFF09\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.sec, children: "\u624B\u52A8\u6DFB\u52A0\u76F2\u6D4B\u5BF9" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: s5.input, value: form.visitorInput, onChange: (e) => setForm((f) => ({ ...f, visitorInput: e.target.value })), placeholder: "\u8BBF\u5BA2\u8F93\u5165\uFF08\u4F8B\uFF1A\u4F60\u4EEC\u4EC0\u4E48\u65F6\u5019\u80FD\u7ED9\u65B9\u6848\uFF1F\uFF09" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: s5.input, value: form.masterReply, onChange: (e) => setForm((f) => ({ ...f, masterReply: e.target.value })), placeholder: "\u4E3B\u4EBA\u7684\u771F\u5B9E\u56DE\u590D" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { style: s5.input, value: form.twinReply, onChange: (e) => setForm((f) => ({ ...f, twinReply: e.target.value })), placeholder: "\u5206\u8EAB\u7684\u56DE\u590D" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { style: s5.btn, onClick: () => void addPair(), children: "\u6DFB\u52A0" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { style: s5.ghost, onClick: () => void load(), children: "\u5237\u65B0" }),
    msg && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { ...s5.hint, color: msg.ok ? "var(--dsw-alias-state-success-primary)" : "var(--dsw-alias-state-error-primary)" }, children: msg.text }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: s5.hint, children: "\u9690\u79C1\uFF1A\u76F2\u6D4B\u5BF9\u4EC5\u672C\u5730\u5B58\u50A8\uFF080600\uFF09\uFF1B\u7EDF\u8BA1\u53EA\u843D\u6307\u6807\u4E0D\u843D\u539F\u6587\uFF1B\u5DF2\u5224\u5B9A\u4E14\u8D85 90 \u5929\u7684\u5BF9\u81EA\u52A8\u6E05\u7406\u3002" })
  ] });
}

// src/client/twin-hub.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var SUB_TABS = [
  { id: "todo", label: "\u4ECA\u65E5\u5F85\u529E" },
  { id: "learning", label: "\u5B66\u4E60\u961F\u5217" },
  { id: "profiles", label: "\u5173\u7CFB\u6863\u6848" },
  { id: "shadow", label: "\u5F71\u5B50\u6D4B\u8BD5" }
];
var s6 = {
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
      { name: "conversation.view", id: "twin-hub", order: 21, label: () => "\u6570\u5B57\u5206\u8EAB" },
      TwinHubPage
    )
  );
}
function TwinHubPage() {
  const [tab, setTab] = (0, import_react6.useState)("todo");
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: s6.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { style: s6.tabBar, children: SUB_TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      "button",
      {
        style: tab === t.id ? s6.tabBtnOn : s6.tabBtn,
        onClick: () => setTab(t.id),
        children: t.label
      },
      t.id
    )) }),
    tab === "todo" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(DashboardPage, {}),
    tab === "learning" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(LearningPage, {}),
    tab === "profiles" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ProfilesPage, {}),
    tab === "shadow" && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ShadowPage, {})
  ] });
}

// src/client/index.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
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
  applyCards(ctx);
  applyTwinHub(ctx);
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
  const [state, setState] = (0, import_react7.useState)("checking");
  (0, import_react7.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
    "div",
    {
      style: (
        // 本组件在模块作用域，够不到 TwinSettingsPage 内部的样式对象 s——内联等价样式
        // （historical s.hint + marginTop）。此前引用 s.hint 是 ReferenceError，监控 Tab 必崩。
        {
          fontSize: 12,
          color: "var(--dsw-alias-label-tertiary)",
          background: "var(--dsw-alias-bg-layer-1)",
          border: "1px solid #eee",
          borderRadius: 6,
          padding: "8px 10px",
          marginTop: 8
        }
      ),
      children: [
        "\u6A21\u578B\u964D\u7EA7\u94FE\uFF1A",
        state === "ok" && "\u5DF2\u914D\u7F6E\uFF08\u5957\u9910\u8D85\u9650/\u4F59\u989D\u4E0D\u8DB3\u65F6\u6309\u94FE\u81EA\u52A8\u5207\u6362\uFF0C\u7A97\u53E3\u91CD\u7F6E\u81EA\u52A8\u5207\u56DE\uFF09",
        state === "unconfigured" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_jsx_runtime7.Fragment, { children: "\u672A\u914D\u7F6E\u2014\u2014\u5206\u8EAB\u5728\u6A21\u578B\u5957\u9910\u8D85\u9650\u65F6\u4F1A\u76F4\u63A5\u62A5\u9519\u3002\u5EFA\u8BAE\u5728\u300C\u8BBE\u7F6E \u2192 \u6A21\u578B\u5207\u6362\u300D\u914D\u7F6E\u964D\u7EA7\u94FE\u3002" }),
        state === "checking" && "\u68C0\u6D4B\u4E2D\u2026"
      ]
    }
  );
}
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
  const [cfg, setCfg] = (0, import_react7.useState)(emptyConfig);
  const [loaded, setLoaded] = (0, import_react7.useState)(false);
  const [saving, setSaving] = (0, import_react7.useState)(false);
  const [status, setStatus] = (0, import_react7.useState)("");
  const [toolHint, setToolHint] = (0, import_react7.useState)("");
  const [stats, setStats] = (0, import_react7.useState)(null);
  const [history, setHistory] = (0, import_react7.useState)([]);
  const [monitor, setMonitor] = (0, import_react7.useState)(null);
  const [tab, setTab] = (0, import_react7.useState)("persona");
  const load = (0, import_react7.useCallback)(async () => {
    try {
      const d = await api3("/dsh-twin/config", "GET");
      if (d.ok && d.config) {
        setCfg({ ...emptyConfig, ...d.config });
        const t = d.config.template;
        setToolHint(PRESETS.find((p) => p.id === t)?.toolHint ?? "");
      }
    } catch {
    }
    try {
      const s8 = await api3("/dsh-twin/stats", "GET");
      if (s8.ok && s8.stats) setStats(s8.stats);
    } catch {
    }
    try {
      const h = await api3("/dsh-twin/history", "GET");
      if (h.ok && h.history) setHistory(h.history);
    } catch {
    }
    try {
      const m = await api3("/dsh-twin/monitor", "GET");
      if (m.ok && m.monitor) setMonitor(m.monitor);
    } catch {
    }
    setLoaded(true);
  }, []);
  (0, import_react7.useEffect)(() => {
    load();
  }, [load]);
  async function restoreVersion(index) {
    if (!window.confirm("\u786E\u5B9A\u8981\u6062\u590D\u5230\u8BE5\u5386\u53F2\u7248\u672C\u5417\uFF1F\u5F53\u524D\u300C\u5206\u8EAB\u8BBE\u7F6E\u300D\u914D\u7F6E\u4F1A\u88AB\u66FF\u6362\u3002")) return;
    const d = await api3("/dsh-twin/history/restore", "POST", { index });
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
    const hasInput = cfg.identity.name.trim() !== "" || cfg.identity.role.trim() !== "" || cfg.identity.background.trim() !== "" || cfg.persona.style.trim() !== "" || cfg.persona.values.trim() !== "" || cfg.persona.rules.trim() !== "" || cfg.persona.escalation.trim() !== "" || cfg.persona.avoid.trim() !== "" || (cfg.knowledge?.seeds ?? []).some((s8) => s8.trim() !== "");
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
      const d = await api3("/dsh-twin/config", "POST", cfg);
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
  const [preview, setPreview] = (0, import_react7.useState)(null);
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
    let exported = cfg;
    try {
      const d = await api3("/dsh-twin/config", "GET");
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
        const d = await api3("/dsh-twin/config", "POST", { ...emptyConfig, ...data });
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
  const s7 = {
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
  const setI = (k, v) => setCfg((prev) => ({ ...prev, identity: { ...prev.identity, [k]: v } }));
  const setP = (k, v) => setCfg((prev) => ({ ...prev, persona: { ...prev.persona, [k]: v } }));
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.wrap, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h1", { style: s7.h, children: "\u6570\u5B57\u5206\u8EAB\u8BBE\u7F6E" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { style: s7.sub, children: "\u914D\u7F6E\u4F60\u7684\u6570\u5B57\u5206\u8EAB\uFF1A\u6A21\u677F / \u4EBA\u683C / \u77E5\u8BC6\u3002\u4FDD\u5B58\u540E\u7ACB\u5373\u751F\u6548\uFF08\u4EBA\u683C\u6CE8\u5165\u63D0\u793A\u8BCD\u3001\u77E5\u8BC6\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\uFF09\u3002\u63D2\u4EF6\u662F\u7EAF\u6846\u67B6\uFF0C\u4EBA\u683C\u662F\u6570\u636E\uFF0C\u53EF\u5BFC\u5165\u5BFC\u51FA\u968F\u8EAB\u643A\u5E26\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.tabBar, children: [["persona", "\u4EBA\u683C"], ["knowledge", "\u77E5\u8BC6"], ["monitor", "\u76D1\u63A7"], ["history", "\u5386\u53F2"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { style: tab === id ? s7.tabOn : s7.tab, onClick: () => setTab(id), children: label }, id)) }),
    tab === "persona" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.secTitle, children: "\u6A21\u677F\u9884\u8BBE" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.templateGrid, children: PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: cfg.template === p.id ? { ...s7.templateCard, ...s7.templateCardOn } : s7.templateCard, onClick: () => applyPreset(p.id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.templateName, children: p.label }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.templateDesc, children: p.desc }),
        cfg.template === p.id && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.templateCheck, children: "\u2713 \u5DF2\u9009" })
      ] }, p.id)) }),
      toolHint && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.hint, children: [
        "\u{1F6E1}\uFE0F ",
        toolHint
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.secTitle, children: "\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u540D\u5B57" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { style: s7.input, value: cfg.identity.name, onChange: (e) => setI("name", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5C0F D" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u8EAB\u4EFD\u5B9A\u4F4D" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { style: s7.input, value: cfg.identity.role, onChange: (e) => setI("role", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u79C1\u4EBA\u52A9\u7406 / \u7814\u53D1\u52A9\u624B / \u4E13\u5BB6\u987E\u95EE" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u80CC\u666F" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.identity.background, onChange: (e) => setI("background", e.target.value), placeholder: "\u4F60\u662F\u8C01\u3001\u61C2\u4EC0\u4E48\u3001\u670D\u52A1\u8C01\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.hint, children: "\u{1F512} \u4EC5\u6CE8\u5165\u4F60\u81EA\u5DF1\u7684\u4F1A\u8BDD\uFF1B\u8BBF\u5BA2\u4F1A\u8BDD\u4E0D\u542B\u6B64\u5185\u5BB9\u3002\u53EF\u5199\u79C1\u5BC6\u4E8B\u5B9E\uFF08\u65E5\u7A0B\u3001\u9879\u76EE\u3001\u5BB6\u5EAD\u5B89\u6392\u7B49\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u8BED\u6C14" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.chipRow, children: TONES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { style: cfg.persona.tone === t.id ? s7.chipOn : s7.chip, onClick: () => setP("tone", t.id), children: t.label }, t.id)) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u98CE\u683C\u8865\u5145" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.persona.style, onChange: (e) => setP("style", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5148\u7ED9\u7ED3\u8BBA\u518D\u7ED9\u4F9D\u636E / \u522B\u7528\u592A\u4E13\u4E1A\u7684\u9ED1\u8BDD\u2026" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u4EF7\u503C\u89C2\u4E0E\u539F\u5219" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.persona.values, onChange: (e) => setP("values", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4EE5\u4E3B\u4EBA\u5229\u76CA\u4E3A\u5148\uFF1B\u8BDA\u5B9E\u6709\u636E\u3001\u4E0D\u7F16\u9020\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.hint, children: "\u26A0 \u4F1A\u6CE8\u5165\u6240\u6709\u4F1A\u8BDD\uFF08\u542B\u8BBF\u5BA2\uFF09\u2014\u2014\u5206\u8EAB\u5BF9\u4EFB\u4F55\u4EBA\u90FD\u575A\u5B88\u8FD9\u91CC\u7684\u539F\u5219\u3002\u53EA\u5199\u884C\u4E3A\u51C6\u5219\uFF0C\u52FF\u5199\u673A\u5BC6\uFF08\u673A\u5BC6\u8BF7\u5199\u5728\u4E0A\u65B9\u300C\u80CC\u666F\u300D\uFF0C\u4EC5\u4F60\u81EA\u5DF1\u7684\u4F1A\u8BDD\u53EF\u89C1\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u51B3\u7B56\u4E0E\u505A\u4E8B\u65B9\u5F0F" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.persona.rules, onChange: (e) => setP("rules", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u5148\u542C\u6E05\u9700\u6C42\u518D\u884C\u52A8\uFF1B\u80FD\u4EE3\u529E\u7684\u4EE3\u529E\uFF0C\u4E0D\u786E\u5B9A\u7684\u5148\u786E\u8BA4\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u8FB9\u754C\u4E0E\u8F6C\u4EBA\u5DE5" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.persona.escalation, onChange: (e) => setP("escalation", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u6D89\u53CA\u91D1\u94B1/\u5BF9\u5916\u627F\u8BFA/\u5BF9\u5916\u53D1\u5E03\u65F6\u8F6C\u4E3B\u4EBA\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u7981\u5FCC" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("textarea", { style: s7.textarea, value: cfg.persona.avoid, onChange: (e) => setP("avoid", e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u4E0D\u64C5\u81EA\u5BF9\u5916\u627F\u8BFA\u3001\u4E0D\u66FF\u4E3B\u4EBA\u505A\u4E3B\u51B3\u5B9A\u3002" })
    ] }),
    tab === "knowledge" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.secTitle, children: "\u77E5\u8BC6\uFF08\u5171\u4EAB\u8BB0\u5FC6\u79CD\u5B50\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("label", { style: s7.label, children: "\u8BB0\u5FC6\uFF08\u6BCF\u884C\u4E00\u6761\uFF09" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "textarea",
        {
          style: { ...s7.textarea, minHeight: "80px" },
          value: (cfg.knowledge?.seeds ?? []).join("\n"),
          onChange: (e) => setCfg((prev) => ({ ...prev, knowledge: { seeds: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })),
          placeholder: "\u4F8B\u5982\uFF1A\n\u6211\u662F\u67D0\u516C\u53F8\u7814\u53D1\u8D1F\u8D23\u4EBA\n\u6211\u4EEC\u9879\u76EE\u7528 TypeScript\n\u6BCF\u5468\u4E94\u4E0B\u5348\u5F00\u5468\u4F1A"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { style: { ...s7.ghost, display: "inline-block", marginTop: "8px" }, children: [
        "\u5BFC\u5165\u77E5\u8BC6\u6587\u4EF6(.txt/.md)",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { type: "file", accept: ".txt,.md,.markdown,text/plain", style: { display: "none" }, onChange: handleImportKnowledge })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { ...s7.hint, marginTop: 10 }, children: "\u6B64\u5904\u7F16\u8F91\u7684\u662F\u300C\u79CD\u5B50\u300D\uFF1B\u4FDD\u5B58\u540E\u5199\u5165\u5171\u4EAB\u8BB0\u5FC6\u5E93\u3002\u8981\u67E5\u770B / \u7F16\u8F91 / \u5220\u9664\u5DF2\u5165\u5E93\u7684 \u5355\u6761\u8BB0\u5FC6\uFF08\u542B\u5206\u8EAB\u5BF9\u8BDD\u4E2D\u6C89\u6DC0\u7684\u8BB0\u5FC6\uFF09\uFF0C\u8BF7\u5230\u5DE6\u4FA7\u300C\u8BB0\u5FC6\u300D\u6807\u7B7E\u9875\uFF08dsh-memory \u63D0\u4F9B\uFF09\u3002" })
    ] }),
    tab === "monitor" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.secTitle, children: "\u8FD0\u884C\u76D1\u63A7" }),
      monitor ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.hint, children: [
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
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("br", {}),
        "Tokens\uFF1A\u8F93\u5165 ",
        monitor.tokens.input,
        " \xB7 \u8F93\u51FA ",
        monitor.tokens.output,
        " \xB7 \u7F13\u5B58\u8BFB ",
        monitor.tokens.cacheRead,
        " \xB7 \u7F13\u5B58\u5199 ",
        monitor.tokens.cacheWrite
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.hint, children: "\u6682\u65E0\u76D1\u63A7\u6570\u636E\uFF08\u4F7F\u7528\u5206\u8EAB\u4F1A\u8BDD\u540E\u51FA\u73B0\uFF09\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(FailoverCard, {})
    ] }),
    tab === "history" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.secTitle, children: "\u5386\u53F2\u7248\u672C" }),
      history.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.hint, children: [
        "\u6700\u8FD1 ",
        history.length,
        " \u4E2A\uFF1A",
        history.map((v) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { style: { ...s7.ghost, padding: "2px 8px", fontSize: "12px", margin: "0 4px 4px 0" }, onClick: () => restoreVersion(v.index), children: [
          "\u6062\u590D ",
          new Date(v.ts).toLocaleString()
        ] }, v.index))
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.hint, children: "\u6682\u65E0\u5386\u53F2\u7248\u672C\uFF08\u4FDD\u5B58\u8FC7\u300C\u5206\u8EAB\u8BBE\u7F6E\u300D\u4F1A\u751F\u6210\uFF09\u3002" })
    ] }),
    stats && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.hint, children: [
      "\u72B6\u6001\uFF1A\u8BB0\u5FC6 ",
      stats.memoryTotal,
      " \u6761",
      stats.memoryTotal > 0 ? `\uFF08${Object.entries(stats.memoryTypes).map(([k, v]) => `${k}\xD7${v}`).join("\uFF0C")}\uFF09` : "",
      " \xB7 \u4EBA\u683C",
      stats.hasPersona ? "\u5DF2\u914D\u7F6E" : "\u672A\u914D\u7F6E"
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { style: { ...s7.hint, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        "input",
        {
          type: "checkbox",
          checked: cfg.becomeDefaultPreset === true,
          onChange: (e) => setCfg((prev) => ({ ...prev, becomeDefaultPreset: e.target.checked }))
        }
      ),
      "\u628A\u300C\u6570\u5B57\u5206\u8EAB\u300D\u8BBE\u4E3A\u9ED8\u8BA4 agent \u9884\u8BBE"
    ] }),
    cfg.becomeDefaultPreset === true && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: { ...s7.hint, color: "var(--dsw-alias-state-warn-label)" }, children: "\u26A0 \u52FE\u9009\u540E\u6240\u6709\u65B0\u4F1A\u8BDD\uFF08\u542B\u4F60\u81EA\u5DF1\u7684\u65E5\u5E38\u5DE5\u4F5C\u4F1A\u8BDD\uFF09\u90FD\u5C06\u4F7F\u7528 conversation-first \u5206\u8EAB\u9884\u8BBE\uFF08\u65E0 shell / \u6587\u4EF6\u7CFB\u7EDF\u76F4\u64CD\u5DE5\u5177\uFF09\u3002\u82E5\u4F60\u4E3B\u8981\u5728\u7F51\u9875\u7AEF\u505A\u5F00\u53D1\u5DE5\u4F5C\uFF0C \u5EFA\u8BAE\u4E0D\u52FE\u9009\uFF0C\u6539\u4E3A\u5728\u300C\u624B\u673A\u8FDE\u63A5 \u2192 im-channel \u8BBE\u7F6E\u300D\u91CC\u914D\u7F6E agentPreset: digital-twin\uFF0C \u53EA\u8BA9\u4F01\u5FAE\u4F1A\u8BDD\u8D70\u5206\u8EAB\u4EBA\u683C\u3002" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { style: s7.row, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { style: s7.btn, disabled: !loaded || saving, onClick: handleSave, children: saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u4FDD\u5B58\u5E76\u751F\u6548" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { style: s7.ghost, onClick: handlePreviewToggle, children: preview ? "\u6536\u8D77\u9884\u89C8" : "\u9884\u89C8\u6CE8\u5165\u7684\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { style: s7.ghost, onClick: handleExport, children: "\u5BFC\u51FA\u4EBA\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { style: s7.ghost, children: [
        "\u5BFC\u5165\u4EBA\u683C",
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { type: "file", accept: "application/json", style: { display: "none" }, onChange: handleImport })
      ] })
    ] }),
    preview && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("pre", { style: { ...s7.hint, whiteSpace: "pre-wrap", background: "rgba(127,127,127,0.12)", padding: 10, borderRadius: 8, maxHeight: 260, overflow: "auto" }, children: [
      preview.persona || "\uFF08\u4EBA\u683C\u4E3A\u7A7A\uFF1A\u540D\u5B57/\u98CE\u683C\u7B49\u5B57\u6BB5\u5168\u7A7A\u65F6\u4E0D\u6CE8\u5165\u4EBA\u683C\u6BB5\uFF09",
      preview.guard ? `

${preview.guard}` : ""
    ] }),
    status && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { style: s7.status, children: status })
  ] });
}
		return module.exports;
	}
});
//# sourceMappingURL=client.js.map
