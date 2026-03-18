/**
 * 案例数据管理 composable
 * 负责处理案例数据的获取、分类、排序和收藏等功能
 */

import { ref, computed } from 'vue'
import { CaseItem, CaseFilter, CaseSortBy, CaseCategory } from '../types/case'

// 模拟案例数据
const mockCases: CaseItem[] = [
  {
    id: 'case_001',
    title: '秋季时尚穿搭指南',
    description: '小红书爆款秋季穿搭，ins极简风格，清新自然',
    category: 'fashion',
    style: 'ins_minimal',
    imageUrl: '/src/assets/style-examples/ins_minimal.png',
    config: {
      prompt: 'A minimalist fashion lookbook, 3:4, 2048x2730, clean background, soft lighting',
      styleId: 'ins_minimal',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.7
      }
    },
    likes: 128,
    views: 1567,
    createdAt: '2025-12-10T10:30:00Z',
    isFavorite: false
  },
  {
    id: 'case_002',
    title: '科技产品宣传海报',
    description: '未来科技风格，适合电子数码产品宣传',
    category: 'technology',
    style: 'tech_future',
    imageUrl: '/src/assets/style-examples/tech_future.png',
    config: {
      prompt: 'Futuristic tech product poster, 3:4, 2048x2730, neon lights, sleek design',
      styleId: 'tech_future',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.8
      }
    },
    likes: 95,
    views: 1234,
    createdAt: '2025-12-09T14:20:00Z',
    isFavorite: false
  },
  {
    id: 'case_003',
    title: '美食探店分享',
    description: '多巴胺风格美食照片，色彩鲜艳，活力四射',
    category: 'food',
    style: 'dopamine',
    imageUrl: '/src/assets/style-examples/dopamine.png',
    config: {
      prompt: 'Vibrant food photography, 3:4, 2048x2730, high saturation, colorful, appetizing',
      styleId: 'dopamine',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.9
      }
    },
    likes: 156,
    views: 2345,
    createdAt: '2025-12-08T09:15:00Z',
    isFavorite: false
  },
  {
    id: 'case_004',
    title: '自然风景摄影',
    description: '自然清新风格，适合旅行和风景分享',
    category: 'travel',
    style: 'nature_fresh',
    imageUrl: '/src/assets/style-examples/nature_fresh.png',
    config: {
      prompt: 'Fresh nature landscape, 3:4, 2048x2730, natural lighting, vibrant greens, clear sky',
      styleId: 'nature_fresh',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.7
      }
    },
    likes: 203,
    views: 3456,
    createdAt: '2025-12-07T16:45:00Z',
    isFavorite: false
  },
  {
    id: 'case_005',
    title: '高端美妆产品展示',
    description: '黑金风格，展现高端奢华感',
    category: 'beauty',
    style: 'black_gold',
    imageUrl: '/src/assets/style-examples/black_gold.png',
    config: {
      prompt: 'Luxury beauty product showcase, 3:4, 2048x2730, black and gold theme, elegant',
      styleId: 'black_gold',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.6
      }
    },
    likes: 178,
    views: 2890,
    createdAt: '2025-12-06T11:20:00Z',
    isFavorite: false
  },
  {
    id: 'case_006',
    title: '复古风穿搭分享',
    description: '复古怀旧风格，展现年代感',
    category: 'fashion',
    style: 'retro_vintage',
    imageUrl: '/src/assets/style-examples/retro_vintage.png',
    config: {
      prompt: 'Retro fashion style, 3:4, 2048x2730, vintage film effect, warm tones',
      styleId: 'retro_vintage',
      otherParams: {
        aspectRatio: '3:4',
        temperature: 0.8
      }
    },
    likes: 145,
    views: 2134,
    createdAt: '2025-12-05T15:30:00Z',
    isFavorite: false
  }
]

/**
 * 案例数据管理 hook
 */
export function useCaseData() {
  // 案例列表状态
  const cases = ref<CaseItem[]>(mockCases)
  // 筛选条件
  const filter = ref<CaseFilter>({
    sortBy: 'latest'
  })
  // 加载状态
  const loading = ref(false)
  // 错误信息
  const error = ref<string | null>(null)
  // 收藏列表
  const favorites = ref<string[]>(loadFavorites())

  /**
   * 从本地存储加载收藏列表
   */
  function loadFavorites(): string[] {
    try {
      const saved = localStorage.getItem('case_favorites')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load favorites:', e)
      return []
    }
  }

  /**
   * 保存收藏列表到本地存储
   */
  function saveFavorites() {
    try {
      localStorage.setItem('case_favorites', JSON.stringify(favorites.value))
    } catch (e) {
      console.error('Failed to save favorites:', e)
    }
  }

  /**
   * 根据ID获取案例
   */
  const getCaseById = (id: string) => {
    return cases.value.find(c => c.id === id)
  }

  /**
   * 筛选后的案例列表
   */
  const filteredCases = computed(() => {
    let result = [...cases.value]

    // 应用分类筛选
    if (filter.value.category) {
      result = result.filter(caseItem => caseItem?.category === filter.value.category)
    }

    // 应用搜索筛选
    if (filter.value.search) {
      const searchLower = filter.value.search.toLowerCase()
      result = result.filter(caseItem => 
        caseItem?.title.toLowerCase().includes(searchLower) ||
        caseItem?.description.toLowerCase().includes(searchLower)
      )
    }

    // 过滤掉undefined或null的案例项（使用类型保护，保证数组元素类型为 CaseItem）
    result = result.filter((caseItem): caseItem is CaseItem => !!caseItem)

    // 应用排序
    result.sort((a, b) => {
      switch (filter.value.sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'popular':
          return b.likes - a.likes
        case 'recommended':
          // 推荐算法：结合点赞数和浏览量
          const scoreA = a.likes * 0.7 + a.views * 0.3
          const scoreB = b.likes * 0.7 + b.views * 0.3
          return scoreB - scoreA
        default:
          return 0
      }
    })

    return result
  })

  /**
   * 更新筛选条件
   */
  const updateFilter = (newFilter: Partial<CaseFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  /**
   * 切换案例收藏状态
   */
  const toggleFavorite = (caseId: string) => {
    const caseItem = getCaseById(caseId)
    if (!caseItem) return

    const index = favorites.value.indexOf(caseId)
    if (index === -1) {
      // 添加到收藏
      favorites.value.push(caseId)
      caseItem.isFavorite = true
    } else {
      // 取消收藏
      favorites.value.splice(index, 1)
      caseItem.isFavorite = false
    }

    saveFavorites()
  }

  /**
   * 复制案例配置到剪贴板
   */
  const copyCaseConfig = async (caseItem: CaseItem) => {
    try {
      const configString = JSON.stringify(caseItem.config, null, 2)
      await navigator.clipboard.writeText(configString)
      return true
    } catch (e) {
      console.error('Failed to copy config:', e)
      return false
    }
  }

  /**
   * 增加案例浏览量
   */
  const incrementViews = (caseId: string) => {
    const caseItem = getCaseById(caseId)
    if (caseItem) {
      caseItem.views++
    }
  }

  /**
   * 增加案例点赞数
   */
  const incrementLikes = (caseId: string) => {
    const caseItem = getCaseById(caseId)
    if (caseItem) {
      caseItem.likes++
    }
  }

  /**
   * 获取所有案例分类
   */
  const getAllCategories = computed(() => {
    const categories = new Set<CaseCategory>()
    cases.value.forEach(caseItem => categories.add(caseItem.category))
    return Array.from(categories)
  })

  return {
    // 状态
    cases,
    filter,
    loading,
    error,
    favorites,
    // 计算属性
    filteredCases,
    getAllCategories,
    // 方法
    getCaseById,
    updateFilter,
    toggleFavorite,
    copyCaseConfig,
    incrementViews,
    incrementLikes
  }
}
