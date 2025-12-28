/**
 * 算法艺术主题配置
 * 定义不同页面和场景的算法艺术参数
 */

export type AlgorithmMode = 'flowField' | 'particleSystem' | 'noiseField' | 'fractal'

export interface AlgorithmTheme {
  /** 算法模式 */
  mode: AlgorithmMode
  /** 粒子数量 */
  particleCount: number
  /** 动画速度 */
  speed: number
  /** 颜色主题 */
  colorTheme: 'red' | 'blue' | 'purple' | 'gradient'
  /** 是否启用交互 */
  interactive: boolean
  /** 噪声缩放（用于流场和噪声场） */
  noiseScale?: number
  /** 场强度（用于流场） */
  fieldStrength?: number
  /** 连接距离（用于粒子系统） */
  connectionDistance?: number
  /** 分形深度（用于分形系统） */
  fractalDepth?: number
  /** 透明度 */
  opacity?: number
}

/**
 * 路由到主题的映射
 */
export const routeThemes: Record<string, AlgorithmTheme> = {
  // 首页 - 流动创作主题
  '/': {
    mode: 'flowField',
    particleCount: 50,  // 减少粒子数量：从80改为50
    speed: 0.3,  // 进一步降低速度：从0.5改为0.3
    colorTheme: 'red',
    interactive: true,
    noiseScale: 0.01,
    fieldStrength: 0.3,
    opacity: 0.4  // 降低透明度：从0.6改为0.4，让背景更不显眼
  },
  // 仪表盘 - 渐变粒子系统
  '/dashboard': {
    mode: 'particleSystem',
    particleCount: 60,
    speed: 0.6,
    colorTheme: 'gradient',
    interactive: true,
    connectionDistance: 120,
    opacity: 0.5
  },
  // 需求分析 - 蓝色流场
  '/requirement-analysis': {
    mode: 'flowField',
    particleCount: 70,
    speed: 0.7,
    colorTheme: 'blue',
    interactive: true,
    noiseScale: 0.012,
    fieldStrength: 0.25,
    opacity: 0.55
  },
  // 内容规划 - 紫色噪声场
  '/planning': {
    mode: 'noiseField',
    particleCount: 50,
    speed: 0.5,
    colorTheme: 'purple',
    interactive: true,
    noiseScale: 0.008,
    opacity: 0.5
  },
  // 发布日历 - 分形系统
  '/calendar': {
    mode: 'fractal',
    particleCount: 40,
    speed: 0.4,
    colorTheme: 'gradient',
    interactive: false,
    fractalDepth: 5,
    opacity: 0.4
  },
  // 历史记录 - 静态粒子系统
  '/history': {
    mode: 'particleSystem',
    particleCount: 45,
    speed: 0.3,
    colorTheme: 'red',
    interactive: false,
    connectionDistance: 100,
    opacity: 0.45
  },
  // 系统设置 - 极简噪声场
  '/settings': {
    mode: 'noiseField',
    particleCount: 30,
    speed: 0.2,
    colorTheme: 'blue',
    interactive: false,
    noiseScale: 0.005,
    opacity: 0.3
  }
}

/**
 * 默认主题（当路由未匹配时使用）
 */
export const defaultTheme: AlgorithmTheme = {
  mode: 'particleSystem',
  particleCount: 60,
  speed: 0.6,
  colorTheme: 'red',
  interactive: true,
  connectionDistance: 120,
  opacity: 0.5
}

/**
 * 根据路由路径获取主题
 */
export function getThemeByRoute(routePath: string): AlgorithmTheme {
  // 精确匹配
  if (routeThemes[routePath]) {
    return routeThemes[routePath]
  }
  
  // 模糊匹配（支持带查询参数的路径）
  const basePath = routePath.split('?')[0]
  if (routeThemes[basePath]) {
    return routeThemes[basePath]
  }
  
  return defaultTheme
}

/**
 * 组件级别的主题配置
 * 用于特定组件（如卡片、按钮）的算法艺术效果
 */
export interface ComponentTheme {
  /** 算法模式 */
  mode: AlgorithmMode
  /** 粒子数量（通常比背景少） */
  particleCount: number
  /** 动画速度 */
  speed: number
  /** 颜色主题 */
  colorTheme: 'red' | 'blue' | 'purple' | 'gradient'
  /** 是否启用交互 */
  interactive: boolean
  /** 透明度 */
  opacity: number
}

/**
 * 卡片组件主题
 */
export const cardTheme: ComponentTheme = {
  mode: 'noiseField',
  particleCount: 20,
  speed: 0.3,
  colorTheme: 'gradient',
  interactive: true,
  opacity: 0.3
}

/**
 * 按钮组件主题
 */
export const buttonTheme: ComponentTheme = {
  mode: 'particleSystem',
  particleCount: 15,
  speed: 0.5,
  colorTheme: 'red',
  interactive: true,
  opacity: 0.4
}

/**
 * 导航组件主题
 */
export const navTheme: ComponentTheme = {
  mode: 'flowField',
  particleCount: 25,
  speed: 0.4,
  colorTheme: 'red',
  interactive: true,
  opacity: 0.35
}

/**
 * 性能自适应主题
 * 根据设备性能自动调整参数
 */
export function getAdaptiveTheme(baseTheme: AlgorithmTheme, performanceLevel: 'high' | 'medium' | 'low'): AlgorithmTheme {
  const multipliers = {
    high: { particleCount: 1.0, speed: 1.0 },
    medium: { particleCount: 0.7, speed: 0.8 },
    low: { particleCount: 0.5, speed: 0.6 }
  }
  
  const multiplier = multipliers[performanceLevel]
  
  return {
    ...baseTheme,
    particleCount: Math.floor(baseTheme.particleCount * multiplier.particleCount),
    speed: baseTheme.speed * multiplier.speed,
    opacity: baseTheme.opacity ? baseTheme.opacity * 0.8 : 0.4
  }
}

/**
 * 检测设备性能等级
 */
export function detectPerformanceLevel(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium'
  
  // 检测硬件并发数（CPU核心数）
  const hardwareConcurrency = navigator.hardwareConcurrency || 4
  
  // 检测设备内存（如果可用）
  const deviceMemory = (navigator as any).deviceMemory || 4
  
  // 检测是否支持WebGL（GPU加速）
  const hasWebGL = !!document.createElement('canvas').getContext('webgl')
  
  // 综合判断
  if (hardwareConcurrency >= 8 && deviceMemory >= 8 && hasWebGL) {
    return 'high'
  } else if (hardwareConcurrency >= 4 && deviceMemory >= 4) {
    return 'medium'
  } else {
    return 'low'
  }
}




