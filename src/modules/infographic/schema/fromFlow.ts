import type { ImageFlow, InfographicDocument, TextElement, ShapeElement } from './types'

const CANVAS_WIDTH = 1242
const CANVAS_HEIGHT = 1660
const MARGIN = 80
const GAP_Y = 40
const GAP_X = 32
const LINE_HEIGHT = 1.6
const MIN_SECTION_GAP = 48

type Block = {
  headerTitle: string
  headerHero: string
  headerSub: string
  backgroundLines: string[]
  dataLines: string[]
  strategyLines: string[]
  effectLines: string[]
  summaryTitle: string
  summaryLines: string[]
  reportTag: string
}

function splitByKeywords(texts: string[]): Block {
  const lower = texts.map(t => t.toLowerCase())

  const findIndex = (kw: string[]) =>
    lower.findIndex(t => kw.some(k => t.includes(k.toLowerCase())))

  const idxBackground = findIndex(['投放背景', '背景与目标', '投放目标'])
  const idxStrategy = findIndex(['投放策略', '阶段划分', '核心策略'])
  const idxData = findIndex(['数据概览', '数据概览（模拟数据）', '关键数据'])
  const idxEffect = findIndex(['效果分析', '效果与结论'])
  const idxSummary = findIndex(['结语', '下一步'])

  const title = texts[0] || '小红书投放策略报告'
  const hero = texts[1] || ''
  const sub = texts[2] || ''

  const sliceSafe = (start: number, end?: number) =>
    start >= 0 ? texts.slice(start, end).filter(Boolean) : []

  const backgroundLines = sliceSafe(
    idxBackground >= 0 ? idxBackground + 1 : 3,
    idxStrategy >= 0 ? idxStrategy : idxData >= 0 ? idxData : undefined
  )

  const strategyStart = idxStrategy >= 0 ? idxStrategy + 1 : idxData >= 0 ? idxData : texts.length
  const strategyEnd = idxData >= 0 ? idxData : idxEffect >= 0 ? idxEffect : undefined
  const strategyLines = sliceSafe(strategyStart, strategyEnd)

  const dataStart = idxData >= 0 ? idxData + 1 : idxEffect >= 0 ? idxEffect : texts.length
  const dataEnd = idxEffect >= 0 ? idxEffect : idxSummary >= 0 ? idxSummary : undefined
  const dataLines = sliceSafe(dataStart, dataEnd)

  const effectStart = idxEffect >= 0 ? idxEffect + 1 : idxSummary >= 0 ? idxSummary : texts.length
  const effectLines = sliceSafe(effectStart, idxSummary >= 0 ? idxSummary : undefined)

  let summaryLines = sliceSafe(idxSummary >= 0 ? idxSummary + 1 : texts.length)

  const reportTag =
    texts.find(t => t.toLowerCase().includes('report')) || 'REPORT 2026'
  summaryLines = summaryLines.filter(
    line => !line.trim().toLowerCase().includes('report') && line.trim() !== reportTag
  )

  const summaryTitle =
    (idxSummary >= 0 ? texts[idxSummary] : '结语') || '结语'

  return {
    headerTitle: title,
    headerHero: hero,
    headerSub: sub,
    backgroundLines,
    dataLines,
    strategyLines,
    effectLines,
    summaryTitle,
    summaryLines,
    reportTag
  }
}

function wrapLines(
  lines: string[],
  fontSize: number,
  maxWidth: number
): string[] {
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

function pushTextLines(
  elements: TextElement[],
  baseId: string,
  x: number,
  startY: number,
  width: number,
  fontSize: number,
  weight: number,
  color: string,
  lines: string[]
): number {
  const wrapped = wrapLines(lines, fontSize, width)
  let y = startY
  wrapped.forEach((text, idx) => {
    elements.push({
      id: `${baseId}_${idx}`,
      type: 'text',
      position: { x, y },
      text,
      fontSize,
      fontWeight: weight,
      lineHeight: LINE_HEIGHT,
      color,
      width,
      zIndex: 10
    })
    y += fontSize * LINE_HEIGHT
  })
  return y
}

export function buildInfographicFromFlow(flow: ImageFlow): InfographicDocument {
  const texts = flow
    .filter(i => i.kind === 'text')
    .map(i => i.text.trim())
    .filter(Boolean)

  const block = splitByKeywords(texts)

  const elements: (TextElement | ShapeElement)[] = []

  const contentWidth = CANVAS_WIDTH - 2 * MARGIN
  const colWidth = (contentWidth - GAP_X) / 2
  const leftX = MARGIN
  const rightX = MARGIN + colWidth + GAP_X

  let y = MARGIN

  // Header
  y = pushTextLines(
    elements as TextElement[],
    'hdr_title',
    leftX,
    y,
    contentWidth,
    56,
    800,
    '#0F172A',
    [block.headerTitle]
  )
  y += 8

  y = pushTextLines(
    elements as TextElement[],
    'hdr_hero',
    leftX,
    y,
    contentWidth,
    30,
    700,
    '#FF2442',
    block.headerHero ? [block.headerHero] : []
  )
  y += 8

  y = pushTextLines(
    elements as TextElement[],
    'hdr_sub',
    leftX,
    y,
    contentWidth,
    26,
    500,
    '#475569',
    block.headerSub ? [block.headerSub] : []
  )

  y += GAP_Y

  // Top cards: background (left) & data (right)
  const cardPadding = 20
  const cardStartY = y

  let cardLeftY = y + cardPadding
  const leftBodyStartY = cardLeftY + 44

  // Left card title
  elements.push({
    id: 'card_left_title',
    type: 'text',
    position: { x: leftX + cardPadding, y: cardLeftY },
    text: '投放目标与场景',
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#0F172A',
    zIndex: 10
  })

  cardLeftY = pushTextLines(
    elements as TextElement[],
    'card_left_body',
    leftX + cardPadding,
    leftBodyStartY,
    colWidth - 2 * cardPadding,
    24,
    500,
    '#334155',
    block.backgroundLines.slice(0, 4)
  )

  let cardRightY = y + cardPadding
  const rightBodyStartY = cardRightY + 44

  elements.push({
    id: 'card_right_title',
    type: 'text',
    position: { x: rightX + cardPadding, y: cardRightY },
    text: '关键数据 & 结果',
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#FFFFFF',
    zIndex: 10
  })

  cardRightY = pushTextLines(
    elements as TextElement[],
    'card_right_body',
    rightX + cardPadding,
    rightBodyStartY,
    colWidth - 2 * cardPadding,
    26,
    700,
    '#E2E8F0',
    block.dataLines.slice(0, 5)
  )

  const cardBottom = Math.max(cardLeftY, cardRightY) + cardPadding

  let yAfterCards = cardBottom + GAP_Y
  y = Math.max(yAfterCards, y + MIN_SECTION_GAP)

  elements.push(
    {
      id: 'bg_card_left',
      type: 'shape',
      position: { x: leftX, y: cardStartY },
      shape: 'rect',
      width: colWidth,
      height: cardBottom - cardStartY,
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 2,
      borderRadius: 28,
      zIndex: 0
    },
    {
      id: 'bg_card_right',
      type: 'shape',
      position: { x: rightX, y: cardStartY },
      shape: 'rect',
      width: colWidth,
      height: cardBottom - cardStartY,
      fill: '#0F172A',
      borderRadius: 28,
      zIndex: 0
    }
  )

  // Middle section: strategy (left) & effect (right)
  let midLeftY = y
  elements.push({
    id: 'mid_left_title',
    type: 'text',
    position: { x: leftX, y: midLeftY },
    text: '核心策略拆解',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#0F172A',
    zIndex: 10
  })
  midLeftY += 40

  midLeftY = pushTextLines(
    elements as TextElement[],
    'mid_left_body',
    leftX,
    midLeftY,
    colWidth,
    24,
    500,
    '#334155',
    block.strategyLines.slice(0, 5)
  )

  let midRightY = y
  elements.push({
    id: 'mid_right_title',
    type: 'text',
    position: { x: rightX, y: midRightY },
    text: '效果与结论',
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#0F172A',
    zIndex: 10
  })
  midRightY += 40

  midRightY = pushTextLines(
    elements as TextElement[],
    'mid_right_body',
    rightX,
    midRightY,
    colWidth,
    24,
    500,
    '#334155',
    block.effectLines.slice(0, 5)
  )

  const midBottom = Math.max(midLeftY, midRightY)
  y = Math.max(midBottom + GAP_Y, midBottom + MIN_SECTION_GAP)

  // Bottom summary
  elements.push({
    id: 'summary_title',
    type: 'text',
    position: { x: leftX, y },
    text: block.summaryTitle,
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#0F172A',
    zIndex: 10
  })
  y += 40

  y = pushTextLines(
    elements as TextElement[],
    'summary_body',
    leftX,
    y,
    contentWidth,
    24,
    500,
    '#64748B',
    block.summaryLines.slice(0, 2)
  )

  // REPORT tag
  elements.push({
    id: 'summary_tag',
    type: 'text',
    position: { x: CANVAS_WIDTH - MARGIN - 140, y: CANVAS_HEIGHT - MARGIN - 24 },
    text: block.reportTag,
    fontSize: 22,
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#9CA3AF',
    zIndex: 10
  })

  return {
    version: 1,
    size: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
    background: '#F8FAFC',
    elements
  }
}

