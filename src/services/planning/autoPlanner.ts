/**
 * 自动规划服务
 * 实现多内容规划算法
 */

import { v4 as uuidv4 } from 'uuid'
import {
  RequirementAnalysis,
  SingleContentPlan,
  MultiContentPlan,
  ContentOutline,
  PageContent,
  StylePack,
  StyleExample
} from '../../types'
import { generateOutline } from '../ai/outline'
import { getStyleConfig } from '../../config/stylePrompts'
import { logger } from '../../composables/useLogger'

export class MultiContentPlanner {
  private availableStyles = [
    'xiaohongshu', 'poster_2k', 'ins_minimal', 'tech_future',
    'nature_fresh', 'morandi', 'black_gold', 'minimal_white',
    'dopamine', 'cyberpunk', 'retro_vintage'
  ]

  /**
   * 生成多内容规划（一周/一月）
   */
  async generateMultiContentPlan(
    requirement: RequirementAnalysis,
    period: { startDate: string; endDate: string; totalContents: number }
  ): Promise<MultiContentPlan> {
    logger.debug('开始生成多内容规划:', { requirement: requirement.id, period })

    // 验证输入
    if (period.totalContents <= 0) {
      throw new Error('内容数量必须大于0')
    }

    // 1. 内容类型分布规划
    const contentTypeDistribution = this.planContentTypeDistribution(
      requirement,
      period.totalContents
    )

    // 2. 风格分布规划（确保多样性）
    // 创建副本，避免在循环中修改原始对象
    const styleDistribution = { ...this.planStyleDistribution(
      requirement,
      period.totalContents
    ) }

    // 3. 为每篇内容生成规划
    const contents: SingleContentPlan[] = []
    for (let i = 0; i < period.totalContents; i++) {
      const contentType = this.selectContentType(contentTypeDistribution, i)
      const stylePack = await this.selectStyle(styleDistribution, i, contents)

      const content = await this.generateSingleContentPlan(
        requirement,
        {
          index: i + 1,
          contentType,
          stylePack,
          targetDate: this.calculateTargetDate(period.startDate, period.endDate, i + 1, period.totalContents)
        }
      )

      // 生成风格示例贴（简化版）
      content.styleExample = this.generateStyleExample(stylePack, contentType)

      contents.push(content)
    }

    // 4. 计算多样性评分
    const diversityScore = this.calculateDiversityScore(contents)

    // 5. 构建多内容规划
    const plan: MultiContentPlan = {
      id: `plan_${Date.now()}_${uuidv4().slice(0, 8)}`,
      requirementId: requirement.id,
      planName: `${period.totalContents}篇内容规划`,
      period: {
        startDate: period.startDate,
        endDate: period.endDate,
        totalDays: this.calculateDays(period.startDate, period.endDate)
      },
      contents,
      overallStrategy: {
        totalContents: period.totalContents,
        contentTypeDistribution,
        styleDistribution,
        diversityScore
      },
      publishSchedule: this.planPublishSchedule(contents, period),
      resources: this.calculateTotalResources(contents),
      conflictCheck: {
        checked: false,
        conflicts: [],
        resolved: false
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    logger.info('多内容规划生成完成:', plan.id)
    return plan
  }

  /**
   * 规划内容类型分布（确保多样性）
   */
  private planContentTypeDistribution(
    requirement: RequirementAnalysis,
    totalContents: number
  ): Record<string, number> {
    const preferredType = requirement.contentType
    const availableTypes = ['tutorial', 'review', 'recommendation', 'comparison', 'knowledge']

    // 主要类型占60%，其他类型占40%
    const mainTypeCount = Math.ceil(totalContents * 0.6)
    const otherTypeCount = totalContents - mainTypeCount

    const distribution: Record<string, number> = {}
    distribution[preferredType] = mainTypeCount

    // 分配其他类型
    const otherTypes = availableTypes.filter(t => t !== preferredType)
    const perType = Math.floor(otherTypeCount / otherTypes.length)
    const remainder = otherTypeCount % otherTypes.length

    otherTypes.forEach((type, index) => {
      distribution[type] = perType + (index < remainder ? 1 : 0)
    })

    return distribution
  }

  /**
   * 规划风格分布（确保多样性）
   */
  private planStyleDistribution(
    requirement: RequirementAnalysis,
    totalContents: number
  ): Record<string, number> {
    const suggestedStyles = requirement.suggestedStyles
    const distribution: Record<string, number> = {}

    // 优先使用建议的风格
    const styleCount = Math.min(suggestedStyles.length, totalContents)
    const perStyle = Math.floor(totalContents / styleCount)
    const remainder = totalContents % styleCount

    suggestedStyles.slice(0, styleCount).forEach((style, index) => {
      distribution[style] = perStyle + (index < remainder ? 1 : 0)
    })

    // 如果内容数量多于风格数量，补充其他风格
    if (totalContents > styleCount) {
      const remaining = totalContents - styleCount
      const otherStyles = this.availableStyles.filter(s => !suggestedStyles.includes(s))
      
      if (otherStyles.length > 0) {
        const perOtherStyle = Math.floor(remaining / otherStyles.length)
        const otherRemainder = remaining % otherStyles.length

        // 分配剩余内容到其他风格
        otherStyles.forEach((style, index) => {
          if (index < remaining) {
            distribution[style] = perOtherStyle + (index < otherRemainder ? 1 : 0)
          }
        })
      }
    }

    return distribution
  }

  /**
   * 选择内容类型
   */
  private selectContentType(
    distribution: Record<string, number>,
    index: number
  ): string {
    const types: string[] = []
    Object.entries(distribution).forEach(([type, count]) => {
      for (let i = 0; i < count; i++) {
        types.push(type)
      }
    })

    if (types.length === 0) {
      return 'recommendation' // 默认类型
    }

    // 随机打乱
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[types[i], types[j]] = [types[j], types[i]]
    }

    return types[index % types.length] || 'recommendation'
  }

  /**
   * 选择风格（确保不连续使用相同风格）
   */
  private async selectStyle(
    styleDistribution: Record<string, number>,
    index: number,
    existingContents: SingleContentPlan[]
  ): Promise<StylePack> {
    // 获取最近3篇内容使用的风格
    const recentStyles = existingContents
      .slice(-3)
      .map(c => c.stylePack.style_id)

    // 选择与最近风格不同的风格
    const availableStyles = Object.keys(styleDistribution).filter(
      style => !recentStyles.includes(style) && (styleDistribution[style] || 0) > 0
    )

    let selectedStyle: string
    if (availableStyles.length === 0) {
      // 如果没有可用风格，选择使用次数最少的
      selectedStyle = this.getLeastUsedStyle(styleDistribution, existingContents)
    } else {
      // 随机选择可用风格
      selectedStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)]
    }

    // 减少该风格的使用次数
    if (styleDistribution[selectedStyle]) {
      styleDistribution[selectedStyle]--
    }

    return this.getStylePack(selectedStyle)
  }

  /**
   * 获取使用次数最少的风格（基于剩余可用数量）
   */
  private getLeastUsedStyle(
    styleDistribution: Record<string, number>,
    existingContents: SingleContentPlan[]
  ): string {
    // 优先选择剩余数量最多的风格
    const availableStyles = Object.entries(styleDistribution)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // 按剩余数量降序排序
    
    if (availableStyles.length > 0) {
      return availableStyles[0][0]
    }
    
    // 如果所有风格都用完了，选择使用次数最少的
    const usageCount: Record<string, number> = {}
    Object.keys(styleDistribution).forEach(style => {
      usageCount[style] = existingContents.filter(c => c.stylePack.style_id === style).length
    })

    const sorted = Object.entries(usageCount).sort((a, b) => a[1] - b[1])
    return sorted[0]?.[0] || 'xiaohongshu'
  }

  /**
   * 获取风格包
   */
  private getStylePack(styleId: string): StylePack {
    const styleConfig = getStyleConfig(styleId)
    return {
      style_id: styleId,
      style_name: styleConfig?.name || styleId,
      description: styleConfig?.description || ''
    }
  }

  /**
   * 生成单篇内容规划
   */
  private async generateSingleContentPlan(
    requirement: RequirementAnalysis,
    options: {
      index: number
      contentType: string
      stylePack: StylePack
      targetDate: string
    }
  ): Promise<SingleContentPlan> {
    // 生成标题
    const title = await this.generateTitle(requirement, options.contentType, options.index)

    // 生成大纲
    const outline = await this.generateOutline(requirement, options.contentType, options.stylePack.style_id)

    // 计算发布时间
    const scheduledTime = this.calculateScheduledTime(options.targetDate)

    // 计算资源需求（包括封面页）
    const resources = {
      imageCount: outline.pages.length + 1, // 封面 + 内容页
      textLength: outline.cover.content.length + outline.pages.reduce((sum, p) => sum + p.content.length, 0),
      estimatedTime: 1 // 预计时间固定为1分钟
    }

    return {
      id: `content_${Date.now()}_${options.index}_${uuidv4().slice(0, 8)}`,
      index: options.index,
      title,
      outline,
      stylePack: options.stylePack,
      publishSchedule: {
        scheduledTime,
        date: options.targetDate,
        time: new Date(scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        platform: 'xiaohongshu',
        status: 'draft'
      },
      resources,
      contentType: options.contentType as any,
      diversity: {
        styleVariety: 1,
        typeVariety: 1,
        overallVariety: 1
      }
    }
  }

  /**
   * 生成标题
   */
  private async generateTitle(
    requirement: RequirementAnalysis,
    contentType: string,
    index: number
  ): Promise<string> {
    // 简化版：基于需求生成标题
    const typeLabels: Record<string, string> = {
      tutorial: '教程',
      review: '测评',
      recommendation: '种草',
      comparison: '对比',
      knowledge: '知识分享'
    }

    return `${requirement.extractedTopic} - ${typeLabels[contentType] || '内容'} ${index}`
  }

  /**
   * 生成大纲
   */
  private async generateOutline(
    requirement: RequirementAnalysis,
    contentType: string,
    styleId: string
  ): Promise<ContentOutline> {
    // 构建主题
    const topic = `${requirement.extractedTopic} - ${this.getContentTypeLabel(contentType)}`

    // 调用现有的大纲生成服务
    const result = await generateOutline(topic, 8, styleId)

    // 验证结果
    if (!result.pages || result.pages.length === 0) {
      throw new Error('大纲生成失败：未生成任何页面')
    }

    // 找到封面页（type为'cover'的页面，或第一页）
    const coverPage = result.pages.find(p => p.type === 'cover') || result.pages[0]
    const contentPages = result.pages.filter(p => p.type !== 'cover')

    if (!coverPage) {
      throw new Error('大纲生成失败：未找到封面页')
    }

    // 转换为ContentOutline格式
    const cover: PageContent = {
      index: 0,
      title: coverPage.content.split('\n')[0]?.trim() || '封面',
      content: coverPage.content || '',
      imagePrompt: coverPage.imagePrompt || '',
      templateType: 'COVER'
    }

    const pages: PageContent[] = contentPages.map((page, index) => ({
      index: index + 1,
      title: page.content.split('\n')[0]?.trim() || `页面 ${index + 1}`,
      content: page.content,
      imagePrompt: page.imagePrompt || '',
      templateType: 'LIST_5'
    }))

    return {
      cover,
      pages
    }
  }

  /**
   * 获取内容类型标签
   */
  private getContentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      tutorial: '教程',
      review: '测评',
      recommendation: '种草',
      comparison: '对比',
      knowledge: '知识分享'
    }
    return labels[type] || type
  }

  /**
   * 计算目标日期
   */
  private calculateTargetDate(startDate: string, endDate: string, index: number, totalContents: number): string {
    if (totalContents === 1) {
      return startDate
    }
    
    const start = new Date(startDate)
    // index从1开始，所以需要减1
    const contentIndex = index - 1
    const totalDays = this.calculateDays(startDate, endDate)
    // 均匀分布在日期范围内
    const days = Math.floor((contentIndex / Math.max(totalContents - 1, 1)) * totalDays)
    start.setDate(start.getDate() + days)
    // 使用本地时区格式化日期
    const year = start.getFullYear()
    const month = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 计算天数
   */
  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(diff, 1) // 至少1天
  }

  /**
   * 计算发布时间
   */
  private calculateScheduledTime(date: string): number {
    // 默认发布时间：上午10点或晚上8点（最佳发布时间）
    const hour = Math.random() > 0.5 ? 10 : 20
    // 使用本地时区创建日期对象
    const [year, month, day] = date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day, hour, 0, 0, 0)
    return dateObj.getTime()
  }

  /**
   * 规划发布时间
   */
  private planPublishSchedule(
    contents: SingleContentPlan[],
    period: { startDate: string; endDate: string; totalContents: number }
  ) {
    const bestTimes = [10, 20] // 上午10点和晚上8点
    return {
      distribution: 'daily' as const,
      bestTimes,
      totalScheduled: contents.length
    }
  }

  /**
   * 计算总资源
   */
  private calculateTotalResources(contents: SingleContentPlan[]) {
    return {
      totalImageCount: contents.reduce((sum, c) => sum + c.resources.imageCount, 0),
      totalTextLength: contents.reduce((sum, c) => sum + c.resources.textLength, 0),
      totalEstimatedTime: contents.reduce((sum, c) => sum + c.resources.estimatedTime, 0)
    }
  }

  /**
   * 计算多样性评分
   */
  private calculateDiversityScore(contents: SingleContentPlan[]): number {
    if (contents.length === 0) {
      return 0
    }

    // 风格多样性
    const uniqueStyles = new Set(contents.map(c => c.stylePack.style_id))
    const styleVariety = uniqueStyles.size / contents.length

    // 类型多样性
    const uniqueTypes = new Set(contents.map(c => c.contentType))
    const typeVariety = uniqueTypes.size / contents.length

    // 综合评分
    return (styleVariety * 0.5 + typeVariety * 0.5)
  }

  /**
   * 生成风格示例
   */
  private generateStyleExample(stylePack: StylePack, contentType: string): StyleExample {
    const styleConfig = getStyleConfig(stylePack.style_id)
    return {
      styleId: stylePack.style_id,
      styleName: stylePack.style_name,
      previewImage: `/style-examples/${stylePack.style_id}.png`, // 假设有示例图片
      colorPalette: ['主色调', '辅助色1', '辅助色2'],
      description: styleConfig?.description || stylePack.style_name
    }
  }
}

export const multiContentPlanner = new MultiContentPlanner()


