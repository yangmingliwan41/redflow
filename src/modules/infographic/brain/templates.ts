import type { BrainBrief } from './types'
import type { InfographicLayout } from '../schema/types'
import { layoutCase1, layoutCase2, layoutCase3 } from '../schema/layoutSample'

/**
 * 根据 brief 选择预设 layout（Phase 1 规则驱动，无 LLM）
 */
export function getLayoutForBrief(brief: BrainBrief): InfographicLayout {
  if (brief.caseId === 'case2') return layoutCase2
  if (brief.caseId === 'case3') return layoutCase3
  if (brief.themeId === 'platform') return layoutCase2
  if (brief.themeId === 'travel') return layoutCase3
  return layoutCase1
}
