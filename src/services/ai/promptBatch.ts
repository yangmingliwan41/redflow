/**
 * 批量提示词生成规划服务
 * 参考文生图模式，自动规划批量生成任务，严格控制生成数量
 */

import { logger } from '../../composables/useLogger'

export interface PromptBatchTask {
  index: number
  theme: string
  prompt?: string // 如果用户直接提供提示词
}

export interface PromptBatchPlan {
  tasks: PromptBatchTask[]
  totalCount: number
  maxCount: number
}

/**
 * 规划批量生成任务
 * @param themes 主题列表（如果用户输入主题）
 * @param prompts 提示词列表（如果用户直接输入提示词）
 * @param maxCount 最大生成数量限制（默认10，确保成本可控）
 */
export function generatePromptBatchPlan(
  themes?: string[],
  prompts?: string[],
  maxCount: number = 10
): PromptBatchPlan {
  logger.debug('开始规划批量生成任务', { themesCount: themes?.length, promptsCount: prompts?.length, maxCount })

  const tasks: PromptBatchTask[] = []

  // 如果提供了主题列表
  if (themes && themes.length > 0) {
    // 过滤空主题并限制数量
    const validThemes = themes
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, maxCount)

    validThemes.forEach((theme, index) => {
      tasks.push({
        index,
        theme
      })
    })
  }

  // 如果提供了提示词列表
  if (prompts && prompts.length > 0) {
    // 过滤空提示词并限制数量
    const validPrompts = prompts
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, maxCount - tasks.length) // 确保总数不超过maxCount

    validPrompts.forEach((prompt, index) => {
      tasks.push({
        index: tasks.length + index,
        prompt
      })
    })
  }

  // 如果任务数量超过限制，截断
  if (tasks.length > maxCount) {
    tasks.splice(maxCount)
  }

  logger.debug('批量生成任务规划完成', { totalTasks: tasks.length, maxCount })

  return {
    tasks,
    totalCount: tasks.length,
    maxCount
  }
}








