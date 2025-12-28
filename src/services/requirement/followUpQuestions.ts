/**
 * 智能追问逻辑
 * 根据用户已回答的问题，智能决定是否需要追问
 */

import { QuestionDefinition } from '../../types/requirement'

export interface FollowUpContext {
  productDescription: string
  selectedStyles: string[]
  sellingPoints: string[]
}

/**
 * 判断是否需要追问某个问题
 */
export function shouldAskFollowUp(
  context: FollowUpContext,
  questionType: 'targetAudience' | 'publishFrequency' | 'contentType'
): boolean {
  const { productDescription } = context

  switch (questionType) {
    case 'targetAudience':
      // 检查产品描述中是否包含目标受众信息
      const audienceKeywords = ['面向', '目标', '受众', '用户', '客户', '人群', '年龄', '性别']
      const hasAudienceInfo = audienceKeywords.some(keyword => 
        productDescription.includes(keyword)
      )
      return !hasAudienceInfo

    case 'publishFrequency':
      // 检查产品描述中是否包含发布频率信息
      const frequencyKeywords = ['每天', '每周', '每月', '发布', '频率', '次数', '篇', '条']
      const hasFrequencyInfo = frequencyKeywords.some(keyword => 
        productDescription.includes(keyword)
      )
      return !hasFrequencyInfo

    case 'contentType':
      // 检查产品描述中是否包含内容类型信息
      const contentTypeKeywords = ['教程', '测评', '推荐', '对比', '知识', '攻略', '指南']
      const hasContentTypeInfo = contentTypeKeywords.some(keyword => 
        productDescription.includes(keyword)
      )
      return !hasContentTypeInfo

    default:
      return false
  }
}

/**
 * 获取需要追问的问题列表（最多2个）
 */
export function getFollowUpQuestions(context: FollowUpContext): QuestionDefinition[] {
  const questions: QuestionDefinition[] = []

  // 优先级1：目标受众（如果不明确）
  if (shouldAskFollowUp(context, 'targetAudience') && questions.length < 2) {
    questions.push({
      id: 'targetAudience',
      type: 'followUp',
      text: '请选择您的目标受众',
      required: false,
      validation: (answer: any) => {
        if (answer && (typeof answer === 'object' || typeof answer === 'string')) {
          return true
        }
        return '请选择目标受众信息'
      },
      // 标记为卡片选择器类型
      cardSelectorType: 'targetAudience'
    })
  }

  // 优先级2：发布频率（如果不明确）
  if (shouldAskFollowUp(context, 'publishFrequency') && questions.length < 2) {
    questions.push({
      id: 'publishFrequency',
      type: 'followUp',
      text: '您希望的内容发布频率是？',
      required: false,
      validation: (answer: any) => {
        if (answer && (typeof answer === 'string' || typeof answer === 'object')) {
          return true
        }
        return '请选择发布频率'
      },
      // 标记为卡片选择器类型
      cardSelectorType: 'publishFrequency'
    })
  }

  // 优先级3：内容类型（如果不明确且还有空间）
  if (shouldAskFollowUp(context, 'contentType') && questions.length < 2) {
    questions.push({
      id: 'contentType',
      type: 'followUp',
      text: '您希望生成什么类型的内容？',
      required: false,
      validation: (answer: any) => {
        if (answer && (typeof answer === 'string' || typeof answer === 'object')) {
          return true
        }
        return '请选择内容类型'
      },
      // 标记为卡片选择器类型
      cardSelectorType: 'contentType'
    })
  }

  return questions
}

/**
 * 根据风格类型获取额外的追问问题
 */
export function getStyleBasedFollowUp(
  styleIds: string[],
  context: FollowUpContext
): QuestionDefinition[] {
  const questions: QuestionDefinition[] = []

  // 科技风格可能需要技术细节
  if (styleIds.includes('tech_future')) {
    if (questions.length < 2) {
      questions.push({
        id: 'techDetails',
        type: 'followUp',
        text: '是否需要突出产品的技术特点或创新点？',
        required: false
      })
    }
  }

  // 小红书风格可能需要更多营销信息
  if (styleIds.includes('xiaohongshu')) {
    if (questions.length < 2 && !context.sellingPoints.includes('颜值')) {
      questions.push({
        id: 'visualStyle',
        type: 'followUp',
        text: '您希望内容更注重视觉呈现还是文字表达？',
        required: false
      })
    }
  }

  return questions
}

