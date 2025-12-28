/**
 * 算法艺术组合式函数
 * 封装算法艺术的通用逻辑和状态管理
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import type { AlgorithmTheme, ComponentTheme } from '../config/algorithmicThemes'
import { getThemeByRoute, getAdaptiveTheme, detectPerformanceLevel, defaultTheme } from '../config/algorithmicThemes'

export interface UseAlgorithmicArtOptions {
  /** 是否自动根据路由切换主题 */
  autoRouteTheme?: boolean
  /** 自定义主题（覆盖自动主题） */
  customTheme?: Partial<AlgorithmTheme>
  /** 是否启用性能自适应 */
  adaptivePerformance?: boolean
  /** 是否响应路由变化 */
  watchRoute?: boolean
}

/**
 * 算法艺术组合式函数
 */
export function useAlgorithmicArt(options: UseAlgorithmicArtOptions = {}) {
  const {
    autoRouteTheme = true,
    customTheme,
    adaptivePerformance = true,
    watchRoute = true
  } = options

  const route = useRoute()
  
  // 当前主题
  const currentTheme = ref<AlgorithmTheme>(defaultTheme)
  
  // 性能等级
  const performanceLevel = ref<'high' | 'medium' | 'low'>('medium')
  
  // 是否启用动画（响应 prefers-reduced-motion）
  const prefersReducedMotion = ref(false)
  
  /**
   * 更新主题
   */
  const updateTheme = (theme: AlgorithmTheme) => {
    currentTheme.value = theme
  }
  
  /**
   * 根据路由获取主题
   */
  const getRouteTheme = (): AlgorithmTheme => {
    if (!autoRouteTheme) {
      return customTheme ? { ...defaultTheme, ...customTheme } : defaultTheme
    }
    
    const routeTheme = getThemeByRoute(route.path)
    
    // 应用自定义覆盖
    if (customTheme) {
      return { ...routeTheme, ...customTheme }
    }
    
    return routeTheme
  }
  
  /**
   * 应用性能自适应
   */
  const applyAdaptivePerformance = (theme: AlgorithmTheme): AlgorithmTheme => {
    if (!adaptivePerformance) {
      return theme
    }
    
    // 检测性能等级
    if (performanceLevel.value === 'medium') {
      performanceLevel.value = detectPerformanceLevel()
    }
    
    return getAdaptiveTheme(theme, performanceLevel.value)
  }
  
  /**
   * 应用减少动画偏好
   */
  const applyReducedMotion = (theme: AlgorithmTheme): AlgorithmTheme => {
    if (!prefersReducedMotion.value) {
      return theme
    }
    
    return {
      ...theme,
      speed: theme.speed * 0.3,
      particleCount: Math.floor(theme.particleCount * 0.5),
      animated: false
    }
  }
  
  /**
   * 初始化主题
   */
  const initTheme = () => {
    let theme = getRouteTheme()
    theme = applyAdaptivePerformance(theme)
    theme = applyReducedMotion(theme)
    updateTheme(theme)
  }
  
  /**
   * 检测 prefers-reduced-motion
   */
  const checkReducedMotion = () => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches
    
    // 监听变化
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
      initTheme()
    }
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }
  
  // 初始化
  onMounted(() => {
    performanceLevel.value = detectPerformanceLevel()
    const cleanup = checkReducedMotion()
    initTheme()
    
    if (cleanup) {
      onUnmounted(cleanup)
    }
  })
  
  // 监听路由变化
  if (watchRoute) {
    watch(() => route.path, () => {
      initTheme()
    })
  }
  
  // 计算属性：当前主题（响应式）
  const theme = computed(() => currentTheme.value)
  
  // 计算属性：是否启用动画
  const animated = computed(() => {
    return !prefersReducedMotion.value && currentTheme.value.animated !== false
  })
  
  return {
    /** 当前主题 */
    theme,
    /** 是否启用动画 */
    animated,
    /** 性能等级 */
    performanceLevel,
    /** 更新主题 */
    updateTheme,
    /** 重新初始化主题 */
    initTheme
  }
}

/**
 * 组件级别的算法艺术 Hook
 * 用于小型组件（卡片、按钮等）
 */
export function useComponentAlgorithmicArt(
  componentTheme: ComponentTheme,
  options: {
    interactive?: boolean
    adaptivePerformance?: boolean
  } = {}
) {
  const {
    interactive = true,
    adaptivePerformance = true
  } = options
  
  const performanceLevel = ref<'high' | 'medium' | 'low'>('medium')
  
  // 应用性能自适应
  const getAdaptiveComponentTheme = (): ComponentTheme => {
    if (!adaptivePerformance) {
      return componentTheme
    }
    
    if (performanceLevel.value === 'medium') {
      performanceLevel.value = detectPerformanceLevel()
    }
    
    const multipliers = {
      high: { particleCount: 1.0, speed: 1.0 },
      medium: { particleCount: 0.8, speed: 0.9 },
      low: { particleCount: 0.6, speed: 0.7 }
    }
    
    const multiplier = multipliers[performanceLevel.value]
    
    return {
      ...componentTheme,
      particleCount: Math.floor(componentTheme.particleCount * multiplier.particleCount),
      speed: componentTheme.speed * multiplier.speed,
      interactive: interactive && performanceLevel.value !== 'low',
      opacity: componentTheme.opacity * (performanceLevel.value === 'low' ? 0.7 : 1.0)
    }
  }
  
  const theme = computed(() => getAdaptiveComponentTheme())
  
  onMounted(() => {
    performanceLevel.value = detectPerformanceLevel()
  })
  
  return {
    theme,
    performanceLevel
  }
}




