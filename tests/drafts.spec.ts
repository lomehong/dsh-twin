/**
 * 样例候选池 + 规则挖掘契约测试（V2-M2a/M2b）：
 * 规则分类 / 指纹去重 / 确认入卡 / 生效双条件 / 驳回。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let home: string
beforeEach(() => { home = mkdtempSync(join(tmpdir(), 'dsh-twin-drafts-')); process.env.DSH_HOME = home })
afterEach(() => { delete process.env.DSH_HOME; rmSync(home, { recursive: true, force: true }) })

async function D() { return import('../src/drafts.ts') }

describe('规则式挖掘', () => {
  it('拒绝/承诺/澄清三类命中；一般文本不入池', async () => {
    const { mineAndPool, listDrafts } = await D()
    const r = mineAndPool([
      '这个要求我们无法满足，需要走流程。',       // 拒绝边界
      '我们保证下周内给出方案。',                 // 承诺措辞
      '方便先确认一下您的具体需求吗？',           // 澄清确认
      '今天天气不错。',                            // 一般：不入池
    ])
    expect(r.scanned).toBe(4)
    expect(r.added).toBe(3)
    expect(listDrafts().map(d => d.category)).toEqual(['拒绝边界', '承诺措辞', '澄清确认'])
  })
  it('同 say 指纹去重', async () => {
    const { mineAndPool, listDrafts } = await D()
    mineAndPool(['这个需求我们无法满足。'])
    const r = mineAndPool(['这个需求我们无法满足。'])
    expect(r.added).toBe(0)
    expect(r.duplicates).toBe(1)
    expect(listDrafts().length).toBe(1)
  })
})

describe('确认入卡（与四张卡联动）', () => {
  it('确认 → 合并进样例卡；无回归报告时停留候选修订（不生效）', async () => {
    const { mineAndPool, confirmDraft, listDrafts } = await D()
    mineAndPool(['这个要求我们无法满足，需要走流程。'])
    const id = listDrafts()[0]!.id
    const r = confirmDraft(id, {})
    expect(r.ok).toBe(true)
    expect(listDrafts()[0]!.state).toBe('已确认')

    const cards = await import('../src/cards.ts')
    const st = cards.loadCardsState()
    expect(st.file.current.exemplars.items.length).toBe(1)
    expect(st.hasEffective).toBe(false) // 无回归报告 → 候选修订，不生效
  })
  it('带回归报告确认 → 卡生效', async () => {
    const { mineAndPool, confirmDraft, listDrafts } = await D()
    mineAndPool(['我们保证在两周内交付。'])
    const id = listDrafts()[0]!.id
    confirmDraft(id, { regressionReportId: 'REP-X' })
    const cards = await import('../src/cards.ts')
    const st = cards.loadCardsState()
    expect(st.hasEffective).toBe(true)
    expect(st.file.regressionReportId).toBe('REP-X')
  })
  it('重复确认拒绝；驳回后不可确认', async () => {
    const { mineAndPool, confirmDraft, rejectDraft, listDrafts } = await D()
    mineAndPool(['这个需求我们无法满足。'])
    const id = listDrafts()[0]!.id
    expect(confirmDraft(id, {}).ok).toBe(true)
    expect(confirmDraft(id, {}).ok).toBe(false) // 已确认

    mineAndPool(['我们不能接受这个条件。'])
    const id2 = listDrafts().find(d => d.state === '候选')!.id
    expect(rejectDraft(id2).ok).toBe(true)
    expect(confirmDraft(id2, {}).ok).toBe(false) // 已驳回
  })
})
