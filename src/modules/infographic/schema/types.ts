export type InfographicSize = {
  width: number
  height: number
}

export type RGBA = { r: number; g: number; b: number; a?: number }

export type Point = { x: number; y: number }

export type ElementBase = {
  id: string
  name?: string
  position: Point
  rotation?: number
  opacity?: number
  zIndex?: number
}

export type TextElement = ElementBase & {
  type: 'text'
  text: string
  width?: number
  height?: number
  fontFamily?: string
  fontSize: number
  fontWeight?: number | string
  lineHeight?: number
  letterSpacing?: number
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  maxLines?: number
}

export type ImageElement = ElementBase & {
  type: 'image'
  src: string
  width: number
  height: number
  borderRadius?: number
  fit?: 'cover' | 'contain'
}

export type ShapeElement = ElementBase & {
  type: 'shape'
  shape: 'rect' | 'circle'
  width: number
  height: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  borderRadius?: number
}

export type InfographicElement = TextElement | ImageElement | ShapeElement

export type InfographicDocument = {
  version: 1
  size: InfographicSize
  background?: string
  elements: InfographicElement[]
}

export type ImageFlowItem =
  | { kind: 'image'; label?: string }
  | { kind: 'shape'; label?: string }
  | { kind: 'text'; text: string }

export type ImageFlow = ImageFlowItem[]

// 语义化布局结构，用于描述报表型图文海报的逻辑区块

export type InfographicLayoutMeta = {
  title: string
  subtitle?: string
  tagline?: string
  themeId?: string
  reportYear?: string
  /** 结尾标签文案，如 "SAVE THIS"；不设则用 "REPORT" + reportYear */
  tagLabel?: string
}

export type InfographicSectionSlot =
  | 'header'
  | 'background'
  | 'strategy'
  | 'data'
  | 'effect'
  | 'summary'
  // 新版语义布局：优势区与方案区
  | 'advantages'
  | 'plans'

export type HeaderTag = {
  label: string
}

export type HeaderContent = {
  tags?: HeaderTag[]
  note?: string
}

export type BackgroundBullet = {
  label: string
  items: string[]
}

export type BackgroundContent = {
  intro?: string
  bullets: BackgroundBullet[]
}

export type StrategyPhase = {
  name: string
  duration?: string
  focus: string[]
}

export type StrategyContent = {
  phases: StrategyPhase[]
}

export type DataMetric = {
  label: string
  value: string
  comment?: string
}

export type DataContent = {
  metrics: DataMetric[]
}

export type EffectGroup = {
  heading: string
  bullets: string[]
}

export type EffectContent = {
  groups: EffectGroup[]
}

// 优势区：抽象为卡片列表，适配「平台优势」「起号优势」等网格内容
export type AdvantageItem = {
  title: string
  highlight?: string
  description?: string
}

export type AdvantagesContent = {
  items: AdvantageItem[]
}

// 方案区：左右对比套餐 / 方案
export type PlanFeature = {
  label: string
  highlight?: boolean
}

export type PlanCard = {
  name: string
  price?: string
  unit?: string
  tagline?: string
  highlight?: boolean
  features: PlanFeature[]
  note?: string
}

export type PlansContent = {
  plans: PlanCard[]
}

export type SummaryContent = {
  title?: string
  paragraphs: string[]
}

export type SectionContent =
  | { kind: 'header'; data: HeaderContent }
  | { kind: 'background'; data: BackgroundContent }
  | { kind: 'strategy'; data: StrategyContent }
  | { kind: 'data'; data: DataContent }
  | { kind: 'effect'; data: EffectContent }
  | { kind: 'advantages'; data: AdvantagesContent }
  | { kind: 'plans'; data: PlansContent }
  | { kind: 'summary'; data: SummaryContent }

export type InfographicSectionStyle = {
  emphasis?: 'low' | 'medium' | 'high'
  highlightColor?: string
}

export type InfographicSection = {
  id: string
  slot: InfographicSectionSlot
  title?: string
  style?: InfographicSectionStyle
  content: SectionContent
}

export type InfographicLayout = {
  meta: InfographicLayoutMeta
  sections: InfographicSection[]
}



