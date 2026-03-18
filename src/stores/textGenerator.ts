import { defineStore } from 'pinia'

// 全局视觉指南接口
export interface VisualStyleGuide {
  colorPalette: {
    primary: string              // 主色调
    secondary: string[]          // 辅助色调列表
    accent?: string              // 强调色
  }
  typographyStyle: string        // 字体风格（如："现代无衬线，中等粗细"）
  layoutStyle: string            // 布局风格（如："网格布局，充足留白"）
  decorativeElements: string     // 装饰元素风格（如："极简线条，几何图形"）
  overallAesthetic: string       // 整体美学（如："清新、简约、专业"）
}

export interface Page {
  index: number
  type: 'cover' | 'content' | 'summary'
  content: string
  imageUrl?: string
  imagePrompt?: string // 配图建议，可编辑
  
  // 视觉元数据（可选，用于保证并行生成时的视觉一致性）
  visualMetadata?: {
    primaryColor?: string        // 该页主色调（如："柔和的粉蓝色"）
    secondaryColors?: string[]   // 辅助色调
    visualFocus?: string         // 视觉重点（如："左侧大标题，右侧配图"）
    decorativeStyle?: string     // 装饰风格（如："极简线条，几何图形"）
    layoutPattern?: string       // 布局模式（如："上下分割，3:7比例"）
  }
}

export interface GeneratedImage {
  index: number
  url: string
  status: 'generating' | 'done' | 'error' | 'retrying'
  error?: string
  debugPrompt?: string // 调试用的完整 prompt
  debugInfo?: {
    style?: string
    temperature: number
    negativePrompt?: string
    stylePromptPreview?: string
  }
}

export interface TextGeneratorState {
  // 当前阶段
  stage: 'input' | 'outline' | 'generating' | 'result'

  // 用户输入
  topic: string

  // 项目信息
  projectName: string
  projectDescription: string

  // 风格元数据
  style?: string // 风格ID（如 'ins_minimal', 'poster_2k' 等）
  stylePrompt?: string // 当前使用的风格提示词（从配置中获取）
  headImageMode: boolean // 头图模式：仅生成单张高质量头图

  // 大纲数据
  outline: {
    raw: string
    pages: Page[]
    visualGuide?: VisualStyleGuide  // 全局视觉指南（可选，用于保证所有页面视觉一致性）
  }

  // 生成进度
  progress: {
    current: number
    total: number
    status: 'idle' | 'generating' | 'done' | 'error'
  }

  // 生成结果
  images: GeneratedImage[]

  // 任务ID
  taskId: string | null

  // 历史记录ID
  recordId: string | null

  // 导航守卫提示显示状态
  showNavigationGuard: boolean

  // 文案生成相关
  contentCopy: string | null // 生成的完整文案
  isGeneratingCopy: boolean // 是否正在生成文案
}

const STORAGE_KEY = 'text-generator-state'

// 从 localStorage 加载状态
function loadState(): Partial<TextGeneratorState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载状态失败:', e)
  }
  return {}
}

// 保存状态到 localStorage
function saveState(state: TextGeneratorState) {
  try {
    // 为避免 localStorage 空间爆掉，这里只存图片的索引和状态，不存 base64 / URL 本体
    const slimImages = state.images.map(img => ({
      index: img.index,
      status: img.status,
      error: img.error
    }))

    const toSave = {
      stage: state.stage,
      topic: state.topic,
      projectName: state.projectName,
      projectDescription: state.projectDescription,
      style: state.style,
      stylePrompt: state.stylePrompt,
      headImageMode: state.headImageMode,
      outline: state.outline,
      progress: state.progress,
      images: slimImages,
      taskId: state.taskId,
      recordId: state.recordId,
      contentCopy: state.contentCopy,
      isGeneratingCopy: state.isGeneratingCopy
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('保存状态失败:', e)
  }
}

export const useTextGeneratorStore = defineStore('textGenerator', {
  state: (): TextGeneratorState => {
    const saved = loadState()
    return {
      stage: saved.stage || 'input',
      topic: saved.topic || '',
      projectName: saved.projectName || '',
      projectDescription: saved.projectDescription || '',
      style: saved.style,
      stylePrompt: saved.stylePrompt,
      headImageMode: saved.headImageMode || false,
      outline: saved.outline || {
        raw: '',
        pages: []
      },
      progress: saved.progress || {
        current: 0,
        total: 0,
        status: 'idle'
      },
      images: saved.images || [],
      taskId: saved.taskId || null,
      recordId: saved.recordId || null,
      showNavigationGuard: false,
      contentCopy: saved.contentCopy || null,
      isGeneratingCopy: false
    }
  },

  getters: {
    // 获取需要生成的页面列表（考虑头图模式）
    getPagesToGenerate(): Page[] {
      if (this.headImageMode) {
        const coverPage = this.outline.pages.find(p => p.type === 'cover')
        return coverPage ? [coverPage] : (this.outline.pages.length > 0 ? [this.outline.pages[0]] : [])
      }
      return this.outline.pages
    },

    // 检查所有需要的图片是否都完成
    isAllCompleted(): boolean {
      const pagesToGenerate = this.getPagesToGenerate
      if (pagesToGenerate.length === 0) return false
      
      const result = pagesToGenerate.every(page => {
        const image = this.images.find(img => img.index === page.index)
        const isDone = image && image.status === 'done' && image.url
        if (import.meta.env.DEV && !isDone) {
          console.log('🔍 [Store] isAllCompleted 检查页面:', {
            pageIndex: page.index,
            hasImage: !!image,
            imageStatus: image?.status,
            hasUrl: !!image?.url,
            isDone
          })
        }
        return isDone
      })
      
      if (import.meta.env.DEV) {
        console.log('🔍 [Store] isAllCompleted 结果:', {
          pagesToGenerateCount: pagesToGenerate.length,
          result,
          pagesToGenerate: pagesToGenerate.map(p => p.index),
          images: this.images.map(img => ({ index: img.index, status: img.status, hasUrl: !!img.url }))
        })
      }
      
      return result
    },

    // 检查是否有失败的图片（在需要生成的页面中）
    hasFailedImages(): boolean {
      const pagesToGenerate = this.getPagesToGenerate
      return pagesToGenerate.some(page => {
        const image = this.images.find(img => img.index === page.index)
        return image && image.status === 'error'
      })
    },

    // 完成状态
    completionStatus(): 'pending' | 'completed' | 'partial' {
      // 如果还没有开始生成，返回 pending
      if (this.progress.status !== 'generating' && this.progress.status !== 'done') {
        if (import.meta.env.DEV) {
          console.log('🔍 [Store] completionStatus: pending (未开始生成)', {
            progressStatus: this.progress.status
          })
        }
        return 'pending'
      }
      
      const allCompleted = this.isAllCompleted
      const hasFailed = this.hasFailedImages
      
      // 如果所有图片都完成且没有错误，返回 completed
      if (allCompleted && !hasFailed) {
        if (import.meta.env.DEV) {
          console.log('🔍 [Store] completionStatus: completed')
        }
        return 'completed'
      }
      
      // 如果所有图片都完成但有错误，返回 partial
      if (allCompleted && hasFailed) {
        if (import.meta.env.DEV) {
          console.log('🔍 [Store] completionStatus: partial (有失败)')
        }
        return 'partial'
      }
      
      // 其他情况返回 pending
      if (import.meta.env.DEV) {
        console.log('🔍 [Store] completionStatus: pending (未全部完成)', {
          allCompleted,
          hasFailed,
          progressStatus: this.progress.status
        })
      }
      return 'pending'
    },

    // 是否应该显示完成模态框
    shouldShowCompletionModal(): boolean {
      const status = this.completionStatus
      const result = (status === 'completed' || status === 'partial') &&
                     this.progress.total > 0
      
      // 调试日志（仅在开发环境）
      if (import.meta.env.DEV && this.progress.total > 0) {
        console.log('🔍 [Store] shouldShowCompletionModal 计算:', {
          completionStatus: status,
          progressTotal: this.progress.total,
          progressStatus: this.progress.status,
          isAllCompleted: this.isAllCompleted,
          hasFailedImages: this.hasFailedImages,
          result
        })
      }
      
      return result
    },

    // 检查所有图片是否都已完成（成功或失败）
    areAllImagesFinished(): boolean {
      const pagesToGenerate = this.getPagesToGenerate
      if (pagesToGenerate.length === 0) return false
      
      const result = pagesToGenerate.every(page => {
        const image = this.images.find(img => img.index === page.index)
        // 图片已完成：状态为 'done' 或 'error'（不再处于 'generating' 或 'retrying' 状态）
        return image && (image.status === 'done' || image.status === 'error')
      })
      
      if (import.meta.env.DEV) {
        console.log('🔍 [Store] areAllImagesFinished 检查:', {
          pagesToGenerateCount: pagesToGenerate.length,
          result,
          imagesStatus: this.images.map(img => ({ index: img.index, status: img.status }))
        })
      }
      
      return result
    }
  },

  actions: {
    // 设置主题
    setTopic(topic: string) {
      this.topic = topic
      // 自动生成项目名称（如果没有设置）
      if (!this.projectName) {
        this.projectName = topic.length > 20 ? topic.substring(0, 20) + '...' : topic
      }
      this.saveToStorage()
    },

    // 设置项目名称
    setProjectName(name: string) {
      this.projectName = name
      this.saveToStorage()
    },

    // 设置项目简介
    setProjectDescription(description: string) {
      this.projectDescription = description
      this.saveToStorage()
    },

    // 设置风格
    setStyle(style: string, stylePrompt?: string) {
      this.style = style
      if (stylePrompt) {
        this.stylePrompt = stylePrompt
      }
      this.saveToStorage()
    },

    // 设置头图模式
    setHeadImageMode(enabled: boolean) {
      this.headImageMode = enabled
      this.saveToStorage()
    },

    // 设置大纲
    setOutline(raw: string, pages: Page[], visualGuide?: VisualStyleGuide) {
      this.outline.raw = raw
      this.outline.pages = pages
      this.outline.visualGuide = visualGuide
      this.stage = 'outline'
      this.saveToStorage()
    },

    // 更新页面
    updatePage(index: number, content: string, imagePrompt?: string) {
      const page = this.outline.pages.find(p => p.index === index)
      if (page) {
        page.content = content
        if (imagePrompt !== undefined) {
          page.imagePrompt = imagePrompt
        }
        this.syncRawFromPages()
        this.saveToStorage()
      }
    },

    // 根据 pages 重新生成 raw 文本
    syncRawFromPages() {
      this.outline.raw = this.outline.pages
        .map((page, idx) => {
          const typeLabel = page.type === 'cover' ? '封面' : '内容'
          return `<page>\ntype: ${page.type}\ncontent: ${page.content}\n</page>`
        })
        .join('\n\n')
    },

    // 删除页面
    deletePage(index: number) {
      this.outline.pages = this.outline.pages.filter(p => p.index !== index)
      // 重新索引
      this.outline.pages.forEach((page, idx) => {
        page.index = idx
      })
      this.syncRawFromPages()
      this.saveToStorage()
    },

    // 添加页面
    addPage(type: 'cover' | 'content', content: string = '') {
      const newPage: Page = {
        index: this.outline.pages.length,
        type,
        content
      }
      this.outline.pages.push(newPage)
      this.syncRawFromPages()
      this.saveToStorage()
    },

    // 移动页面 (拖拽排序)
    movePage(fromIndex: number, toIndex: number) {
      const pages = [...this.outline.pages]
      const [movedPage] = pages.splice(fromIndex, 1)
      pages.splice(toIndex, 0, movedPage)

      // 重新索引
      pages.forEach((page, idx) => {
        page.index = idx
      })

      this.outline.pages = pages
      this.syncRawFromPages()
      this.saveToStorage()
    },

    // 开始生成
    startGeneration() {
      this.stage = 'generating'
      this.progress.current = 0
      this.progress.total = this.outline.pages.length
      this.progress.status = 'generating'
      
      // 初始化图片数组，但保留已完成的图片（避免覆盖）
      const existingImages = new Map(this.images.map(img => [img.index, img]))
      this.images = this.outline.pages.map(page => {
        const existing = existingImages.get(page.index)
        // 如果图片已存在且已完成，保留其状态；否则初始化为生成中
        if (existing && existing.status === 'done' && existing.url) {
          return existing
        }
        return {
          index: page.index,
          url: '',
          status: 'generating' as const
        }
      })
      
      // 重新计算已完成的数量
      this.progress.current = this.images.filter(img => img.status === 'done').length
      
      this.saveToStorage()
    },

    // 更新进度
    updateProgress(
      index: number, 
      status: 'generating' | 'done' | 'error', 
      url?: string, 
      error?: string,
      debugPrompt?: string,
      debugInfo?: { style?: string; temperature: number; negativePrompt?: string; stylePromptPreview?: string }
    ) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        const oldStatus = image.status
        image.status = status
        if (url) image.url = url
        if (error) image.error = error
        if (debugPrompt) image.debugPrompt = debugPrompt
        if (debugInfo) image.debugInfo = debugInfo
        
        // 只有在状态真正改变时才保存
        if (oldStatus !== status) {
          if (status === 'done') {
            this.progress.current++
          }
          // 使用防抖保存，避免频繁写入
          this.debouncedSave()
        }
      }
    },

    updateImage(
      index: number, 
      newUrl: string,
      debugPrompt?: string,
      debugInfo?: { style?: string; temperature: number; negativePrompt?: string; stylePromptPreview?: string }
    ) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        const oldStatus = image.status
        image.url = newUrl
        image.status = 'done'
        delete image.error
        if (debugPrompt) image.debugPrompt = debugPrompt
        if (debugInfo) image.debugInfo = debugInfo
        
        // 如果状态从非 done 变为 done，更新进度计数
        if (oldStatus !== 'done') {
          this.progress.current++
        }
      }
      // 同时更新 page 的 imageUrl
      const page = this.outline.pages.find(p => p.index === index)
      if (page) {
        page.imageUrl = newUrl
      }
      this.saveToStorage()
    },

    // 完成生成
    finishGeneration(taskId: string) {
      this.taskId = taskId
      this.stage = 'result'
      this.progress.status = 'done'
      this.saveToStorage()
    },

    // 设置单个图片为重试中状态
    setImageRetrying(index: number) {
      const image = this.images.find(img => img.index === index)
      if (image) {
        image.status = 'retrying'
      }
      this.saveToStorage()
    },

    // 获取失败的图片列表
    getFailedImages() {
      return this.images.filter(img => img.status === 'error')
    },

    // 获取失败图片对应的页面
    getFailedPages() {
      const failedIndices = this.images
        .filter(img => img.status === 'error')
        .map(img => img.index)
      return this.outline.pages.filter(page => failedIndices.includes(page.index))
    },

    // 检查是否有失败的图片（已移至 getters，保留此方法以保持向后兼容）
    hasFailedImages() {
      return this.images.some(img => img.status === 'error')
    },

    // 重置
    reset() {
      this.stage = 'input'
      this.topic = ''
      this.projectName = ''
      this.projectDescription = ''
      this.style = undefined
      this.stylePrompt = undefined
      this.outline = {
        raw: '',
        pages: []
      }
      this.progress = {
        current: 0,
        total: 0,
        status: 'idle'
      }
      this.images = []
      this.taskId = null
      this.recordId = null
      this.showNavigationGuard = false
      this.contentCopy = null
      this.isGeneratingCopy = false
      localStorage.removeItem(STORAGE_KEY)
    },

    // 保存当前状态
    saveToStorage() {
      saveState(this)
    },

    // 防抖保存函数
    debouncedSave() {
      if ((this as any)._saveTimer) {
        clearTimeout((this as any)._saveTimer)
      }
      ;(this as any)._saveTimer = setTimeout(() => {
        this.saveToStorage()
        ;(this as any)._saveTimer = null
      }, 500) // 500ms 防抖
    },

    // 显示导航守卫提示
    showNavigationGuardModal() {
      this.showNavigationGuard = true
    },

    // 隐藏导航守卫提示
    hideNavigationGuardModal() {
      this.showNavigationGuard = false
    },

    // 设置文案生成状态
    setGeneratingCopy(isGenerating: boolean) {
      this.isGeneratingCopy = isGenerating
      this.saveToStorage()
    },

    // 设置生成的文案
    setContentCopy(content: string) {
      this.contentCopy = content
      this.isGeneratingCopy = false
      this.saveToStorage()
    },

    // 清除文案
    clearContentCopy() {
      this.contentCopy = null
      this.isGeneratingCopy = false
      this.saveToStorage()
    }
  }
})

