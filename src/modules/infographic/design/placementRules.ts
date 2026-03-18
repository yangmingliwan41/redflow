import type { CompositionSpec, RowSpec } from './compositionTypes'

/** 区块间距（8 的倍数） */
export const SECTION_GAP = 48

/** 行内模块间距 */
export const ROW_GAP = 28

/** 底部 CTA/金句区最小高度 px */
export const BOTTOM_MIN_HEIGHT = 140

/** 画布默认尺寸 */
export const CANVAS_WIDTH = 1242
export const CANVAS_HEIGHT = 1660

/**
 * 对组合规范应用放置规则：补全 gap、规范化比例等（当前仅做占位，后续可加校验与自动补全）
 */
export function applyPlacementRules(spec: CompositionSpec): CompositionSpec {
  const rows: RowSpec[] = spec.rows.map(row => ({
    ...row,
    gap: row.gap ?? ROW_GAP,
    align: row.align ?? 'stretch'
  }))
  return {
    ...spec,
    canvas: spec.canvas.width && spec.canvas.height
      ? spec.canvas
      : { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    rows
  }
}
