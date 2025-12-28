/**
 * 存储适配器接口定义
 * 为未来迁移到IndexedDB或后端API做准备
 */

import { User } from '../../../types'
import { GeneratedResult } from '../../../types'
import { RequirementAnalysis } from '../../../types'
import { ContentPlan, PlanFilters } from '../../../types'
import { PublishSchedule, DateRange } from '../../../types'

export interface StorageAdapter {
  // 用户相关
  saveUser(user: User): Promise<void>
  getUser(userId: string): Promise<User | null>
  getAllUsers(): Promise<User[]>
  updateUser(user: User): Promise<void>
  deleteUser(userId: string): Promise<void>
  
  // 当前用户
  getCurrentUser(): Promise<User | null>
  setCurrentUser(user: User | null): Promise<void>
  
  // 需求分析
  saveRequirement(requirement: RequirementAnalysis): Promise<void>
  getRequirement(id: string): Promise<RequirementAnalysis | null>
  getAllRequirements(userId?: string): Promise<RequirementAnalysis[]>
  deleteRequirement(id: string): Promise<void>
  
  // 内容规划
  savePlan(plan: ContentPlan): Promise<void>
  getPlan(id: string): Promise<ContentPlan | null>
  listPlans(filters?: PlanFilters): Promise<ContentPlan[]>
  deletePlan(id: string): Promise<void>
  
  // 发布计划
  saveSchedule(schedule: PublishSchedule): Promise<void>
  getSchedule(id: string): Promise<PublishSchedule | null>
  listSchedules(dateRange?: DateRange): Promise<PublishSchedule[]>
  deleteSchedule(id: string): Promise<void>
  
  // 历史记录
  saveHistory(history: GeneratedResult): Promise<void>
  getHistory(userId: string, itemId?: string): Promise<GeneratedResult[]>
  deleteHistory(userId: string, itemId: string): Promise<void>
}


