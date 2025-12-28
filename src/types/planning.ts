/**
 * 规划相关类型定义
 */

import { RequirementAnalysis } from './requirement'

// 风格示例贴
export interface StyleExample {
  styleId: string
  styleName: string
  previewImage: string // 示例图片URL
  colorPalette: string[] // 配色方案
  typography?: {
    fontFamily: string
    fontSize: string
    fontWeight: string
  }
  layout?: {
    type: string
    description: string
  }
  description: string // 风格描述
}

// 页面内容
export interface PageContent {
  index: number
  title: string
  content: string
  imagePrompt: string
  templateType: string // TemplateId
}

// 内容大纲
export interface ContentOutline {
  cover: PageContent
  pages: PageContent[]
  summary?: PageContent
}

// 风格包（复用现有类型，这里简化定义）
export interface StylePack {
  style_id: string
  style_name: string
  [key: string]: any
}

// 单篇内容规划
export interface SingleContentPlan {
  id: string
  index: number // 在整体规划中的序号
  title: string // 内容标题
  outline: ContentOutline // 内容大纲
  stylePack: StylePack // 风格方案
  styleExample?: StyleExample // 风格示例贴（可视化）
  publishSchedule: {
    scheduledTime: number // 时间戳
    date: string // YYYY-MM-DD
    time: string // HH:mm
    platform: 'xiaohongshu'
    status: 'draft' | 'scheduled' | 'published'
  }
  resources: {
    imageCount: number
    textLength: number
    estimatedTime: number // 预计创作时间（分钟）
  }
  contentType: 'tutorial' | 'review' | 'recommendation' | 'comparison' | 'knowledge'
  diversity: {
    styleVariety: number // 风格多样性评分（0-1）
    typeVariety: number // 类型多样性评分（0-1）
    overallVariety: number // 整体多样性评分
  }
}

// 需求冲突问题
export interface ConflictIssue {
  id: string
  type: 'style_conflict' | 'time_conflict' | 'content_conflict' | 'resource_conflict'
  severity: 'low' | 'medium' | 'high'
  description: string
  affectedContents: string[] // 受影响的内容ID
  suggestion: string // 解决建议
  autoResolvable: boolean // 是否可自动解决
}

// 多内容规划（一周/一月）
export interface MultiContentPlan {
  id: string
  requirementId: string
  planName: string // 规划名称，如"一周内容规划"
  period: {
    startDate: string // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
    totalDays: number
  }
  contents: SingleContentPlan[] // 多篇内容规划
  overallStrategy: {
    totalContents: number
    contentTypeDistribution: Record<string, number> // 内容类型分布
    styleDistribution: Record<string, number> // 风格分布
    diversityScore: number // 整体多样性评分
  }
  publishSchedule: {
    distribution: 'daily' | 'weekday' | 'custom' // 发布频率分布
    bestTimes: number[] // 最佳发布时间（小时）
    totalScheduled: number
  }
  resources: {
    totalImageCount: number
    totalTextLength: number
    totalEstimatedTime: number // 总预计时间（分钟）
  }
  conflictCheck: {
    checked: boolean
    conflicts: ConflictIssue[]
    resolved: boolean
  }
  createdAt: number
  updatedAt: number
}

// 内容规划（兼容单篇和多篇）
export interface ContentPlan {
  id: string
  requirementId: string
  planType: 'single' | 'multi' // 单篇或多篇
  single?: SingleContentPlan
  multi?: MultiContentPlan
  createdAt: number
  updatedAt?: number
  confirmed?: boolean // 是否已确认
  confirmedAt?: number // 确认时间
}

// 规划过滤器
export interface PlanFilters {
  requirementId?: string
  planType?: 'single' | 'multi'
  dateRange?: {
    start: string
    end: string
  }
}

// Agent质检结果
export interface AgentQualityCheckResult {
  overallScore: number // 总体评分 0-1
  checks: Array<{
    category: string
    score: number
    issues: string[]
    suggestions: string[]
    severity: 'low' | 'medium' | 'high'
  }>
  summary: string
  conflicts: ConflictIssue[]
  resolved: boolean
  recommendations: string[]
}


