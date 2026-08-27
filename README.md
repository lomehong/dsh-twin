# dsh-twin — 可拔插、可移植的数字分身插件

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
  **物化**到 `$DSH_HOME/.agent-presets/digital-twin/`（幂等）。
- **可移植**：插件是纯代码；人格是数据，打包进 `$DSH_HOME/twin-config.json`，
  向导提供「导出人格 / 导入人格」，换电脑装插件→导入即可。
- **自动默认**：未显式选择默认 preset 时设为 `digital-twin`（幂等，尊重手动选择；
  把组合 base `standard` 视为「未选择」可覆盖）。
- **严格专属人格**：`twin` 段通过 `agentPresets.composedPreset(agent.ctx)` 判断当前 agent
  是否由 `digital-twin` 预设组合，仅对分身 agent 注入人格；其它预设/会话不会带上这套人格。
  预设不写死 persona，人格全由 `twin` 段动态注入，改配置即生效。
- **人格深度**：人格可不只是名字/语气/背景，还支持 价值观与原则 / 决策与做事方式 /
  边界与转人工 / 禁忌，让分身更立体、更守规矩。「转人工」不只是提示词：
  digital-twin 预设挂载 `escalate_to_owner` 工具，分身遇到权限不足、敏感操作
  或访客投诉时会真正经 im-channel 给主人发 IM 通知（主人需先 /bind 绑定）。
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

1. 物化 `digital-twin` 预设到 `$DSH_HOME/.agent-presets/digital-twin/`；
2. 若未设默认预设，把 `agent-presets.default` 设为 `digital-twin`；
3. 顶级「设置」出现「**分身设置**」Tab；
4. Agent 预设挑选器多出「**数字分身**」模式。

## 使用

1. 打开 设置 → **分身设置**；
2. 选模板（自定义/私人助理/专家顾问/客服），或直接填人格（名字/身份定位/背景/语气/风格）；
3. 填知识（每行一条记忆种子）；
4. 点「保存并生效」→ 人格注入 system prompt、知识写入 dsh-memory；
5. 换机使用：导出 `twin-config.json` → 另一台装同插件后导入。

## 与其它插件的关系

- `dsh-memory`：共享记忆（知识层）。dsh-twin 在保存知识时写入它；digital-twin
  预设挂载 `tool-memory` 工具行，分身会话可读取这些知识。
- `im-channel`（建议 ≥ 含 `agentPreset` 配置的版本）：企业微信通道。推荐在
  settings.yaml 的 `im-channel:` 节配置 `agentPreset: digital-twin`——这把
  IM 会话的人格与「全局默认预设」解耦：主人网页端日常会话保持 standard
  （完整 shell/文件工具），企微侧稳定走分身预设。若不配置，也可以在分身
  设置里勾选「设为默认预设」，但那会影响你自己的所有新会话（见勾选框旁
  的警示说明）。
- `dsh-yuyi`（可选）：已安装时，digital-twin 预设会自动追加御驿工具行，
  分身可经 Hub 跨设备通信。
- `dsh-model-failover`（可选）：装上后对分身自动生效（机制层），但需在
  「设置 → 模型切换」配置降级链才会启用；分身设置的「监控」页有状态卡。
- `dsh-persona-guide`（可选）：分身搭建指引文档查看器，独立于本插件。

## 开发

```sh
git clone https://github.com/lomehong/dsh-twin.git
cd dsh-twin
pnpm add -D esbuild react @types/react   # 构建客户端仅需 esbuild
node scripts/build-client.mjs            # 产出 lib/client.js
```

- 客户端 bundle 用 esbuild，输出 `__ModuleLoader__.load()` 格式（与 dsh-memory 一致）。
- `lib/`（构建产物）随仓库提交，git 安装无需本地构建。
- 改 host 端直接用 `lib/index.js`；改客户端后重建 `lib/client.js`。

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
