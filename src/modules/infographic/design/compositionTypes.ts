import type { ModuleId, LayoutHints } from './moduleTypes'
import type { InfographicLayoutMeta } from '../schema/types'

/**
 * 单模块实例：模块类型 + 内容 + 可选布局覆盖
 */
export type ModuleInstance = {
  moduleId: ModuleId
  content: unknown
  layoutOverrides?: Partial<LayoutHints>
}

/**
 * 一行规格：一行内多个模块如何分栏
 */
export type RowSpec = {
  modules: ModuleInstance[]
  gap?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
}

/**
 * 组合规范：一页由哪些行、每行哪些模块、画布与主题
 */
export type CompositionSpec = {
  canvas: { width: number; height: number }
  themeId?: string
  meta?: InfographicLayoutMeta
  rows: RowSpec[]
}
