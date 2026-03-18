import type { CompositionSpec } from './compositionTypes'
import type {
  InfographicLayout,
  InfographicSection,
  BackgroundContent,
  DataContent,
  AdvantagesContent,
  PlansContent,
  SummaryContent
} from '../schema/types'

/**
 * 将组合规范转回 InfographicLayout，供 buildDocumentFromLayout 导出 PNG
 */
export function compositionToLayout(spec: CompositionSpec): InfographicLayout {
  const meta = spec.meta ?? { title: '' }
  const sections: InfographicSection[] = []
  let sectionIndex = 0

  for (const row of spec.rows) {
    for (const mod of row.modules) {
      if (mod.moduleId === 'header') continue
      if (mod.moduleId === 'hero-dual') {
        const c = mod.content as { background?: BackgroundContent; data?: DataContent }
        if (c?.background) {
          sections.push({
            id: `sec_${sectionIndex++}`,
            slot: 'background',
            title: '背景与目标',
            content: { kind: 'background', data: c.background }
          })
        }
        if (c?.data) {
          sections.push({
            id: `sec_${sectionIndex++}`,
            slot: 'data',
            title: '4 个关键数字',
            content: { kind: 'data', data: c.data }
          })
        }
        continue
      }
      if (mod.moduleId === 'advantage-grid') {
        sections.push({
          id: `sec_${sectionIndex++}`,
          slot: 'advantages',
          title: '优势',
          content: { kind: 'advantages', data: mod.content as AdvantagesContent }
        })
        continue
      }
      if (mod.moduleId === 'plan-cards') {
        sections.push({
          id: `sec_${sectionIndex++}`,
          slot: 'plans',
          title: '方案',
          content: { kind: 'plans', data: mod.content as PlansContent }
        })
        continue
      }
      if (mod.moduleId === 'quote-cta') {
        sections.push({
          id: `sec_${sectionIndex++}`,
          slot: 'summary',
          content: { kind: 'summary', data: mod.content as SummaryContent }
        })
      }
    }
  }

  return { meta, sections }
}
