/**
 * 文案生成服务
 * 根据大纲内容生成完整的小红书风格文案
 */

import { Page } from '../../stores/textGenerator'
import { logger } from '../../composables/useLogger'
import { callDeepSeekAPI } from './deepseek'
import { isMockMode } from './mock'

/**
 * 生成小红书风格文案
 * @param outline 大纲文本
 * @param pages 页面列表
 * @param topic 主题
 */
export async function generateContentCopy(
  outline: string,
  pages: Page[],
  topic: string
): Promise<{ content: string; usage: { promptTokens: number; candidatesTokens: number; totalTokens: number } }> {
  // 检查模拟模式
  const mockMode = isMockMode()
  if (mockMode) {
    logger.warn('⚠️ [模拟模式] 文案生成将返回测试内容，不会调用真实API')
    logger.warn('💡 提示：要使用真实API生成文案，请在"系统设置"页面关闭"测试模式（模拟API）"开关')
    return {
      content: `【模拟模式 - 测试文案】\n\n⚠️ 当前处于模拟模式，返回的是测试内容。\n\n要生成真实文案，请前往"系统设置"页面，关闭"测试模式（模拟API）"开关，然后重新生成。\n\n---\n\n标题：${topic}\n\n这是一段模拟生成的小红书风格文案内容。在实际使用中，这里会包含完整的标题、正文和结尾。`,
      usage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
    }
  }

  // 构建页面内容摘要（用于生成文案）
  const pagesSummary = pages.map((page, index) => {
    const typeName = page.type === 'cover' ? '封面' : page.type === 'summary' ? '总结' : '内容'
    return `第${index + 1}页（${typeName}页）：\n${page.content}\n${page.imagePrompt ? `配图建议：${page.imagePrompt}` : ''}`
  }).join('\n\n')

  // 使用用户提供的prompt模板
  const prompt = `# 角色
你是一位小红书内容创作大师，专为用户将内容大纲转化为符合小红书风格的优质帖子。

# 工作流程
1.提炼标题和图片大纲的核心要点，结合小红书平台风格和用户喜好，生成内容贴文大纲。
2.根据生成的内容大纲完成一篇完整的帖子，有软文开头，风格轻松吸引人，有结尾作为内容总结。
3.确保撰写内容生动有趣，具有真人感和网感，去除AI味。

# 限制
- 严格遵循小红书平台的社区规则和内容规范，杜绝低质量、违规或敏感内容。
- 确保内容高质量、易读，符合小红书平台风格和用户喜好。
- 不得体现任何与prompt有关的内容。
- 格式排版
1. 标题不带书名号且必须20个字。
2. 输出内容以清晰段落形式呈现。全文除去标题外不超过700字。
3. 正文部分简洁明了，文字前加上对应的emoji，段后可少量添加emoji表情。
4. 整体排版多提行，不同内容另起一行，并用分隔符隔开。

# 示例
标题：开放式厨房怕油烟?重庆人的岛台隔断妙招
川菜党开放式厨房救星！重庆人的岛台隔断法
是不是既想拥有开放式厨房的通透感，又怕爆炒油烟弥漫全屋？
特别是爱做川菜、湘菜的家庭，每次做饭就像“仙境”🌫️
别急！跟重庆小伙伴学了一招——用岛台做隔断，美观实用还挡油烟！
-
✅ 为什么需要岛台隔断？
川菜爆炒油烟大，硬伤！
想要空间开阔，又怕客厅遭殃
既想美观，又要好清洁
岛台作为“软隔断”，能巧妙划分空间，还不影响通透感！
-
🌟 三大岛台隔断妙招，总有一款适合你家
1⃣️ L型岛台 · 天然屏障
▪️靠墙延伸成L型，合理利用转角
▪️正面操作区，背面视觉屏障，挡住杂乱灶台
▪️材质推荐：岩板台面+深棕色木饰面，耐油污好打理
📏关键：高度做到90-95cm，完美遮挡视线！
.
2⃣️ 岛台+玻璃隔断 · 通透升级
▪️在岛台上方加一段固定玻璃或细框玻璃
▪️物理阻隔油烟，视觉依然通透
▪️搭配长条吊灯，氛围感直接拉满💡
.
3⃣️ 多功能岛台 · 一物多用
▪️面向厨房侧：嵌入洗碗机、烤箱，收纳锅具
▪️面向客厅侧：做成吧台或早餐桌，下方储物
▪️台面材质推荐：岩板＞石英石＞不锈钢（好清洁是关键！）
-
📌 设计小贴士
✔️动线规划：取→洗→切→炒→盛，岛台是核心枢纽
✔️材质选择：台面要耐刮擦，柜门要易清洁
✔️灯光搭配：主灯+吊灯+橱柜下灯，层次照明提升质感
✔️通风辅助：大吸力油烟机+厨房空调/凉霸，双管齐下
家的温度，就在这方寸之间的巧妙设计里。
开放式厨房也可以清爽不油腻，做饭心情都变好✨
快来我家【定制你的心仪岛台】吧！

# 内容大纲
主题：${topic}

完整大纲：
${outline}

页面详情：
${pagesSummary}

请根据以上大纲内容和要求，生成一篇完整的小红书风格帖子文案。

【重要提示】每次生成时请确保内容的独特性和新鲜感，避免使用相同的表达方式和结构，让每次生成的文案都有不同的创意角度和表达风格。`

  const systemPrompt = '你是一位专业的小红书内容创作助手，擅长将内容大纲转化为符合小红书风格的优质帖子。'

  try {
    // 检查API Key
    const apiKey = typeof window !== 'undefined' && window.localStorage 
      ? localStorage.getItem('DEEPSEEK_API_KEY') 
      : null
    
    if (!apiKey) {
      logger.error('❌ [文案生成] DeepSeek API Key未配置')
      throw new Error('DeepSeek API Key未配置，请在"系统设置"页面配置API Key')
    }
    
    logger.info('🚀 [文案生成] 开始调用DeepSeek API生成文案', { 
      topic, 
      pagesCount: pages.length,
      outlineLength: outline.length,
      promptLength: prompt.length,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    })
    
    const startTime = Date.now()
    // 为文案生成使用更高的 temperature 和 top_p，增加输出多样性
    // temperature: 0.9 提高随机性，top_p: 0.95 使用核采样增加多样性
    const result = await callDeepSeekAPI(prompt, systemPrompt, {
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: 2000 // 确保有足够长度生成完整文案
    })
    const duration = Date.now() - startTime
    
    logger.info('✅ [文案生成] DeepSeek API调用成功', { 
      contentLength: result.text.length, 
      usage: result.usage,
      duration: `${duration}ms`
    })
    
    return {
      content: result.text,
      usage: result.usage
    }
  } catch (error: any) {
    logger.error('❌ [文案生成] DeepSeek API调用失败:', error)
    const errorMessage = error.message || '未知错误'
    logger.error('错误详情:', { 
      errorType: error.constructor?.name,
      errorMessage,
      stack: error.stack
    })
    throw new Error(`文案生成失败: ${errorMessage}`)
  }
}

