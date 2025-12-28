/**
 * 需求分析状态管理
 */

import { defineStore } from 'pinia'
import { RequirementAnalysis } from '../types'
import {
  analyzeAndSaveRequirement,
  getRequirement,
  getAllRequirements,
  deleteRequirement,
  updateRequirement
} from '../services/requirement/requirementAnalysis'
import { storage } from '../services/storage/index'
import { logger } from '../composables/useLogger'

interface RequirementState {
  currentRequirement: RequirementAnalysis | null
  requirements: RequirementAnalysis[]
  loading: boolean
  error: string | null
}

export const useRequirementStore = defineStore('requirement', {
  state: (): RequirementState => ({
    currentRequirement: null,
    requirements: [],
    loading: false,
    error: null
  }),

  getters: {
    hasCurrentRequirement: (state): boolean => {
      return state.currentRequirement !== null
    },
    
    requirementsCount: (state): number => {
      return state.requirements.length
    }
  },

  actions: {
    /**
     * 分析需求
     */
    async analyzeRequirement(userInput: string, userId?: string): Promise<RequirementAnalysis> {
      this.loading = true
      this.error = null
      
      try {
        const result = await analyzeAndSaveRequirement(userInput, userId)
        this.currentRequirement = result.requirement
        await this.loadRequirements(userId)
        return result.requirement
      } catch (error: any) {
        this.error = error.message || '需求分析失败'
        logger.error('需求分析失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载需求分析列表
     */
    async loadRequirements(userId?: string): Promise<void> {
      this.loading = true
      this.error = null
      
      try {
        this.requirements = await getAllRequirements(userId)
      } catch (error: any) {
        this.error = error.message || '加载需求列表失败'
        logger.error('加载需求列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载单个需求分析
     */
    async loadRequirement(id: string): Promise<void> {
      this.loading = true
      this.error = null
      
      try {
        const requirement = await getRequirement(id)
        if (requirement) {
          this.currentRequirement = requirement
        } else {
          throw new Error('需求分析不存在')
        }
      } catch (error: any) {
        this.error = error.message || '加载需求分析失败'
        logger.error('加载需求分析失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前需求分析
     */
    setCurrentRequirement(requirement: RequirementAnalysis | null): void {
      this.currentRequirement = requirement
    },

    /**
     * 更新需求分析
     */
    async updateRequirement(requirement: RequirementAnalysis): Promise<void> {
      this.loading = true
      this.error = null
      
      try {
        await updateRequirement(requirement)
        if (this.currentRequirement?.id === requirement.id) {
          this.currentRequirement = requirement
        }
        // 更新列表中的需求
        const index = this.requirements.findIndex(r => r.id === requirement.id)
        if (index >= 0) {
          this.requirements[index] = requirement
        }
      } catch (error: any) {
        this.error = error.message || '更新需求分析失败'
        logger.error('更新需求分析失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除需求分析
     */
    async removeRequirement(id: string): Promise<void> {
      this.loading = true
      this.error = null
      
      try {
        await deleteRequirement(id)
        this.requirements = this.requirements.filter(r => r.id !== id)
        if (this.currentRequirement?.id === id) {
          this.currentRequirement = null
        }
      } catch (error: any) {
        this.error = error.message || '删除需求分析失败'
        logger.error('删除需求分析失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 清除错误
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    reset(): void {
      this.currentRequirement = null
      this.requirements = []
      this.loading = false
      this.error = null
    }
  }
})


