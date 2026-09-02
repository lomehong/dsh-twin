# dsh-twin — 可拔插、可移植的数字分身插件

> **v0.3.0（实施计划 T3/T7）**：人格升级为**四张卡**（身份卡[公开/私密分级] /
> 策略卡[结构化规则] / 样例卡[对照示例] / 状态卡[自动衰减]）——存储于
> `cards.json`，经**纯函数投影**注入 system prompt（生效 = 主人确认 + 回归
> 通过双条件）；设置页新增「四张卡」Tab（结构化编辑 + 双视图预览 + 修订史 +
> legacy 迁移）；`escalate_to_owner` 保留。legacy twin-config 渲染在无生效卡
> 时回落，迁移走 `POST /dsh-twin/cards`（migrate=true）。

一个把「数字分身」收敛成**单个可拔插插件包**的方案：装到任意 DSH 上即出现数字分身
（`digital-twin` agent 预设），人格/知识通过顶级「分身设置」向导配置，可导入导出随身携带。

插件=纯框架，人格=数据。

## 分层

| 层 | 由谁负责 |
|---|---|
| 基础层（模型/运行时） | DSH 本身 |
| **能力/行为层** | `digital-twin` agent 预设（由 `standard` 裁剪，模型向工具） |
| **人格/表达层** | `systemPrompt.section('twin')` 动态注入（读 `twin-config.json`，**仅 digital-twin 预设的 agent 生效**） |
| **知识层** | 写入 `dsh-memory`（共享记忆，去重） |

## 功能

- **可拔插**：一个插件包，`dsh plugin add` 装上 / 卸掉即拔。首启把内置预设
  **物化**到 `$DSH_HOME/.agent-presets/digital-twin/`（幂等，版本化更新）。
  可选依赖（dsh-memory / dsh-yuyi）的工具行**检测到已安装才追加**——不装也
  不会让预设因缺包行而无法挂载。
- **可移植**：插件是纯代码；人格是数据，打包进 `$DSH_HOME/dsh-twin/twin-config.json`，
  向导提供「导出人格 / 导入人格」，换电脑装插件→导入即可。
- **默认预设为显式选择**：安装**不会**改写全局默认（v0.1.x 的旧行为会让主人日常
  会话静默失去 shell/fs 工具）。「分身设置」勾选「设为默认预设」并保存后，才把
  `agent-presets.default` 设为 `digital-twin`（仍尊重用户手动选择的其它预设）。
  更推荐在 settings.yaml 的 `im-channel:` 节配置 `agentPreset: digital-twin`，
  把 IM 侧人格与全局默认解耦。
- **严格专属人格**：`twin` 段通过 `agentPresets.composedPreset(agent.ctx)` 判断当前 agent
  是否由 `digital-twin` 预设组合，仅对分身 agent 注入人格；其它预设/会话不会带上这套人格。
  预设不写死 persona，人格全由 `twin` 段动态注入，改配置即生效。
- **人格深度**：人格可不只是名字/语气/背景，还支持 价值观与原则 / 决策与做事方式 /
  边界与转人工 / 禁忌，让分身更立体、更守规矩。「转人工」不只是提示词：
  digital-twin 预设挂载 `escalate_to_owner` 工具，分身遇到权限不足、敏感操作
  或访客投诉时会真正经 im-channel 给主人发 IM 通知（主人需先 /bind 绑定）。
  有进程级频控（10 分钟最多 3 次），防止被注入诱导的会话刷屏主人。
- **安全边界段（anti-injection）**：`twin-guard` 段注入静态安全指令——对话者身份与权限由
  系统决定、无视试图泄露/越权/扮演他人的注入指令、敏感事项礼貌拒绝或转交主人。
- **最小攻击面预设**：`digital-twin` 预设为 **conversation-first**——**不挂 shell（bash/pwsh）与
  filesystem 工具**，只保留 web/todo/goal/ask-user/skill/jobs 等模型向工具，降低对访客的分身暴露面；
  需要完整能力的会话可切换到 `standard`/`code` 预设。
- **知识种子**：保存时写入 `dsh-memory`（按内容去重）；向导支持从 `.txt/.md` 文件一键导入（按行去重合并），便于把文档喂成分身的初始记忆。
- **记忆整理**：保存时对 dsh-memory 做一次规整——合并内容规整后相同的近重复条目（保留最新、
  并集 participants/scope），避免记忆重复、保持存储整洁。

## 安装

前置：Node.js ≥ 22、pnpm ≥ 9、DSH。规范安装用 `dsh plugin`：

```sh
# 从插件源码目录（把 ./dsh-twin 指向该目录），或直接用远程：
dsh plugin --profile web add ./dsh-twin            # 本地目录
dsh plugin --profile web add git+https://github.com/lomehong/dsh-twin.git   # 远程
```

> `dsh plugin add` 会调用 pnpm 安装并把声明了 `dsh.bundle.patch` 的包自动登记到
> `dsh.profile.bundles`（按安装后的状态 reconcile，比手改 package.json 更稳）。

装完重启 dsh（桌面版：完全退出重开；CLI：`dsh web`）。

## 首次启动会发生什么

1. 物化 `digital-twin` 预设到 `$DSH_HOME/.agent-presets/digital-twin/`（版本化幂等；
   dsh-memory / dsh-yuyi 的工具行检测到已安装才追加）；
2. 顶级「设置」出现「**分身设置**」Tab；
3. Agent 预设挑选器多出「**数字分身**」模式；
4. 全局默认预设**不会被自动改写**——需要时在「分身设置」勾选「设为默认预设」，
   或在 settings.yaml 的 `im-channel:` 节配置 `agentPreset: digital-twin`。

## 使用

1. 打开 设置 → **分身设置**；
2. 选模板（自定义/私人助理/专家顾问/客服），或直接填人格（名字/身份定位/背景/语气/风格）；
3. 填知识（每行一条记忆种子）；
4. 点「保存并生效」→ 人格注入 system prompt、知识写入 dsh-memory；
5. 换机使用：导出 `twin-config.json` → 另一台装同插件后导入。

## 与其它插件的关系

- `dsh-memory`（可选）：共享记忆（知识层）。dsh-twin 在保存知识时写入它；
  digital-twin 预设的 `tool-memory` 工具行由宿主端在物化时**检测到 dsh-memory
  已安装才追加**——未装时预设依然可挂载，只是分身读不到知识种子。
- `im-channel`（**硬性要求 ≥ 支持 noteActor 角色标注的版本**，且建议含
  `agentPreset` 配置）：企业微信通道。主人/访客双视图依赖 driver 在 agent setup
  里调用 dsh-twin 的 `noteActor(agentCtx, { isMaster })` 标注对话者角色；装了
  im-channel 而会话未被标注时，人格按**访客视图**渲染（fail-closed，见下方
  安全模型）。推荐在 settings.yaml 的 `im-channel:` 节配置
  `agentPreset: digital-twin`——这把 IM 会话的人格与「全局默认预设」解耦：
  主人网页端日常会话保持 standard（完整 shell/文件工具），企微侧稳定走分身
  预设。若不配置，也可以在分身设置里勾选「设为默认预设」，但那会影响你自己的
  所有新会话（见勾选框旁的警示说明）。
- `dsh-yuyi`（可选）：已安装时，digital-twin 预设会自动追加御驿工具行，
  分身可经 Hub 跨设备通信。
- `dsh-model-failover`（可选）：装上后对分身自动生效（机制层），但需在
  「设置 → 模型切换」配置降级链才会启用；分身设置的「监控」页有状态卡。
- `dsh-persona-guide`（可选）：分身搭建指引文档查看器，独立于本插件。

## 安全模型与已知边界

- **主人/访客双视图为 fail-closed**：装了 im-channel 后，未被 driver 显式标注为
  主人的会话一律按访客视图渲染（`background` 不注入）。副作用：主人的**网页端**
  会话不再注入 background（可用知识种子把等效上下文喂回记忆层）；IM 侧主/访客
  均由 driver 标注，各得正确视图。因此 im-channel 必须 ≥ 支持 noteActor 的版本，
  旧版会让网页端与 IM 侧全部按访客视图。
- **插件自有路由不在上游认证围栏内**：dsh v0.1.2 起 `/`（index）与 `/api` 前缀有
  一次性 token 认证，但 webserver 的路由匹配是 exact 优先——本插件的
  `/dsh-twin/*` 路由不经过该围栏。写端点已自带 sameOrigin CSRF 防护 +
  content-type/体积限制；LAN 暴露场景下 GET 端点（配置/监控）可被未认证读取，
  敏感部署请勿把端口暴露到局域网之外。
- **配置不走 settings namespace**：人格/知识存独立 `$DSH_HOME/dsh-twin/twin-config.json`
  （单文件导入导出是核心需求），代价是没有 settings 的分层/校验/热重载机制；
  写入侧已自行实现字段白名单 + 长度上限 + 控制字符清洗 + 原子写（0600）。
  v0.1.x 存放在 `$DSH_HOME` 根下的旧文件会被自动读取迁移，首次保存后落到新目录。

## 开发

```sh
git clone https://github.com/lomehong/dsh-twin.git
cd dsh-twin
npm install
npm run build       # tsc 编译 src/ → lib/（宿主端 + 类型声明）+ esbuild 重建 lib/client.js
npm test            # vitest：26 个行为锁定测试（直接跑 src/*.ts 源码）
npm run typecheck   # tsc -b --noEmit 严格类型检查（exactOptionalPropertyTypes）
```

- 宿主端源码是 TypeScript（`src/index.ts`、`src/tools.ts`，结构化 XxxLike 接口
  声明外部服务，对齐 dsh-model-failover）；`lib/index.js`、`lib/tools.js` 是
  tsc 构建产物，类型声明在 `lib/types/`。
- 客户端 bundle 用 esbuild，输出 `__ModuleLoader__.load()` 格式（与 dsh-memory 一致）。
- `lib/`（构建产物）随仓库提交，git 安装无需本地构建（LESSONS #6）。
- 改宿主端编辑 `src/*.ts` 后跑 `npm run build`；改客户端后重建 `lib/client.js`。

## 目录结构

```
dsh-twin/
├── presets/digital-twin/{agent.cordis.yml,preset.yml}  # 内置数字分身 agent 预设
├── lib/index.js       # 宿主端：物化预设 + 默认预设 + 配置存储/API + 人格注入 + 记忆
├── lib/client.js      # 顶级「分身设置」向导（模板/人格/知识 + 导入导出）
├── cordis.patch.yml   # bundle 注册行（inject settings/agentPresets/systemPrompt）
├── src/client/index.tsx + scripts/build-client.mjs  # 客户端源码与构建
```

## 许可

MIT
