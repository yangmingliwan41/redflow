import type {
  InfographicDocument,
  InfographicLayout,
  InfographicSection,
  TextElement,
  ShapeElement,
  InfographicElement,
  BackgroundContent,
  StrategyContent,
  DataContent,
  EffectContent,
  SummaryContent
} from './types'
import type { CompositionSpec } from '../design/compositionTypes'
import { compositionToLayout } from '../design/compositionToLayout'

const CANVAS_WIDTH = 1242
const CANVAS_HEIGHT = 1660
const MARGIN = 80
const GAP_Y = 40
const GAP_X = 32
const LINE_HEIGHT = 1.65

type MutableElements = InfographicElement[]

function wrapLines(lines: string[], fontSize: number, maxWidth: number): string[] {
  if (!lines.length) return []
  const maxCharsPerLine = Math.max(8, Math.floor(maxWidth / (fontSize * 0.95)))
  const result: string[] = []

  for (const raw of lines) {
    let text = raw.trim()
    while (text.length > maxCharsPerLine) {
      result.push(text.slice(0, maxCharsPerLine))
      text = text.slice(maxCharsPerLine)
    }
    if (text.length) result.push(text)
  }

  return result
}

const LINE_HEIGHT_DARK_CARD = 1.75

function pushTextLines(
  elements: MutableElements,
  baseId: string,
  x: number,
  startY: number,
  width: number,
  fontSize: number,
  weight: number,
  color: string,
  lines: string[],
  maxLines?: number,
  lineHeight?: number
): number {
  const lh = lineHeight ?? LINE_HEIGHT
  const wrapped = wrapLines(lines, fontSize, width)
  const limited = typeof maxLines === 'number' ? wrapped.slice(0, maxLines) : wrapped
  let y = startY

  limited.forEach((text, idx) => {
    const el: TextElement = {
      id: `${baseId}_${idx}`,
      type: 'text',
      position: { x, y },
      text,
      fontSize,
      fontWeight: weight,
      lineHeight: lh,
      color,
      width,
      zIndex: 10
    }
    elements.push(el)
    y += fontSize * lh
  })

  return y
}

function addSectionBackgroundCard(
  elements: MutableElements,
  id: string,
  x: number,
  y: number,
  width: number,
  bottomY: number,
  options: { fill: string; stroke?: string; strokeWidth?: number }
): void {
  const height = Math.max(0, bottomY - y)
  const shape: ShapeElement = {
    id,
    type: 'shape',
    position: { x, y },
    shape: 'rect',
    width,
    height,
    fill: options.fill,
    stroke: options.stroke,
    strokeWidth: options.strokeWidth,
    borderRadius: 28
  }
  elements.push(shape)
}

function findSection(layout: InfographicLayout, slot: InfographicSection['slot']): InfographicSection | undefined {
  return layout.sections.find(section => section.slot === slot)
}

export function buildDocumentFromLayout(layout: InfographicLayout): InfographicDocument {
  const elements: MutableElements = []

  const contentWidth = CANVAS_WIDTH - 2 * MARGIN
  const colWidth = (contentWidth - GAP_X) / 2
  const leftX = MARGIN
  const rightX = MARGIN + colWidth + GAP_X

  let y = MARGIN

  // Header
  const headerTitle = layout.meta.title
  const headerSubtitle = layout.meta.subtitle
  const headerTagline = layout.meta.tagline

  y = pushTextLines(
    elements,
    'hdr_title',
    leftX,
    y,
    contentWidth,
    56,
    800,
    '#0F172A',
    [headerTitle]
  )
  y += 8

  if (headerSubtitle) {
    y = pushTextLines(
      elements,
      'hdr_subtitle',
      leftX,
      y,
      contentWidth,
      30,
      700,
      '#FF2442',
      [headerSubtitle]
    )
    y += 8
  }

  if (headerTagline) {
    y = pushTextLines(
      elements,
      'hdr_tagline',
      leftX,
      y,
      contentWidth,
      26,
      500,
      '#475569',
      [headerTagline]
    )
  }

  y += GAP_Y

  // Top cards: background (left) & data (right)
  const cardPadding = 20

  const backgroundSection = findSection(layout, 'background')
  const dataSection = findSection(layout, 'data')

  let cardLeftY = y + cardPadding
  const leftBodyStartY = cardLeftY + 44

  if (backgroundSection) {
    const title = backgroundSection.title ?? '投放目标与场景'
    elements.push({
      id: 'card_left_title',
      type: 'text',
      position: { x: leftX + cardPadding, y: cardLeftY },
      text: title,
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#0F172A',
      zIndex: 10
    } as TextElement)

    const content = backgroundSection.content
    const bgData = content.kind === 'background' ? (content.data as BackgroundContent) : undefined
    const bgLines: string[] = []
    if (bgData) {
      if (bgData.intro) bgLines.push(bgData.intro)
      for (const bullet of bgData.bullets ?? []) {
        if (bullet.label) bgLines.push(bullet.label)
        for (const item of bullet.items ?? []) {
          bgLines.push(item)
        }
      }
    }

    cardLeftY = pushTextLines(
      elements,
      'card_left_body',
      leftX + cardPadding,
      leftBodyStartY,
      colWidth - 2 * cardPadding,
      24,
      500,
      '#334155',
      bgLines,
      4
    )
  }

  let cardRightY = y + cardPadding
  const rightBodyStartY = cardRightY + 44

  if (dataSection) {
    const title = dataSection.title ?? '关键数据 & 结果'
    elements.push({
      id: 'card_right_title',
      type: 'text',
      position: { x: rightX + cardPadding, y: cardRightY },
      text: title,
      fontSize: 30,
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#FFFFFF',
      zIndex: 10
    } as TextElement)

    const content = dataSection.content
    const data = content.kind === 'data' ? (content.data as DataContent) : undefined
    const dataLines: string[] = []
    if (data) {
      for (const metric of data.metrics ?? []) {
        const label = metric.label || ''
        if (metric.comment) {
          dataLines.push(`${label} ${metric.value} · ${metric.comment}`)
        } else {
          dataLines.push(`${label} ${metric.value}`)
        }
      }
    }

    cardRightY = pushTextLines(
      elements,
      'card_right_body',
      rightX + cardPadding,
      rightBodyStartY,
      colWidth - 2 * cardPadding,
      26,
      700,
      '#E2E8F0',
      dataLines,
      5,
      LINE_HEIGHT_DARK_CARD
    )
  }

  const cardBottom = Math.max(cardLeftY, cardRightY) + cardPadding

  addSectionBackgroundCard(elements, 'bg_card_left', leftX, y, colWidth, cardBottom, {
    fill: '#FFFFFF',
    stroke: '#E2E8F0',
    strokeWidth: 2
  })

  addSectionBackgroundCard(elements, 'bg_card_right', rightX, y, colWidth, cardBottom, {
    fill: '#0F172A'
  })

  y = cardBottom + GAP_Y

  // Middle section: strategy (left) & effect (right)
  const strategySection = findSection(layout, 'strategy')
  const effectSection = findSection(layout, 'effect')
  const advantagesSection = findSection(layout, 'advantages')
  const plansSection = findSection(layout, 'plans')

  let midLeftY = y
  if (strategySection) {
    const title = strategySection.title ?? '核心策略拆解'
    elements.push({
      id: 'mid_left_title',
      type: 'text',
      position: { x: leftX, y: midLeftY },
      text: title,
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#0F172A',
      zIndex: 10
    } as TextElement)
    midLeftY += 40

    const content = strategySection.content
    const stData = content.kind === 'strategy' ? (content.data as StrategyContent) : undefined
    const stLines: string[] = []
    if (stData) {
      for (const phase of stData.phases ?? []) {
        const head = phase.duration ? `${phase.name}（${phase.duration}）` : phase.name
        stLines.push(head)
        for (const f of phase.focus ?? []) {
          stLines.push(f)
        }
      }
    }

    midLeftY = pushTextLines(
      elements,
      'mid_left_body',
      leftX,
      midLeftY,
      colWidth,
      24,
      500,
      '#334155',
      stLines,
      5
    )
  }

  let midRightY = y
  if (effectSection) {
    const title = effectSection.title ?? '效果与结论'
    elements.push({
      id: 'mid_right_title',
      type: 'text',
      position: { x: rightX, y: midRightY },
      text: title,
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.4,
      color: '#0F172A',
      zIndex: 10
    } as TextElement)
    midRightY += 40

    const content = effectSection.content
    const efData = content.kind === 'effect' ? (content.data as EffectContent) : undefined
    const efLines: string[] = []
    if (efData) {
      for (const group of efData.groups ?? []) {
        if (group.heading) {
          efLines.push(group.heading)
        }
        for (const b of group.bullets ?? []) {
          efLines.push(b)
        }
      }
    }

    midRightY = pushTextLines(
      elements,
      'mid_right_body',
      rightX,
      midRightY,
      colWidth,
      24,
      500,
      '#334155',
      efLines,
      5
    )
  }

  const midBottom = Math.max(midLeftY, midRightY)
  y = midBottom + GAP_Y

  // Advantages grid (optional)
  if (advantagesSection && advantagesSection.content.kind === 'advantages') {
    const advData = advantagesSection.content.data as AdvantagesContent
    const advItems = advData.items ?? []
    const advCols = 2
    const advColWidth = (contentWidth - GAP_X) / advCols

    let advX = leftX
    let advRowY = y
    let rowMaxY = y

    advItems.forEach((item, index) => {
      const baseId = `adv_${index}`
      let cardY = advRowY

      // card title
      cardY = pushTextLines(
        elements,
        `${baseId}_title`,
        advX,
        cardY,
        advColWidth,
        22,
        700,
        '#0F172A',
        [item.title],
        1
      )

      if (item.highlight) {
        cardY = pushTextLines(
          elements,
          `${baseId}_hl`,
          advX,
          cardY,
          advColWidth,
          18,
          600,
          '#E85D4C',
          [item.highlight],
          2
        )
      }

      if (item.description) {
        cardY = pushTextLines(
          elements,
          `${baseId}_desc`,
          advX,
          cardY + 4,
          advColWidth,
          16,
          400,
          '#5C5C5C',
          [item.description],
          3
        )
      }

      const cardBottomY = cardY + 16
      addSectionBackgroundCard(elements, `${baseId}_bg`, advX - 8, advRowY - 10, advColWidth + 16, cardBottomY, {
        fill: '#FEF2F2',
        stroke: '#F97373',
        strokeWidth: 1
      })

      rowMaxY = Math.max(rowMaxY, cardBottomY)

      const isLastInRow = (index + 1) % advCols === 0
      if (isLastInRow) {
        advX = leftX
        advRowY = rowMaxY + 24
      } else {
        advX += advColWidth + GAP_X
      }
    })

    y = rowMaxY + 32
  }

  // Plans row (optional)
  if (plansSection && plansSection.content.kind === 'plans') {
    const plansData = plansSection.content.data as PlansContent
    const plans = plansData.plans ?? []
    if (plans.length) {
      const planColWidth = (contentWidth - GAP_X) / 2
      let planX = leftX
      let maxPlanBottom = y

      plans.slice(0, 2).forEach((plan, index) => {
        const baseId = `plan_${index}`
        let planY = y

        // name
        planY = pushTextLines(
          elements,
          `${baseId}_name`,
          planX,
          planY,
          planColWidth,
          22,
          700,
          '#0F172A',
          [plan.name],
          1
        )

        if (plan.tagline) {
          planY = pushTextLines(
            elements,
            `${baseId}_tagline`,
            planX,
            planY + 2,
            planColWidth,
            16,
            500,
            '#5C5C5C',
            [plan.tagline],
            2
          )
        }

        if (plan.price) {
          const priceLine = plan.unit ? `${plan.price} ${plan.unit}` : plan.price
          planY = pushTextLines(
            elements,
            `${baseId}_price`,
            planX,
            planY + 6,
            planColWidth,
            24,
            700,
            '#E85D4C',
            [priceLine],
            1
          )
        }

        const features = plan.features ?? []
        const featureLines = features.map(f => (f.highlight ? `• ${f.label}` : f.label))
        if (featureLines.length) {
          planY = pushTextLines(
            elements,
            `${baseId}_features`,
            planX,
            planY + 8,
            planColWidth,
            16,
            400,
            '#5C5C5C',
            featureLines,
            5
          )
        }

        if (plan.note) {
          planY = pushTextLines(
            elements,
            `${baseId}_note`,
            planX,
            planY + 6,
            planColWidth,
            14,
            400,
            '#9CA3AF',
            [plan.note],
            2
          )
        }

        const planBottom = planY + 16
        addSectionBackgroundCard(
          elements,
          `${baseId}_bg`,
          planX - 10,
          y - 14,
          planColWidth + 20,
          planBottom,
          {
            fill: plan.highlight ? '#FFFFFF' : '#FDFDFD',
            stroke: plan.highlight ? '#E85D4C' : '#E5E7EB',
            strokeWidth: plan.highlight ? 2 : 1
          }
        )

        maxPlanBottom = Math.max(maxPlanBottom, planBottom)
        planX += planColWidth + GAP_X
      })

      y = maxPlanBottom + GAP_Y
    }
  }

  // Bottom summary
  const summarySection = findSection(layout, 'summary')
  const summaryData =
    summarySection && summarySection.content.kind === 'summary'
      ? (summarySection.content.data as SummaryContent)
      : undefined

  const label = layout.meta.tagLabel ?? 'REPORT'
  const year = layout.meta.reportYear
  const reportTag = year
    ? label === 'REPORT'
      ? `REPORT ${year}`
      : `${label} · ${year}`
    : label
  const summaryLines = (summaryData?.paragraphs ?? []).filter(
    p => !p.trim().toLowerCase().includes('report') && p.trim() !== reportTag
  )

  y += 16
  y = pushTextLines(
    elements,
    'summary_body',
    leftX,
    y,
    contentWidth,
    26,
    700,
    '#1a1a1a',
    summaryLines,
    2
  )

  elements.push({
    id: 'summary_tag',
    type: 'text',
    position: { x: CANVAS_WIDTH - MARGIN - 140, y: CANVAS_HEIGHT - MARGIN - 24 },
    text: reportTag,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#9CA3AF',
    zIndex: 10
  } as TextElement)

  return {
    version: 1,
    size: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    background: '#fefaf6',
    elements
  }
}

/**
 * 从组合规范生成导出用文档，保证与画布预览一致
 */
export function buildDocumentFromComposition(spec: CompositionSpec): InfographicDocument {
  return buildDocumentFromLayout(compositionToLayout(spec))
}

