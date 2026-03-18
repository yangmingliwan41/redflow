/**
 * 需求分析相关类型定义
 */

export interface RequirementAnalysis {
  id: string
  userInput: string
  extractedTopic: string
  targetAudience: {
    age: string
    gender: string
    interests: string[]
  }
  contentType: 'tutorial' | 'review' | 'recommendation' | 'comparison' | 'knowledge'
  suggestedStyles: string[]
  keywords: string[]
  createdAt: number
  updatedAt?: number
  userId?: string // 用户ID（可选）
  // 深度需求分析（未来扩展）
  deep?: {
    goal: {
      questionId: string
      answers: Array<{
        questionId: string
        value: string
      }>
    }
  }
  // 向导式需求分析字段（新增）
  productDescription?: string // 产品描述
  selectedStyles?: string[] // 用户选择的风格（数组）
  sellingPoints?: string[] // 产品卖点（数组）
  followUpAnswers?: Record<string, any> // 追问答案（对象，key为问题ID）
  questionFlow?: QuestionFlowRecord[] // 问题流程记录
  inputMode?: 'text' | 'wizard' // 输入模式：文本输入或向导式
  // 调研数据（新增）
  researchData?: {
    platformTrends: string[] // 平台趋势
    competitorAnalysis: string // 竞品分析
    keywordSuggestions: string[] // 关键词建议
    contentTypeRecommendations: string[] // 内容类型建议
    marketInsights: string // 市场洞察
    platformTips: string[] // 平台运营建议
  }
}

/**
 * 问题流程记录
 */
export interface QuestionFlowRecord {
  questionId: string
  questionType: 'product' | 'style' | 'sellingPoint' | 'followUp'
  questionText: string
  answer: any
  answeredAt: number
  skipped?: boolean
}

/**
 * 问题定义
 */
export interface QuestionDefinition {
  id: string
  type: 'product' | 'style' | 'sellingPoint' | 'followUp'
  text: string
  required: boolean
  validation?: (answer: any) => boolean | string
  skipCondition?: (answers: Record<string, any>) => boolean
  cardSelectorType?: 'targetAudience' | 'publishFrequency' | 'contentType' // 卡片选择器类型
}

export interface RequirementAnalysisResult {
  requirement: RequirementAnalysis
  confidence: number // 分析置信度 0-1
  suggestions: string[] // 建议
}


