/**
 * 套件状态坞（suite-dock）纯函数测试：
 * - dockFresh：心跳新鲜判定（90s 窗口/坏值/空值）
 * - imTraffic / yuyiTraffic：行信号量映射与缺席降级
 * 纯函数，无 DSH_HOME/DOM 依赖（G8）。
 */
import { describe, expect, it } from 'vitest'
import {
  DOCK_FRESH_MS, dockFresh, imTraffic, trafficColor, yuyiTraffic,
} from '../src/client/suite-dock-model.ts'

describe('dockFresh 心跳新鲜判定', () => {
  it('90s 内的心跳为新鲜，超窗/未来时间/坏值不新鲜', () => {
    const now = Date.parse('2026-09-26T06:00:00Z')
    expect(dockFresh(new Date(now - 1000).toISOString(), now)).toBe(true)
    expect(dockFresh(new Date(now - DOCK_FRESH_MS + 1000).toISOString(), now)).toBe(true)
    expect(dockFresh(new Date(now - DOCK_FRESH_MS - 1).toISOString(), now)).toBe(false)
    expect(dockFresh(new Date(now + 60_000).toISOString(), now)).toBe(false) // 未来时间戳视为不新鲜
    expect(dockFresh('not-a-date', now)).toBe(false)
    expect(dockFresh(null, now)).toBe(false)
    expect(dockFresh(undefined, now)).toBe(false)
  })
})

describe('imTraffic 三平台聚合', () => {
  const bots = (rows: Array<[boolean, boolean]>) => rows.map(([configured, online]) => ({ configured, online }))
  it('探测失败 → absent；全未配置 → down；有配置全离线 → degraded；任一在线 → ok', () => {
    expect(imTraffic(undefined)).toBe('absent')
    expect(imTraffic(bots([[false, false], [false, false]]))).toBe('down')
    expect(imTraffic(bots([[true, false], [true, false]]))).toBe('degraded')
    expect(imTraffic(bots([[true, false], [true, true]]))).toBe('ok')
    expect(imTraffic([])).toBe('down')
  })
})

describe('yuyiTraffic 连接状态映射', () => {
  it('未广播 → absent；未配置 → down；已配置未连接 → degraded；已连接 → ok', () => {
    expect(yuyiTraffic(undefined)).toBe('absent')
    expect(yuyiTraffic({ configured: false, connected: false })).toBe('down')
    expect(yuyiTraffic({ configured: true, connected: false })).toBe('degraded')
    expect(yuyiTraffic({ configured: true, connected: true })).toBe('ok')
  })
})

describe('trafficColor 语义色', () => {
  it('ok 绿 / degraded 琥珀 / down 与 absent 灰', () => {
    expect(trafficColor('ok')).toContain('success')
    expect(trafficColor('degraded')).toContain('warn')
    expect(trafficColor('down')).toContain('tertiary')
    expect(trafficColor('absent')).toContain('tertiary')
  })
})
