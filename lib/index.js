/**
 * dsh-twin — 可拔插、可移植的数字分身（宿主端）
 *
 * 把一个「数字分身」收敛成一个插件包：
 *  - 首启把内置的 `digital-twin` agent 预设物化到 `$DSH_HOME/.agent-presets/digital-twin/`
 *    （agent-presets 会扫描用户根，装到任意机器即出现该预设）；
 *  - 若未设置默认预设，将 `agent-presets.default` 设为 `digital-twin`（分身走默认即用它）；
 *  - 人格是「数据」：存 `$DSH_HOME/twin-config.json`，由顶级设置向导读写，
 *    通过 `systemPrompt.section('twin')` 注入；
 *  - 知识种子写入 dsh-memory（若已安装）。
 *
 * im-channel 只是通道，不承担分身身份。
 * 客户端通过 `GET/POST /dsh-twin/config` 读写。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, copyFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-twin'
export const provide = ['dsh-twin']

const SECTION_NAME = 'twin'
const SECTION_ORDER = 25
const PRESET_ID = 'digital-twin'
const USER_PRESET_ROOT = '.agent-presets'

// 包内置的 digital-twin 预设目录
const PACKAGE_PRESET_DIR = fileURLToPath(new URL('../presets/digital-twin/', import.meta.url))
const PACKAGE_AGENT_CORDIS = join(PACKAGE_PRESET_DIR, 'agent.cordis.yml')
const PACKAGE_PRESET_YML = join(PACKAGE_PRESET_DIR, 'preset.yml')

function dshHome() {
  return process.env.DSH_HOME ?? join(homedir(), '.dsh')
}

function userPresetDir() {
  return join(dshHome(), USER_PRESET_ROOT, PRESET_ID)
}

function configPath() {
  return join(dshHome(), 'twin-config.json')
}

export function defaultConfig() {
  return {
    template: 'custom',
    identity: { name: '', role: '', background: '' },
    persona: { tone: 'professional', style: '' },
    knowledge: { seeds: [] },
  }
}

export function loadConfig() {
  const path = configPath()
  if (!existsSync(path)) return defaultConfig()
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'))
    const d = defaultConfig()
    return {
      ...d,
      ...raw,
      identity: { ...d.identity, ...(raw.identity ?? {}) },
      persona: { ...d.persona, ...(raw.persona ?? {}) },
      knowledge: { ...d.knowledge, ...(raw.knowledge ?? {}) },
      template: raw.template ?? 'custom',
    }
  } catch {
    return defaultConfig()
  }
}

export function saveConfig(cfg) {
  const path = configPath()
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`
  writeFileSync(tmp, `${JSON.stringify(cfg, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, path)
  return loadConfig()
}

export function renderPersona(cfg) {
  const i = cfg.identity ?? {}
  const p = cfg.persona ?? {}
  const parts = []
  if (i.name) parts.push(`你的名字是「${i.name}」。`)
  if (i.role) parts.push(`你的身份定位：${i.role}。`)
  if (i.background) parts.push(`背景：${i.background}`)
  const toneMap = {
    professional: '以专业、可靠、条理清晰的语气回答。',
    friendly: '以亲切、友好、接地气的语气回答。',
    concise: '回答尽量简洁、直接，少说废话。',
    humorous: '语气轻松幽默，偶尔带点玩笑。',
  }
  if (p.tone && toneMap[p.tone]) parts.push(toneMap[p.tone])
  if (p.style) parts.push(`风格要求：${p.style}`)
  if (parts.length === 0) return ''
  return `# 数字分身人格\n${parts.join('\n')}`
}

/** 把内置预设物化到用户 agent-presets 根（幂等）。返回是否本次写入。 */
export function materializePreset() {
  const dir = userPresetDir()
  if (existsSync(dir)) return { materialized: false, dir }
  try {
    mkdirSync(dir, { recursive: true })
    copyFileSync(PACKAGE_AGENT_CORDIS, join(dir, 'agent.cordis.yml'))
    copyFileSync(PACKAGE_PRESET_YML, join(dir, 'preset.yml'))
  } catch (error) {
    ctxloggerError(error)
    return { materialized: false, dir, error: error instanceof Error ? error.message : String(error) }
  }
  return { materialized: true, dir }
}

function ctxloggerError(error) {
  try {
    console.error('[dsh-twin] 物化 digital-twin 预设失败:', error instanceof Error ? error.message : String(error))
  } catch {
    /* 忽略 */
  }
}

/**
 * 若用户未显式选择默认 agent 预设，则设为 digital-twin（幂等，尊重用户的选择）。
 *
 * 三个易错点：
 * - `agent-presets` 命名空间由 dsh-agent-presets 服务经 ctx.inject(['settings'])
 *   注册，可能晚于本插件 apply。未注册时 settings.update 会以 rejected promise
 *   形式抛 `settings namespace ... is not registered`，加载期未 await/未捕获
 *   会被 cordis 归因为 fatal load failure（曾导致 harness 启动崩溃循环）。
 *   因此先探测注册（get 对未注册命名空间返回 undefined，不抛），未注册则
 *   轮询等待。
 * - 判断“用户是否选过”必须读原始用户层 settings.section()：resolved 值的
 *   default 恒有 composition base（'standard'）兜底，永远非空，用它判断会
 *   导致本设置永远写不进去。
 * - settings.update 是 async，必须捕获 rejection，不能只靠同步 try/catch。
 */
const SETTINGS_NAMESPACE = 'agent-presets'
const NAMESPACE_POLL_MS = 200
const NAMESPACE_POLL_LIMIT = 50 // 最多约 10 秒

export function ensureDefaultPreset(ctx) {
  ctx.inject(['settings'], (sctx) => {
    const settings = sctx.get('settings')
    let tries = 0
    let timer = null
    const stop = () => {
      clearInterval(timer)
      timer = null
    }
    const write = async () => {
      if (settings?.get?.(SETTINGS_NAMESPACE) === undefined) return false
      const user = settings?.section?.(SETTINGS_NAMESPACE)
      const userDefault = user?.default
      // 组合 base 默认恒为 'standard'：把它当成“未显式选择”，可覆盖为 digital-twin。
      // 只尊重用户手动选过的非 base / 非 digital-twin 预设。
      if (userDefault === PRESET_ID) return false
      if (userDefault !== undefined && userDefault !== 'standard') return false
      await settings?.update?.(SETTINGS_NAMESPACE, { default: PRESET_ID })
      ctx.logger?.info?.('[dsh-twin] 已将默认 agent 预设设为 digital-twin')
      return true
    }
    const tick = () => {
      write()
        .then((done) => {
          if (done) stop()
          else if (++tries >= NAMESPACE_POLL_LIMIT) {
            stop()
            ctx.logger?.info?.('[dsh-twin] agent-presets 命名空间未注册，跳过设置默认预设')
          }
        })
        .catch((error) => {
          stop()
          ctx.logger?.warn?.('[dsh-twin] 设置默认预设失败:', error instanceof Error ? error.message : String(error))
        })
    }
    sctx.effect(() => stop)
    tick()
    timer = setInterval(tick, NAMESPACE_POLL_MS)
  })
}

/** 把知识种子写入 dsh-memory（若已安装）；按内容去重。 */
export async function seedMemory(ctx, cfg) {
  const memory = ctx.get('dsh-memory')
  const seeds = cfg?.knowledge?.seeds ?? []
  if (!memory || !Array.isArray(seeds) || seeds.length === 0) {
    return { available: Boolean(memory), seeded: 0 }
  }
  let seeded = 0
  const existing = memory.loadSharedMemory?.() ?? []
  for (const s of seeds) {
    if (typeof s !== 'string' || !s.trim()) continue
    const content = s.trim()
    if (existing.some((e) => e.content === content)) continue
    const r = await memory.addMemoryEntry?.({
      content,
      type: 'note',
      scope: 'master',
      author: 'master',
      authorRole: 'master',
    })
    if (r) seeded += 1
  }
  return { available: true, seeded }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const all = Buffer.concat(chunks).toString('utf8')
        resolve(all ? JSON.parse(all) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function respondJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function registerApi(web, service) {
  web.register({
    kind: 'exact',
    path: '/dsh-twin/config',
    handler: async (req, res) => {
      if (req.method === 'GET') {
        respondJson(res, 200, { ok: true, config: loadConfig(), default: defaultConfig(), preset: PRESET_ID })
        return
      }
      if (req.method === 'POST') {
        try {
          const body = await readJsonBody(req)
          const cfg = saveConfig(body)
          let memory = { available: false, seeded: 0 }
          try {
            memory = await service.seedMemory(cfg)
          } catch {
            // 记忆写入失败不阻断配置保存
          }
          respondJson(res, 200, { ok: true, config: cfg, memory })
          return
        } catch (e) {
          respondJson(res, 500, { ok: false, error: e instanceof Error ? e.message : String(e) })
          return
        }
      }
      respondJson(res, 405, { ok: false, error: 'method not allowed' })
    },
  })
}

export function apply(ctx) {
  ctx.logger?.info?.('[dsh-twin] 数字分身插件已加载')

  // 1) 物化 digital-twin 预设（幂等）
  const mat = materializePreset()
  if (mat.materialized) ctx.logger?.info?.(`[dsh-twin] 已物化 digital-twin 预设: ${mat.dir}`)

  // 2) 未设置默认则设为 digital-twin
  ensureDefaultPreset(ctx)

  // 3) 人格注入：读配置实时渲染，保存即生效（任何异常都不得让 apply 抛出）
  try {
    if (ctx.systemPrompt && typeof ctx.systemPrompt.section === 'function') {
      ctx.systemPrompt.section({
        name: SECTION_NAME,
        order: SECTION_ORDER,
        text: () => renderPersona(loadConfig()),
      })
    }
  } catch (error) {
    ctx.logger?.warn?.('[dsh-twin] 人格注入失败:', error instanceof Error ? error.message : String(error))
  }

  const service = {
    loadConfig,
    saveConfig,
    renderPersona,
    seedMemory: (cfg) => seedMemory(ctx, cfg),
    defaultConfig,
    materializePreset,
    presetId: PRESET_ID,
  }
  // 提供服务，供其他插件消费（如 im-channel 探测 dsh-twin）
  try {
    ctx.provide('dsh-twin', service)
  } catch (error) {
    ctx.logger?.warn?.('[dsh-twin] 提供 dsh-twin 服务失败:', error instanceof Error ? error.message : String(error))
  }

  // 4) 设置页需要 webServer；非硬依赖
  ctx.inject(['webServer'], (wctx) => {
    const web = wctx.get('webServer')
    if (web && typeof web.register === 'function') {
      registerApi(web, service)
      ctx.logger?.info?.('[dsh-twin] API 路由已注册 (/dsh-twin/config)')
    }
  })
}
