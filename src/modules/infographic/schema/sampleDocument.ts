import type { InfographicDocument } from './types'

export const sampleDocument: InfographicDocument = {
  version: 1,
  size: { width: 1242, height: 1660 },
  background: '#F8FAFC',
  elements: [
    {
      id: 'title',
      type: 'text',
      position: { x: 96, y: 92 },
      text: '小红书投放策略速览（示例）',
      fontSize: 64,
      fontWeight: 800,
      lineHeight: 1.2,
      color: '#0F172A'
    },
    {
      id: 'subtitle',
      type: 'text',
      position: { x: 96, y: 180 },
      text: '高信息密度中文测试：￥¥%（）【】—…「」；确保导出不缺字不乱码',
      fontSize: 30,
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#475569',
      width: 1468
    },
    {
      id: 'card1',
      type: 'shape',
      position: { x: 96, y: 280 },
      shape: 'rect',
      width: 720,
      height: 360,
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 2,
      borderRadius: 28
    },
    {
      id: 'card1_title',
      type: 'text',
      position: { x: 140, y: 320 },
      text: '目标',
      fontSize: 36,
      fontWeight: 700,
      color: '#0F172A'
    },
    {
      id: 'card1_body',
      type: 'text',
      position: { x: 140, y: 380 },
      text:
        '获得精准客资转化；验证内容+投流协同效果。\n' +
        '• 中午 12:00–14:00 留资高峰\n' +
        '• 晚上 17:00–20:00 留资高峰\n' +
        '• 地域：新一线/一线/二线城市',
      fontSize: 30,
      fontWeight: 500,
      lineHeight: 1.7,
      color: '#334155',
      width: 632
    },
    {
      id: 'card2',
      type: 'shape',
      position: { x: 844, y: 280 },
      shape: 'rect',
      width: 720,
      height: 360,
      fill: '#0F172A',
      borderRadius: 28
    },
    {
      id: 'card2_title',
      type: 'text',
      position: { x: 888, y: 320 },
      text: '数据（模拟）',
      fontSize: 36,
      fontWeight: 700,
      color: '#FFFFFF'
    },
    {
      id: 'card2_body',
      type: 'text',
      position: { x: 888, y: 380 },
      text: '预算：¥5,000\nCTR：6.0%\n留资量：35\n单客资成本：~¥150',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: 1.6,
      color: '#E2E8F0'
    },
    {
      id: 'footer',
      type: 'text',
      position: { x: 96, y: 1150 },
      text: '导出 PNG 后检查：中文/符号/数字是否出现方块或乱码',
      fontSize: 26,
      fontWeight: 500,
      color: '#64748B'
    }
  ]
}

