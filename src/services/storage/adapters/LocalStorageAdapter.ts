/**
 * localStorage存储适配器实现
 */

import { v4 as uuidv4 } from 'uuid'
import { StorageAdapter } from './StorageAdapter'
import { User, UserRole, GeneratedResult, ProcessingMode } from '../../../types'
import { RequirementAnalysis } from '../../../types'
import { ContentPlan, PlanFilters } from '../../../types'
import { PublishSchedule, DateRange } from '../../../types'
import { STORAGE_KEYS, HISTORY_CONFIG } from '../../../config/constants'
import { compressImage } from '../../../utils'
import { logger } from '../../../composables/useLogger'

export class LocalStorageAdapter implements StorageAdapter {
  // ========== 用户相关 ==========
  
  async saveUser(user: User): Promise<void> {
    const users = await this.getAllUsers()
    const existingIndex = users.findIndex(u => u.id === user.id)
    
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    logger.debug('用户保存成功:', user.id)
  }
  
  async getUser(userId: string): Promise<User | null> {
    const users = await this.getAllUsers()
    return users.find(u => u.id === userId) || null
  }
  
  async getAllUsers(): Promise<User[]> {
    const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
    return usersStr ? JSON.parse(usersStr) : []
  }
  
  async updateUser(user: User): Promise<void> {
    await this.saveUser(user)
  }
  
  async deleteUser(userId: string): Promise<void> {
    const users = await this.getAllUsers()
    const filtered = users.filter(u => u.id !== userId)
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered))
    logger.debug('用户删除成功:', userId)
  }
  
  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return userStr ? JSON.parse(userStr) : null
  }
  
  async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
    logger.debug('当前用户设置成功')
  }
  
  // ========== 需求分析 ==========
  
  async saveRequirement(requirement: RequirementAnalysis): Promise<void> {
    const key = `redflow_requirement_${requirement.id}`
    localStorage.setItem(key, JSON.stringify(requirement))
    logger.debug('需求分析保存成功:', requirement.id)
  }
  
  async getRequirement(id: string): Promise<RequirementAnalysis | null> {
    const key = `redflow_requirement_${id}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  
  async getAllRequirements(userId?: string): Promise<RequirementAnalysis[]> {
    const requirements: RequirementAnalysis[] = []
    const keys = Object.keys(localStorage)
    
    for (const key of keys) {
      if (key.startsWith('redflow_requirement_')) {
        try {
          const requirement = JSON.parse(localStorage.getItem(key) || '{}')
          if (!userId || requirement.userId === userId) {
            requirements.push(requirement)
          }
        } catch (e) {
          logger.warn('解析需求分析失败:', key, e)
        }
      }
    }
    
    return requirements.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  
  async deleteRequirement(id: string): Promise<void> {
    const key = `redflow_requirement_${id}`
    localStorage.removeItem(key)
    logger.debug('需求分析删除成功:', id)
  }
  
  // ========== 内容规划 ==========
  
  async savePlan(plan: ContentPlan): Promise<void> {
    const key = `redflow_plan_${plan.id}`
    const planToSave = {
      ...plan,
      updatedAt: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(planToSave))
    logger.debug('内容规划保存成功:', plan.id)
  }
  
  async getPlan(id: string): Promise<ContentPlan | null> {
    const key = `redflow_plan_${id}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  
  async listPlans(filters?: PlanFilters): Promise<ContentPlan[]> {
    const plans: ContentPlan[] = []
    const keys = Object.keys(localStorage)
    
    for (const key of keys) {
      if (key.startsWith('redflow_plan_')) {
        try {
          const plan = JSON.parse(localStorage.getItem(key) || '{}')
          
          // 应用过滤器
          if (filters) {
            if (filters.requirementId && plan.requirementId !== filters.requirementId) {
              continue
            }
            if (filters.planType && plan.planType !== filters.planType) {
              continue
            }
            if (filters.dateRange) {
              const planDate = plan.createdAt
              if (planDate < new Date(filters.dateRange.start).getTime() ||
                  planDate > new Date(filters.dateRange.end).getTime()) {
                continue
              }
            }
          }
          
          plans.push(plan)
        } catch (e) {
          logger.warn('解析内容规划失败:', key, e)
        }
      }
    }
    
    return plans.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }
  
  async deletePlan(id: string): Promise<void> {
    const key = `redflow_plan_${id}`
    localStorage.removeItem(key)
    logger.debug('内容规划删除成功:', id)
  }
  
  // ========== 发布计划 ==========
  
  async saveSchedule(schedule: PublishSchedule): Promise<void> {
    const key = `redflow_schedule_${schedule.id}`
    const scheduleToSave = {
      ...schedule,
      updatedAt: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(scheduleToSave))
    logger.debug('发布计划保存成功:', schedule.id)
  }
  
  async getSchedule(id: string): Promise<PublishSchedule | null> {
    const key = `redflow_schedule_${id}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }
  
  async listSchedules(dateRange?: DateRange): Promise<PublishSchedule[]> {
    const schedules: PublishSchedule[] = []
    const keys = Object.keys(localStorage)
    
    for (const key of keys) {
      if (key.startsWith('redflow_schedule_')) {
        try {
          const schedule = JSON.parse(localStorage.getItem(key) || '{}')
          
          // 应用日期范围过滤
          if (dateRange) {
            const scheduleDate = new Date(schedule.scheduledTime).toISOString().split('T')[0]
            if (scheduleDate < dateRange.start || scheduleDate > dateRange.end) {
              continue
            }
          }
          
          schedules.push(schedule)
        } catch (e) {
          logger.warn('解析发布计划失败:', key, e)
        }
      }
    }
    
    return schedules.sort((a, b) => a.scheduledTime - b.scheduledTime)
  }
  
  async deleteSchedule(id: string): Promise<void> {
    const key = `redflow_schedule_${id}`
    localStorage.removeItem(key)
    logger.debug('发布计划删除成功:', id)
  }
  
  // ========== 历史记录 ==========
  
  async saveHistory(result: GeneratedResult): Promise<void> {
    if (!result.userId) {
      throw new Error('历史记录必须包含userId')
    }
    
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${result.userId}`
    const historyStr = localStorage.getItem(key)
    let history: GeneratedResult[] = historyStr ? JSON.parse(historyStr) : []
    
    // 压缩图片（复用现有逻辑）
    let storedOriginalImage = result.originalImageUrl
    let storedGeneratedImage = result.generatedImageUrl
    
    const COMPRESSION_WIDTH = 600
    const COMPRESSION_QUALITY = 0.6
    
    if (result.mode === ProcessingMode.IMAGE_TO_IMAGE) {
      if (result.originalImageFile || result.originalImageUrl) {
        try {
          storedOriginalImage = await compressImage(
            result.originalImageFile || result.originalImageUrl,
            COMPRESSION_WIDTH,
            COMPRESSION_QUALITY
          )
        } catch (e) {
          logger.warn('原始图片压缩失败', e)
        }
      }
      
      if (result.generatedImageUrl) {
        try {
          storedGeneratedImage = await compressImage(
            result.generatedImageUrl,
            COMPRESSION_WIDTH,
            COMPRESSION_QUALITY
          )
        } catch (e) {
          logger.warn('生成图片压缩失败', e)
        }
      }
    } else if (result.mode === ProcessingMode.TEXT_TO_IMAGE && result.pages) {
      const compressedPages = await Promise.all(
        result.pages.map(async (page) => {
          if (page.imageUrl) {
            try {
              const compressed = await compressImage(
                page.imageUrl,
                COMPRESSION_WIDTH,
                COMPRESSION_QUALITY
              )
              return { ...page, imageUrl: compressed }
            } catch (e) {
              logger.warn(`页面 ${page.index} 图片压缩失败`, e)
              return page
            }
          }
          return page
        })
      )
      result.pages = compressedPages
    } else if (result.mode === ProcessingMode.PROMPT_TO_IMAGE && result.generatedImageUrl) {
      try {
        storedGeneratedImage = await compressImage(
          result.generatedImageUrl,
          COMPRESSION_WIDTH,
          COMPRESSION_QUALITY
        )
      } catch (e) {
        logger.warn('提示词生成图片压缩失败', e)
      }
    }
    
    const itemToSave: GeneratedResult = {
      ...result,
      originalImageFile: undefined,
      originalImageUrl: storedOriginalImage,
      generatedImageUrl: storedGeneratedImage,
      createdAt: Date.now(),
    }
    
    const existingIndex = history.findIndex(h => h.id === result.id)
    if (existingIndex >= 0) {
      history[existingIndex] = itemToSave
    } else {
      history.unshift(itemToSave)
    }
    
    // 限制历史记录数量
    const maxItems = HISTORY_CONFIG.MAX_ITEMS
    let itemsToSave = history.slice(0, maxItems)
    
    // 尝试保存，如果失败则删除最旧的记录
    try {
      const jsonStr = JSON.stringify(itemsToSave)
      localStorage.setItem(key, jsonStr)
      logger.info('✅ 历史记录保存成功！')
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
        logger.warn('存储空间不足，尝试删除旧记录')
        if (itemsToSave.length > 1) {
          itemsToSave = itemsToSave.slice(0, itemsToSave.length - 1)
          localStorage.setItem(key, JSON.stringify(itemsToSave))
        } else {
          throw new Error('存储空间不足，无法保存历史记录。请清理浏览器缓存或删除旧记录。')
        }
      } else {
        throw e
      }
    }
  }
  
  async getHistory(userId: string, itemId?: string): Promise<GeneratedResult[]> {
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    
    if (!historyStr) {
      return []
    }
    
    try {
      const history = JSON.parse(historyStr)
      if (itemId) {
        return history.filter((item: GeneratedResult) => item.id === itemId)
      }
      return history
    } catch (e) {
      logger.error('解析历史记录失败，可能数据损坏:', e)
      localStorage.removeItem(key)
      return []
    }
  }
  
  async deleteHistory(userId: string, itemId: string): Promise<void> {
    const key = `${STORAGE_KEYS.HISTORY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    
    if (!historyStr) {
      return
    }
    
    try {
      const history: GeneratedResult[] = JSON.parse(historyStr)
      const filtered = history.filter(item => item.id !== itemId)
      localStorage.setItem(key, JSON.stringify(filtered))
      logger.debug('历史记录删除成功:', itemId)
    } catch (e) {
      logger.error('删除历史记录失败:', e)
      throw e
    }
  }
}


