/**
 * 历史记录存储服务
 */

import { GeneratedResult, ProcessingMode } from '../../types'
import { compressImage } from '../../utils'
import { STORAGE_KEYS, HISTORY_CONFIG } from '../../config/constants'
import { logger } from '../../composables/useLogger'

/**
 * 保存历史记录项
 */
export async function saveHistoryItem(
  userId: string,
  result: GeneratedResult
): Promise<void> {
  try {
    logger.debug('=== saveHistoryItem 开始:', { userId, resultId: result.id, mode: result.mode })
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    let history: GeneratedResult[] = historyStr ? JSON.parse(historyStr) : []
    logger.debug('当前历史记录数量:', history.length)

    let storedOriginalImage = result.originalImageUrl
    let storedGeneratedImage = result.generatedImageUrl

    // 对所有模式的图片进行压缩，以节省存储空间
    // 统一的压缩参数：宽度600px，质量0.6
    const COMPRESSION_WIDTH = 600
    const COMPRESSION_QUALITY = 0.6
    
    if (result.mode === ProcessingMode.IMAGE_TO_IMAGE) {
      // 图生图模式：压缩原始图片和生成的图片
      if (result.originalImageFile || result.originalImageUrl) {
        try {
          storedOriginalImage = await compressImage(
            result.originalImageFile || result.originalImageUrl,
            COMPRESSION_WIDTH,
            COMPRESSION_QUALITY
          )
          logger.debug('原始图片压缩完成')
        } catch (e) {
          logger.warn('Original image compression failed', e)
        }
      }

      if (result.generatedImageUrl) {
        try {
          storedGeneratedImage = await compressImage(
            result.generatedImageUrl,
            COMPRESSION_WIDTH,
            COMPRESSION_QUALITY
          )
          logger.debug('生成图片压缩完成')
        } catch (e) {
          logger.warn('Generated image compression failed', e)
        }
      }
    } else if (result.mode === ProcessingMode.TEXT_TO_IMAGE && result.pages) {
      // 文生图模式：压缩所有页面图片以节省存储空间
      logger.debug(`开始压缩 ${result.pages.length} 页图片`)
      const compressedPages = await Promise.all(
        result.pages.map(async (page) => {
          if (page.imageUrl) {
            // 压缩所有格式的图片（包括 data: 和其他格式）
            try {
              const compressed = await compressImage(
                page.imageUrl,
                COMPRESSION_WIDTH,
                COMPRESSION_QUALITY
              )
              logger.debug(`页面 ${page.index} 图片压缩完成`)
              return { ...page, imageUrl: compressed }
            } catch (e) {
              logger.warn(`Page ${page.index} image compression failed`, e)
              return page
            }
          }
          return page
        })
      )
      result.pages = compressedPages
      logger.debug('所有页面图片压缩完成')
    } else if (result.mode === ProcessingMode.PROMPT_TO_IMAGE) {
      // 提示词生图模式：压缩生成的图片
      if (result.generatedImageUrl) {
        try {
          storedGeneratedImage = await compressImage(
            result.generatedImageUrl,
            COMPRESSION_WIDTH,
            COMPRESSION_QUALITY
          )
          logger.debug('提示词生成图片压缩完成')
        } catch (e) {
          logger.warn('PROMPT_TO_IMAGE image compression failed', e)
        }
      }
    }
    
    // 额外压缩：如果 originalImageUrl 或 generatedImageUrl 存在但未被压缩，也进行压缩
    if (result.originalImageUrl && result.originalImageUrl.startsWith('data:')) {
      try {
        storedOriginalImage = await compressImage(
          result.originalImageUrl,
          COMPRESSION_WIDTH,
          COMPRESSION_QUALITY
        )
        logger.debug('额外压缩 originalImageUrl 完成')
      } catch (e) {
        logger.warn('Additional originalImageUrl compression failed', e)
      }
    }
    
    if (result.generatedImageUrl && result.generatedImageUrl.startsWith('data:') && !storedGeneratedImage) {
      try {
        storedGeneratedImage = await compressImage(
          result.generatedImageUrl,
          COMPRESSION_WIDTH,
          COMPRESSION_QUALITY
        )
        logger.debug('额外压缩 generatedImageUrl 完成')
      } catch (e) {
        logger.warn('Additional generatedImageUrl compression failed', e)
      }
    }

    const itemToSave: GeneratedResult = {
      ...result,
      userId,
      originalImageFile: undefined, // 不保存File对象
      originalImageUrl: storedOriginalImage,
      generatedImageUrl: storedGeneratedImage,
      createdAt: Date.now(),
    }

    const existingIndex = history.findIndex(h => h.id === result.id)
    if (existingIndex >= 0) {
      logger.debug('更新已有历史记录:', existingIndex)
      history[existingIndex] = itemToSave
    } else {
      logger.debug('添加新历史记录')
      history.unshift(itemToSave)
    }

    // 先限制历史记录数量，优先保留最新的记录
    const maxItems = HISTORY_CONFIG.MAX_ITEMS
    let itemsToSave = history.slice(0, maxItems)
    
    const trySetItem = async (items: GeneratedResult[], attempt: number = 0): Promise<void> => {
      try {
        const jsonStr = JSON.stringify(items)
        const sizeInMB = (new Blob([jsonStr]).size / 1024 / 1024).toFixed(2)
        logger.debug(`保存历史记录到localStorage，数量: ${items.length}, 大小: ${sizeInMB}MB, key: ${key}`)
        
        localStorage.setItem(key, jsonStr)
        logger.info('✅ 历史记录保存成功！')
      } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
          logger.warn(`Storage quota exceeded (attempt ${attempt + 1}). Current items: ${items.length}`)
          
          // 限制最大尝试次数，避免无限递归
          if (attempt >= 5) {
            logger.error('达到最大尝试次数，无法保存历史记录')
            throw new Error('存储空间不足，无法保存历史记录。请清理浏览器缓存或删除旧记录。')
          }
          
          if (items.length > 1) {
            // 删除最旧的记录（保留最新的）
            const reducedItems = items.slice(0, items.length - 1)
            logger.debug(`删除最旧记录，剩余: ${reducedItems.length} 条`)
            await trySetItem(reducedItems, attempt + 1)
          } else if (items.length === 1) {
            // 如果只有一条记录仍然失败，尝试进一步压缩图片
            logger.warn('单条记录仍然超出限制，尝试进一步压缩图片...')
            const item = items[0]
            
            // 分阶段降低质量和分辨率
            const compressionLevels = [
              { width: 500, quality: 0.6 },
              { width: 400, quality: 0.5 },
              { width: 300, quality: 0.4 },
              { width: 200, quality: 0.3 }
            ]
            
            const compressionLevel = compressionLevels[Math.min(attempt, compressionLevels.length - 1)]
            
            // 压缩主图片
            if (item.generatedImageUrl && item.generatedImageUrl.startsWith('data:')) {
              try {
                const moreCompressed = await compressImage(
                  item.generatedImageUrl, 
                  compressionLevel.width, 
                  compressionLevel.quality
                )
                item.generatedImageUrl = moreCompressed
              } catch (compressError) {
                logger.error('压缩 generatedImageUrl 失败:', compressError)
              }
            }
            
            // 压缩 TEXT_TO_IMAGE 模式下的所有页面图片
            if (item.mode === ProcessingMode.TEXT_TO_IMAGE && item.pages) {
              try {
                const compressedPages = await Promise.all(
                  item.pages.map(async (page) => {
                    if (page.imageUrl && page.imageUrl.startsWith('data:')) {
                      try {
                        const compressed = await compressImage(
                          page.imageUrl, 
                          compressionLevel.width, 
                          compressionLevel.quality
                        )
                        return { ...page, imageUrl: compressed }
                      } catch (e) {
                        logger.warn(`压缩页面 ${page.index} 图片失败:`, e)
                        return page
                      }
                    }
                    return page
                  })
                )
                item.pages = compressedPages
              } catch (compressError) {
                logger.error('压缩 pages 图片失败:', compressError)
              }
            }
            
            // 压缩 originalImageUrl（如果是 base64）
            if (item.originalImageUrl && item.originalImageUrl.startsWith('data:')) {
              try {
                const moreCompressed = await compressImage(
                  item.originalImageUrl, 
                  compressionLevel.width, 
                  compressionLevel.quality
                )
                item.originalImageUrl = moreCompressed
              } catch (compressError) {
                logger.error('压缩 originalImageUrl 失败:', compressError)
              }
            }
            
            await trySetItem([item], attempt + 1)
            return
            
            // 尝试删除其他存储项，释放空间
            if (attempt < 3) {
              logger.warn('尝试清理其他存储项...')
              // 只保留最新的历史记录，删除所有其他记录
              await trySetItem([item], attempt + 1)
              return
            }
            
            logger.error('Storage full, cannot save even one item after compression attempts.')
            throw new Error('存储空间不足，无法保存历史记录。请清理浏览器缓存或删除旧记录。')
          } else {
            logger.error('Storage full, cannot save even one item.')
            throw new Error('存储空间不足，无法保存历史记录。请清理浏览器缓存或删除旧记录。')
          }
        } else {
          throw e
        }
      }
    }

    await trySetItem(itemsToSave)
    
    // 同步到最近项目（workspace）
    try {
      const { useWorkspaceStore } = await import('../../stores/workspaceStore')
      const workspaceStore = useWorkspaceStore()
      
      // 根据历史记录创建或更新workspace
      const workspaceType = result.mode === ProcessingMode.IMAGE_TO_IMAGE ? 'image' 
        : result.mode === ProcessingMode.PROMPT_TO_IMAGE ? 'prompt' 
        : 'text'
      
      const workspaceName = result.projectName || result.topic || result.analysis?.name || '未命名项目'
      const thumbnail = result.generatedImageUrl || result.originalImageUrl || result.pages?.[0]?.imageUrl
      
      // 检查是否已存在对应的workspace
      const existingWorkspace = workspaceStore.allWorkspaces.find(w => w.relatedId === result.id)
      
      if (existingWorkspace) {
        // 更新现有workspace
        existingWorkspace.name = workspaceName
        existingWorkspace.updatedAt = Date.now()
        existingWorkspace.thumbnail = thumbnail
        existingWorkspace.status = 'completed'
        await workspaceStore.saveWorkspaces()
        await workspaceStore.addToRecent(existingWorkspace.id)
      } else {
        // 创建新workspace
        const workspace = await workspaceStore.createWorkspace({
          name: workspaceName,
          type: workspaceType,
          relatedId: result.id,
          metadata: {
            historyItem: result,
            thumbnail: thumbnail
          }
        }, userId)
        await workspaceStore.addToRecent(workspace.id)
      }
      
      logger.debug('✅ 历史记录已同步到最近项目')
    } catch (workspaceError) {
      logger.warn('⚠️ 同步到最近项目失败（不影响历史记录保存）:', workspaceError)
      // 不抛出错误，因为历史记录保存已经成功
    }
  } catch (error) {
    logger.error('❌ Failed to save history:', error)
    throw error
  }
}

/**
 * 获取用户历史记录
 */
export function getUserHistory(userId: string): GeneratedResult[] {
  const key = `${STORAGE_KEYS.HISTORY_PREFIX}${userId}`
  const historyStr = localStorage.getItem(key)
  try {
    logger.debug('=== getUserHistory 开始加载:', { userId, key })
    const history = historyStr ? JSON.parse(historyStr) : []
    logger.debug('=== getUserHistory 成功加载:', { userId, count: history.length })
    if (import.meta.env.DEV) {
      logger.debug('原始localStorage数据:', historyStr?.substring(0, 500) + '...')
      if (history.length > 0) {
        logger.debug('第一条历史记录预览:', history[0])
      }
    }
    return history
  } catch (e) {
    logger.error('❌ 解析历史记录失败，可能数据损坏:', e)
    localStorage.removeItem(key) // 清除损坏的数据
    return []
  }
}

/**
 * 获取所有用户的历史记录（管理员功能）
 */
export function getAllUsersHistory(): GeneratedResult[] {
  const allHistory: GeneratedResult[] = []
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
  const users = usersStr ? JSON.parse(usersStr) : []
  
  for (const user of users) {
    const userHistory = getUserHistory(user.id)
    allHistory.push(...userHistory)
  }
  
  // 按创建时间排序
  return allHistory.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

/**
 * 删除历史记录
 */
export function deleteHistoryItem(userId: string, itemId: string): boolean {
  try {
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    if (!historyStr) return false
    
    const history: GeneratedResult[] = JSON.parse(historyStr)
    const filtered = history.filter(item => item.id !== itemId)
    
    if (filtered.length === history.length) {
      return false // 没有找到要删除的项
    }
    
    localStorage.setItem(key, JSON.stringify(filtered))
    logger.debug('历史记录已删除:', itemId)
    return true
  } catch (e) {
    logger.error('删除历史记录失败:', e)
    return false
  }
}


