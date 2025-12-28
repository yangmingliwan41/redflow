/**
 * 调研Agent服务
 * 结合小红书平台和产品进行深度调研分析
 */

import { callDeepSeekAPI } from './deepseek'
import { callZhipuAPI } from './zhipu'
import { logger } from '../../composables/useLogger'
import { isMockMode } from './mock'
import { cleanMarkdown } from '../../utils/textFormatter'

export interface ResearchData {
  platformTrends: string[] // 平台趋势
  competitorAnalysis: string // 竞品分析
  keywordSuggestions: string[] // 关键词建议
  contentTypeRecommendations: string[] // 内容类型建议
  marketInsights: string // 市场洞察
  platformTips: string[] // 平台运营建议
}

export interface ResearchContext {
  productDescription: string
  selectedStyles: string[]
  sellingPoints: string[]
  targetAudience?: {
    age: string
    gender: string
    interests: string[]
  }
}

/**
 * 执行深度调研分析
 * 默认使用智谱API（支持联网搜索），DeepSeek作为备选
 */
export async function conductResearch(
  context: ResearchContext
): Promise<ResearchData> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 调研分析')
    return mockResearch(context)
  }

  const prompt = buildResearchPrompt(context)
  const systemPrompt = buildResearchSystemPrompt()
  
  // 最大重试次数
  const maxRetries = 3
  let lastError: any = null
  
  // 优先使用智谱API（支持联网搜索，更适合调研分析）
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`[尝试 ${attempt}/${maxRetries}] 使用智谱API进行调研分析`)
      
      const result = await callAPIWithTimeout(
        () => callZhipuAPI(prompt, systemPrompt),
        30000 // 30秒超时（智谱API可能需要更长时间，特别是联网搜索时）
      )
      
      const researchResult = parseAndValidateResponse(result.text)
      if (researchResult) {
        logger.debug('智谱API 调研分析成功')
        return researchResult
      } else {
        logger.warn('智谱API返回结果解析失败，尝试重新解析')
        // 如果解析失败，尝试更宽松的解析
        const relaxedResult = parseAndValidateResponseRelaxed(result.text)
        if (relaxedResult) {
          logger.debug('使用宽松解析成功')
          return relaxedResult
        }
      }
    } catch (error: any) {
      logger.warn(`智谱API 尝试 ${attempt} 失败:`, error.message)
      lastError = error
      if (attempt < maxRetries) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  // 智谱API失败，尝试使用DeepSeek API作为备选
  logger.debug('智谱API失败，尝试使用DeepSeek API作为备选')
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`[尝试 ${attempt}/${maxRetries}] 使用 DeepSeek API 进行调研分析`)
      
      const result = await callAPIWithTimeout(
        () => callDeepSeekAPI(prompt, systemPrompt),
        20000 // 20秒超时
      )
      
      const researchResult = parseAndValidateResponse(result.text)
      if (researchResult) {
        logger.debug('DeepSeek API 调研分析成功')
        return researchResult
      }
    } catch (error: any) {
      logger.warn(`DeepSeek API 尝试 ${attempt} 失败:`, error.message)
      lastError = error
      if (attempt < maxRetries) {
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  // 所有尝试都失败，返回基础结果
  logger.error('所有API调用均失败，返回基础调研结果', lastError)
  return {
    platformTrends: [],
    competitorAnalysis: '调研分析暂时不可用，请稍后重试',
    keywordSuggestions: extractBasicKeywords(context.productDescription),
    contentTypeRecommendations: ['recommendation'],
    marketInsights: '基于产品描述的基础分析',
    platformTips: ['建议关注小红书平台的最新趋势', '注意内容原创性和真实性']
  }
}

/**
 * 带超时的API调用
 */
async function callAPIWithTimeout<T>(
  apiCall: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('API调用超时')), timeoutMs)
  })
  
  return Promise.race([apiCall(), timeoutPromise])
}

/**
 * 解析并验证API响应（严格模式）
 */
function parseAndValidateResponse(text: string): ResearchData | null {
  try {
    if (!text || text.trim().length === 0) {
      logger.warn('API返回内容为空')
      return null
    }
    
    // 检查返回的文本长度，如果过长可能是陷入了循环
    if (text.length > 10000) {
      logger.warn('调研分析返回内容过长，可能存在问题，截断处理')
      text = text.substring(0, 10000)
    }
    
    // 检查是否包含重复内容（可能是循环）
    if (text.length > 200) {
      const firstHalf = text.substring(0, Math.floor(text.length / 2))
      const secondHalf = text.substring(Math.floor(text.length / 2))
      const similarity = calculateSimilarity(firstHalf, secondHalf)
      if (similarity > 0.8) {
        logger.warn('检测到响应内容可能陷入循环，使用前半部分')
        text = firstHalf
      }
    }
    
    // 解析AI返回的JSON
    let jsonText = text.trim()
    
    // 移除代码块标记
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

    // 提取JSON对象（支持多行）
    let jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // 尝试查找嵌套的JSON
      jsonMatch = jsonText.match(/\{[\s\S]*\{[\s\S]*\}[\s\S]*\}/)
    }
    
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    } else {
      logger.warn('无法从响应中提取JSON对象，尝试宽松解析')
      return null
    }

    // 验证JSON格式
    const researchResult = JSON.parse(jsonText)
    
    // 验证必需字段
    if (!researchResult || typeof researchResult !== 'object') {
      logger.warn('解析结果不是有效对象')
      return null
    }
    
    // 清理markdown格式并返回
    return {
      platformTrends: Array.isArray(researchResult.platformTrends) 
        ? researchResult.platformTrends.slice(0, 10) 
        : [],
      competitorAnalysis: cleanMarkdown(String(researchResult.competitorAnalysis || '')),
      keywordSuggestions: Array.isArray(researchResult.keywordSuggestions)
        ? researchResult.keywordSuggestions.slice(0, 10)
        : [],
      contentTypeRecommendations: Array.isArray(researchResult.contentTypeRecommendations)
        ? researchResult.contentTypeRecommendations.slice(0, 5)
        : [],
      marketInsights: cleanMarkdown(String(researchResult.marketInsights || '')),
      platformTips: Array.isArray(researchResult.platformTips)
        ? researchResult.platformTips.slice(0, 10).map((tip: string) => cleanMarkdown(String(tip)))
        : []
    }
  } catch (error: any) {
    logger.error('解析API响应失败:', error.message)
    return null
  }
}

/**
 * 宽松模式解析API响应（当严格解析失败时使用）
 */
function parseAndValidateResponseRelaxed(text: string): ResearchData | null {
  try {
    if (!text || text.trim().length === 0) {
      return null
    }
    
    logger.debug('尝试宽松模式解析响应')
    
    // 尝试提取各个字段
    const extractArray = (text: string, key: string): string[] => {
      const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]+)\\]`, 'i')
      const match = text.match(regex)
      if (match) {
        try {
          const arrayStr = '[' + match[1] + ']'
          return JSON.parse(arrayStr)
        } catch {
          // 手动解析
          const items = match[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
          return items.filter(item => item.length > 0)
        }
      }
      return []
    }
    
    const extractString = (text: string, key: string): string => {
      const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'i')
      const match = text.match(regex)
      if (match) {
        return match[1]
      }
      // 尝试多行字符串
      const regex2 = new RegExp(`"${key}"\\s*:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 's')
      const match2 = text.match(regex2)
      if (match2) {
        return match2[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
      }
      return ''
    }
    
    const platformTrends = extractArray(text, 'platformTrends')
    const competitorAnalysis = extractString(text, 'competitorAnalysis') || '暂无竞品分析数据'
    const keywordSuggestions = extractArray(text, 'keywordSuggestions')
    const contentTypeRecommendations = extractArray(text, 'contentTypeRecommendations')
    const marketInsights = extractString(text, 'marketInsights') || '暂无市场洞察数据'
    const platformTips = extractArray(text, 'platformTips')
    
    // 至少要有一些数据才返回
    if (platformTrends.length === 0 && keywordSuggestions.length === 0 && platformTips.length === 0) {
      return null
    }
    
    return {
      platformTrends: platformTrends.slice(0, 10),
      competitorAnalysis: cleanMarkdown(competitorAnalysis),
      keywordSuggestions: keywordSuggestions.slice(0, 10),
      contentTypeRecommendations: contentTypeRecommendations.slice(0, 5),
      marketInsights: cleanMarkdown(marketInsights),
      platformTips: platformTips.slice(0, 10).map((tip: string) => cleanMarkdown(String(tip)))
    }
  } catch (error: any) {
    logger.error('宽松模式解析也失败:', error.message)
    return null
  }
}

/**
 * 计算两个字符串的相似度（简单实现）
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1.length === 0 || str2.length === 0) return 0
  
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  // 简单的字符匹配相似度
  let matches = 0
  const minLength = Math.min(longer.length, shorter.length)
  for (let i = 0; i < minLength; i++) {
    if (longer[i] === shorter[i]) {
      matches++
    }
  }
  
  return matches / longer.length
}

/**
 * 构建调研系统提示词
 */
function buildResearchSystemPrompt(): string {
  return `你是一个专业的小红书内容营销专家，擅长平台趋势分析、竞品研究和内容策略制定。

你的任务是：
1. 分析小红书平台上的相关趋势和热点（可以使用联网搜索获取最新信息）
2. 研究类似产品或服务的内容策略
3. 提供关键词优化建议
4. 推荐适合的内容类型
5. 提供市场洞察和平台运营建议

重要要求：
- 必须严格按照JSON格式返回，不要添加任何额外的说明文字
- 所有文本字段必须使用纯文本，禁止使用markdown格式（如*、#、**、-、1.等）
- 如果使用联网搜索，请整合搜索结果并提供准确的分析

请基于你的专业知识和对小红书平台的了解，提供深入、实用的分析建议。`
}

/**
 * 构建调研提示词
 */
function buildResearchPrompt(context: ResearchContext): string {
  const { productDescription, selectedStyles, sellingPoints, targetAudience } = context
  
  return `请对以下产品/服务进行深度调研分析：

【产品信息】
产品描述：${productDescription}
选择风格：${selectedStyles.join('、')}
产品卖点：${sellingPoints.join('、')}
${targetAudience ? `目标受众：${targetAudience.age}，${targetAudience.gender}，兴趣：${targetAudience.interests.join('、')}` : ''}

【调研要求】
请从以下维度进行深度分析：

1. **平台趋势分析**
   - 分析小红书平台上与产品相关的热门话题和趋势
   - 识别当前用户关注的热点
   - 提供3-5个相关趋势关键词

2. **竞品内容分析**
   - 分析类似产品或服务在小红书上的内容策略
   - 总结成功案例的共同特点
   - 识别可借鉴的内容形式

3. **关键词优化建议**
   - 基于产品特点和平台趋势，提供5-8个高价值关键词
   - 关键词应兼顾搜索热度和相关性
   - 考虑长尾关键词和热门标签

4. **内容类型推荐**
   - 根据产品特点和目标受众，推荐2-3种最适合的内容类型
   - 考虑：教程、测评、种草、对比、知识分享等
   - 说明推荐理由

5. **市场洞察**
   - 分析目标用户在小红书上的行为特征
   - 提供内容创作的方向性建议
   - 识别潜在的机会点

6. **平台运营建议**
   - 提供3-5条小红书平台运营建议
   - 包括发布时间、互动策略、内容优化等

【输出要求】
请严格按照以下JSON格式返回，不要添加任何额外的文字说明、代码块标记或注释：

{
  "platformTrends": ["趋势1", "趋势2", "趋势3"],
  "competitorAnalysis": "竞品分析内容（200-300字，纯文本，不要使用markdown格式）",
  "keywordSuggestions": ["关键词1", "关键词2", "关键词3"],
  "contentTypeRecommendations": ["recommendation", "tutorial"],
  "marketInsights": "市场洞察内容（200-300字，纯文本，不要使用markdown格式）",
  "platformTips": ["建议1", "建议2", "建议3"]
}

【关键要求】
1. 必须直接返回JSON对象，不要使用代码块标记包裹
2. 所有文本内容必须使用纯文本格式，禁止使用markdown标记（如星号、井号、减号、数字点、圆点等）
3. 所有字符串必须用双引号包裹，不能使用单引号
4. JSON格式必须严格正确，可以直接被JSON.parse()解析
5. 如果可以使用联网搜索功能，请搜索最新的小红书平台趋势和相关信息，然后整合到分析中
6. 内容要简洁明了，控制在指定字数范围内
7. 不要添加任何说明文字，直接返回JSON对象即可`
}

/**
 * 模拟模式调研
 */
function mockResearch(context: ResearchContext): ResearchData {
  const keywords = extractBasicKeywords(context.productDescription)
  
  return {
    platformTrends: [
      '相关话题热度上升',
      '用户关注度增加',
      '类似内容互动率高'
    ],
    competitorAnalysis: `基于对类似产品在小红书平台的分析，发现成功的内容通常具有以下特点：
1. 真实的使用体验分享
2. 清晰的视觉呈现
3. 实用的价值信息
4. 适度的情感共鸣

建议在内容创作中注重这些方面，同时保持内容的原创性和真实性。`,
    keywordSuggestions: keywords.length > 0 ? keywords : ['产品推荐', '使用体验', '好物分享'],
    contentTypeRecommendations: ['recommendation', 'tutorial'],
    marketInsights: `目标用户在小红书平台上更倾向于：
- 真实的使用体验和评价
- 清晰的视觉呈现和美观的排版
- 实用的信息和价值
- 适度的情感共鸣和故事性

建议在内容创作中平衡这些要素，打造既有价值又有吸引力的内容。`,
    platformTips: [
      '建议在用户活跃时间段发布（晚上7-10点）',
      '使用热门标签增加曝光',
      '保持内容原创性，避免过度营销',
      '及时回复评论，增加互动率',
      '定期分析数据，优化内容策略'
    ]
  }
}

/**
 * 从产品描述中提取基础关键词
 */
function extractBasicKeywords(productDescription: string): string[] {
  const keywords: string[] = []
  
  // 简单的关键词提取逻辑
  const words = productDescription.split(/[\s，,。.！!？?、]/).filter(w => w.length > 1)
  
  // 提取前5个有意义的词作为关键词
  keywords.push(...words.slice(0, 5))
  
  return [...new Set(keywords)].slice(0, 5)
}

