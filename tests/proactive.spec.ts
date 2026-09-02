/**
 * v3 契约测试：状态卡汇入/衰减、主动触达候选生成、过闸送达、频控。
 * DSH_HOME 隔离；账本/记忆/IM 用 mock 注入。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let home: string
beforeEach(() => { home = mkdtempSync(join(tmpdir(), 'dsh-twin-v3-')); process.env.DSH_HOME = home })
afterEach(() => { delete process.env.DSH_HOME; rmSync(home, { recursive: true, force: true }) })

async function P() { return import('../src/proactive.ts') }
async function C() { return import('../src/cards.ts') }

describe('状态卡汇入与衰减（V3-M1）', () => {
  it('汇入种子：去重 + 上限 + 自动 decayAt', async () => {
    const { ingestStateSeeds } = await P()
    const { loadCardsState } = await C()
    const r = ingestStateSeeds([
      { content: '未闭环：客户 A 报价跟进', source: '关系轨' },
      { content: '未闭环：客户 A 报价跟进', source: '关系轨' }, // 去重
      { content: '未闭环：客户 B 交期承诺', source: '关系轨' },
    ])
    expect(r.added).toBe(2)
    expect(r.skipped).toBe(1)
    const st = loadCardsState()
    expect(st.file.current.state.items.length).toBe(2)
    expect(st.file.current.state.items[0]!.decayAt).toBeDefined()
    expect(st.file.current.state.items[0]!.source).toBe('关系轨')
  })

  it('预算裁剪：超过 STATE_BUDGET 只保留最新', async () => {
    const { ingestStateSeeds } = await P()
    const { loadCardsState } = await C()
    const seeds = Array.from({ length: 20 }, (_, i) => ({ content: `种子 ${i}`, source: '测试' }))
    ingestStateSeeds(seeds)
    expect(loadCardsState().file.current.state.items.length).toBe(12)
  })

  it('清理过期：decayAt 早于 now 的被移除', async () => {
    const { ingestStateSeeds, pruneExpiredState } = await P()
    const { loadCardsState } = await C()
    ingestStateSeeds([{ content: '即将过期', source: '测试' }])
    // 手动把 decayAt 拨到过去
    const st = loadCardsState()
    const items = st.file.current.state.items.map(s => ({ ...s, decayAt: '2020-01-01T00:00:00Z' }))
    const C2 = await C()
    C2.saveCards({ cards: { ...st.file.current, state: { items } }, confirm: false })
    const removed = pruneExpiredState()
    expect(removed).toBe(1)
    expect(loadCardsState().file.current.state.items.length).toBe(0)
  })
})

describe('主动触达候选（V3-M2）', () => {
  const staleLoop = (id: string, openedAt: string) => [{
    id,
    content: '客户 A 报价跟进',
    timestamp: openedAt,
    relation: { actorId: 'act_1', kind: '观察', openLoop: { openedAt, closedAt: undefined } },
  }]

  it('未闭环 >24h 的开环生成候选；新鲜开环不生', async () => {
    const { buildReachCandidates } = await P()
    const old = staleLoop('m1', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
    const fresh = staleLoop('m2', new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString())
    const cs = buildReachCandidates({ memory: { loadSharedMemory: () => [...old, ...fresh] } as never })
    expect(cs.length).toBe(1)
    expect(cs[0]!.kind).toBe('开环到期提醒')
    expect(cs[0]!.actorId).toBe('act_1')
    expect(cs[0]!.actionType).toBe('主动汇报')
  })

  it('待批审批生成候选', async () => {
    const { buildReachCandidates } = await P()
    const cs = buildReachCandidates({ ledger: { pendingApprovals: () => [{ id: 'P-1', actionType: '报价', targetScope: 'A 客户' }] } as never })
    expect(cs.length).toBe(1)
    expect(cs[0]!.kind).toBe('待办提醒')
  })

  it('已触达过的 refKey 不再生成（幂等）', async () => {
    const { buildReachCandidates, loadProactive, saveProactive, resetReachThrottleForTest } = await P()
    resetReachThrottleForTest()
    // 预写一条已触达记录（note=refKey）
    const store = loadProactive()
    store.reaches.push({
      id: 'PR-1', at: new Date().toISOString(), kind: '开环到期提醒', title: 't',
      target: {}, status: '已触达', note: '开环到期提醒:m1',
    })
    saveProactive(store)
    const old = staleLoop('m1', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
    const cs = buildReachCandidates({ memory: { loadSharedMemory: () => old } as never })
    expect(cs.length).toBe(0)
  })
})

describe('过闸送达与频控（V3-M2）', () => {
  it('L1 主动汇报：过闸放行 + im 送达 + 记录已触达', async () => {
    const { deliverReach, loadProactive } = await P()
    const delivered: string[] = []
    const im = {
      botsStatus: () => [{ kind: 'wecom', bindings: [{ userId: 'boss', isMaster: true }] }],
      pushToUser: async (k: string, u: string, t: string) => { delivered.push(`${k}:${u}:${t}`); return true },
    }
    const r = await deliverReach(
      { kind: '汇报', title: '汇报', text: '主人，有进展', actionType: '主动汇报', targetScope: '汇报', refKey: 'r1' },
      { im: im as never },
    )
    expect(r.ok).toBe(true)
    expect(delivered.length).toBe(1)
    const rec = loadProactive().reaches.at(-1)!
    expect(rec.status).toBe('已触达')
  })

  it('账本阻断（L2 未批准）：不送达、记录被阻断', async () => {
    const { deliverReach } = await P()
    const ledger = {
      check: () => ({ judgment: { decision: '阻断' }, record: { id: 'A-1' } }),
    }
    const im = { pushToUser: async () => { throw new Error('不应调用') } }
    const r = await deliverReach(
      { kind: '汇报', title: 't', text: 'x', actionType: '主动汇报', targetScope: 'x', refKey: 'r2' },
      { ledger: ledger as never, im: im as never },
    )
    expect(r.ok).toBe(false)
    expect(r.blocked).toBe(true)
  })

  it('频控：窗口内超 3 条拒绝', async () => {
    const { deliverReach, resetReachThrottleForTest } = await P()
    resetReachThrottleForTest()
    const im = {
      botsStatus: () => [{ kind: 'wecom', bindings: [{ userId: 'boss', isMaster: true }] }],
      pushToUser: async () => true,
    }
    for (let i = 0; i < 3; i++) {
      const r = await deliverReach({ kind: '汇报', title: `t${i}`, text: 'x', actionType: '主动汇报', targetScope: 'x', refKey: `r${i}` }, { im: im as never })
      expect(r.ok).toBe(true)
    }
    const r4 = await deliverReach({ kind: '汇报', title: 't4', text: 'x', actionType: '主动汇报', targetScope: 'x', refKey: 'r4' }, { im: im as never })
    expect(r4.ok).toBe(false)
    expect(r4.error).toContain('频控')
  })

  it('im-channel 缺席：降级记录', async () => {
    const { deliverReach, loadProactive, resetReachThrottleForTest } = await P()
    resetReachThrottleForTest()
    const r = await deliverReach({ kind: '汇报', title: 't', text: 'x', actionType: '主动汇报', targetScope: 'x', refKey: 'r9' }, {})
    expect(r.ok).toBe(false)
    expect(r.reached?.status).toBe('降级')
  })
})
