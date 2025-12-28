/**
 * 工作区/项目类型定义
 */

export type WorkspaceType = 'text' | 'image' | 'prompt' | 'plan' | 'requirement' | 'calendar'

export type WorkspaceStatus = 'draft' | 'in-progress' | 'completed' | 'archived'

export interface Workspace {
  /** 工作区ID */
  id: string
  /** 工作区名称 */
  name: string
  /** 工作区类型 */
  type: WorkspaceType
  /** 缩略图URL */
  thumbnail?: string
  /** 更新时间戳 */
  updatedAt: number
  /** 创建时间戳 */
  createdAt: number
  /** 是否收藏 */
  isFavorite: boolean
  /** 工作区状态 */
  status: WorkspaceStatus
  /** 用户ID */
  userId: string
  /** 描述信息 */
  description?: string
  /** 标签 */
  tags?: string[]
  /** 关联的数据ID（如历史记录ID、规划ID等） */
  relatedId?: string
  /** 扩展数据 */
  metadata?: Record<string, any>
}

export interface WorkspaceGroup {
  /** 分组名称 */
  name: string
  /** 分组类型 */
  type: 'recent' | 'favorite' | 'all' | 'custom'
  /** 工作区列表 */
  workspaces: Workspace[]
  /** 是否可折叠 */
  collapsible?: boolean
  /** 是否默认展开 */
  defaultExpanded?: boolean
}

export interface CreateWorkspaceOptions {
  /** 工作区名称 */
  name: string
  /** 工作区类型 */
  type: WorkspaceType
  /** 描述 */
  description?: string
  /** 标签 */
  tags?: string[]
  /** 关联数据ID */
  relatedId?: string
  /** 扩展数据 */
  metadata?: Record<string, any>
}




