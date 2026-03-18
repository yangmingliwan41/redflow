/**
 * 提示词模板服务
 * 负责加载模板文件并根据主题生成图片提示词
 */

import { logger } from '../../composables/useLogger'
import { callDeepSeekAPI } from './deepseek'
import { isMockMode } from './mock'
import { getTemplateById } from '../../config/promptTemplates'

/**
 * 加载模板文件内容
 */
export async function loadPromptTemplate(templateId: string): Promise<string> {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error(`模板 ${templateId} 不存在或未启用`)
  }

  try {
    // 动态加载模板文件
    // 注意：在浏览器环境中，我们需要通过 fetch 加载文件
    const response = await fetch(`/${template.promptFilePath}`)
    if (!response.ok) {
      throw new Error(`无法加载模板文件: ${template.promptFilePath}`)
    }
    const content = await response.text()
    logger.debug(`模板 ${templateId} 加载成功，长度: ${content.length}`)
    return content
  } catch (error) {
    logger.error(`加载模板文件失败: ${template.promptFilePath}`, error)
    throw new Error(`加载模板文件失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * 根据主题和模板生成图片提示词
 */
export async function generateImagePromptFromTemplate(
  templateId: string,
  theme: string
): Promise<{ prompt: string; usage: { promptTokens: number; candidatesTokens: number; totalTokens: number } }> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 生成图片提示词')
    return {
      prompt: `Mock image prompt for theme: ${theme}`,
      usage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
    }
  }

  // 加载模板
  const templateContent = await loadPromptTemplate(templateId)

  // 构建完整的提示词
  const fullPrompt = `${templateContent}

【主题】
${theme}

请根据以上模板要求，为这个主题生成一个高质量的英文图像生成提示词（Prompt）。`

  logger.debug(`开始生成图片提示词，主题: ${theme}, 模板: ${templateId}`)

  try {
    const systemPrompt = '你是一位精通AI绘画的专家级提示词工程师（Prompt Engineer），擅长根据模板要求生成高质量的图像生成提示词。'
    const result = await callDeepSeekAPI(fullPrompt, systemPrompt)

    if (!result.text || !result.text.trim()) {
      throw new Error('生成的提示词为空')
    }

    logger.debug('图片提示词生成成功')
    return {
      prompt: result.text.trim(),
      usage: result.usage
    }
  } catch (error) {
    logger.error('生成图片提示词失败:', error)
    throw error
  }
}

/**
 * 批量生成图片提示词
 */
export async function generateImagePromptsBatch(
  templateId: string,
  themes: string[]
): Promise<Array<{ theme: string; prompt: string; usage: { promptTokens: number; candidatesTokens: number; totalTokens: number } }>> {
  logger.debug(`开始批量生成图片提示词，数量: ${themes.length}`)

  // 加载模板（只加载一次）
  const templateContent = await loadPromptTemplate(templateId)

  // 并发生成所有提示词
  const tasks = themes.map(async (theme) => {
    try {
      const fullPrompt = `${templateContent}

【主题】
${theme}

请根据以上模板要求，为这个主题生成一个高质量的英文图像生成提示词（Prompt）。`

      const systemPrompt = '你是一位精通AI绘画的专家级提示词工程师（Prompt Engineer），擅长根据模板要求生成高质量的图像生成提示词。'
      const result = await callDeepSeekAPI(fullPrompt, systemPrompt)

      return {
        theme,
        prompt: result.text.trim(),
        usage: result.usage
      }
    } catch (error) {
      logger.error(`生成主题 "${theme}" 的提示词失败:`, error)
      throw error
    }
  })

  const results = await Promise.all(tasks)
  logger.debug(`批量生成图片提示词完成，成功: ${results.length}/${themes.length}`)
  return results
}

