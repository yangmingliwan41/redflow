/**
 * 提示词模板配置
 * 用于管理不同风格的元提示词模板
 */

export interface PromptTemplate {
  id: string
  name: string
  description: string
  promptFilePath: string // 相对于项目根目录的路径
  enabled: boolean
}

/**
 * 可用的提示词模板列表
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'poster',
    name: '海报风格',
    description: '3D微缩场景电影海报风格，适合电影、剧集等主题',
    promptFilePath: 'prompt/picprompt.md',
    enabled: true
  }
  // 未来可以在这里添加更多风格模板
  // {
  //   id: 'another_style',
  //   name: '另一种风格',
  //   description: '风格描述',
  //   promptFilePath: 'prompt/another_style.md',
  //   enabled: true
  // }
]

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id && t.enabled)
}

/**
 * 获取所有启用的模板
 */
export function getEnabledTemplates(): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.enabled)
}








