/**
 * 套件状态坞（suite-dock）纯函数层：跨插件契约常量 + 状态→信号量映射。
 *
 * 宪章 §3.1：套件包之间零构建期依赖——本文件与 im-channel（ui-settings-im）、
 * dsh-yuyi 各持一份相同常量拷贝（值不共享运行时导入）。契约三件：
 * 1. localStorage 心跳：dock 挂载期每 30s 写 `dsh-suite-dock` = ISO 时间戳；
 *    im/yuyi 见 90s 内的新鲜心跳即隐藏自己的常驻角标（dock 缺席则自动回归）。
 * 2. `suite-dock:yuyi-open` 事件：dock 点击御驿行 → yuyi 打开协同面板。
 * 3. `suite-dock:yuyi-status` 事件：yuyi → dock 广播 { configured, connected,
 *    panelOpen }（面板打开期间 dock 暂避）。
 */

export const DOCK_STORAGE_KEY = 'dsh-suite-dock'
export const DOCK_FRESH_MS = 90_000
export const EV_READY = 'suite-dock:ready'
export const EV_GONE = 'suite-dock:gone'
export const EV_YUYI_OPEN = 'suite-dock:yuyi-open'
export const EV_YUYI_STATUS = 'suite-dock:yuyi-status'
/** 心智右下角存在体展开/收起广播（detail: { open }），dock 暂避。 */
export const EV_MIND_COMPANION = 'dsh-mind:companion'

/** 信号量（dock 行的统一状态语义）。 */
export type Traffic = 'ok' | 'degraded' | 'down' | 'absent'

/** 心跳新鲜判定：90s 内的 ISO 时间戳 = dock 在场。 */
export function dockFresh(raw: string | null | undefined, now = Date.now()): boolean {
  if (raw === null || raw === undefined || raw === '') return false
  const t = Date.parse(raw)
  return Number.isFinite(t) && now - t >= 0 && now - t < DOCK_FRESH_MS
}

/** IM 渠道：三平台聚合信号。探测失败 = 插件缺席；有配置全离线 = 降级 amber。 */
export function imTraffic(bots: ReadonlyArray<{ configured?: boolean; online?: boolean }> | undefined): Traffic {
  if (bots === undefined) return 'absent'
  const configured = bots.filter(b => b.configured === true)
  if (configured.length === 0) return 'down'
  return configured.some(b => b.online === true) ? 'ok' : 'degraded'
}

/** 御驿协同：连接状态 → 信号。未收到广播（undefined）= 视为缺席。 */
export function yuyiTraffic(status: { configured?: boolean; connected?: boolean } | undefined): Traffic {
  if (status === undefined) return 'absent'
  if (status.configured !== true) return 'down'
  return status.connected === true ? 'ok' : 'degraded'
}

export interface MindStatusLike {
  enabled?: boolean
  stoppedByMaster?: boolean
  running?: boolean
  quiet?: { active?: boolean }
  openAsks?: number
}

/** 心智：存在语义 → 信号。探测失败 = 插件缺席。 */
export function mindTraffic(status: MindStatusLike | undefined): Traffic {
  if (status === undefined) return 'absent'
  if (status.stoppedByMaster === true || status.enabled === false) return 'down'
  if (status.quiet?.active === true) return 'degraded'
  return 'ok'
}

/** 信号量 → 状态点颜色（与 twin 今日待办卡语义一致）。 */
export function trafficColor(t: Traffic): string {
  switch (t) {
    case 'ok': return 'var(--dsw-alias-state-success-primary, #2A9D8F)'
    case 'degraded': return 'var(--dsw-alias-state-warn-primary, #b8860b)'
    default: return 'var(--dsw-alias-label-tertiary, #999)'
  }
}
