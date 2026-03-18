/**
 * 营销文案生成服务
 */

import { ProductAnalysis, GenerationSettings, TokenUsage } from '../../types'
import { logger } from '../../composables/useLogger'
import { callDeepSeekAPI } from './deepseek'
import { isMockMode, mockGenerateMarketingCopy } from './mock'

/**
 * 生成营销文案
 */
export async function generateMarketingCopy(
  analysis: ProductAnalysis,
  settings: GenerationSettings
): Promise<{ copy: string; usage: TokenUsage }> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 生成营销文案')
    return await mockGenerateMarketingCopy(analysis, settings)
  }

  const provider = settings.textApiProvider || 'deepseek'
  const additionalContext = settings.additionalContext || ''

  // 根据平台风格选择不同的文案模板
  const platformStyle = settings.style === 'xiaohongshu' 
    ? '小红书风格（亲切、有趣、实用，适当使用 emoji）'
    : settings.style === 'wechat'
    ? '微信公众号风格（专业、深度、有见解）'
    : 'Instagram 风格（简洁、视觉化、国际化）'

  // 根据文案风格选择描述
  const styleDesc = settings.copyStyle === 'storytelling'
    ? '通过故事和场景来展示产品'
    : settings.copyStyle === 'sales_driven'
    ? '突出产品卖点和购买理由'
    : '简洁直接，突出核心信息'

  const prompt = `你是一个专业的营销文案写手。请根据以下产品信息，生成一篇${platformStyle}的营销文案。

产品信息：
- 名称：${analysis.name}
- 类别：${analysis.category}
- 特征：${analysis.features.join('、')}
- 颜色：${analysis.colors.join('、')}
- 材质：${analysis.materials.join('、')}

${additionalContext}

要求：
- 平台风格：${platformStyle}
- 语气：${settings.tone}
- 文案风格：${settings.copyStyle}（${styleDesc}）
- 长度：${settings.length}
- 语言：简体中文

结构：
1. 吸引人的标题（带 emoji）
2. 正文（要点形式展示特征，情感连接）
3. 行动号召
4. 相关话题标签`

  const systemPrompt = 'You are a professional marketing copywriter specializing in social media content creation.'

  if (provider === 'deepseek') {
    const result = await callDeepSeekAPI(prompt, systemPrompt)
    return { copy: result.text, usage: result.usage }
  } else {
    throw new Error(`Unsupported text provider: ${provider}`)
  }
}

