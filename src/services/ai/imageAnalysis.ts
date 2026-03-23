/**
 * 图片分析服务
 */

import { ProductAnalysis, TokenUsage } from '../../types'
import { logger } from '../../composables/useLogger'
import { callGoogleGenAIAPI } from './google'
import { fileToGenerativePart } from '../../utils/image'
import { isMockMode, mockAnalyzeProductImage } from './mock'

/**
 * 分析产品图片
 */
export async function analyzeProductImage(
  file: File
): Promise<{ analysis: ProductAnalysis; usage: TokenUsage }> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 分析产品图片')
    return await mockAnalyzeProductImage(file)
  }

  const { mimeType, data } = await fileToGenerativePart(file)

  const prompt = `请详细分析这张产品图片，提取以下信息：

1. 产品名称（简洁明确）
2. 产品类别（如：家具、电子产品、服装等）
3. 主要特征（3-5个关键特点）
4. 颜色（主要颜色，2-4种）
5. 材质（如果可见）
6. 推荐风格配置（根据产品特点推荐适合的文案语气、文案风格和图片风格）

请以 JSON 格式返回，格式如下：
{
  "name": "产品名称",
  "category": "产品类别",
  "features": ["特征1", "特征2", "特征3"],
  "colors": ["颜色1", "颜色2"],
  "materials": ["材质1", "材质2"],
  "recommendation": {
    "tone": "enthusiastic|professional|emotional|minimalist",
    "copyStyle": "storytelling|sales_driven|minimalist",
    "imageStyle": "ins_minimal|muji_minimal|simple_doodle|diffuse_soft|collage_patch|real_scene_pure|dopamine|luxury|poster|tech_future|nature_fresh|warm_home|cream_ins|furniture_size|japanese_wood"
  }
}`

  try {
    const result = await callGoogleGenAIAPI(prompt, [{ mimeType, data }], {
      responseFormat: 'text'
    })

    if (!result.text) {
      throw new Error('No analysis result returned')
    }

    // 尝试解析 JSON（可能包含 markdown 代码块）
    let analysisText = result.text.trim()
    
    logger.debug('原始分析文本:', analysisText.substring(0, 500))
    
    // 移除可能的 markdown 代码块标记
    if (analysisText.startsWith('```')) {
      const lines = analysisText.split('\n')
      // 查找第一个 ``` 和最后一个 ```
      const firstIndex = analysisText.indexOf('```')
      const lastIndex = analysisText.lastIndexOf('```')
      if (firstIndex !== lastIndex && firstIndex >= 0 && lastIndex > firstIndex) {
        analysisText = analysisText.substring(firstIndex + 3, lastIndex).trim()
        // 移除可能的语言标识符（如 ```json）
        if (analysisText.startsWith('json')) {
          analysisText = analysisText.substring(4).trim()
        }
      } else {
        // 如果只有一个 ```，尝试移除第一行和最后一行
        const lines = analysisText.split('\n')
        if (lines.length > 2) {
          analysisText = lines.slice(1, -1).join('\n').trim()
        }
      }
    }
    
    // 移除可能的 json 标记（单独一行）
    if (analysisText.startsWith('json\n') || analysisText.startsWith('json\r\n')) {
      analysisText = analysisText.replace(/^json[\r\n]+/, '').trim()
    }
    
    // 尝试提取 JSON 对象（使用正则表达式）
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      analysisText = jsonMatch[0]
    }
    
    // 修复 JSON 中的控制字符问题
    // 1. 将字符串值中的未转义换行符替换为空格或转义
    // 2. 保留已转义的换行符 \n
    analysisText = analysisText.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
      // 在字符串值中，将未转义的换行符、回车符等控制字符替换为空格
      const cleaned = content
        .replace(/(?<!\\)\r\n/g, ' ')  // 未转义的 \r\n -> 空格
        .replace(/(?<!\\)\n/g, ' ')    // 未转义的 \n -> 空格
        .replace(/(?<!\\)\r/g, ' ')    // 未转义的 \r -> 空格
        .replace(/\t/g, ' ')           // Tab -> 空格
        .replace(/\s+/g, ' ')          // 多个空格合并为一个
        .trim()
      return `"${cleaned}"`
    })
    
    logger.debug('清理后的分析文本:', analysisText.substring(0, 500))

    let analysis: ProductAnalysis
    try {
      analysis = JSON.parse(analysisText)
    } catch (parseError: any) {
      logger.error('JSON 解析失败:', {
        error: parseError.message,
        text: analysisText.substring(0, 500),
        fullText: analysisText
      })
      
      // 尝试更激进的修复：移除所有控制字符
      try {
        const fixedText = analysisText
          .replace(/[\x00-\x1F\x7F]/g, ' ') // 移除所有控制字符
          .replace(/\s+/g, ' ')              // 合并多个空格
          .replace(/,\s*}/g, '}')            // 修复尾随逗号
          .replace(/,\s*]/g, ']')            // 修复数组尾随逗号
        
        analysis = JSON.parse(fixedText)
        logger.warn('使用修复后的 JSON 解析成功')
      } catch (secondError: any) {
        logger.error('二次修复也失败:', secondError)
        throw new Error(`Failed to parse analysis response: ${parseError.message}. Response text: ${analysisText.substring(0, 200)}...`)
      }
    }

    logger.debug('图片分析完成:', analysis)

    return {
      analysis,
      usage: result.usage
    }
  } catch (error: any) {
    logger.error('图片分析失败:', error)
    
    // 如果解析失败，返回默认分析结果
    return {
      analysis: {
        name: '未知产品',
        category: '其他',
        features: [],
        colors: [],
        materials: [],
        recommendation: {
          tone: 'professional',
          copyStyle: 'storytelling',
          imageStyle: 'ins_minimal'
        }
      },
      usage: {
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0
      }
    }
  }
}

