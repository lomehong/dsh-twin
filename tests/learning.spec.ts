/**
 * V2 学习闭环契约测试：指纹归一 / 证据权重门槛 / 晋升 / 主人确认 / 驳回 / 回归门禁。
 * 注意：enqueue 在入参 store 上原地 push，调用方应保留同一个引用累加事件。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let home: string
beforeEach(() => { home = mkdtempSync(join(tmpdir(), 'dsh-twin-learn-')); process.env.DSH_HOME = home })
afterEach(() => { delete process.env.DSH_HOME; rmSync(home, { recursive: true, force: true }) })

async function L() { return import('../src/learning.ts') }

function freshStore() {
  return { events: { events: [] }, candidates: { candidates: [] } }
}

describe('fingerprint（指纹幂等归一）', () => {
  it('NFC + 去标点 + 折叠空白 + 截断，幂等', async () => {
    const { fingerprint } = await L()
    const a = fingerprint('客户坚持要打八折时，分身直接答应了！')
    const b = fingerprint('  客户 坚持 要打八折时,分身 直接答应了。')
    // 都归一化为同一无标点无多余空格的串
    expect(a).toBe('客户坚持要打八折时分身直接答应了')
    expect(b).toBe('客户坚持要打八折时分身直接答应了')
    expect(a).toBe(b)
    expect(a.includes('八折')).toBe(true)
    expect(a.length).toBeLessThanOrEqual(80)
  })
  it('空输入返回空串（调用方应拒绝入队）', async () => {
    const { fingerprint } = await L()
    expect(fingerprint('   ')).toBe('')
    expect(fingerprint(123)).toBe('')
  })
})

describe('enqueue（指纹聚合 + 晋升）', () => {
  it('第 1 次同类信号：仅观察（weight=1）', async () => {
    const { enqueue } = await L()
    const s = freshStore()
    const r = enqueue({ kind: '纠正', signal: '客户问八折时直接答应', by: '主人' }, s.events, s.candidates)
    expect(r.candidate).toBeUndefined()
    expect(r.event.status).toBe('观察')
    expect(r.event.weight).toBe(1)
    expect(s.events.events.length).toBe(1)
  })
  it('同类累计 N=3 → 候选修订（同时把已有同类事件升级为候选修订）', async () => {
    const { enqueue } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '客户问八折时直接答应', by: '主人' }, s.events, s.candidates)
    }
    expect(s.events.events.length).toBe(3)
    expect(s.events.events.every(e => e.status === '候选修订')).toBe(true)
    expect(s.candidates.candidates.length).toBe(1)
    expect(s.candidates.candidates[0]?.kind).toBe('样例卡')
  })
  it('不同信号、不同 target：各自独立晋升', async () => {
    const { enqueue } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '应当先确认范围', by: '主人' }, s.events, s.candidates)
    }
    expect(s.candidates.candidates.length).toBe(1)
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '应当先确认范围', target: '策略卡', by: '主人' }, s.events, s.candidates)
    }
    expect(s.events.events.length).toBe(6)
    expect(s.candidates.candidates.length).toBe(2)
  })
  it('显式归因：一次即候选', async () => {
    const { enqueue } = await L()
    const s = freshStore()
    const r = enqueue(
      { kind: '事实更正', signal: '客户实际采购价是 5 万', target: '记忆', by: '主人', explicitAttribution: true } as any,
      s.events, s.candidates,
    )
    expect(r.candidate).toBeDefined()
    expect(r.event.status).toBe('候选修订')
  })
  it('否决信号门槛 = 2，事实更正门槛 = 1', async () => {
    const { enqueue } = await L()
    const s = freshStore()
    // 否决第 1 次仍是观察
    enqueue({ kind: '否决', signal: '在 A 客户上不应报价', by: '主人' }, s.events, s.candidates)
    expect(s.events.events[0]?.status).toBe('观察')
    // 第 2 次晋升
    enqueue({ kind: '否决', signal: '在 A 客户上不应报价', by: '主人' }, s.events, s.candidates)
    expect(s.events.events.every(e => e.status === '候选修订')).toBe(true)
    // 事实更正 1 次晋升
    enqueue({ kind: '事实更正', signal: '客户实际预算五万', target: '记忆', by: '主人' }, s.events, s.candidates)
    expect(s.candidates.candidates.some(c => c.kind === '记忆')).toBe(true)
  })
  it('驳回 = 同类不再晋升（驳回事件排除出同类聚合）', async () => {
    const { enqueue, rejectCandidate } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '应当保持安静', by: '主人' }, s.events, s.candidates)
    }
    const cid = s.candidates.candidates[0]?.id
    expect(cid).toBeDefined()
    rejectCandidate(cid!, s.candidates, s.events)
    expect(s.candidates.candidates[0]?.status).toBe('已驳回')
    expect(s.events.events.every(e => e.status === '已驳回')).toBe(true)
    // 再来一次同类（已驳回事件被过滤，不计入同类）→ 应成为新一类（观察）
    enqueue({ kind: '纠正', signal: '应当保持安静', by: '主人' }, s.events, s.candidates)
    // 第四个事件：同类（同指纹）已经被过滤，新事件 status='观察'
    const last = s.events.events.at(-1)
    expect(last?.status).toBe('观察')
  })
})

describe('confirm → apply（回归门禁）', () => {
  it('confirm 后 apply 缺 regressionReportId 拒绝', async () => {
    const { enqueue, confirmCandidate, applyCandidate } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '请先确认范围', by: '主人' }, s.events, s.candidates)
    }
    const cid = s.candidates.candidates[0]?.id!
    confirmCandidate(cid, '主人', s.candidates)
    const r = applyCandidate(cid, '', s.candidates, s.events)
    expect(r).toBeUndefined() // 缺 reportId 返回未未生效
    expect(s.candidates.candidates.find(c => c.id === cid)?.regressionReportId).toBeUndefined()
  })
  it('confirm + apply(reportId) → 候选已入卡 + 事件已入卡', async () => {
    const { enqueue, confirmCandidate, applyCandidate } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '请先确认范围', by: '主人' }, s.events, s.candidates)
    }
    const cid = s.candidates.candidates[0]?.id!
    confirmCandidate(cid, '主人', s.candidates)
    const r = applyCandidate(cid, 'REP-20260902-001', s.candidates, s.events)
    expect(r).toBeDefined()
    expect(r?.status).toBe('已入卡')
    expect(r?.regressionReportId).toBe('REP-20260902-001')
    expect(r?.appliedAt).toBeDefined()
    expect(s.events.events.filter(e => e.status === '已入卡').length).toBe(3)
  })
  it('apply 未确认候选 → 拒绝', async () => {
    const { enqueue, applyCandidate } = await L()
    const s = freshStore()
    for (let i = 0; i < 3; i++) {
      enqueue({ kind: '纠正', signal: '请先确认范围', by: '主人' }, s.events, s.candidates)
    }
    const cid = s.candidates.candidates[0]?.id!
    const r = applyCandidate(cid, 'REP-1', s.candidates, s.events)
    expect(r).toBeDefined()
    expect(r?.status).toBe('候选修订')
  })
})

describe('listEvents / listCandidates（查询）', () => {
  it('按 status 过滤 + 截断', async () => {
    const { enqueue, saveEvents, listEvents, listCandidates } = await L()
    for (let i = 0; i < 5; i++) {
      // 每次从磁盘重读 + 落盘（模拟路由调用流程）
      const evs = { events: (await import('../src/learning.ts')).loadEvents().events }
      const cs = { candidates: (await import('../src/learning.ts')).loadCandidates().candidates }
      enqueue({ kind: '纠正', signal: `场景 ${i}`, by: '主人' }, evs, cs)
      saveEvents(evs)
    }
    expect(listEvents({ status: '观察' }).length).toBe(5)
    expect(listEvents({ limit: 3 }).length).toBe(3)
    expect(listCandidates().length).toBe(0) // N=3 之前都不晋升（每个指纹只来了一次）
  })
})