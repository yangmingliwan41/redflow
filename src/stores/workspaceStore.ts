/**
 * 工作区状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Workspace, WorkspaceGroup, CreateWorkspaceOptions, WorkspaceType, WorkspaceStatus } from '../types/workspace'
import { storage } from '../services/storage/index'
import { logger } from '../composables/useLogger'
import { v4 as uuidv4 } from 'uuid'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  loading: boolean
  error: string | null
  recentWorkspaceIds: string[]
}

const STORAGE_KEY = 'workspaces'
const RECENT_KEY = 'recent_workspaces'
const MAX_RECENT = 20

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
    recentWorkspaceIds: []
  }),

  getters: {
    /** 所有工作区 */
    allWorkspaces: (state): Workspace[] => {
      return state.workspaces
    },

    /** 最近工作区 */
    recentWorkspaces: (state): Workspace[] => {
      return state.recentWorkspaceIds
        .map(id => state.workspaces.find(w => w.id === id))
        .filter((w): w is Workspace => w !== undefined)
        .slice(0, MAX_RECENT)
    },

    /** 收藏的工作区 */
    favoriteWorkspaces: (state): Workspace[] => {
      return state.workspaces
        .filter(w => w.isFavorite)
        .sort((a, b) => b.updatedAt - a.updatedAt)
    },

    /** 按类型分组的工作区 */
    workspacesByType: (state) => {
      return (type: WorkspaceType): Workspace[] => {
        return state.workspaces
          .filter(w => w.type === type)
          .sort((a, b) => b.updatedAt - a.updatedAt)
      }
    },

    /** 工作区分组 */
    workspaceGroups: (state): WorkspaceGroup[] => {
      const recent = state.recentWorkspaceIds
        .map(id => state.workspaces.find(w => w.id === id))
        .filter((w): w is Workspace => w !== undefined)
        .slice(0, MAX_RECENT)

      const favorites = state.workspaces
        .filter(w => w.isFavorite)
        .sort((a, b) => b.updatedAt - a.updatedAt)

      return [
        {
          name: '最近',
          type: 'recent',
          workspaces: recent,
          defaultExpanded: true
        },
        {
          name: '收藏',
          type: 'favorite',
          workspaces: favorites,
          defaultExpanded: true
        },
        {
          name: '全部',
          type: 'all',
          workspaces: state.workspaces.sort((a, b) => b.updatedAt - a.updatedAt),
          defaultExpanded: false
        }
      ]
    },

    /** 工作区数量 */
    workspaceCount: (state): number => {
      return state.workspaces.length
    }
  },

  actions: {
    /**
     * 加载工作区列表
     */
    async loadWorkspaces(userId?: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        // 从localStorage加载
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          this.workspaces = Array.isArray(parsed) ? parsed : []
        } else {
          this.workspaces = []
        }

        // 加载最近访问记录
        const recentStored = localStorage.getItem(RECENT_KEY)
        if (recentStored) {
          this.recentWorkspaceIds = JSON.parse(recentStored)
        } else {
          this.recentWorkspaceIds = []
        }

        // 如果提供了userId，过滤工作区
        if (userId) {
          this.workspaces = this.workspaces.filter(w => w.userId === userId)
        }
      } catch (error: any) {
        this.error = error.message || '加载工作区失败'
        logger.error('加载工作区失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 创建工作区
     */
    async createWorkspace(options: CreateWorkspaceOptions, userId?: string): Promise<Workspace> {
      this.loading = true
      this.error = null

      try {
        const now = Date.now()
        const workspace: Workspace = {
          id: uuidv4(),
          name: options.name,
          type: options.type,
          description: options.description,
          tags: options.tags || [],
          thumbnail: options.metadata?.thumbnail,
          createdAt: now,
          updatedAt: now,
          isFavorite: false,
          status: 'draft',
          userId: userId || 'default',
          relatedId: options.relatedId,
          metadata: options.metadata || {}
        }

        this.workspaces.unshift(workspace)
        await this.saveWorkspaces()
        await this.addToRecent(workspace.id)

        logger.info('工作区创建成功:', workspace.id)
        return workspace
      } catch (error: any) {
        this.error = error.message || '创建工作区失败'
        logger.error('创建工作区失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 更新工作区
     */
    async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
      this.loading = true
      this.error = null

      try {
        const index = this.workspaces.findIndex(w => w.id === id)
        if (index === -1) {
          throw new Error('工作区不存在')
        }

        const workspace = this.workspaces[index]
        this.workspaces[index] = {
          ...workspace,
          ...updates,
          updatedAt: Date.now()
        }

        await this.saveWorkspaces()

        // 如果更新的是当前工作区，同步更新
        if (this.currentWorkspace?.id === id) {
          this.currentWorkspace = this.workspaces[index]
        }

        logger.info('工作区更新成功:', id)
        return this.workspaces[index]
      } catch (error: any) {
        this.error = error.message || '更新工作区失败'
        logger.error('更新工作区失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 删除工作区
     */
    async deleteWorkspace(id: string): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const index = this.workspaces.findIndex(w => w.id === id)
        if (index === -1) {
          throw new Error('工作区不存在')
        }

        this.workspaces.splice(index, 1)
        await this.saveWorkspaces()

        // 从最近访问中移除
        this.recentWorkspaceIds = this.recentWorkspaceIds.filter(rid => rid !== id)
        localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentWorkspaceIds))

        // 如果删除的是当前工作区，清空当前工作区
        if (this.currentWorkspace?.id === id) {
          this.currentWorkspace = null
        }

        logger.info('工作区删除成功:', id)
      } catch (error: any) {
        this.error = error.message || '删除工作区失败'
        logger.error('删除工作区失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 设置当前工作区
     */
    setCurrentWorkspace(workspace: Workspace | null): void {
      this.currentWorkspace = workspace
      if (workspace) {
        this.addToRecent(workspace.id)
      }
    },

    /**
     * 根据ID获取工作区
     */
    getWorkspaceById(id: string): Workspace | undefined {
      return this.workspaces.find(w => w.id === id)
    },

    /**
     * 切换收藏状态
     */
    async toggleFavorite(id: string): Promise<void> {
      const workspace = this.getWorkspaceById(id)
      if (workspace) {
        await this.updateWorkspace(id, { isFavorite: !workspace.isFavorite })
      }
    },

    /**
     * 添加到最近访问
     */
    async addToRecent(id: string): Promise<void> {
      // 移除已存在的
      this.recentWorkspaceIds = this.recentWorkspaceIds.filter(rid => rid !== id)
      // 添加到最前面
      this.recentWorkspaceIds.unshift(id)
      // 限制数量
      this.recentWorkspaceIds = this.recentWorkspaceIds.slice(0, MAX_RECENT)
      // 保存
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentWorkspaceIds))
    },

    /**
     * 保存工作区到localStorage
     */
    async saveWorkspaces(): Promise<void> {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.workspaces))
      } catch (error: any) {
        logger.error('保存工作区失败:', error)
        throw error
      }
    },

    /**
     * 从历史记录创建工作区
     */
    async createWorkspaceFromHistory(historyId: string, userId?: string): Promise<Workspace> {
      try {
        const currentUser = await storage.getCurrentUser()
        const { getUserHistory } = await import('../services/storage/history')
        const history = getUserHistory(currentUser?.id || userId || 'default')
        const historyItem = history.find(h => h.id === historyId)

        if (!historyItem) {
          throw new Error('历史记录不存在')
        }

        const type: WorkspaceType = historyItem.mode === 'IMAGE_TO_IMAGE' ? 'image' 
          : historyItem.mode === 'PROMPT_TO_IMAGE' ? 'prompt' 
          : 'text'
        const name = historyItem.projectName || historyItem.analysis?.productName || historyItem.topic || `项目 ${new Date().toLocaleDateString()}`

        return await this.createWorkspace({
          name,
          type,
          relatedId: historyId,
          metadata: {
            historyItem,
            thumbnail: historyItem.generatedImageUrl || historyItem.originalImageUrl
          }
        }, userId || currentUser?.id)
      } catch (error: any) {
        logger.error('从历史记录创建工作区失败:', error)
        throw error
      }
    }
  }
})




