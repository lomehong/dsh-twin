/**
 * V2 端到端冒烟剧本（实施计划 V2-X）：
 * 主人纠正 → 信号入队（观察）→ 同类累计达标 → 候选生成 → 主人确认
 * → 回归报告 → 入卡 → 否决信号（账本推翻）→ 策略卡候选 → 关系开环闭环
 *
 * 全程机制参与（零模型）。运行前必须设置 USERPROFILE 指向全新临时目录：
 *   USERPROFILE=<tmp> node scripts/smoke-v2.mjs
 */
import {
  enqueue, confirmCandidate, applyCandidate,
  loadEvents, loadCandidates, saveEvents, saveCandidates,
  fingerprint,
} from 'file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/learning.js'
import { mineAndPool, confirmDraft, listDrafts } from 'file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/drafts.js'
import {
  loadCardsState,
} from 'file:///D:/development/Coder/nodejs/dsh/dsh-twin/lib/cards.js'
import { addRelationEntry, closeOpenLoop, openLoopsForActor } from 'file:///D:/development/Coder/nodejs/dsh/dsh-memory/lib/memory-store.js'
import * as Asm from 'file:///D:/development/Coder/nodejs/dsh/dsh-memory/lib/memory-assemble.js'

let failed = 0
function check(name, cond, extra = '') {
  if (cond) { console.log(`  PASS ${name}`) } else { failed++; console.log(`  FAIL ${name} ${extra}`) }
}

console.log('== 剧本一：纠正 → 样例卡（证据门槛 N=3） ==')
const evs = loadEvents()
const cs = loadCandidates()
for (let i = 0; i < 3; i++) {
  const r = enqueue({ kind: '纠正', target: '样例卡', signal: `客户坚持要八折，直接答应了他`, by: '主人' }, evs, cs)
  if (i === 0) check('单次纠正只成为观察', r.event.status === '观察' && r.candidate === undefined)
}
saveEvents(evs); saveCandidates(cs)
check('第 3 次晋升为候选修订', cs.candidates.length === 1 && cs.candidates[0].status === '候选修订')

// 主人补充说人话的字段 + 确认
const cand = cs.candidates[0]
cand.payload.situation = '客户砍价'
cand.payload.say = '我记下您的诉求，转主人给您准信'
cand.payload.avoidSay = '好的可以打八折'
confirmCandidate(cand.id, '主人', cs)
saveCandidates(cs)
check('主人已确认（签名）', cs.candidates[0].confirmedAt !== undefined)

// 回归门禁：确认后 apply 缺报告 → 拒绝；有报告 → 入卡
const rejected = applyCandidate(cand.id, '', cs, loadEvents())
check('缺回归报告 → 拒绝入卡', rejected === undefined)
const evs2 = loadEvents()
const applied = applyCandidate(cand.id, 'REP-V2-001', cs, evs2)
saveEvents(evs2)
check('有报告 → 已入卡', applied?.status === '已入卡')

console.log('== 剧本二：账本否决 → 策略卡候选（证据门槛 N=2） ==')
const evs3 = loadEvents()
const cs3 = loadCandidates()
for (let i = 0; i < 2; i++) {
  enqueue({ kind: '否决', target: '策略卡', signal: '在 A 客户上报价被推翻', by: '主人' }, evs3, cs3)
}
saveEvents(evs3); saveCandidates(cs3)
const vetoCand = cs3.candidates.find(c => c.kind === '策略卡')
check('否决 2 次生成策略卡候选', vetoCand !== undefined)

console.log('== 剧本三：样例引擎（语料挖掘 → 脱敏池 → 确认入卡） ==')
mineAndPool([
  '这个要求我们无法满足，需要走采购流程。',
  '我们保证在两周内交付。',
  '今天天气不错。',
])
const drafts = listDrafts('候选')
check('规则挖掘命中 2 条（一般文本不入池）', drafts.length === 2)
const d1 = drafts[0]
confirmDraft(d1.id, { regressionReportId: 'REP-V2-001' })
check('草稿确认后进入样例卡（候选修订）', loadCardsState().file.current.exemplars.items.some(x => x.say.includes('无法满足')))

console.log('== 剧本四：关系档案（开环 → 装配回注 → 闭环） ==')
await addRelationEntry({ actorId: 'act_cust_1', kind: '观察', content: 'act_cust_1 询问 A 产品报价', openLoop: { via: '对话承诺' } })
await addRelationEntry({ actorId: 'act_cust_1', kind: '推断', content: 'act_cust_1 对价格敏感' })
const loops = openLoopsForActor('act_cust_1')
check('开环在案', loops.length === 1)
const asm = Asm.assembleMemoryPack({ userId: 'act_cust_1', isMaster: false, actorId: 'act_cust_1' }, { turnId: 'turn-v2-1' })
check('装配自动回注关系摘要段', asm.receipt.relationDigest !== undefined && asm.receipt.relationDigest.openLoops.length === 1)
await closeOpenLoop(loops[0].id, '主人确认已跟进')
check('闭环后开环清零', openLoopsForActor('act_cust_1').length === 0)

console.log('== 剧本五：影子测试存储（判定不可改 + 统计） ==')
const SH = await import('file:///D:/development/Coder/nodejs/dsh/dsh-regression/lib/shadow.js')
const p1 = SH.addPair({ visitorInput: '何时交付？', masterReply: '周五前给初稿', twinReply: '马上就好' })
SH.judgePair(p1.pair.id, '分身')
const reJudge = SH.judgePair(p1.pair.id, '主人')
check('判定不可改', reJudge.pair.judged === '分身')
const st = SH.shadowStats(30)
check('分辨不出率=1.0（选了分身）', st.confusionRate === 1)

console.log(failed === 0 ? '\nV2 端到端剧本全部通过 ✓' : `\n${failed} 项失败 ✗`)
process.exit(failed === 0 ? 0 : 1)
