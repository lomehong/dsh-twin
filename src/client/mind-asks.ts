/**
 * dsh-mind 请求单（P5 §6.5）消费端：数字分身「今日待办」的请求单数据源与答复。
 *
 * 宪章 §3.1 合规：跨插件只走同源 HTTP 探测（先例：dashboard 对 ledger/actors 的
 * 聚合），零构建期依赖；写操作沿用 dsh-mind 的写门禁键（GET /dsh-mind/token 一次
 * 取用，401 自动重取重试一次——进程重启换键自愈）。
 *
 * 导航契约（dsh-mind/src/client/nav.ts 同款常量拷贝，值不共享运行时导入）：
 * dsh-mind 右下角存在体角标/面板「去处理」→ 点击顶部「数字分身」Tab +
 * 派发 ASKS_FOCUS_EVENT；本仓 twin-hub 监听后落到「今日待办」。
 */
export const ASKS_FOCUS_EVENT = 'dsh-twin:focus-todo'

/** 一次性焦点标记：跳转事件可能先于「今日待办」挂载到达（顶部 Tab 切换是异步
 *  渲染）——twin-hub 收到事件先记账，dashboard 挂载/收到事件时消费。 */
let asksFocusPending = false

export function markAsksFocus(): void {
  asksFocusPending = true
}

export function consumeAsksFocus(): boolean {
  const v = asksFocusPending
  asksFocusPending = false
  return v
}

export interface MindAsk {
  id: string
  seq: number
  ts: string
  what: string
  why?: string
  howto?: string
  goalTitle?: string
  ageHours: number
}

export interface AsksPayload { ok: boolean; asks: MindAsk[] }

/** 拉取 open 请求单（缺席/失败由调用方按「提供方插件未安装」降级）。 */
export async function fetchMindAsks(): Promise<AsksPayload> {
  const resp = await fetch('/dsh-mind/asks')
  return (await resp.json()) as AsksPayload
}

let keyPromise: Promise<string> | undefined

function writeKey(refetch = false): Promise<string> {
  if (refetch || keyPromise === undefined) {
    keyPromise = fetch('/dsh-mind/token')
      .then(r => r.json() as Promise<{ ok?: boolean; key?: string }>)
      .then(b => {
        if (b.ok === true && typeof b.key === 'string') return b.key
        throw new Error('获取校验键失败')
      })
      .catch(e => {
        keyPromise = undefined
        throw e
      })
  }
  return keyPromise
}

async function postAnswer(id: string, answer: string): Promise<{ status: number; body: { ok: boolean; error?: string } }> {
  const key = await writeKey()
  const resp = await fetch('/dsh-mind/asks/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-mind-key': key },
    body: JSON.stringify({ id, answer }),
  })
  return { status: resp.status, body: (await resp.json()) as { ok: boolean; error?: string } }
}

/** 答复请求单（结清 + 答复注入心智时间线并触发反应性唤醒）。401（键已随宿主重启
 *  轮换）重取键重试一次；其余失败原样返回。 */
export async function answerMindAsk(id: string, answer: string): Promise<{ ok: boolean; error?: string }> {
  try {
    let r = await postAnswer(id, answer)
    if (r.status === 401) {
      keyPromise = undefined // 键随宿主重启轮换：重取再试一次
      r = await postAnswer(id, answer)
    }
    return r.body
  } catch (e) {
    keyPromise = undefined // 键可能失效：下次答复重取
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
