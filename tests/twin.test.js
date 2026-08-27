/**
 * dsh-twin 宿主端测试：直接 import 构建产物 lib/index.js（ESM）。
 * 每个用例把 DSH_HOME 隔离到独立临时目录，测试间互不污染、不碰真实 ~/.dsh。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let home

beforeEach(() => {
  home = mkdtempSync(join(tmpdir(), 'dsh-twin-test-'))
  process.env.DSH_HOME = home
})

afterEach(() => {
  delete process.env.DSH_HOME
  rmSync(home, { recursive: true, force: true })
})

describe('normalizeConfigInput', () => {
  it('字段白名单：未声明键被丢弃', async () => {
    const { normalizeConfigInput } = await import('../lib/index.js')
    const n = normalizeConfigInput({ identity: { name: 'x' }, evil: 'payload', extra: 1 })
    expect(Object.keys(n).sort()).toEqual(['becomeDefaultPreset', 'identity', 'knowledge', 'persona', 'template'])
    expect(n.evil).toBeUndefined()
  })

  it('非法 tone 回落默认，seeds 过滤非字符串/空串并截断', async () => {
    const { normalizeConfigInput } = await import('../lib/index.js')
    const n = normalizeConfigInput({
      persona: { tone: 'hacker' },
      knowledge: { seeds: [' ok ', 42, null, ''] },
    })
    expect(n.persona.tone).toBe('professional')
    expect(n.knowledge.seeds).toEqual(['ok'])
  })

  it('清洗控制字符 + 长度上限（超限截断，未超限保留）', async () => {
    const { normalizeConfigInput } = await import('../lib/index.js')
    const long = 'x'.repeat(3000)
    const n = normalizeConfigInput({
      identity: { name: 'a\u0000b\u001fc', background: long },
      knowledge: { seeds: [long] },
    })
    expect(n.identity.name).toBe('abc')
    expect(n.identity.background.length).toBe(2000) // 超限截断到上限
    expect(n.knowledge.seeds[0].length).toBe(500)
  })

  it('becomeDefaultPreset 仅接受布尔（默认 false）', async () => {
    const { normalizeConfigInput } = await import('../lib/index.js')
    expect(normalizeConfigInput({ becomeDefaultPreset: true }).becomeDefaultPreset).toBe(true)
    expect(normalizeConfigInput({ becomeDefaultPreset: 'yes' }).becomeDefaultPreset).toBe(false)
    expect(normalizeConfigInput({}).becomeDefaultPreset).toBe(false)
  })

  it('非对象 body 安全回落默认', async () => {
    const { normalizeConfigInput } = await import('../lib/index.js')
    const d = normalizeConfigInput('not an object')
    expect(d.template).toBe('custom')
    const a = normalizeConfigInput(['array'])
    expect(a.identity.name).toBe('')
  })
})

describe('配置持久化与版本化', () => {
  it('saveConfig 原子写 + loadConfig 往返', async () => {
    const { saveConfig, loadConfig, normalizeConfigInput } = await import('../lib/index.js')
    saveConfig(normalizeConfigInput({ identity: { name: '小七' } }))
    expect(loadConfig().identity.name).toBe('小七')
    expect(existsSync(join(home, 'twin-config.json'))).toBe(true)
    // 无 tmp 残留
    expect(readdirSync(home).some((f) => f.includes('.tmp-'))).toBe(false)
  })

  it('坏 JSON 回落默认并保留旧文件内容直到下次保存', async () => {
    const { loadConfig } = await import('../lib/index.js')
    mkdirSync(home, { recursive: true })
    writeFileSync(join(home, 'twin-config.json'), '{broken json', 'utf8')
    const cfg = loadConfig()
    expect(cfg.template).toBe('custom')
    expect(readFileSync(join(home, 'twin-config.json'), 'utf8')).toBe('{broken json')
  })

  it('restoreHistory 恢复前先归档当前版本（连续恢复不丢中间态）', async () => {
    const mod = await import('../lib/index.js')
    const { saveConfig, loadConfig, archiveHistory, restoreHistory, listHistory, normalizeConfigInput } = mod
    saveConfig(normalizeConfigInput({ identity: { name: 'B' } }))
    archiveHistory(loadConfig()) // history[0] = B
    saveConfig(normalizeConfigInput({ identity: { name: 'C' } })) // 当前 = C，未归档
    const before = listHistory().length
    const r = restoreHistory(0) // 恢复 B
    expect(r.ok).toBe(true)
    expect(loadConfig().identity.name).toBe('B')
    // C 在恢复前被归档了：历史数 +1，且能再次恢复回 C
    expect(listHistory().length).toBe(before + 1)
    const r2 = restoreHistory(0)
    expect(r2.ok).toBe(true)
    expect(loadConfig().identity.name).toBe('C')
  })

  it('restoreHistory 不存在的索引返回 404 语义且不动配置', async () => {
    const mod = await import('../lib/index.js')
    const { restoreHistory, loadConfig, normalizeConfigInput, saveConfig } = mod
    saveConfig(normalizeConfigInput({ identity: { name: 'only' } }))
    const r = restoreHistory(99)
    expect(r.ok).toBe(false)
    expect(loadConfig().identity.name).toBe('only')
  })

  it('history 封顶最近 10 个', async () => {
    const mod = await import('../lib/index.js')
    const { saveConfig, archiveHistory, loadConfig, listHistory, normalizeConfigInput } = mod
    for (let i = 0; i < 14; i++) {
      archiveHistory(loadConfig())
      saveConfig(normalizeConfigInput({ identity: { name: `v${i}` } }))
    }
    expect(listHistory().length).toBe(10)
  })
})

describe('materializePreset 版本戳', () => {
  it('首启物化；二次调用幂等；预设文件包含 tool-memory 与（yuyi 缺席时无）tool-yuyi', async () => {
    const { materializePreset } = await import('../lib/index.js')
    const first = materializePreset()
    expect(first.materialized).toBe(true)
    const yml = readFileSync(join(first.dir, 'agent.cordis.yml'), 'utf8')
    expect(yml).toContain('@dsh-extra/dsh-memory/tools')
    expect(yml).toContain('@dsh-extra/dsh-twin/tools')
    const second = materializePreset()
    expect(second.materialized).toBe(false)
    // 版本戳存在
    expect(readFileSync(join(first.dir, '.materialized-version'), 'utf8').trim()).toBeTruthy()
  })

  it('版本号变化时覆盖更新并保留 .bak', async () => {
    const { materializePreset } = await import('../lib/index.js')
    const first = materializePreset()
    // 手工改版本戳模拟"插件升级"
    writeFileSync(join(first.dir, '.materialized-version'), '0\n', 'utf8')
    const second = materializePreset()
    expect(second.materialized).toBe(true)
    expect(existsSync(join(first.dir, 'agent.cordis.yml.bak'))).toBe(true)
    expect(readFileSync(join(first.dir, '.materialized-version'), 'utf8').trim()).not.toBe('0')
  })
})

describe('renderPersona', () => {
  it('默认 tone 始终渲染语气行（全新配置也有一条专业语气指令）', async () => {
    const { renderPersona, defaultConfig } = await import('../lib/index.js')
    const text = renderPersona(defaultConfig())
    // normalizeConfigInput 把非法/缺省 tone 归一为 professional，因此"空配置"
    // 至少渲染语气行；只有 renderPersona 直接收到 tone 为空的配置才返回空串
    expect(text).toContain('# 数字分身人格')
    expect(text).toContain('专业')
  })

  it('tone 为空时返回空串（空段被丢弃）', async () => {
    const { renderPersona } = await import('../lib/index.js')
    const empty = { template: 'custom', identity: {}, persona: { tone: '' }, knowledge: { seeds: [] } }
    expect(renderPersona(empty)).toBe('')
  })

  it('字段拼接：身份/语气/风格/边界按序渲染', async () => {
    const { renderPersona, normalizeConfigInput } = await import('../lib/index.js')
    const cfg = normalizeConfigInput({
      identity: { name: '小七', role: '助理' },
      persona: { tone: 'concise', escalation: '投诉转主人' },
    })
    const text = renderPersona(cfg)
    expect(text).toContain('# 数字分身人格')
    expect(text).toContain('「小七」')
    expect(text).toContain('简洁')
    expect(text).toContain('投诉转主人')
  })
})

describe('escalateToOwner（转人工通知）', () => {
  it('im-channel 缺席时明确报错而非崩溃', async () => {
    const { escalateToOwner } = await import('../lib/tools.js')
    const r = await escalateToOwner({}, { reason: '需要主人决策' })
    expect(r.ok).toBe(false)
    expect(r.error).toContain('im-channel')
  })

  it('推送给全部 isMaster 绑定（跨渠道去重）', async () => {
    const { escalateToOwner } = await import('../lib/tools.js')
    const pushes = []
    const ctx = {
      get(name) {
        if (name !== 'im-channel') return undefined
        return {
          botsStatus: () => [
            { kind: 'wecom', bindings: [{ userId: 'boss', isMaster: true }, { userId: 'guest1', isMaster: false }] },
            { kind: 'feishu', bindings: [{ userId: 'boss', isMaster: true }] },
          ],
          pushToUser: async (kind, userId, text) => {
            pushes.push({ kind, userId, text })
            return true
          },
        }
      },
    }
    const r = await escalateToOwner(ctx, { reason: '访客投诉', detail: '需要退款' })
    expect(r.ok).toBe(true)
    expect(r.delivered).toBe(1) // boss 去重后只有一个目标
    expect(pushes[0].userId).toBe('boss')
    expect(pushes[0].text).toContain('转人工')
    expect(pushes[0].text).toContain('访客投诉')
    expect(pushes[0].text).toContain('需要退款')
  })

  it('无主人绑定时明确报错（/bind 提示）', async () => {
    const { escalateToOwner } = await import('../lib/tools.js')
    const ctx = {
      get: () => ({ botsStatus: () => [{ kind: 'wecom', bindings: [{ userId: 'g', isMaster: false }] }], pushToUser: async () => true }),
    }
    const r = await escalateToOwner(ctx, { reason: 'x' })
    expect(r.ok).toBe(false)
    expect(r.error).toContain('/bind')
  })

  it('全部渠道发送失败时报错', async () => {
    const { escalateToOwner } = await import('../lib/tools.js')
    const ctx = {
      get: () => ({
        botsStatus: () => [{ kind: 'wecom', bindings: [{ userId: 'boss', isMaster: true }] }],
        pushToUser: async () => false,
      }),
    }
    const r = await escalateToOwner(ctx, { reason: 'x' })
    expect(r.ok).toBe(false)
    expect(r.error).toContain('发送失败')
  })
})
