/**
 * 模拟AI服务 - 用于开发和测试，不消耗真实API
 * 通过环境变量或localStorage控制是否启用模拟模式
 */

import { ProductAnalysis, TokenUsage, GenerationSettings } from '../types'

// 检查是否启用模拟模式
export const isMockMode = (): boolean => {
  if (typeof window === 'undefined') return false
  
  // 优先检查localStorage
  const mockMode = localStorage.getItem('MOCK_MODE')
  if (mockMode !== null) {
    return mockMode === 'true'
  }
  
  // 检查环境变量
  return import.meta.env.VITE_MOCK_MODE === 'true'
}

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟产品分析
export const mockAnalyzeProductImage = async (file: File): Promise<{ analysis: ProductAnalysis; usage: TokenUsage }> => {
  await delay(1500) // 模拟1.5秒延迟
  
  // 根据文件名生成不同的分析结果
  const fileName = file.name.toLowerCase()
  
  let analysis: ProductAnalysis
  
  if (fileName.includes('chair') || fileName.includes('椅子') || fileName.includes('armchair')) {
    analysis = {
      name: 'Quilted Orange Accent Armchair',
      category: 'Armchairs & Accent Chairs',
      features: [
        'Unique quilted texture upholstery',
        'Plush, rounded silhouette for maximum comfort',
        'Contrasting white piping trim on armrests',
        'Bold, statement-making color',
        'Soft and inviting design'
      ],
      colors: ['Orange', 'White'],
      materials: ['Fabric', 'Foam'],
      recommendation: {
        tone: 'enthusiastic',
        copyStyle: 'storytelling',
        imageStyle: 'warm_home'
      }
    }
  } else if (fileName.includes('table') || fileName.includes('桌子')) {
    analysis = {
      name: 'Modern Minimalist Coffee Table',
      category: 'Furniture',
      features: [
        'Clean lines and minimalist design',
        'Durable construction',
        'Versatile styling options'
      ],
      colors: ['Wood', 'Black'],
      materials: ['Wood', 'Metal'],
      recommendation: {
        tone: 'minimalist',
        copyStyle: 'minimalist',
        imageStyle: 'ins_minimal'
      }
    }
  } else {
    // 默认分析结果
    analysis = {
      name: 'Premium Product',
      category: 'Home & Living',
      features: [
        'High quality materials',
        'Modern design',
        'Versatile use cases',
        'Durable construction'
      ],
      colors: ['White', 'Gray'],
      materials: ['Premium Materials'],
      recommendation: {
        tone: 'professional',
        copyStyle: 'sales_driven',
        imageStyle: 'ins_minimal'
      }
    }
  }
  
  return {
    analysis,
    usage: {
      promptTokens: 1200,
      candidatesTokens: 450,
      totalTokens: 1650
    }
  }
}

// 模拟生成营销文案
export const mockGenerateMarketingCopy = async (
  analysis: ProductAnalysis,
  settings: GenerationSettings
): Promise<{ copy: string; usage: TokenUsage }> => {
  await delay(2000) // 模拟2秒延迟
  
  const toneMap: Record<string, string> = {
    enthusiastic: '🔥',
    professional: '📊',
    emotional: '💝',
    minimalist: '✨'
  }
  
  const emoji = toneMap[settings.tone] || '✨'
  const lengthMap: Record<string, number> = {
    short: 150,
    medium: 400,
    long: 800
  }
  
  const wordCount = lengthMap[settings.length] || 400
  
  // 生成模拟文案
  const copy = `# ${emoji} ${analysis.name} - 小红书种草文案

## 🌟 产品亮点

${analysis.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 💡 使用场景

这款${analysis.category}非常适合：
- 现代简约风格的家居空间
- 追求品质生活的都市人群
- 注重细节和质感的消费者

## 🎨 设计特色

- **颜色搭配**：${analysis.colors.join(' + ')}，经典配色永不过时
- **材质选择**：${analysis.materials.join('、')}，质感与实用并存
- **设计理念**：${settings.copyStyle === 'storytelling' ? '每一个细节都讲述着品质的故事' : settings.copyStyle === 'sales_driven' ? '性价比之选，不容错过' : '极简设计，回归本质'}

## 💬 真实体验

${settings.tone === 'enthusiastic' ? '真的太好用了！强烈推荐给大家！' : settings.tone === 'professional' ? '经过实际使用，产品表现稳定可靠。' : settings.tone === 'emotional' ? '用了一段时间，真的爱上了这个设计。' : '简洁实用，值得拥有。'}

## 🛒 购买建议

${settings.additionalContext || '现在入手正是好时机，不要犹豫！'}

---

#${analysis.category.replace(/\s+/g, '')} #家居好物 #${analysis.name.replace(/\s+/g, '')} #好物推荐 #种草 #${settings.tone === 'enthusiastic' ? '必买清单' : '品质生活'}`
  
  return {
    copy,
    usage: {
      promptTokens: 800,
      candidatesTokens: wordCount,
      totalTokens: 800 + wordCount
    }
  }
}

// 模拟生成图片
export const mockGenerateStyledImage = async (
  file: File,
  analysis: ProductAnalysis,
  imageStyle: string
): Promise<{ imageUrl: string; usage: TokenUsage }> => {
  await delay(3000) // 模拟3秒延迟
  
  // 返回原图的预览URL作为模拟结果
  // 在实际测试中，这会是一个占位图或处理后的图片
  const imageUrl = URL.createObjectURL(file)
  
  return {
    imageUrl,
    usage: {
      promptTokens: 500,
      candidatesTokens: 0,
      totalTokens: 500
    }
  }
}

// 模拟生成大纲
export const mockGenerateOutline = async (topic: string): Promise<{
  outline: string
  pages: Array<{ index: number; type: string; content: string }>
}> => {
  await delay(2000) // 模拟2秒延迟
  
  const outline = `# ${topic} - 内容大纲

## 封面页
引人入胜的开场，突出主题价值

## 第1页：问题引入
为什么需要关注${topic}？当前市场痛点分析

## 第2页：核心内容
深入解析${topic}的关键要素和实用方法

## 第3页：案例分享
真实案例展示，增强说服力

## 第4页：总结与行动
核心要点回顾，给出明确的行动建议`
  
  const pages = [
    {
      index: 0,
      type: 'cover',
      content: '引人入胜的开场，突出主题价值'
    },
    {
      index: 1,
      type: 'content',
      content: `为什么需要关注${topic}？当前市场痛点分析`
    },
    {
      index: 2,
      type: 'content',
      content: `深入解析${topic}的关键要素和实用方法`
    },
    {
      index: 3,
      type: 'content',
      content: '真实案例展示，增强说服力'
    },
    {
      index: 4,
      type: 'content',
      content: '核心要点回顾，给出明确的行动建议'
    }
  ]
  
  return { outline, pages }
}

// 模拟生成单页图片
export const mockGeneratePageImage = async (
  pageContent: string,
  pageIndex: number
): Promise<{ imageUrl: string; usage: TokenUsage }> => {
  await delay(2000) // 模拟2秒延迟
  
  // 返回一个SVG占位图
  const svg = `<svg width="1024" height="1365" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1365" fill="#f0f0f0"/>
    <text x="512" y="400" text-anchor="middle" font-size="32" fill="#333" font-weight="bold">第 ${pageIndex + 1} 页</text>
    <text x="512" y="500" text-anchor="middle" font-size="18" fill="#666">${pageContent.substring(0, 50)}...</text>
    <text x="512" y="800" text-anchor="middle" font-size="14" fill="#999">模拟图片（开启真实API后将生成实际图片）</text>
  </svg>`
  
  return {
    imageUrl: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    usage: {
      promptTokens: 100,
      candidatesTokens: 0,
      totalTokens: 100
    }
  }
}

