import type { BrainBrief } from './types'
import type { CompositionSpec } from '../design/compositionTypes'
import { applyPlacementRules } from '../design/placementRules'
import { getLayoutForBrief } from './templates'
import { layoutToComposition } from './layoutToComposition'

/**
 * 根据主题/案例 brief 计算组合规范（Phase 1：模板 + layout 内容，无 LLM）
 */
export function computeComposition(brief: BrainBrief): CompositionSpec {
  const layout = getLayoutForBrief(brief)
  const spec = layoutToComposition(layout)
  return applyPlacementRules(spec)
}

export type { BrainBrief } from './types'
export { getLayoutForBrief } from './templates'
export { layoutToComposition } from './layoutToComposition'
