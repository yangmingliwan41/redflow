/**
 * 功能开关定义
 */

export interface FeatureFlags {
  requirementAnalysis: boolean
  autoPlanning: boolean
  publishCalendar: boolean
  workflowEngine: boolean
  dashboard: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  requirementAnalysis: true,
  autoPlanning: true,
  publishCalendar: true,
  workflowEngine: true,
  dashboard: true,
}


