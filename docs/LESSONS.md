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
- 【已实施，方案与当初设想不同】双视图最终用 **noteActor + WeakMap** 实现：
  dsh-twin 服务暴露 `noteActor(agentCtx, { isMaster })`，im-channel driver 在
  agent setup 里标注，section 的 text 回调从 WeakMap 取角色（键 = agentCtx，
  与框架 `composedPreset(agent.ctx)` 的取法一致）。
- 【v0.2.0 起 fail-closed】视图判定收进 `resolveGuestView`：装了 im-channel 而
  会话未被标注 → 按访客视图（宁可少注入 background，不可泄露给无法证明身份的
  对话者）；未装 im-channel 的纯网页部署按主人视图（否则 background 永久丢失）。
  当初设想的 `mountPersonaSection` 按角色挂载方案未采用——全局 section +
  WeakMap 已够用，且少一处跨仓库接口。

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

## 11. 插件自有 HTTP 路由不在上游认证围栏内（exact 优先于 prefix）
- 教训：dsh v0.1.2 起 web 界面对 `/`（index）与 `/api` 前缀做一次性 token 认证，
  但 webserver 的路由匹配是「先查 exact 表，未命中再查最长 prefix」——把插件
  路由注册成 `/api/...` 的 **exact** 路由会抢在认证围栏前面被直接应答，既拿不到
  认证保护也不是"继承围栏"。围栏内的正确注册途径是 connection 的 fetch 注册表
  （`ctx.connection` / rpc intercept），接口版本敏感。
- 现状（dsh-twin / dsh-model-failover 同）：插件写端点自行做 sameOrigin CSRF +
  content-type/体积限制；**GET 端点在 LAN 暴露场景可被未认证读取**。敏感部署
  不要把端口暴露到局域网之外，等上游提供面向插件的认证注册途径。

## 12. agent 预设里的插件行是硬引用：行引用的包未安装 = 整份组合不可挂载
- 教训：上游 agent-presets 的 discovery 把无法解析的行判为组合问题
  （"row … names a plugin that cannot be resolved"）。预设本体里**不能写死可选
  依赖的工具行**（dsh-twin 曾无条件写 tool-memory，未装 dsh-memory 的机器上
  预设直接挂不了，"可拔插"卖点失效）。
- 正确做法：可选依赖的工具行由宿主端在**物化时**探测安装状态再逐行追加
  （`materializePreset` 的 optionalRows），装了才有行；同时给预设本体加
  `PRESET_VERSION` 递增，让存量用户拿到修正后的组合。

## 13. link: 安装下 `createRequire(import.meta.url).resolve()` 探测同伴插件必然失败
- 教训：pnpm `link:` 安装时，`import.meta.url` 经 symlink 解析到**源码仓库真实
  路径**，node resolve 从那里向上找 `node_modules`——永远到不了安装位置
  （`$DSH_HOME/profiles/<名>/node_modules`）里平级摆放的同伴包。于是
  「resolve 失败 = 未安装」的判断在开发机上恒为 false：已装 dsh-memory 却
  不追加 tool-memory 行，分身对话退化成用文件工具模拟记忆（真实事故，
  2026-09 端到端功能测试才暴露）。
- 正确做法：resolve 失败后再按**安装布局**做存在性探测兜底
  （`installedInHome()`：`$DSH_HOME/node_modules/<pkg>` 与
  `$DSH_HOME/profiles/*/node_modules/<pkg>` 任一存在即视为已安装）；
  探测逻辑修复要伴随 `PRESET_VERSION` 递增，否则存量 stamp 相同不会重物化。
- 附带坑：块注释里写 `profiles/*/node_modules` 会被 `*/` 提前终止注释，
  esbuild 报「Expected \";\" but found \"）\"」类语法错误；注释里避免 `*/` 字面量。
- 测试面：会话内记忆条目**不会自动注入上下文**，靠 memory_read 主动检索；
  对分身说「不用查，凭记忆回答」这类措辞会抑制工具调用——验收记忆功能时
  直接问事实，或明确要求「到记忆库里查」。

## 14. dsh 运行中重建 lib 会触发热重载竞态，可能用旧代码重物化预设
- 教训：`patchReload: live` 下，运行中的 dsh 监听插件包文件变化。`tsc -b`
  逐文件输出 lib 的过程中，热重载可能在**构建中间态**加载到旧版本号的
  index.js，随即执行 `materializePreset()`：版本号比对认为「需要重物化」，
  却用**旧探测逻辑**重写预设——刚修好的 tool-memory 行被抹掉（真实事故，
  2026-09 重建 lib 后生产 yml 丢工具行，.bak 里才找到好状态）。
- 正确做法：要么先停 dsh 再构建；要么构建后**删版本戳**
  （`.agent-presets/digital-twin/.materialized-version`）强制下次启动按新
  lib 重物化。install-all.bat 现在每次安装后都删戳，天然防护。
- 附带坑：裸跑插件 lib 的函数（如 materializePreset）时，进程没有
  DSH_HOME 环境变量会回落 `~/.dsh`——**写错 home**。务必显式
  `DSH_HOME=<desktop home>` 再跑；install-all.bat 的 DSH_HOME 自动定位
  （desktop home → ~/.dsh）就是为了这个。
