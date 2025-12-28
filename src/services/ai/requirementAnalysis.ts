/**
 * 需求分析AI服务
 * 调用AI服务进行需求分析
 */

import { RequirementAnalysis, RequirementAnalysisResult } from '../../types'
import { callDeepSeekAPI } from './deepseek'
import { logger } from '../../composables/useLogger'
import { isMockMode } from './mock'

/**
 * 分析用户需求
 */
export async function analyzeRequirement(
  userInput: string
): Promise<RequirementAnalysisResult> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 需求分析')
    return mockAnalyzeRequirement(userInput)
  }

  const systemPrompt = `你是一个专业的内容策划专家，擅长分析用户需求并提取关键信息。
请根据用户输入，分析并提取以下信息：
1. 核心主题（简洁明确）
2. 目标受众（年龄、性别、兴趣）
3. 内容类型（tutorial教程、review测评、recommendation种草、comparison对比、knowledge知识分享）
4. 推荐风格（从小红书风格中选择2-3个合适的）
5. 关键词（3-5个）

请以JSON格式返回，格式如下：
{
  "extractedTopic": "核心主题",
  "targetAudience": {
    "age": "年龄段，如：18-25",
    "gender": "性别，如：女性、男性、不限",
    "interests": ["兴趣1", "兴趣2", "兴趣3"]
  },
  "contentType": "tutorial|review|recommendation|comparison|knowledge",
  "suggestedStyles": ["风格1", "风格2"],
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "confidence": 0.8
}`

  const prompt = `请分析以下用户需求：
"${userInput}"

请提取关键信息并返回JSON格式的分析结果。`

  try {
    const result = await callDeepSeekAPI(prompt, systemPrompt)
    const analysisText = result.text.trim()

    // 解析JSON（可能包含markdown代码块）
    let jsonText = analysisText
    if (jsonText.startsWith('```')) {
      const firstIndex = jsonText.indexOf('```')
      const lastIndex = jsonText.lastIndexOf('```')
      if (firstIndex !== lastIndex && firstIndex >= 0 && lastIndex > firstIndex) {
        jsonText = jsonText.substring(firstIndex + 3, lastIndex).trim()
        if (jsonText.startsWith('json')) {
          jsonText = jsonText.substring(4).trim()
        }
      }
    }

    // 提取JSON对象
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const analysisData = JSON.parse(jsonText)

    const requirement: RequirementAnalysis = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userInput,
      extractedTopic: analysisData.extractedTopic || userInput,
      targetAudience: {
        age: analysisData.targetAudience?.age || '18-35',
        gender: analysisData.targetAudience?.gender || '不限',
        interests: analysisData.targetAudience?.interests || []
      },
      contentType: analysisData.contentType || 'recommendation',
      suggestedStyles: analysisData.suggestedStyles || ['xiaohongshu'],
      keywords: analysisData.keywords || [],
      createdAt: Date.now()
    }

    return {
      requirement,
      confidence: analysisData.confidence || 0.8,
      suggestions: analysisData.suggestions || []
    }
  } catch (error: any) {
    logger.error('需求分析失败:', error)
    
    // 返回基础分析结果
    const requirement: RequirementAnalysis = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userInput,
      extractedTopic: userInput,
      targetAudience: {
        age: '18-35',
        gender: '不限',
        interests: []
      },
      contentType: 'recommendation',
      suggestedStyles: ['xiaohongshu'],
      keywords: [],
      createdAt: Date.now()
    }

    return {
      requirement,
      confidence: 0.5,
      suggestions: ['建议提供更详细的需求描述以获得更准确的分析']
    }
  }
}

/**
 * 模拟模式的需求分析
 */
function mockAnalyzeRequirement(userInput: string): RequirementAnalysisResult {
  const requirement: RequirementAnalysis = {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userInput,
    extractedTopic: userInput.substring(0, 20) + '...',
    targetAudience: {
      age: '18-25',
      gender: '女性',
      interests: ['美妆', '时尚', '生活']
    },
    contentType: 'recommendation',
    suggestedStyles: ['xiaohongshu', 'ins_minimal'],
    keywords: ['关键词1', '关键词2', '关键词3'],
    createdAt: Date.now()
  }

  return {
    requirement,
    confidence: 0.9,
    suggestions: ['这是模拟数据，实际使用时会调用AI进行分析']
  }
}


