# 经验教训（LESSONS LEARNED）

本文件记录 dsh 数字分身（dsh-twin / im-channel / dsh-memory）开发中**踩过的坑**，供后续迭代引用，避免重犯。

## 1. schemastery 的 `z` 没有 `.enum()`
- 教训：dsh 插件用 `@deepseek-ai/schemastery`，它的 `z.enum()` **不存在**（那是 zod）。
  它是用 `z.union([...])` 表示枚举（im-channel 的 `KindUnion = z.union(['feishu','wechat','wecom'])` 即如此）。
- 后果：给 im-channel 加 `approval` 字段时写了 `z.enum(['ask','never'])` → **im-channel 加载即崩**（`z.enum is not a function`）→ 整个 harness 启动失败。
- 正确写法：`z.union(['ask','never']).default('ask')`。

## 2. 宿主 bundle 的 `apply()` 抛错 = 整个 harness fatal 崩溃
- 教训：bundle 的 `apply()` 是宿主组合的关键路径，**任何同步抛错**都会让 profile 启动失败（`fatal load failure`）。
- 所以 `apply()` 内的每一个副作用都要 defensively 处理：**同步的用 try/catch，异步的必须 `await` + `.catch()`**，绝不能让它冒泡。
  （dsh-twin 就是这么修的：`materializePreset`、人格注入 section、`ctx.provide` 全部 try/catch。）

## 3. `settings.update('agent-presets', ...)` 在命名空间未注册时会异步 reject → 崩溃
- 教训：`settings` 服务的命名空间（如 `agent-presets`）由 dsh-agent-presets 服务注册，**可能晚于本插件 apply**。
  对其调用 `update` 会以 rejected promise 抛 `settings namespace "agent-presets" is not registered`；加载期未 await/未捕获会被 cordis 归因为 fatal。
- 正确做法：
  - 先探测注册：`settings.get(ns) === undefined`（get 对未注册命名空间返回 undefined，**不抛**）；
  - 判断「用户是否选过」用 `settings.section(ns)` 读**原始用户层**（resolved 值恒有 composition base 兜底永远非空）；
  - `await settings.update(...)` 并 `.catch(...)`；必要时轮询等待。

## 4. 安装 dsh 插件：用 `dsh plugin --profile <名> add <spec>`，不是手改 package.json
- 教训：`dsh plugin add` 会调用 pnpm 并按**安装后的状态** reconcile `dsh.profile.bundles`（依赖声明了 `dsh.bundle.patch` 就自动入层），更稳。
- 手改 `profiles/web/package.json` + `pnpm install` 是等价的硬做，但不规范，还会遇到 `file:` 依赖缓存导致拷贝不更新。
- 相对路径安装会在调用目录解析（`./dsh-twin`）。

## 5. 桌面版 dsh 的 pnpm 不在 PATH
- 教训：桌面版把 pnpm 打包在 `...\resources\harness\node_modules\pnpm\bin\pnpm.mjs`，**不在 PATH**。
- 所以 `dsh plugin add`（内部 `spawnSync('pnpm')`）会 `ENOENT`；需用打包的 pnpm：`node <pnpm.mjs> <args>`。

## 6. 插件仓库必须带 README + .gitignore
- 教训：发布插件仓库要有 README（用途/安装/使用/可移植性/开发/目录结构）；`.gitignore` 排除
  `node_modules/`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`*.tsbuildinfo`（保留 `lib/` 构建产物以便 git 安装无需构建）。
- 缺少 README 会让用户觉得不专业。

## 7. 改上游仓库的已装 lib 只在安装副本生效
- 教训：直接改 `node_modules/@dsh-extra/<上游包>/lib`（如 im-channel）只在**本机安装副本**生效，
  **重装/更新会被覆盖**。要持久，须把改动**收进上游仓库**（fork/patch/PR）。
- 改上游前先确认它的依赖/API（第 1 条就是反例）。

## 8. systemPrompt.section 的 text 回调里拿不到「对话者身份」
- 教训：`AssembleContext` 只有 `scope` 和 `signal` 两个字段（dsh-system-prompt 类型原文），
  **没有 user/actor/session 信息**。想在人格段里区分主人/访客（双视图人格），
  在 section 的 text 回调里做不到。
- 既定模式是「驱动器挂载时带身份」：im-channel driver 在 agent setup 里显式调
  `mountSharedMemory(agentCtx, userId, isMaster)`——按角色注入必须走同一条路。
- 双视图的正确实现路径（未实施）：im-channel driver 在 setup 里调用 dsh-twin 服务
  的钩子（如 `twin.mountPersonaSection(agentCtx, { isMaster })`）按角色挂载人格段，
  同时 dsh-twin 全局 section 需退位避免双人格。跨仓库改动 + 需真机 IM 回归验证。

## 9. peerDependencies 版本范围对 rc 包必须是 rc 可满足的
- 教训：`">=0.1.0"` 对 registry 上的 `0.1.0-rc.x` **不可满足**（semver 里 prerelease
  小于正式版），裸 `npm install` 直接 notarget 失败。
- 正确写法：`">=0.1.0-rc.0"` 这类 rc 起点范围；仓库再加 `.npmrc` 的
  `legacy-peer-deps=true`（工作区惯例）双保险。

## 10. 写测试不必等 TS 迁移：直接对 ESM 构建产物测
- 教训：vitest 可以直接 `import '../lib/index.js'`（ESM JS），配合每个用例把
  `DSH_HOME` 设到 `mkdtempSync` 临时目录隔离，就能对宿主端全量行为（持久化/原子写/
  版本化/纯函数）建立回归保护。
- TS 迁移因此可以放慢节奏单独做，不被"没有测试就不敢重构"绑架。
