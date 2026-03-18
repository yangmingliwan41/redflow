import type { InfographicLayout, InfographicSectionSlot } from '../schema/types'
import type { CompositionSpec, ModuleInstance, RowSpec } from '../design/compositionTypes'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../design/placementRules'

function getSectionBySlot(layout: InfographicLayout, slot: InfographicSectionSlot) {
  return layout.sections.find(s => s.slot === slot)
}

/**
 * 将 InfographicLayout 转为 CompositionSpec：按 section 顺序组行，header 从 meta 生成
 */
export function layoutToComposition(
  layout: InfographicLayout,
  canvas?: { width: number; height: number }
): CompositionSpec {
  const rows: RowSpec[] = []
  const { meta, sections } = layout

  // 页头：始终从 meta 生成
  rows.push({
    modules: [{ moduleId: 'header', content: meta }],
    gap: 0,
    align: 'stretch'
  })

  const background = getSectionBySlot(layout, 'background')
  const data = getSectionBySlot(layout, 'data')
  if (background && data && background.content.kind === 'background' && data.content.kind === 'data') {
    rows.push({
      modules: [{
        moduleId: 'hero-dual',
        content: { background: background.content.data, data: data.content.data }
      }],
      align: 'stretch'
    })
  }

  const advantages = getSectionBySlot(layout, 'advantages')
  if (advantages && advantages.content.kind === 'advantages') {
    rows.push({
      modules: [{ moduleId: 'advantage-grid', content: advantages.content.data }],
      align: 'stretch'
    })
  }

  const plans = getSectionBySlot(layout, 'plans')
  if (plans && plans.content.kind === 'plans') {
    rows.push({
      modules: [{ moduleId: 'plan-cards', content: plans.content.data }],
      align: 'stretch'
    })
  }

  const summary = getSectionBySlot(layout, 'summary')
  if (summary && summary.content.kind === 'summary') {
    rows.push({
      modules: [{ moduleId: 'quote-cta', content: summary.content.data }],
      align: 'stretch'
    })
  }

  return {
    canvas: canvas ?? { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    themeId: meta.themeId,
    meta,
    rows
  }
}
