import { callDeepSeekAPI } from './deepseek'
import { logger } from '../../composables/useLogger'
import type {
  ImageFlow,
  InfographicLayout
} from '@/modules/infographic/schema/types'

export interface PagePlan {
  index: number
  title: string
  type: 'cover' | 'content' | 'summary'
  summary: string
}

export interface LayoutHint {
  pageIndex: number
  slot: 'hero' | 'data' | 'timeline' | 'comparison' | 'cta'
  importance?: 'low' | 'medium' | 'high'
}

export interface PlanRequest {
  topic: string
  styleId?: string
  maxPages?: number
  emphasizeData?: boolean
}

export interface PlanResponse {
  outline: string[]
  pages: PagePlan[]
  imageFlow: ImageFlow
  layout?: InfographicLayout
  layoutHints?: LayoutHint[]
  rawCode?: string
}

export async function generateInfographicPlan(req: PlanRequest): Promise<PlanResponse> {
  const { topic, styleId, maxPages = 1, emphasizeData } = req

  const styleInfo = styleId
    ? `\n\n【视觉风格要求】\n用户选择的风格ID：${styleId}。\n请在配色、版式和用词上尽量贴合该风格的调性（例如无印良品风：留白多、字重轻、色彩柔和）。`
    : ''

  const dataFocus = emphasizeData
    ? '\n- 本次图文需要清晰展示关键数据指标（预算、CTR、客资成本等），请在分页和布局时为“数据卡片”预留明显区域。'
    : ''

  const prompt = `你是一个小红书长图/海报的专业策划+设计助手。
用户给你一份投放/营销相关的说明，请你输出一份**严格 JSON 格式**的图文规划结果，用于前端生成 1660×1242 的单张图文海报。

【用户输入】
${topic}
${styleInfo}

【任务目标】
- 将以上内容规划成一张信息量较高但结构清晰的图文海报。
- 海报尺寸为 1660×1242 像素，适配小红书展示比例。
- 需要同时包含：标题区、核心要点区、数据概览区、效果/结论区。
${dataFocus}

【规划约束】
- 分页概念仅用于规划结构（如“封面/正文/结语”），最终仍然是一张图。
- 最多规划 ${maxPages} 个逻辑页面（包括封面思想），例如：封面视角+主体内容+结语。
- 文案要口语化、适合小红书阅读。

【输出要求】
只允许输出一段 JSON，不要包含任何解释性文字或 Markdown 代码块标记。
JSON 顶层必须是一个对象，字段如下（字段顺序不重要）：
{
  "outline": string[],           // 章节/要点标题列表，按阅读顺序排序
  "pages": [                     // 逻辑分页规划（即使最终合成一张图）
    {
      "index": number,           // 从0开始的页索引
      "title": string,           // 该页标题
      "type": "cover" | "content" | "summary",
      "summary": string          // 该页大致要讲的内容（2-4句）
    }
  ],
  "layout": {                    // 语义化布局结构（前端主要消费对象）
    "meta": {
      "title": string,           // 主标题，例如“投放平台：小红书聚光平台”
      "subtitle": string,        // 副标题，例如“基于内容驱动与精准投流的整合营销策略分析报告”
      "tagline": string,         // 简短一句话收益/结论，例如“获得精准客资转化 验证内容+投流协同效果”
      "themeId": string | null,  // 可选：与前端风格 id 对齐（如 xiaohongshu/infographic_report）
      "reportYear": string | null// 可选：用于底部 REPORT 标记，例如“2026”
    },
    "sections": [
      {
        "id": string,            // 任意唯一 id，例如 "section_background"
        "slot": "header" | "background" | "strategy" | "data" | "effect" | "summary",
        "title": string | null,  // 分区标题（如“一、投放背景与目标”）
        "style": {
          "emphasis": "low" | "medium" | "high" | null,
          "highlightColor": string | null
        } | null,
        "content": {
          "kind": "header" | "background" | "strategy" | "data" | "effect" | "summary",
          "data": any            // 见下方各类型定义
        }
      }
    ]
  },
  "imageFlow": [                 // 可选的一维文本流，主要用于兼容旧逻辑
    { "kind": "text", "text": "投放平台：小红书聚光平台" },
    { "kind": "text", "text": "一、投放背景与目标" },
    { "kind": "text", "text": "1.1 投放背景" }
  ],
  "layoutHints": [               // 可选，给前端的额外布局建议
    {
      "pageIndex": number,
      "slot": "hero" | "data" | "timeline" | "comparison" | "cta",
      "importance": "low" | "medium" | "high"
    }
  ],
  "rawCode": string | null       // 可选：如有必要，可以附带一小段 React/JSX 或 Tailwind 片段，仅供开发调试
}

【layout.content 详细结构】
- 当 "slot" 为 "background" 时：
  "content": {
    "kind": "background",
    "data": {
      "intro": string | null,             // 一两句总述，控制在 40 字以内
      "bullets": [
        {
          "label": string,                // 小标题，如“1.1 投放背景”
          "items": string[]              // 1~3 条短句，每条不超过 22 个汉字
        }
      ]
    }
  }
- 当 "slot" 为 "strategy" 时：
  "content": {
    "kind": "strategy",
    "data": {
      "phases": [
        {
          "name": string,                // 阶段名称
          "duration": string | null,     // 时间，如“第1-12天”
          "focus": string[]              // 1~3 条要点，每条不超过 22 个汉字
        }
      ]
    }
  }
- 当 "slot" 为 "data" 时：
  "content": {
    "kind": "data",
    "data": {
      "metrics": [
        {
          "label": string,               // 指标名，如“预算”
          "value": string,               // 简短数值，如“¥5,000”
          "comment": string | null       // 解释文案，控制在 22 字以内
        }
      ]
    }
  }
- 当 "slot" 为 "effect" 时：
  "content": {
    "kind": "effect",
    "data": {
      "groups": [
        {
          "heading": string,             // 例如“4.1 内容素材表现”
          "bullets": string[]            // 1~4 条短句，每条不超过 22 个汉字
        }
      ]
    }
  }
- 当 "slot" 为 "summary" 时：
  "content": {
    "kind": "summary",
    "data": {
      "title": string | null,            // 例如“五、结语”
      "paragraphs": string[]             // 最多 2 段，每段 1~2 句，总长不超过 80 字
    }
  }

【内容预算与可读性要求】
- 所有 bullets、focus、metrics.comment、groups.bullets 的单条长度应控制在 18~22 个汉字以内，使用短句。
- 每个 bullets.items / phase.focus / group.bullets 数量不超过 3 条（summary.paragraphs 不超过 2 段）。
- 如果用户原始文案过长，请自动压缩、改写为更短的要点，避免一整段长文直接塞进同一块区域。

【重要 JSON 规范】
- 不要在 JSON 外输出任何文字。
- 不要使用注释。
- 字符串必须用双引号。
- 确保 JSON 能被 JavaScript JSON.parse 成功解析。`

  const { text } = await callDeepSeekAPI(prompt, '你是一个严格遵守 JSON 输出规范的前端策划助手。', {
    temperature: 0.6,
    max_tokens: 2048
  })

  let jsonText = text.trim()
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

  const match = jsonText.match(/\{[\s\S]*\}/)
  if (match) {
    jsonText = match[0]
  }

  try {
    const parsed = JSON.parse(jsonText)
    logger.debug('[InfographicPlan] 解析成功', parsed)

    const outline: string[] = Array.isArray(parsed.outline) ? parsed.outline : []
    const pages: PagePlan[] = Array.isArray(parsed.pages) ? parsed.pages : []

    let imageFlow: ImageFlow = Array.isArray(parsed.imageFlow) ? parsed.imageFlow : []
    // 如果 imageFlow 为空或不合法，用 pages 回退构造一个基础文本流，避免画布无内容
    if (!Array.isArray(imageFlow) || imageFlow.length === 0) {
      imageFlow = pages.flatMap((p) => {
        const items: ImageFlow[number][] = []
        if (p.title) {
          items.push({ kind: 'text', text: p.title })
        }
        if (p.summary) {
          items.push({ kind: 'text', text: p.summary })
        }
        return items
      })
    }

    const layout: InfographicLayout | undefined =
      parsed.layout && typeof parsed.layout === 'object' ? (parsed.layout as InfographicLayout) : undefined

    const layoutHints: LayoutHint[] = Array.isArray(parsed.layoutHints) ? parsed.layoutHints : []

    return {
      outline,
      pages,
      imageFlow,
      layout,
      layoutHints,
      rawCode: typeof parsed.rawCode === 'string' ? parsed.rawCode : undefined
    }
  } catch (error) {
    logger.error('[InfographicPlan] 解析失败，返回原始文本用于调试', { text })
    throw error
  }
}

