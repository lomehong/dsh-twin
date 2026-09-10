# dsh-twin（@dsh-extra/dsh-twin）— service-knowledge 系统层

**定位**：把「数字分身」收敛成单个可拔插、可移植的 cordis 插件包——插件=纯框架，人格=数据；人格经四张卡投影注入 system prompt，知识种子写入 dsh-memory。

**结构速览**：
- `src/`：宿主端 TypeScript——`index.ts`（预设物化 / twin·twin-guard·twin-activity 三段注入 / dsh-twin 服务与 /dsh-twin/* 路由 / timer 调度）、`cards.ts`（四张卡）、`projection.ts`（纯函数双视图投影）、`learning.ts`（学习闭环）、`drafts.ts`（样例候选池）、`proactive.ts`（状态卡汇入+主动触达）、`tools.ts`（escalate_to_owner）、`activity.ts`（看板活动区段）、`sanitize.ts`+`built-in-fields.ts`（归一化/内置身份字段）；`src/client/`：分身设置向导与「数字分身」主面板（tsx）。
- `presets/digital-twin/`：内置 agent 预设（agent.cordis.yml+preset.yml），首启版本化物化到 `$DSH_HOME/.agent-presets/digital-twin/`，可选依赖工具行探测到已安装才追加。

**.knowledge/ 索引**：
- `role.yaml` — 本仓在套件中的角色与能力清单（含回源）
- `interfaces.yaml` — 服务/模型工具/HTTP/客户端面板/事件/预设接口
- `dependencies.yaml` — 消费与被消费关系及降级语义
- `constraints.yaml` — 状态机、红线、测试入口与兼容性备注

**状态语义**：status: 待审核 = 未经主人确认，引用前请自行回源各条 sources。

**红线指针**：改动前先读 `E:\Development\Code\nodejs\digital-twin\docs\suite-charter.md`（套件宪章）；本仓 `GUARD_TEXT`（src/index.ts）守卫纪律是全分身会话的行为约束层，改它属高风险变更。

**构建与测试**：`npm run build`（tsc -b + esbuild 重建 lib/client.js）；`npm test`（vitest run，直跑 src/*.ts，DSH_HOME 隔离临时目录）；`npm run typecheck`（tsc -b --noEmit，exactOptionalPropertyTypes）；CI 另跑 `node scripts/audit-pack.mjs`（.github/workflows/ci.yml）。
