/**
 * 需求冲突检测服务
 */

import { SingleContentPlan, ConflictIssue, RequirementAnalysis } from '../../types'
import { logger } from '../../composables/useLogger'

export class ConflictDetector {
  /**
   * 检测规划中的需求冲突
   */
  async detectConflicts(
    contents: SingleContentPlan[],
    requirement: RequirementAnalysis
  ): Promise<ConflictIssue[]> {
    const conflicts: ConflictIssue[] = []
    
    // 1. 风格冲突检测
    conflicts.push(...this.detectStyleConflicts(contents))
    
    // 2. 时间冲突检测
    conflicts.push(...this.detectTimeConflicts(contents))
    
    // 3. 内容冲突检测
    conflicts.push(...this.detectContentConflicts(contents, requirement))
    
    // 4. 资源冲突检测
    conflicts.push(...this.detectResourceConflicts(contents))
    
    return conflicts
  }
  
  /**
   * 检测风格冲突（连续使用相同风格）
   */
  private detectStyleConflicts(contents: SingleContentPlan[]): ConflictIssue[] {
    const conflicts: ConflictIssue[] = []
    
    for (let i = 1; i < contents.length; i++) {
      const prevStyle = contents[i - 1].stylePack.style_id
      const currentStyle = contents[i].stylePack.style_id
      
      if (prevStyle === currentStyle) {
        conflicts.push({
          id: `conflict_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 11)}`,
          type: 'style_conflict',
          severity: 'medium',
          description: `第${i}篇和第${i + 1}篇内容使用了相同风格"${currentStyle}"，可能造成视觉疲劳`,
          affectedContents: [contents[i - 1].id, contents[i].id],
          suggestion: `建议为第${i + 1}篇内容更换风格，推荐：${this.suggestAlternativeStyle(currentStyle)}`,
          autoResolvable: true
        })
      }
    }
    
    return conflicts
  }
  
  /**
   * 检测时间冲突（发布时间过于集中）
   * 优化：只报告超过阈值的时间冲突
   */
  private detectTimeConflicts(contents: SingleContentPlan[]): ConflictIssue[] {
    const conflicts: ConflictIssue[] = []
    
    // 按小时分组
    const timeGroups = new Map<number, SingleContentPlan[]>()
    contents.forEach(content => {
      const hour = new Date(content.publishSchedule.scheduledTime).getHours()
      if (!timeGroups.has(hour)) {
        timeGroups.set(hour, [])
      }
      timeGroups.get(hour)!.push(content)
    })
    
    // 检查是否有多个内容在同一时间段发布（阈值：超过2篇）
    timeGroups.forEach((group, hour) => {
      if (group.length > 2) {
        // 获取受影响的内容编号
        const contentIndices = group.map(c => {
          const index = contents.findIndex(content => content.id === c.id)
          return index >= 0 ? index + 1 : 0
        }).filter(idx => idx > 0)
        
        const description = contentIndices.length > 0
          ? `有${group.length}篇内容（第${contentIndices.join('、')}篇）计划在${hour}点发布，可能造成内容竞争`
          : `有${group.length}篇内容计划在${hour}点发布，可能造成内容竞争`
        
        conflicts.push({
          id: `conflict_${Date.now()}_time_${hour}_${Math.random().toString(36).slice(2, 11)}`,
          type: 'time_conflict',
          severity: group.length > 4 ? 'high' : 'medium',
          description,
          affectedContents: group.map(c => c.id),
          suggestion: '建议分散发布时间，避免内容竞争',
          autoResolvable: true
        })
      }
    })
    
    return conflicts
  }
  
  /**
   * 检测内容冲突（内容重复或相似度过高）
   * 优化：避免重复报告，按内容分组显示主要冲突
   */
  private detectContentConflicts(
    contents: SingleContentPlan[],
    requirement: RequirementAnalysis
  ): ConflictIssue[] {
    const conflicts: ConflictIssue[] = []
    
    // 为每个内容记录相似度最高的冲突
    const contentConflicts = new Map<number, Array<{ index: number; similarity: number }>>()
    
    // 检查标题相似度
    for (let i = 0; i < contents.length; i++) {
      for (let j = i + 1; j < contents.length; j++) {
        const similarity = this.calculateTitleSimilarity(
          contents[i].title,
          contents[j].title
        )
        
        if (similarity > 0.7) {
          // 为内容i记录冲突
          if (!contentConflicts.has(i)) {
            contentConflicts.set(i, [])
          }
          contentConflicts.get(i)!.push({ index: j, similarity })
          
          // 为内容j记录冲突
          if (!contentConflicts.has(j)) {
            contentConflicts.set(j, [])
          }
          contentConflicts.get(j)!.push({ index: i, similarity })
        }
      }
    }
    
    // 为每个内容生成一个汇总的冲突报告（只显示相似度最高的2个）
    contentConflicts.forEach((conflictList, contentIndex) => {
      // 按相似度降序排序，只取前2个
      conflictList.sort((a, b) => b.similarity - a.similarity)
      const topConflicts = conflictList.slice(0, 2)
      
      if (topConflicts.length > 0) {
        const maxSimilarity = topConflicts[0].similarity
        const affectedIndices = [contentIndex, ...topConflicts.map(c => c.index)]
        
        // 生成描述：列出所有相似的内容
        const similarContents = topConflicts.map(c => `第${c.index + 1}篇`).join('、')
        const description = topConflicts.length === 1
          ? `第${contentIndex + 1}篇与${similarContents}内容标题相似度过高（${(maxSimilarity * 100).toFixed(0)}%）`
          : `第${contentIndex + 1}篇与${similarContents}等多篇内容标题相似度过高（最高${(maxSimilarity * 100).toFixed(0)}%）`
        
        conflicts.push({
          id: `conflict_${Date.now()}_content_${contentIndex}_${Math.random().toString(36).slice(2, 11)}`,
          type: 'content_conflict',
          severity: maxSimilarity > 0.9 ? 'high' : 'medium',
          description,
          affectedContents: affectedIndices.map(idx => contents[idx].id),
          suggestion: '建议调整标题，增加差异化',
          autoResolvable: false
        })
      }
    })
    
    return conflicts
  }
  
  /**
   * 检测资源冲突
   */
  private detectResourceConflicts(contents: SingleContentPlan[]): ConflictIssue[] {
    const conflicts: ConflictIssue[] = []
    
    // 检查是否有内容在同一天需要过多资源
    const dateGroups = new Map<string, SingleContentPlan[]>()
    contents.forEach(content => {
      const date = content.publishSchedule.date
      if (!dateGroups.has(date)) {
        dateGroups.set(date, [])
      }
      dateGroups.get(date)!.push(content)
    })
    
    dateGroups.forEach((group, date) => {
      const totalImages = group.reduce((sum, c) => sum + c.resources.imageCount, 0)
      const totalTime = group.reduce((sum, c) => sum + c.resources.estimatedTime, 0)
      
      if (totalImages > 10 || totalTime > 480) { // 超过10张图片或8小时
        conflicts.push({
          id: `conflict_${Date.now()}_resource_${date.replace(/-/g, '')}_${Math.random().toString(36).slice(2, 11)}`,
          type: 'resource_conflict',
          severity: 'low',
          description: `${date}当天需要${totalImages}张图片，预计耗时${totalTime}分钟，可能资源紧张`,
          affectedContents: group.map(c => c.id),
          suggestion: '建议分散到其他日期，或减少单篇内容的资源需求',
          autoResolvable: true
        })
      }
    })
    
    return conflicts
  }
  
  /**
   * 计算标题相似度（基于字符的Jaccard相似度）
   */
  private calculateTitleSimilarity(title1: string, title2: string): number {
    if (!title1 || !title2) return 0
    
    // 移除空格和标点，转换为字符集合
    const chars1 = new Set(title1.replace(/\s+/g, '').split(''))
    const chars2 = new Set(title2.replace(/\s+/g, '').split(''))
    
    if (chars1.size === 0 && chars2.size === 0) return 1
    if (chars1.size === 0 || chars2.size === 0) return 0
    
    const intersection = new Set([...chars1].filter(x => chars2.has(x)))
    const union = new Set([...chars1, ...chars2])
    
    return intersection.size / union.size
  }
  
  /**
   * 建议替代风格
   */
  private suggestAlternativeStyle(currentStyle: string): string {
    const alternatives: Record<string, string[]> = {
      xiaohongshu: ['ins_minimal', 'nature_fresh', 'poster_2k'],
      ins_minimal: ['xiaohongshu', 'minimal_white', 'tech_future'],
      poster_2k: ['xiaohongshu', 'tech_future', 'black_gold'],
      tech_future: ['ins_minimal', 'poster_2k', 'cyberpunk'],
      nature_fresh: ['xiaohongshu', 'morandi', 'minimal_white'],
      morandi: ['nature_fresh', 'minimal_white', 'xiaohongshu'],
      black_gold: ['poster_2k', 'tech_future', 'cyberpunk']
    }
    
    const suggestions = alternatives[currentStyle] || ['xiaohongshu', 'ins_minimal']
    return suggestions.join('、')
  }
}

export const conflictDetector = new ConflictDetector()

/**
 * 生成测试演示案例的冲突检测结果
 * 用于演示冲突检测功能
 */
export function generateDemoConflicts(): ConflictIssue[] {
  return [
    {
      id: 'demo_conflict_1',
      type: 'time_conflict',
      severity: 'high',
      description: '有6篇内容计划在10点发布，可能造成内容竞争',
      affectedContents: ['demo_content_1', 'demo_content_2', 'demo_content_3', 'demo_content_4', 'demo_content_5', 'demo_content_6'],
      suggestion: '建议分散发布时间，避免内容竞争',
      autoResolvable: true
    },
    {
      id: 'demo_conflict_2',
      type: 'content_conflict',
      severity: 'high',
      description: '第1篇与第2篇、第5篇内容标题相似度过高（最高100%）',
      affectedContents: ['demo_content_1', 'demo_content_2', 'demo_content_5'],
      suggestion: '建议调整标题，增加差异化',
      autoResolvable: false
    },
    {
      id: 'demo_conflict_3',
      type: 'style_conflict',
      severity: 'medium',
      description: '第3篇和第4篇内容使用了相同风格"xiaohongshu"，可能造成视觉疲劳',
      affectedContents: ['demo_content_3', 'demo_content_4'],
      suggestion: '建议为第4篇内容更换风格，推荐：ins_minimal、nature_fresh、poster_2k',
      autoResolvable: true
    },
    {
      id: 'demo_conflict_4',
      type: 'resource_conflict',
      severity: 'low',
      description: '2025-01-15当天需要15张图片，预计耗时520分钟，可能资源紧张',
      affectedContents: ['demo_content_2', 'demo_content_3', 'demo_content_4'],
      suggestion: '建议分散到其他日期，或减少单篇内容的资源需求',
      autoResolvable: true
    }
  ]
}


