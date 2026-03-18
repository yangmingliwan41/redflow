/**
 * 案例相关类型定义
 */

/**
 * 案例分类类型
 */
export type CaseCategory = 'fashion' | 'beauty' | 'lifestyle' | 'food' | 'travel' | 'technology' | 'other'

/**
 * 案例配置信息
 */
export interface CaseConfig {
  /** 生成提示词 */
  prompt: string
  /** 风格ID */
  styleId: string
  /** 其他配置参数 */
  otherParams: {
    /** 图片比例 */
    aspectRatio?: string
    /** 温度参数 */
    temperature?: number
    /** 其他自定义参数 */
    [key: string]: any
  }
}

/**
 * 案例项数据结构
 */
export interface CaseItem {
  /** 案例ID */
  id: string
  /** 案例标题 */
  title: string
  /** 案例描述 */
  description: string
  /** 案例分类 */
  category: CaseCategory
  /** 使用的风格 */
  style: string
  /** 案例图片URL */
  imageUrl: string
  /** 案例配置信息 */
  config: CaseConfig
  /** 点赞数 */
  likes: number
  /** 浏览量 */
  views: number
  /** 创建时间 */
  createdAt: string
  /** 是否收藏 */
  isFavorite: boolean
}

/**
 * 案例排序方式
 */
export type CaseSortBy = 'latest' | 'popular' | 'recommended'

/**
 * 案例筛选条件
 */
export interface CaseFilter {
  /** 分类筛选 */
  category?: CaseCategory
  /** 排序方式 */
  sortBy: CaseSortBy
  /** 搜索关键词 */
  search?: string
}

/**
 * 案例数据管理状态
 */
export interface CaseState {
  /** 所有案例列表 */
  cases: CaseItem[]
  /** 筛选条件 */
  filter: CaseFilter
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: string | null
  /** 收藏列表 */
  favorites: string[]
}