/**
 * 内容生产服务
 * 根据确认的规划生成内容
 */

import { ContentPlan, GeneratedResult } from '../../types'
import { generateStyledImage, generateMarketingCopy } from '../ai'
import { storage } from '../storage/index'
import { eventBus, Events } from '../events'
import { logger } from '../../composables/useLogger'
import { v4 as uuidv4 } from 'uuid'

interface ProductionProgress {
  planId: string
  total: number
  completed: number
  percentage: number
  currentContent?: string
}

const productionProgressMap = new Map<string, ProductionProgress>()

/**
 * 根据确认的规划生成内容
 */
export async function generateContentFromPlan(
  plan: ContentPlan
): Promise<GeneratedResult[]> {
  logger.debug('开始内容生产:', plan.id)
  
  if (!plan.confirmed) {
    throw new Error('规划未确认，无法开始生产')
  }

  const results: GeneratedResult[] = []
  
  if (plan.planType === 'multi' && plan.multi) {
    const totalContents = plan.multi.contents.length
    
    // 初始化进度
    const progress: ProductionProgress = {
      planId: plan.id,
      total: totalContents,
      completed: 0,
      percentage: 0
    }
    productionProgressMap.set(plan.id, progress)
    
    // 批量生成内容
    for (let i = 0; i < plan.multi.contents.length; i++) {
      const contentPlan = plan.multi.contents[i]
      progress.currentContent = contentPlan.title || `内容 ${i + 1}`
      
      try {
        // 生成文案
        const copyResult = await generateMarketingCopy(
          contentPlan.outline.cover.title,
          {
            copyStyle: 'storytelling',
            length: 'medium',
            imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu'
          }
        )
        
        // 生成图片
        const imageResult = await generateStyledImage(
          copyResult.outline,
          {
            imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu',
            brightness: 0
          }
        )
        
        // 组合结果
        const result: GeneratedResult = {
          id: uuidv4(),
          type: 'text',
          topic: contentPlan.title || copyResult.outline.cover.title,
          outline: copyResult.outline,
          imageUrl: imageResult.imageUrl,
          status: 'done',
          createdAt: Date.now(),
          settings: {
            copyStyle: 'storytelling',
            length: 'medium',
            imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu',
            brightness: 0
          }
        }
        
        results.push(result)
        
        // 保存到历史记录
        await storage.saveHistoryItem(result)
        
        // 更新进度
        progress.completed = i + 1
        progress.percentage = Math.round((progress.completed / progress.total) * 100)
        productionProgressMap.set(plan.id, progress)
        
        // 发射进度事件
        await eventBus.emit(Events.CONTENT_PRODUCTION_PROGRESS, progress)
        
        logger.debug(`内容生产进度: ${progress.completed}/${progress.total}`)
      } catch (error) {
        logger.error(`内容生产失败 (${i + 1}/${totalContents}):`, error)
        // 继续生产其他内容
      }
    }
    
    // 清理进度
    productionProgressMap.delete(plan.id)
    
    logger.info('内容生产完成:', { planId: plan.id, total: results.length })
  } else if (plan.planType === 'single' && plan.single) {
    // 单篇内容生产
    const contentPlan = plan.single
    
    try {
      const copyResult = await generateMarketingCopy(
        contentPlan.title,
        {
          copyStyle: 'storytelling',
          length: 'medium',
          imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu'
        }
      )
      
      const imageResult = await generateStyledImage(
        copyResult.outline,
        {
          imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu',
          brightness: 0
        }
      )
      
      const result: GeneratedResult = {
        id: uuidv4(),
        type: 'text',
        topic: contentPlan.title,
        outline: copyResult.outline,
        imageUrl: imageResult.imageUrl,
        status: 'done',
        createdAt: Date.now(),
        settings: {
          copyStyle: 'storytelling',
          length: 'medium',
          imageStyle: contentPlan.stylePack?.style_id || 'xiaohongshu',
          brightness: 0
        }
      }
      
      results.push(result)
      await storage.saveHistoryItem(result)
      
      logger.info('单篇内容生产完成:', result.id)
    } catch (error) {
      logger.error('单篇内容生产失败:', error)
      throw error
    }
  }
  
  return results
}

/**
 * 获取生产进度
 */
export function getProductionProgress(planId: string): ProductionProgress {
  const progress = productionProgressMap.get(planId)
  
  if (!progress) {
    return {
      planId,
      total: 0,
      completed: 0,
      percentage: 0
    }
  }
  
  return { ...progress }
}

