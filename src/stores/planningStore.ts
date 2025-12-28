/**
 * 规划状态管理
 */

import { defineStore } from 'pinia'
import { ContentPlan, MultiContentPlan, SingleContentPlan } from '../types'
import {
  generateMultiContentPlan,
  getPlan,
  getAllPlans,
  savePlan,
  deletePlan
} from '../services/planning/planningService'
import { logger } from '../composables/useLogger'

interface PlanningState {
  currentPlan: ContentPlan | null
  plans: ContentPlan[]
  loading: boolean
  error: string | null
}

export const usePlanningStore = defineStore('planning', {
  state: (): PlanningState => ({
    currentPlan: null,
    plans: [],
    loading: false,
    error: null
  }),

  getters: {
    hasCurrentPlan: (state): boolean => {
      return state.currentPlan !== null
    },
    
    plansCount: (state): number => {
      return state.plans.length
    },

    currentMultiPlan: (state): MultiContentPlan | null => {
      return state.currentPlan?.planType === 'multi' ? state.currentPlan.multi || null : null
    }
  },

  actions: {
    /**
     * 生成多内容规划
     */
    async generatePlan(
      requirementId: string,
      period: { startDate: string; endDate: string; totalContents: number }
    ): Promise<MultiContentPlan> {
      this.loading = true
      this.error = null

      try {
        // 获取需求分析
        const { storage } = await import('../services/storage')
        const requirement = await storage.getRequirement(requirementId)
        if (!requirement) {
          throw new Error('需求分析不存在')
        }

        const plan = await generateMultiContentPlan(requirement, period)
        
        // 加载规划
        const contentPlan = await getPlan(plan.id)
        if (contentPlan) {
          this.currentPlan = contentPlan
        }

        await this.loadPlans()
        return plan
      } catch (error: any) {
        this.error = error.message || '生成规划失败'
        logger.error('生成规划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载规划列表
     */
    async loadPlans(requirementId?: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        this.plans = await getAllPlans(requirementId)
      } catch (error: any) {
        this.error = error.message || '加载规划列表失败'
        logger.error('加载规划列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载单个规划
     */
    async loadPlan(id: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const plan = await getPlan(id)
        if (plan) {
          this.currentPlan = plan
        } else {
          throw new Error('规划不存在')
        }
      } catch (error: any) {
        this.error = error.message || '加载规划失败'
        logger.error('加载规划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前规划
     */
    setCurrentPlan(plan: ContentPlan | null): void {
      this.currentPlan = plan
    },

    /**
     * 更新规划
     */
    async updatePlan(plan: ContentPlan): Promise<void> {
      this.loading = true
      this.error = null

      try {
        await savePlan(plan)
        if (this.currentPlan?.id === plan.id) {
          this.currentPlan = plan
        }
        // 更新列表中的规划
        const index = this.plans.findIndex(p => p.id === plan.id)
        if (index >= 0) {
          this.plans[index] = plan
        }
      } catch (error: any) {
        this.error = error.message || '更新规划失败'
        logger.error('更新规划失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除规划
     */
    async removePlan(id: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        await deletePlan(id)
        this.plans = this.plans.filter(p => p.id !== id)
        if (this.currentPlan?.id === id) {
          this.currentPlan = null
        }
      } catch (error: any) {
        this.error = error.message || '删除规划失败'
        logger.error('删除规划失败:', error)
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
      this.currentPlan = null
      this.plans = []
      this.loading = false
      this.error = null
    }
  }
})


