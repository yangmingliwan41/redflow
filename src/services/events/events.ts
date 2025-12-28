/**
 * 预定义事件常量
 */

export const Events = {
  // 需求分析相关
  REQUIREMENT_ANALYZED: 'requirement:analyzed',
  REQUIREMENT_SAVED: 'requirement:saved',
  REQUIREMENT_DELETED: 'requirement:deleted',
  
  // 规划相关
  PLAN_CREATED: 'plan:created',
  PLAN_UPDATED: 'plan:updated',
  PLAN_DELETED: 'plan:deleted',
  PLAN_CONFIRMED: 'plan:confirmed',
  PLAN_CONFLICT_DETECTED: 'plan:conflict:detected',
  PLAN_CONFLICT_RESOLVED: 'plan:conflict:resolved',
  
  // 内容创作相关
  CONTENT_CREATED: 'content:created',
  CONTENT_UPDATED: 'content:updated',
  CONTENT_DELETED: 'content:deleted',
  
  // 发布计划相关
  SCHEDULE_CREATED: 'schedule:created',
  SCHEDULE_UPDATED: 'schedule:updated',
  SCHEDULE_DELETED: 'schedule:deleted',
  PUBLISH_REMINDER: 'publish:reminder',
  PUBLISH_TIME_APPROACHING: 'publish:time:approaching',
  
  // 工作流相关
  WORKFLOW_STARTED: 'workflow:started',
  WORKFLOW_STEP_COMPLETED: 'workflow:step:completed',
  WORKFLOW_COMPLETED: 'workflow:completed',
  WORKFLOW_FAILED: 'workflow:failed',
  WORKFLOW_CANCELLED: 'workflow:cancelled',
  
  // 用户相关
  USER_LOGGED_IN: 'user:logged:in',
  USER_LOGGED_OUT: 'user:logged:out',
  USER_UPDATED: 'user:updated',
  
  // 历史记录相关
  HISTORY_SAVED: 'history:saved',
  HISTORY_DELETED: 'history:deleted',
} as const

export type EventType = typeof Events[keyof typeof Events]


