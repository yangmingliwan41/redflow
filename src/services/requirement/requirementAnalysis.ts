/**
 * 需求分析服务
 * 业务逻辑层，整合AI分析和存储
 */

import { RequirementAnalysis, RequirementAnalysisResult } from '../../types'
import { analyzeRequirement as aiAnalyzeRequirement } from '../ai/requirementAnalysis'
import { callDeepSeekAPI } from '../ai/deepseek'
// 调研分析功能暂时禁用
// import { conductResearch, ResearchContext, ResearchData } from '../ai/researchAgent'
import { storage } from '../storage/index'
import { eventBus, Events } from '../events'
import { logger } from '../../composables/useLogger'
import { v4 as uuidv4 } from 'uuid'

/**
 * 向导式输入数据接口
 */
export interface WizardInputData {
  product: string // 产品描述
  style: string[] // 选择的风格
  sellingPoint: string[] // 选择的卖点
  followUpAnswers?: Record<string, any> // 追问答案
  questionFlow?: any[] // 问题流程记录
}

/**
 * 分析用户需求并保存（支持文本输入和向导式输入）
 */
export async function analyzeAndSaveRequirement(
  userInput: string | WizardInputData,
  userId?: string
): Promise<RequirementAnalysisResult> {
  try {
    // 判断输入类型
    const isWizardInput = typeof userInput !== 'string'
    
    if (isWizardInput) {
      // 向导式输入
      return await analyzeAndSaveWizardRequirement(userInput as WizardInputData, userId)
    } else {
      // 旧版文本输入（向后兼容）
      return await analyzeAndSaveTextRequirement(userInput as string, userId)
    }
  } catch (error) {
    logger.error('需求分析失败:', error)
    throw error
  }
}

/**
 * 处理向导式输入
 */
async function analyzeAndSaveWizardRequirement(
  wizardData: WizardInputData,
  userId?: string
): Promise<RequirementAnalysisResult> {
  logger.debug('开始向导式需求分析:', wizardData)
  
  // 从向导式输入生成RequirementAnalysis对象
  const requirement: RequirementAnalysis = {
    id: `req_${Date.now()}_${uuidv4().slice(0, 8)}`,
    userInput: wizardData.product, // 产品描述作为主要输入
    extractedTopic: wizardData.product,
    targetAudience: {
      age: '18-35',
      gender: '不限',
      interests: []
    },
    contentType: 'recommendation',
    suggestedStyles: wizardData.style,
    keywords: extractKeywordsFromWizardData(wizardData),
    createdAt: Date.now(),
    // 向导式特有字段
    productDescription: wizardData.product,
    selectedStyles: wizardData.style,
    sellingPoints: wizardData.sellingPoint,
    followUpAnswers: wizardData.followUpAnswers || {},
    questionFlow: wizardData.questionFlow || [],
    inputMode: 'wizard'
  }

  // 从追问答案中提取目标受众信息
  if (wizardData.followUpAnswers?.targetAudience) {
    const audienceAnswer = wizardData.followUpAnswers.targetAudience
    // 如果是对象格式（来自卡片选择器）
    if (typeof audienceAnswer === 'object' && audienceAnswer !== null) {
      // 处理年龄（可能是字符串或数组）
      let ageValue: string
      if (Array.isArray(audienceAnswer.age)) {
        // 如果是数组，取第一个或合并显示
        ageValue = audienceAnswer.age.length > 0 ? audienceAnswer.age[0] : '18-35'
      } else {
        ageValue = audienceAnswer.age || '18-35'
      }
      
      requirement.targetAudience = {
        age: ageValue,
        gender: audienceAnswer.gender || '不限',
        interests: audienceAnswer.interests || []
      }
    } else {
      // 如果是字符串格式（兼容旧版）
      const audienceInfo = parseAudienceInfo(audienceAnswer)
      if (audienceInfo) {
        requirement.targetAudience = audienceInfo
      }
    }
  }

  // 从追问答案中提取内容类型
  if (wizardData.followUpAnswers?.contentType) {
    const contentTypeAnswer = wizardData.followUpAnswers.contentType
    // 如果是字符串格式（来自卡片选择器，直接是类型值）
    if (typeof contentTypeAnswer === 'string') {
      const validTypes: RequirementAnalysis['contentType'][] = ['tutorial', 'review', 'recommendation', 'comparison', 'knowledge']
      if (validTypes.includes(contentTypeAnswer as RequirementAnalysis['contentType'])) {
        requirement.contentType = contentTypeAnswer as RequirementAnalysis['contentType']
      } else {
        // 尝试解析中文描述
        const contentType = parseContentType(contentTypeAnswer)
        if (contentType) {
          requirement.contentType = contentType
        }
      }
    } else {
      // 兼容其他格式
      const contentType = parseContentType(String(contentTypeAnswer))
      if (contentType) {
        requirement.contentType = contentType
      }
    }
  }

  // 使用DeepSeek并发处理多个分析任务
  logger.debug('开始使用DeepSeek并发处理需求分析...')
  
  // 构建分析任务
  const analysisTasks = [
    // 任务1: 核心主题和目标受众分析
    analyzeCoreTopicAndAudience(wizardData),
    // 任务2: 内容类型和风格推荐
    analyzeContentTypeAndStyles(wizardData),
    // 任务3: 关键词提取
    analyzeKeywords(wizardData)
  ]
  
  // 并发执行所有分析任务
  let analysisResults: any = {}
  try {
    const results = await Promise.all(analysisTasks)
    const result0 = results[0] as { extractedTopic?: string; targetAudience?: RequirementAnalysis['targetAudience'] }
    const result1 = results[1] as { contentType?: RequirementAnalysis['contentType']; suggestedStyles?: string[] }
    const result2 = results[2] as { keywords?: string[] }
    
    analysisResults = {
      coreTopic: result0?.extractedTopic || wizardData.product,
      targetAudience: result0?.targetAudience || requirement.targetAudience,
      contentType: result1?.contentType || requirement.contentType,
      suggestedStyles: result1?.suggestedStyles || wizardData.style,
      keywords: result2?.keywords || extractKeywordsFromWizardData(wizardData)
    }
    
    // 更新requirement对象
    requirement.extractedTopic = analysisResults.coreTopic
    requirement.targetAudience = analysisResults.targetAudience
    requirement.contentType = analysisResults.contentType
    requirement.suggestedStyles = analysisResults.suggestedStyles
    requirement.keywords = analysisResults.keywords
    
    logger.debug('DeepSeek并发分析完成')
  } catch (error: any) {
    logger.warn('DeepSeek并发分析部分失败，使用基础结果:', error.message)
    // 失败时使用基础数据
    requirement.extractedTopic = wizardData.product
    requirement.keywords = extractKeywordsFromWizardData(wizardData)
  }
  
  // 暂时禁用调研分析功能，直接使用基础分析结果
  // TODO: 待调研功能稳定后重新启用
  logger.debug('调研分析功能已暂时禁用，使用基础分析结果')
  requirement.researchData = {
    platformTrends: [],
    competitorAnalysis: '调研分析功能暂时不可用',
    keywordSuggestions: requirement.keywords,
    contentTypeRecommendations: [],
    marketInsights: '基于产品描述的基础分析',
    platformTips: []
  }
  
  /* 调研分析功能暂时禁用
  let researchData: ResearchData | null = null
  try {
    logger.debug('开始执行调研分析...')
    const researchContext: ResearchContext = {
      productDescription: wizardData.product,
      selectedStyles: wizardData.style,
      sellingPoints: wizardData.sellingPoint,
      targetAudience: requirement.targetAudience
    }
    
    // 添加超时控制，避免阻塞太久（35秒超时，智谱API联网搜索可能需要更长时间）
    const researchPromise = conductResearch(researchContext)
    const timeoutPromise = new Promise<ResearchData>((_, reject) => {
      setTimeout(() => reject(new Error('调研分析超时')), 35000)
    })
    
    try {
      researchData = await Promise.race([researchPromise, timeoutPromise])
      requirement.researchData = researchData
      
      // 如果调研提供了关键词建议，合并到keywords中
      if (researchData.keywordSuggestions && researchData.keywordSuggestions.length > 0) {
        requirement.keywords = [
          ...requirement.keywords,
          ...researchData.keywordSuggestions
        ].slice(0, 10) // 限制关键词数量
      }
      
      logger.debug('调研分析完成')
    } catch (error: any) {
      logger.warn('调研分析超时或失败，使用基础分析结果:', error.message)
      // 超时或失败时，不阻塞主流程，使用基础分析结果
      requirement.researchData = {
        platformTrends: [],
        competitorAnalysis: '调研分析暂时不可用',
        keywordSuggestions: extractKeywordsFromWizardData(wizardData),
        contentTypeRecommendations: [],
        marketInsights: '基于产品描述的基础分析',
        platformTips: []
      }
    }
  } catch (error) {
    logger.error('调研分析失败，继续使用基础分析:', error)
    // 调研失败不影响主流程，继续执行
    if (!requirement.researchData) {
      requirement.researchData = {
        platformTrends: [],
        competitorAnalysis: '调研分析暂时不可用',
        keywordSuggestions: extractKeywordsFromWizardData(wizardData),
        contentTypeRecommendations: [],
        marketInsights: '基于产品描述的基础分析',
        platformTips: []
      }
    }
  }
  */

  // 保存到存储
  if (userId) {
    requirement.userId = userId
  }
  await storage.saveRequirement(requirement)
  
  // 触发事件
  await eventBus.emit(Events.REQUIREMENT_ANALYZED, requirement)
  await eventBus.emit(Events.REQUIREMENT_SAVED, requirement)
  
  logger.info('向导式需求分析完成:', requirement.id)
  
  return {
    requirement,
    confidence: 0.9, // 向导式输入置信度较高
    suggestions: []
  }
}

/**
 * 处理文本输入（向后兼容）
 */
async function analyzeAndSaveTextRequirement(
  userInput: string,
  userId?: string
): Promise<RequirementAnalysisResult> {
  logger.debug('开始文本需求分析:', userInput)
  
  // 调用AI分析
  const result = await aiAnalyzeRequirement(userInput)
  
  // 确保标记为文本输入模式
  result.requirement.inputMode = 'text'
  
  // 保存到存储
  if (userId) {
    result.requirement.userId = userId
  }
  await storage.saveRequirement(result.requirement)
  
  // 触发事件
  await eventBus.emit(Events.REQUIREMENT_ANALYZED, result.requirement)
  await eventBus.emit(Events.REQUIREMENT_SAVED, result.requirement)
  
  logger.info('文本需求分析完成:', result.requirement.id)
  return result
}

/**
 * 从向导式数据中提取关键词
 */
function extractKeywordsFromWizardData(wizardData: WizardInputData): string[] {
  const keywords: string[] = []
  
  // 从产品描述中提取关键词（简单实现）
  const productWords = wizardData.product.split(/[\s，,。.！!？?]/).filter(w => w.length > 1)
  keywords.push(...productWords.slice(0, 3))
  
  // 添加卖点作为关键词
  keywords.push(...wizardData.sellingPoint)
  
  return [...new Set(keywords)].slice(0, 5) // 去重并限制数量
}

/**
 * 解析目标受众信息
 */
function parseAudienceInfo(audienceText: string): RequirementAnalysis['targetAudience'] | null {
  // 简单的解析逻辑，可以根据需要扩展
  const ageMatch = audienceText.match(/(\d+)[-~](\d+)/)
  const genderMatch = audienceText.match(/(男|女|不限)/)
  
  return {
    age: ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : '18-35',
    gender: genderMatch ? genderMatch[1] : '不限',
    interests: []
  }
}

/**
 * 解析内容类型
 */
function parseContentType(contentTypeText: string): RequirementAnalysis['contentType'] | null {
  const typeMap: Record<string, RequirementAnalysis['contentType']> = {
    '教程': 'tutorial',
    '测评': 'review',
    '推荐': 'recommendation',
    '对比': 'comparison',
    '知识': 'knowledge'
  }
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (contentTypeText.includes(key)) {
      return value
    }
  }
  
  return null
}

/**
 * 获取需求分析
 */
export async function getRequirement(id: string): Promise<RequirementAnalysis | null> {
  return await storage.getRequirement(id)
}

/**
 * 获取所有需求分析
 */
export async function getAllRequirements(userId?: string): Promise<RequirementAnalysis[]> {
  return await storage.getAllRequirements(userId)
}

/**
 * 删除需求分析
 */
export async function deleteRequirement(id: string): Promise<void> {
  await storage.deleteRequirement(id)
  await eventBus.emit(Events.REQUIREMENT_DELETED, { id })
  logger.debug('需求分析已删除:', id)
}

/**
 * 更新需求分析
 */
export async function updateRequirement(requirement: RequirementAnalysis): Promise<void> {
  requirement.updatedAt = Date.now()
  await storage.saveRequirement(requirement)
  await eventBus.emit(Events.REQUIREMENT_SAVED, requirement)
  logger.debug('需求分析已更新:', requirement.id)
}

/**
 * 使用DeepSeek分析核心主题和目标受众（并发任务1）
 */
async function analyzeCoreTopicAndAudience(wizardData: WizardInputData): Promise<{
  extractedTopic?: string
  targetAudience?: RequirementAnalysis['targetAudience']
}> {
  const systemPrompt = `你是一个专业的内容策划专家，擅长分析产品并提取核心主题和目标受众信息。

请根据产品描述，分析并提取：
1. 核心主题（简洁明确，不超过20字）
2. 目标受众（年龄、性别、兴趣）

请以JSON格式返回，格式如下：
{
  "extractedTopic": "核心主题",
  "targetAudience": {
    "age": "年龄段，如：18-25",
    "gender": "性别，如：女性、男性、不限",
    "interests": ["兴趣1", "兴趣2", "兴趣3"]
  }
}`

  const prompt = `产品描述：${wizardData.product}
卖点：${wizardData.sellingPoint.join('、')}

请分析核心主题和目标受众，返回JSON格式。`

  try {
    const result = await callDeepSeekAPI(prompt, systemPrompt)
    const jsonText = result.text.trim()
    // 尝试解析JSON（可能包含markdown代码块）
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : jsonText
    const parsed = JSON.parse(jsonStr)
    
    return {
      extractedTopic: parsed.extractedTopic,
      targetAudience: parsed.targetAudience
    }
  } catch (error: any) {
    logger.warn('核心主题和目标受众分析失败:', error.message)
    return {}
  }
}

/**
 * 使用DeepSeek分析内容类型和风格推荐（并发任务2）
 */
async function analyzeContentTypeAndStyles(wizardData: WizardInputData): Promise<{
  contentType?: RequirementAnalysis['contentType']
  suggestedStyles?: string[]
}> {
  const systemPrompt = `你是一个专业的小红书内容策划专家，擅长推荐内容类型和风格。

请根据产品描述和卖点，推荐：
1. 内容类型（tutorial教程、review测评、recommendation种草、comparison对比、knowledge知识分享）
2. 推荐风格（从小红书风格中选择2-3个合适的）

请以JSON格式返回，格式如下：
{
  "contentType": "tutorial|review|recommendation|comparison|knowledge",
  "suggestedStyles": ["风格1", "风格2", "风格3"]
}`

  const prompt = `产品描述：${wizardData.product}
卖点：${wizardData.sellingPoint.join('、')}
已选风格：${wizardData.style.join('、')}

请推荐内容类型和风格，返回JSON格式。`

  try {
    const result = await callDeepSeekAPI(prompt, systemPrompt)
    const jsonText = result.text.trim()
    // 尝试解析JSON（可能包含markdown代码块）
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : jsonText
    const parsed = JSON.parse(jsonStr)
    
    return {
      contentType: parsed.contentType,
      suggestedStyles: parsed.suggestedStyles
    }
  } catch (error: any) {
    logger.warn('内容类型和风格分析失败:', error.message)
    return {}
  }
}

/**
 * 使用DeepSeek提取关键词（并发任务3）
 */
async function analyzeKeywords(wizardData: WizardInputData): Promise<{
  keywords?: string[]
}> {
  const systemPrompt = `你是一个专业的关键词提取专家，擅长从小红书内容中提取有效关键词。

请根据产品描述和卖点，提取3-5个关键词，这些关键词应该：
1. 适合小红书平台搜索
2. 与产品相关
3. 具有搜索价值

请以JSON格式返回，格式如下：
{
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"]
}`

  const prompt = `产品描述：${wizardData.product}
卖点：${wizardData.sellingPoint.join('、')}

请提取关键词，返回JSON格式。`

  try {
    const result = await callDeepSeekAPI(prompt, systemPrompt)
    const jsonText = result.text.trim()
    // 尝试解析JSON（可能包含markdown代码块）
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : jsonText
    const parsed = JSON.parse(jsonStr)
    
    return {
      keywords: parsed.keywords || []
    }
  } catch (error: any) {
    logger.warn('关键词提取失败:', error.message)
    return {}
  }
}


