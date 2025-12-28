/**
 * 规划Agent质检服务
 * 调用AI进行深度质量检查
 */

import { SingleContentPlan, RequirementAnalysis, ConflictIssue, AgentQualityCheckResult } from '../../types'
import { callDeepSeekAPI } from './deepseek'
import { logger } from '../../composables/useLogger'
import { isMockMode } from './mock'

/**
 * Agent质检（深度质量检查）
 */
export async function agentQualityCheck(
  contents: SingleContentPlan[],
  requirement: RequirementAnalysis,
  conflicts: ConflictIssue[]
): Promise<AgentQualityCheckResult> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] Agent质检')
    return mockAgentQualityCheck(contents, requirement, conflicts)
  }

  try {
    const prompt = buildQualityCheckPrompt(contents, requirement, conflicts)
    const result = await callDeepSeekAPI(prompt, '你是一个专业的内容策划质量检查专家。')
    
    // 解析AI返回的JSON
    let jsonText = result.text.trim()
    if (jsonText.startsWith('```')) {
      const firstIndex = jsonText.indexOf('```')
      const lastIndex = jsonText.lastIndexOf('```')
      if (firstIndex !== lastIndex && firstIndex >= 0 && lastIndex > firstIndex) {
        jsonText = jsonText.substring(firstIndex + 3, lastIndex).trim()
        if (jsonText.startsWith('json')) {
          jsonText = jsonText.substring(4).trim()
        }
      }
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const agentResponse = JSON.parse(jsonText)
    
    return {
      overallScore: agentResponse.overallScore || 0.8,
      checks: (agentResponse.checks || []).map((check: any) => ({
        category: check.category || '',
        score: check.score || 0.8,
        issues: check.issues || [],
        suggestions: check.suggestions || [],
        severity: calculateSeverity(check.score || 0.8)
      })),
      summary: agentResponse.summary || '质检完成',
      conflicts: mergeConflicts(conflicts, agentResponse.newConflicts || []),
      resolved: agentResponse.resolved !== false,
      recommendations: agentResponse.recommendations || []
    }
  } catch (error: any) {
    logger.error('Agent质检失败:', error)
    
    // 返回基础质检结果
    return {
      overallScore: 0.7,
      checks: [],
      summary: '质检过程中出现错误，请手动检查',
      conflicts,
      resolved: false,
      recommendations: ['建议手动检查规划内容']
    }
  }
}

/**
 * 构建Agent质检提示词
 */
function buildQualityCheckPrompt(
  contents: SingleContentPlan[],
  requirement: RequirementAnalysis,
  conflicts: ConflictIssue[]
): string {
  return `
请对以下内容规划进行深度质量检查：

【需求背景】
- 目标用户：${requirement.targetAudience.age}，${requirement.targetAudience.gender}
- 核心主题：${requirement.extractedTopic}
- 内容类型偏好：${requirement.contentType}
- 风格偏好：${requirement.suggestedStyles.join('、')}

【内容规划】
共${contents.length}篇内容：
${contents.map((c, i) => `
${i + 1}. ${c.title}
   - 类型：${c.contentType}
   - 风格：${c.stylePack.style_id}
   - 发布时间：${new Date(c.publishSchedule.scheduledTime).toLocaleString('zh-CN')}
   - 大纲：${c.outline.pages.map(p => p.title).join('、')}
`).join('\n')}

【已检测到的冲突】
${conflicts.length > 0 ? conflicts.map(c => `- ${c.description}（${c.severity}优先级）`).join('\n') : '无'}

【检查要求】
请从以下维度进行全面检查：
1. 内容一致性：检查内容是否与需求目标一致
2. 风格多样性：检查风格分配是否合理，避免同质化
3. 目标对齐度：检查每篇内容是否有助于达成目标
4. 时间优化：检查发布时间是否合理
5. 资源估算：检查资源需求是否合理
6. 冲突解决：评估已检测冲突的严重程度和解决方案

【输出要求】
请以JSON格式返回，格式如下：
{
  "overallScore": 0.85,
  "checks": [
    {
      "category": "内容一致性",
      "score": 0.9,
      "issues": ["问题1", "问题2"],
      "suggestions": ["建议1", "建议2"]
    }
  ],
  "summary": "整体质量良好，但需要注意...",
  "newConflicts": [],
  "resolved": true,
  "recommendations": ["建议1", "建议2"]
}
`
}

/**
 * 计算严重程度
 */
function calculateSeverity(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.8) return 'low'
  if (score >= 0.6) return 'medium'
  return 'high'
}

/**
 * 合并冲突
 */
function mergeConflicts(
  existing: ConflictIssue[],
  newOnes: any[]
): ConflictIssue[] {
  const merged = [...existing]
  
  newOnes.forEach((newConflict: any) => {
    if (!merged.find(c => c.id === newConflict.id)) {
      merged.push({
        id: newConflict.id || `conflict_${Date.now()}_${Math.random()}`,
        type: newConflict.type || 'content_conflict',
        severity: newConflict.severity || 'medium',
        description: newConflict.description || '',
        affectedContents: newConflict.affectedContents || [],
        suggestion: newConflict.suggestion || '',
        autoResolvable: newConflict.autoResolvable !== false
      })
    }
  })
  
  return merged
}

/**
 * 模拟模式质检
 */
function mockAgentQualityCheck(
  contents: SingleContentPlan[],
  requirement: RequirementAnalysis,
  conflicts: ConflictIssue[]
): AgentQualityCheckResult {
  return {
    overallScore: 0.85,
    checks: [
      {
        category: '内容一致性',
        score: 0.9,
        issues: [],
        suggestions: ['内容与需求目标一致'],
        severity: 'low'
      },
      {
        category: '风格多样性',
        score: 0.8,
        issues: conflicts.filter(c => c.type === 'style_conflict').map(c => c.description),
        suggestions: ['建议增加风格多样性'],
        severity: 'medium'
      }
    ],
    summary: '整体质量良好，这是模拟数据',
    conflicts,
    resolved: conflicts.length === 0,
    recommendations: ['建议在实际使用中调用AI进行深度检查']
  }
}


