/**
 * v3 端到端冒烟剧本（实施计划 V3-X）：
 * 状态卡汇入（开环 → 状态卡候选 + 衰减）→ 主动触达（到期开环 → 候选 → 过闸 → 送达）
 * → 频控与幂等兜底。
 * 全部机制参与（mock im/ledger）。运行前必须设置 USERPROFILE 指向全新临时目录。
 */
import {
  ingestStateSeeds, pruneExpiredState, buildReachCandidates, deliverReach,
  loadProactive, resetReachThrottleForTest,
} from 'file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/proactive.js'
import { loadCardsState } from 'file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/cards.js'

let failed = 0
function check(name, cond, extra = '') {
  if (cond) { console.log(`  PASS ${name}`) } else { failed++; console.log(`  FAIL ${name} ${extra}`) }
}

console.log('== 剧本一：状态卡汇入与衰减 ==')
const r1 = ingestStateSeeds([{ content: '未闭环：客户 A 报价跟进', source: '关系轨' }])
check('汇入 1 条', r1.added === 1)
ingestStateSeeds([{ content: '未闭环：客户 A 报价跟进', source: '关系轨' }])
check('重复被跳过', loadCardsState().file.current.state.items.length === 1)
// 拨老 decayAt 触发清理
const st = loadCardsState()
const aged = st.file.current.state.items.map(x => ({ ...x, decayAt: '2020-01-01T00:00:00Z' }))
const { saveCards } = await import('file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/cards.js')
saveCards({ cards: { ...st.file.current, state: { items: aged } }, confirm: false })
check('过期清理 1 条', pruneExpiredState() === 1)

console.log('== 剧本二：主动触达候选（到期开环 >24h） ==')
resetReachThrottleForTest()
const staleLoop = [{
  id: 'm1', content: '客户 A 报价跟进', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  relation: { actorId: 'act_1', kind: '观察', openLoop: { openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), closedAt: undefined } },
}]
const cs = buildReachCandidates({ memory: { loadSharedMemory: () => staleLoop } })
check('生成 1 个到期提醒', cs.length === 1 && cs[0].kind === '开环到期提醒')
check('候选为 L1 主动汇报', cs[0].actionType === '主动汇报')

console.log('== 剧本三：过闸送达（L1 放行 + 记录） ==')
const delivered = []
const im = {
  botsStatus: () => [{ kind: 'wecom', bindings: [{ userId: 'boss', isMaster: true }] }],
  pushToUser: async (k, u, t) => { delivered.push(`${k}:${u}`); return true },
}
const dr = await deliverReach(cs[0], { im })
check('L1 送达成功', dr.ok === true && delivered.length === 1)
check('记录已触达', loadProactive().reaches.at(-1)?.status === '已触达')

console.log('== 剧本四：幂等（已触达不再生成） ==')
const cs2 = buildReachCandidates({ memory: { loadSharedMemory: () => staleLoop } })
check('再次生成候选 0 条（幂等）', cs2.length === 0)

console.log('== 剧本五：L2 被阻断 ==')
resetReachThrottleForTest()
const ledger = { check: () => ({ judgment: { decision: '阻断' }, record: { id: 'A-1' } }) }
const r2 = await deliverReach(
  { kind: '汇报', title: 't', text: 'x', actionType: '对外承诺', targetScope: 'x', refKey: 'r-blocked' },
  { ledger, im },
)
check('L2 未批准被阻断', r2.blocked === true && r2.ok === false)

console.log(failed === 0 ? '\nv3 端到端剧本全部通过 ✓' : `\n${failed} 项失败 ✗`)
process.exit(failed === 0 ? 0 : 1)
