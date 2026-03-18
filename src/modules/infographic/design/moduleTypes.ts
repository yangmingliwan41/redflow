/**
 * 设计模块类型：唯一 id、布局约束，供注册表与组合规范使用
 */

export type ModuleId =
  | 'header'
  | 'hero-dual'
  | 'metrics-block'
  | 'advantage-grid'
  | 'plan-cards'
  | 'quote-cta'
  | 'strategy-effect'

export type LayoutHints = {
  /** 占几行（网格） */
  rowSpan?: number
  /** 占几列（网格） */
  colSpan?: number
  /** 最小高度 px */
  minHeight?: number
  /** 首选高度占比 0–1，相对画布 */
  preferredRatio?: number
}

export type ModuleMeta = {
  id: ModuleId
  name: string
  /** 内容 schema 描述，用于文档/LLM */
  contentSchema: string
  layoutHints: LayoutHints
}

export const MODULE_METAS: Record<ModuleId, ModuleMeta> = {
  header: {
    id: 'header',
    name: '页头',
    contentSchema: 'InfographicLayoutMeta (title, subtitle, tagline)',
    layoutHints: { rowSpan: 1, colSpan: 1, minHeight: 80, preferredRatio: 0.08 }
  },
  'hero-dual': {
    id: 'hero-dual',
    name: '双卡区（左文右数）',
    contentSchema: 'background + data sections',
    layoutHints: { rowSpan: 1, colSpan: 2, minHeight: 200, preferredRatio: 0.22 }
  },
  'metrics-block': {
    id: 'metrics-block',
    name: '关键数字块',
    contentSchema: 'DataContent (metrics[])',
    layoutHints: { rowSpan: 1, colSpan: 1, minHeight: 180 }
  },
  'advantage-grid': {
    id: 'advantage-grid',
    name: '优势网格',
    contentSchema: 'AdvantagesContent (items[])',
    layoutHints: { rowSpan: 1, colSpan: 2, minHeight: 160, preferredRatio: 0.2 }
  },
  'plan-cards': {
    id: 'plan-cards',
    name: '方案对比卡',
    contentSchema: 'PlansContent (plans[])',
    layoutHints: { rowSpan: 1, colSpan: 2, minHeight: 220, preferredRatio: 0.28 }
  },
  'quote-cta': {
    id: 'quote-cta',
    name: '金句 / CTA',
    contentSchema: 'SummaryContent (paragraphs[])',
    layoutHints: { rowSpan: 1, colSpan: 1, minHeight: 120, preferredRatio: 0.15 }
  },
  'strategy-effect': {
    id: 'strategy-effect',
    name: '策略 + 结论双列',
    contentSchema: 'StrategyContent + EffectContent',
    layoutHints: { rowSpan: 1, colSpan: 2, minHeight: 180 }
  }
}
