// ISO(UTC) → 查看者本地时区文本：存储保持 UTC，仅展示层转换。
// 此前各页对 ISO 裸切片（slice/replace）把 UTC 原样展示，在 UTC+8 晚 8 小时。
function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 完整时间 "YYYY-MM-DD HH:mm"（withSeconds 时带秒）；非法输入原样返回。 */
export function formatLocal(iso: string | undefined, withSeconds = false): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}${withSeconds ? ':' + pad2(d.getSeconds()) : ''}`
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${time}`
}

/** 仅日期 "YYYY-MM-DD"（按查看者本地时区取日，避免 UTC 日期在 ±8 界边错一天）。 */
export function formatLocalDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}
