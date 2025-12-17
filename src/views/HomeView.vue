<template>
  <PageContainer size="xl" class="home-container">
    <PageHeader
      title="创作中心"
      subtitle="支持文本生成图文、图生图和提示词生成图片三种创作模式"
    />

    <!-- 模式选择 -->
    <div class="mode-selector">
      <button
        :class="['mode-btn', { active: mode === 'text' }]"
        @click="mode = 'text'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        文本生成图文
      </button>
      <button
        :class="['mode-btn', { active: mode === 'image' }]"
        @click="mode = 'image'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        图生图
      </button>
      <button
        :class="['mode-btn', { active: mode === 'prompt' }]"
        @click="handlePromptMode"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        提示词生成图片
      </button>
    </div>



    <!-- 文本生成图文模式 -->
    <div v-if="mode === 'text'" class="text-mode">
      <div class="input-section">
        <textarea
          v-model="topic"
          placeholder="输入你的创意主题，例如：西安周末旅游攻略"
          class="topic-input"
          rows="4"
        ></textarea>
        <!-- 文生图附加配置：风格与图片数量 -->
        <div class="text-options">
          <div class="option-item">
            <label>风格选择</label>
            <select v-model="textStyle" @change="persistTextOptions" class="text-option-select">
              <option value="xiaohongshu">小红书爆款风格（默认）</option>
              <option value="poster_2k">海报风格（2K）</option>
              <option value="ins_minimal">INS 极简</option>
              <option value="tech_future">科技未来</option>
              <option value="nature_fresh">自然清新</option>
              <option value="dopamine">多巴胺风格</option>
              <option value="morandi">莫兰迪风格</option>
              <option value="black_gold">黑金风格</option>
              <option value="minimal_white">极简白</option>
              <option value="cyberpunk">赛博朋克</option>
              <option value="retro_vintage">复古怀旧</option>
            </select>
          </div>
          <div class="option-item">
            <label>帖子图片数量</label>
            <select v-model="imageCount" @change="persistTextOptions" class="text-option-select">
              <option v-for="n in imageCountOptions" :key="n" :value="n">{{ n }} 张</option>
            </select>
          </div>
          <div class="option-item">
            <span class="head-image-hint" v-if="imageCount === 1">
              ⓘ 选择1张图片时，自动启用头图模式
            </span>
          </div>
        </div>
        <Button
          variant="primary"
          :loading="loading"
          :disabled="loading || !topic.trim()"
          @click="handleGenerateOutline"
        >
          生成大纲
        </Button>
      </div>

      <!-- 文本大纲结果展示 -->
      <div v-if="outlineResult" class="result-section">
        <div class="card">
          <h3>大纲预览（共 {{ outlineResult.pages.length }} 页）</h3>

          <div class="outline-pages">
            <div
              v-for="page in outlineResult.pages"
              :key="page.index"
              class="outline-page"
            >
              <div class="outline-page-header">
                <span class="outline-page-index">第 {{ page.index + 1 }} 页</span>
                <span class="outline-page-type">
                  {{ page.type === 'cover' ? '封面' : '内容' }}
                </span>
              </div>
              <p class="outline-page-content">
                {{ page.content }}
              </p>
            </div>
          </div>

          <details class="outline-raw">
            <summary>查看完整大纲原文</summary>
            <pre>{{ outlineResult.outline }}</pre>
          </details>
        </div>
      </div>
    </div>

    <!-- 图生图模式 -->
    <div v-if="mode === 'image'" class="image-mode-layout">
      <div class="image-mode-left">
        <!-- 模式切换：单张 vs 批量 -->
        <div class="processing-mode-selector" style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">
            处理模式
          </label>
          <div style="display: flex; gap: 10px;">
            <button
              :class="['mode-toggle-btn', { active: processingMode === 'SINGLE' }]"
              @click="processingMode = 'SINGLE'"
              :disabled="globalLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              单张处理
            </button>
            <button
              :class="['mode-toggle-btn', { active: processingMode === 'BATCH' }]"
              @click="processingMode = 'BATCH'"
              :disabled="globalLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              批量处理
            </button>
          </div>
          <p style="margin-top: 8px; font-size: 12px; color: var(--text-sub);">
            {{ processingMode === 'SINGLE' ? '一次处理一张图片' : '一次处理多张图片，自动批量生成' }}
          </p>
        </div>

        <!-- 上传区域 -->
        <div
          class="upload-area"
          @click="fileInputRef?.click()"
          :class="{ 'has-file': selectedFile, 'disabled': globalLoading }"
        >
          <input
            ref="fileInputRef"
            type="file"
            :multiple="processingMode === 'BATCH'"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />
          <svg v-if="!selectedFile" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <img v-if="selectedFile && processingMode === 'SINGLE'" :src="previewUrl" class="preview-image" />
          <div v-if="processingMode === 'BATCH' && results.length > 0" class="batch-preview">
            <div class="batch-count-badge">{{ results.length }} 张图片</div>
          </div>
          <p v-if="!selectedFile">
            {{ processingMode === 'BATCH' ? '点击上传多张产品图片（支持批量选择）' : '点击上传产品图片' }}
          </p>
          <p v-if="selectedFile && results.length === 0 && processingMode === 'SINGLE'" class="file-name">{{ selectedFile.name }}</p>
        </div>

        <!-- 配置面板 -->
        <ConfigPanel
          :settings="settings"
          @update:settings="handleSettingsChange"
          :disabled="globalLoading"
          :mode="processingMode"
          @submit="handleStartProcessing"
          @auto-configure="handleAutoConfigure"
        />

        <!-- 清空按钮 -->
        <button
          v-if="results.length > 0 && !globalLoading"
          @click="clearAll"
          class="clear-btn"
        >
          清空当前内容
        </button>
      </div>

      <!-- 右侧：结果显示区域 -->
      <div class="image-mode-right">
        <div v-if="results.length === 0" class="empty-workspace">
          <div class="empty-icon">👋</div>
          <h3>欢迎使用红流云创</h3>
          <p>在左侧上传图片开始创作，或点击"AI 智能一键配置"自动规划方案。</p>
        </div>

        <div v-else class="results-container">
          <ResultCard
            v-for="item in results"
            :key="item.id"
            :result="item"
            @retry="() => handleRetry(item.id)"
            @regenerate-image="() => handleRegenerateImage(item.id)"
          />
        </div>
      </div>
    </div>

    <!-- 风格示例展示区域 -->
    <div class="style-examples-section">
      <h3>风格示例展示</h3>
      <p class="section-description">选择不同风格，查看对应的示例效果</p>
      <div class="style-examples-grid">
        <StyleExampleCard
          v-for="style in styleExamples"
          :key="style.id"
          :id="style.id"
          :name="style.name"
          :imageUrl="style.imageUrl"
          :prompt="style.prompt"
          @click="handleStyleExampleClick"
        />
      </div>
    </div>

    <!-- 案例演示帖子区域 -->
    <div class="case-demo-section">
      <h3>案例演示帖子</h3>
      <p class="section-description">浏览各类案例，学习不同风格的应用</p>
      
      <!-- 案例筛选组件 -->
      <CaseFilter
        :categories="caseCategories"
        @filterChange="handleFilterChange"
      />
      
      <!-- 案例卡片网格 -->
      <div class="case-grid">
        <CaseCard
          v-for="caseItem in filteredCases"
          :key="caseItem?.id || 'default-key'"
          :caseItem="caseItem"
          @click="handleCaseClick"
          @viewDetail="handleViewCaseDetail"
          @copyConfig="handleCopyCaseConfig"
          @toggleFavorite="handleToggleFavorite"
        />
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredCases.length === 0" class="empty-cases">
        <div class="empty-icon">📚</div>
        <h4>暂无案例</h4>
        <p>请尝试调整筛选条件或添加新案例</p>
      </div>
    </div>

    <!-- 案例详情弹窗 -->
    <CaseDetailModal
      :caseItem="selectedCase || undefined"
      :visible="showDetailModal"
      @close="handleCloseDetailModal"
      @copyConfig="handleCopyCaseConfig"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeProductImage, generateMarketingCopy, generateStyledImage, generateOutline } from '../services/ai'
import { saveHistoryItem, getCurrentUser, registerUser } from '../services/storage'
import { v4 as uuidv4 } from 'uuid'
import { GeneratedResult, ProcessingStatus, ProcessingMode, GenerationSettings } from '../types'
import ConfigPanel from '../components/ConfigPanel.vue'
import ResultCard from '../components/ResultCard.vue'
import StyleExampleCard from '../components/StyleExampleCard.vue'
import CaseCard from '../components/CaseCard.vue'
import CaseFilter from '../components/CaseFilter.vue'
import CaseDetailModal from '../components/CaseDetailModal.vue'
import { useTextGeneratorStore } from '../stores/textGenerator'
import { PageContainer, PageHeader } from '../components/layout'
import { Button } from '../components/ui'
import { getStylePrompt, getAllStyleConfigs } from '../config/stylePrompts'
import { useCaseData } from '../composables/useCaseData'
import { CaseItem } from '../types/case'

const router = useRouter()
const textStore = useTextGeneratorStore()

const mode = ref<'text' | 'image' | 'prompt'>('text')
const textStyle = ref(localStorage.getItem('TEXT_STYLE') || 'xiaohongshu')
const imageCount = ref<number>(parseInt(localStorage.getItem('TEXT_IMAGE_COUNT') || '8', 10) || 8)
const imageCountOptions = [1, 6, 7, 8, 9, 10, 11, 12]

// 头图模式：自动根据图片数量判断，选择1张图片时自动启用
const isHeadImageMode = computed(() => imageCount.value === 1)

// 风格示例数据（使用配置中的中文描述，避免被长提示词“覆盖”或看起来像回滚）
const styleExamples = computed(() => {
  return getAllStyleConfigs().map(style => ({
    id: style.id,
    name: style.name,
    // 使用 public 目录路径，Vite 会将 public 目录中的文件原样复制到构建后的根目录
    imageUrl: `/style-examples/${style.id}.png`,
    // 这里使用简短的中文描述作为卡片文案，而不是长提示词的第一行
    prompt: style.description
  }))
})

// 持久化文本选项
const persistTextOptions = () => {
  localStorage.setItem('TEXT_STYLE', textStyle.value)
  localStorage.setItem('TEXT_IMAGE_COUNT', String(imageCount.value))
}

// 处理风格示例点击
const handleStyleExampleClick = (styleId: string) => {
  // 根据当前模式设置对应的风格
  if (mode.value === 'text') {
    textStyle.value = styleId
    persistTextOptions()
  } else if (mode.value === 'image') {
    // 将样式ID强制转换为预设的 imageStyle 类型，保证类型安全
    settings.value.imageStyle = styleId as GenerationSettings['imageStyle']
  }
  
  // 切换到对应的模式（如果不在正确的模式下）
  if (mode.value !== 'text' && mode.value !== 'image') {
    mode.value = 'text'
  }
}

// 案例演示相关逻辑
const caseData = useCaseData()
// 为了避免模板类型报错，这里将分类和案例列表包装为 any 类型（运行时仍然是响应式的）
const caseCategories: any = caseData.getAllCategories
const filteredCases: any = caseData.filteredCases
const selectedCase = ref<CaseItem | null>(null)
const showDetailModal = ref(false)

/**
 * 处理案例筛选变化
 */
const handleFilterChange = (category?: string, sortBy?: string, search?: string) => {
  caseData.updateFilter({
    category: category as any,
    sortBy: sortBy as any,
    search
  })
}

/**
 * 处理案例卡片点击
 */
const handleCaseClick = (caseItem: CaseItem) => {
  // 增加浏览量
  caseData.incrementViews(caseItem.id)
}

/**
 * 处理查看案例详情
 */
const handleViewCaseDetail = (caseItem: CaseItem) => {
  selectedCase.value = caseItem
  showDetailModal.value = true
  // 增加浏览量
  caseData.incrementViews(caseItem.id)
}

/**
 * 处理关闭详情弹窗
 */
const handleCloseDetailModal = () => {
  showDetailModal.value = false
  selectedCase.value = null
}

/**
 * 处理复制案例配置
 */
const handleCopyCaseConfig = async (caseItem: CaseItem) => {
  const success = await caseData.copyCaseConfig(caseItem)
  if (success) {
    alert('配置已复制到剪贴板')
  } else {
    alert('复制失败，请手动复制')
  }
}

/**
 * 处理切换收藏
 */
const handleToggleFavorite = (caseItem: CaseItem) => {
  caseData.toggleFavorite(caseItem.id)
}

// 跳转到提示词生成模式
const handlePromptMode = () => {
  router.push('/prompt-generate')
}

/**
 * 静默发送调试日志（不显示错误）
 * 用于向本地调试服务器发送日志，如果服务器不可用则静默失败
 */
const sendDebugLog = (data: any) => {
  // 使用 AbortController 设置短超时，避免长时间等待
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 100) // 100ms 超时
  
  fetch('http://127.0.0.1:7242/ingest/cd787270-e269-4164-9504-344731b7326c', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: controller.signal
  })
    .catch(() => {
      // 完全静默失败，不输出任何错误
    })
    .finally(() => {
      clearTimeout(timeoutId)
    })
}
const processingMode = ref<'SINGLE' | 'BATCH'>('SINGLE')
const topic = ref('')
const loading = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const results = ref<GeneratedResult[]>([])
const globalLoading = ref(false)
const outlineResult = ref<{
  outline: string
  pages: Array<{ index: number; type: string; content: string }>
} | null>(null)

// 默认设置
const defaultSettings: GenerationSettings = {
  tone: 'enthusiastic',
  length: 'medium',
  style: 'xiaohongshu',
  copyStyle: 'storytelling',
  imageStyle: 'ins_minimal',
  brightness: 0,
  additionalContext: '',
  textApiProvider: 'deepseek',
  imageApiProvider: 'google',
  imageAnalysisProvider: 'google',
  customPrompts: {
    enable: false,
    marketingCopyTemplate: '',
    imageGenerationTemplate: ''
  }
}

const settings = ref<GenerationSettings>({ ...defaultSettings })

const handleSettingsChange = (newSettings: GenerationSettings) => {
  settings.value = newSettings
}

const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    
    // 创建新的结果项
    const newResult: GeneratedResult = {
      id: uuidv4(),
      originalImageFile: file,
      originalImageUrl: previewUrl.value,
      status: ProcessingStatus.IDLE,
      userId: getCurrentUser()?.id || 'default',
      tokenUsage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
    }
    
    results.value = [newResult]
  }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleGenerateOutline = async () => {
  if (!topic.value.trim()) return
  
  // 持久化用户选择
  persistTextOptions()

  // 检查模拟模式或API Key
  const mockMode = localStorage.getItem('MOCK_MODE') === 'true'
  if (!mockMode) {
    const deepseekKey = localStorage.getItem('DEEPSEEK_API_KEY')
    if (!deepseekKey) {
      alert('请先在"系统设置"中配置 DeepSeek API Key，或开启模拟模式进行测试')
      return
    }
  }
  
  loading.value = true
  try {
    // 保存主题到store
    textStore.setTopic(topic.value)
    
    // 获取风格提示词并保存风格元数据到store
    const stylePrompt = getStylePrompt(textStyle.value)
    textStore.setStyle(textStyle.value, stylePrompt)
    
    // 将风格信息保存到localStorage作为备份，供GenerateView使用
    localStorage.setItem('TEXT_STYLE', textStyle.value)
    localStorage.setItem('TEXT_IMAGE_COUNT', String(imageCount.value))
    
    // 头图模式下强制设置图片数量为1
    const finalImageCount = isHeadImageMode.value ? 1 : imageCount.value
    
    // #region agent log
    sendDebugLog({
      location: 'HomeView.vue:514',
      message: 'handleGenerateOutline: 头图模式判断',
      data: {
        isHeadImageMode: isHeadImageMode.value,
        imageCount: imageCount.value,
        finalImageCount: finalImageCount
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    })
    // #endregion
    
    console.log('=== handleGenerateOutline 调试信息 ===')
    console.log('isHeadImageMode:', isHeadImageMode.value)
    console.log('imageCount:', imageCount.value)
    console.log('finalImageCount:', finalImageCount)
    
    // 生成大纲时传递风格信息，确保配图建议与风格一致
    const res = await generateOutline(topic.value, finalImageCount, textStyle.value)
    
    // #region agent log
    sendDebugLog({
      location: 'HomeView.vue:523',
      message: 'handleGenerateOutline: 大纲生成完成',
      data: {
        pagesCount: res.pages.length,
        pages: res.pages.map((p: any) => ({ index: p.index, type: p.type })),
        targetPageCount: finalImageCount
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'B'
    })
    // #endregion
    
    console.log('大纲生成成功:', res)
    
    // 保存头图模式状态到store
    textStore.setHeadImageMode(isHeadImageMode.value)
    
    // #region agent log
    sendDebugLog({
      location: 'HomeView.vue:526',
      message: 'handleGenerateOutline: 设置头图模式到store',
      data: {
        headImageMode: isHeadImageMode.value,
        storeHeadImageMode: textStore.headImageMode
      },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: 'A'
    })
    // #endregion
    
    // 保存到store并跳转到大纲编辑页面（带上配图建议和视觉元数据）
    textStore.setOutline(res.outline, res.pages.map((p: any) => ({
      index: p.index,
      type: isHeadImageMode.value ? 'cover' : p.type, // 头图模式下所有页面都是封面类型
      content: p.content,
      imagePrompt: p.imagePrompt,
      visualMetadata: p.visualMetadata // 传递视觉元数据
    })), res.visualGuide) // 传递全局视觉指南
    
    // 跳转到大纲编辑页面
    router.push('/text-outline')
  } catch (error: any) {
    console.error('生成失败:', error)
    alert('生成失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// AI智能配置
const handleAutoConfigure = async () => {
  if (results.value.length === 0 || !selectedFile.value) {
    alert('请先上传图片以进行分析')
    return
  }

  // 检查是否已经分析过，避免重复调用API
  if (results.value.length > 0 && results.value[0].analysis) {
    console.log('⚠️ 图片已分析过，使用已有分析结果，跳过重复分析')
    const existingAnalysis = results.value[0].analysis
    // 使用已有分析结果自动配置
    if (existingAnalysis.recommendation) {
      const rec = existingAnalysis.recommendation
      settings.value = {
        ...settings.value,
        tone: rec.tone || settings.value.tone,
        copyStyle: rec.copyStyle || settings.value.copyStyle,
        imageStyle: rec.imageStyle || settings.value.imageStyle
      }
      alert(`AI 已为您自动规划配置（使用已有分析结果）：\n- 风格: ${rec.imageStyle}\n- 语气: ${rec.tone}\n- 文案: ${rec.copyStyle}`)
    } else {
      alert('已有分析结果，但未包含推荐配置，请手动配置。')
    }
    return
  }

  const mockMode = localStorage.getItem('MOCK_MODE') === 'true'
  if (!mockMode) {
    const googleKey = localStorage.getItem('GOOGLE_API_KEY')
    if (!googleKey) {
      alert('请先在"系统设置"中配置 Google GenAI API Key（用于图片分析），或开启模拟模式进行测试')
      return
    }
  }

  try {
    globalLoading.value = true
    
    console.log('🔍 [一键配置] 开始分析图片（首次分析）...')
    const analysisResult = await analyzeProductImage(selectedFile.value)
    console.log('✅ [一键配置] 图片分析完成')
    
    // 更新结果的分析数据
    if (results.value.length > 0) {
      results.value[0].analysis = analysisResult.analysis
    }
    
    // 应用推荐配置
    if (analysisResult.analysis.recommendation) {
      const rec = analysisResult.analysis.recommendation
      settings.value = {
        ...settings.value,
        tone: rec.tone || settings.value.tone,
        copyStyle: rec.copyStyle || settings.value.copyStyle,
        imageStyle: rec.imageStyle || settings.value.imageStyle
      }
      
      alert(`AI 已为您自动规划配置 (消耗 ${analysisResult.usage.totalTokens} tokens)：\n- 风格: ${rec.imageStyle}\n- 语气: ${rec.tone}\n- 文案: ${rec.copyStyle}`)
    } else {
      alert('AI 未能生成具体推荐，请手动配置。')
    }
  } catch (error: any) {
    console.error('自动配置失败:', error)
    alert('自动配置失败: ' + error.message)
  } finally {
    globalLoading.value = false
  }
}

// 创建带超时的 Promise 包装器
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operation} 超时 (${timeoutMs}ms)，请检查网络连接或API配置`))
      }, timeoutMs)
    })
  ])
}

// 处理单个结果项
const processItem = async (item: GeneratedResult) => {
  if (!item.originalImageFile) {
    console.error('processItem: 缺少原始图片文件')
    updateResult(item.id, {
      status: ProcessingStatus.ERROR,
      error: '缺少原始图片文件'
    })
    return
  }

  console.log('=== 开始处理图生图任务 ===', { itemId: item.id, status: item.status })

  let currentRunUsage = { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
  
  try {
    // 1. 分析图片（如果还没有分析）
    let analysis = item.analysis
    if (!analysis) {
      console.log('步骤1: 开始分析图片...')
      updateResultStatus(item.id, ProcessingStatus.ANALYZING)
      
      try {
        // 图片分析可能需要更长时间（上传图片 + AI处理）
        const analysisResult = await withTimeout(
          analyzeProductImage(item.originalImageFile),
          180000, // 180秒（3分钟）超时，图片分析通常需要更长时间
          '图片分析'
        )
        console.log('✅ 图片分析完成:', analysisResult.analysis)
        
        analysis = analysisResult.analysis
        currentRunUsage = {
          promptTokens: currentRunUsage.promptTokens + analysisResult.usage.promptTokens,
          candidatesTokens: currentRunUsage.candidatesTokens + analysisResult.usage.candidatesTokens,
          totalTokens: currentRunUsage.totalTokens + analysisResult.usage.totalTokens
        }
        updateResult(item.id, { analysis })
      } catch (error: any) {
        console.error('❌ 图片分析失败:', error)
        // 检查是否是解析错误，提供更友好的错误信息
        if (error.message && error.message.includes('Failed to parse')) {
          throw new Error(`图片分析失败: API 返回的数据格式不正确。请检查 API 配置或稍后重试。\n\n技术详情: ${error.message}`)
        }
        throw new Error(`图片分析失败: ${error.message}`)
      }
    } else {
      console.log('跳过图片分析（已有分析结果）')
    }

    // 2. 生成文案
    console.log('步骤2: 开始生成文案...')
    updateResultStatus(item.id, ProcessingStatus.GENERATING_COPY)
    
    try {
      const copyResult = await withTimeout(
        generateMarketingCopy(analysis, settings.value),
        60000, // 60秒超时
        '文案生成'
      )
      console.log('✅ 文案生成完成，长度:', copyResult.copy?.length)
      
      currentRunUsage = {
        promptTokens: currentRunUsage.promptTokens + copyResult.usage.promptTokens,
        candidatesTokens: currentRunUsage.candidatesTokens + copyResult.usage.candidatesTokens,
        totalTokens: currentRunUsage.totalTokens + copyResult.usage.totalTokens
      }
      updateResult(item.id, { marketingCopy: copyResult.copy })
    } catch (error: any) {
      console.error('❌ 文案生成失败:', error)
      throw new Error(`文案生成失败: ${error.message}`)
    }

    // 3. 生成图片
    if (settings.value.imageStyle !== 'none') {
      // 检查是否已经生成过图片（避免重复生成）
      if (item.generatedImageUrl) {
        console.log('⚠️ 图片已生成，跳过重复生成')
      } else {
        console.log('步骤3: 开始生成图片，风格:', settings.value.imageStyle)
        updateResultStatus(item.id, ProcessingStatus.GENERATING_IMAGE)
        
        try {
          const imageResult = await withTimeout(
            generateStyledImage(
              item.originalImageFile,
              analysis,
              settings.value.imageStyle,
              settings.value
            ),
            120000, // 120秒超时（图片生成通常需要更长时间）
            '图片生成'
          )
          
          if (imageResult.imageUrl) {
            console.log('✅ 图片生成完成，URL类型:', imageResult.imageUrl.startsWith('data:') ? 'Base64' : 'URL')
            currentRunUsage = {
              promptTokens: currentRunUsage.promptTokens + imageResult.usage.promptTokens,
              candidatesTokens: currentRunUsage.candidatesTokens + imageResult.usage.candidatesTokens,
              totalTokens: currentRunUsage.totalTokens + imageResult.usage.totalTokens
            }
            updateResult(item.id, { generatedImageUrl: imageResult.imageUrl })
          } else {
            console.warn('⚠️ 图片生成返回空URL')
          }
        } catch (error: any) {
          console.error('❌ 图片生成失败:', error)
          throw new Error(`图片生成失败: ${error.message}`)
        }
      }
    } else {
      console.log('跳过图片生成（风格设置为 none）')
    }

    // 4. 完成
    console.log('步骤4: 处理完成，保存结果...')
    const totalUsage = {
      promptTokens: (item.tokenUsage?.promptTokens || 0) + currentRunUsage.promptTokens,
      candidatesTokens: (item.tokenUsage?.candidatesTokens || 0) + currentRunUsage.candidatesTokens,
      totalTokens: (item.tokenUsage?.totalTokens || 0) + currentRunUsage.totalTokens
    }

    // 获取最新的结果（可能已经更新了generatedImageUrl）
    const currentItem = results.value.find(r => r.id === item.id) || item
    
    const finalResult: GeneratedResult = {
      ...currentItem,
      analysis,
      marketingCopy: currentItem.marketingCopy || item.marketingCopy || '',
      generatedImageUrl: currentItem.generatedImageUrl || item.generatedImageUrl, // 确保包含生成的图片
      status: ProcessingStatus.COMPLETED,
      tokenUsage: totalUsage,
      mode: ProcessingMode.IMAGE_TO_IMAGE // 明确设置模式
    }

    updateResult(item.id, finalResult)
    
    // 保存到历史记录
    const user = getCurrentUser() || registerUser('default_user', 'default@example.com')
    await saveHistoryItem(user.id, finalResult)
    
    console.log('✅ 图生图任务完成，已保存到历史记录', {
      id: finalResult.id,
      hasAnalysis: !!finalResult.analysis,
      hasCopy: !!finalResult.marketingCopy,
      hasGeneratedImage: !!finalResult.generatedImageUrl,
      mode: finalResult.mode
    })

  } catch (error: any) {
    console.error('❌ 处理失败:', error)
    updateResult(item.id, {
      status: ProcessingStatus.ERROR,
      error: error.message || '处理失败'
    })
    // 显示错误提示
    alert(`处理失败: ${error.message || '未知错误'}\n\n请检查：\n1. API Key 是否正确配置\n2. 网络连接是否正常\n3. API 服务是否可用`)
  }
}

// 开始处理
const handleStartProcessing = async () => {
  console.log('=== handleStartProcessing 被调用 ===')
  
  if (results.value.length === 0) {
    alert('请先上传图片')
    return
  }

  const mockMode = localStorage.getItem('MOCK_MODE') === 'true'
  console.log('模拟模式:', mockMode)
  
  if (!mockMode) {
    const deepseekKey = localStorage.getItem('DEEPSEEK_API_KEY')
    const googleKey = localStorage.getItem('GOOGLE_API_KEY')
    
    console.log('API Key 检查:', {
      hasDeepSeekKey: !!deepseekKey,
      hasGoogleKey: !!googleKey,
      imageStyle: settings.value.imageStyle
    })
    
    if (!deepseekKey) {
      alert('请先在"系统设置"中配置 DeepSeek API Key（文本生成），或开启模拟模式进行测试')
      return
    }
    
    if (!googleKey && settings.value.imageStyle !== 'none') {
      alert('请先在"系统设置"中配置 Google GenAI API Key（图片生成），或开启模拟模式进行测试')
      return
    }
  }

  // 防止重复调用（必须在设置 globalLoading 之前检查）
  if (globalLoading.value) {
    console.warn('⚠️ 处理任务已在运行中，跳过重复调用')
    return
  }

  globalLoading.value = true
  console.log('开始处理，当前结果数量:', results.value.length)

  try {
    const itemsToProcess = results.value.filter(
      r => r.status === ProcessingStatus.IDLE || r.status === ProcessingStatus.ERROR
    )
    
    console.log('待处理项目:', itemsToProcess.length, itemsToProcess.map(i => ({ id: i.id, status: i.status })))
    
    if (itemsToProcess.length > 0) {
      // 逐个处理，避免并发问题
      for (const item of itemsToProcess) {
        // 再次检查状态，避免重复处理
        const currentItem = results.value.find(r => r.id === item.id)
        if (currentItem && (currentItem.status === ProcessingStatus.ANALYZING || 
            currentItem.status === ProcessingStatus.GENERATING_COPY || 
            currentItem.status === ProcessingStatus.GENERATING_IMAGE)) {
          console.warn(`⚠️ 项目 ${item.id} 正在处理中，跳过`)
          continue
        }
        await processItem(item)
      }
    } else if (results.value.length > 0 && results.value[0].status === ProcessingStatus.COMPLETED) {
      // 如果已完成，询问是否重新处理
      const shouldReprocess = confirm('该项目已完成，是否重新处理？')
      if (shouldReprocess) {
        console.log('重新处理已完成的项目')
        // 重置状态为 IDLE
        updateResult(results.value[0].id, { status: ProcessingStatus.IDLE })
        await processItem(results.value[0])
      }
    } else {
      console.warn('没有可处理的项目')
      alert('没有可处理的项目，请先上传图片')
    }
  } catch (error: any) {
    console.error('处理过程中出错:', error)
    alert(`处理失败: ${error.message || '未知错误'}`)
  } finally {
    globalLoading.value = false
    console.log('处理完成，globalLoading 已设置为 false')
  }
}

// 重试
const handleRetry = async (id: string) => {
  const item = results.value.find(r => r.id === id)
  if (!item) return

  globalLoading.value = true
  try {
    await processItem(item)
  } finally {
    globalLoading.value = false
  }
}

// 重新生成图片
const handleRegenerateImage = async (id: string) => {
  const item = results.value.find(r => r.id === id)
  if (!item || !item.analysis) {
    alert('缺少必要的分析数据，无法重新生成图片。')
    return
  }

  if (!item.originalImageFile) {
    alert('缺少原始图片文件，无法重新生成。')
    return
  }

  globalLoading.value = true
  
  try {
    updateResult(id, {
      status: ProcessingStatus.GENERATING_IMAGE,
      previousGeneratedImageUrl: item.generatedImageUrl,
      error: undefined
    })

    const imageResult = await generateStyledImage(
      item.originalImageFile,
      item.analysis,
      settings.value.imageStyle,
      settings.value
    )

    if (imageResult.imageUrl) {
      const newUsage = {
        promptTokens: (item.tokenUsage?.promptTokens || 0) + imageResult.usage.promptTokens,
        candidatesTokens: (item.tokenUsage?.candidatesTokens || 0) + imageResult.usage.candidatesTokens,
        totalTokens: (item.tokenUsage?.totalTokens || 0) + imageResult.usage.totalTokens
      }

      updateResult(id, {
        generatedImageUrl: imageResult.imageUrl,
        status: ProcessingStatus.COMPLETED,
        tokenUsage: newUsage,
        error: undefined
      })

      const user = getCurrentUser() || registerUser('default_user', 'default@example.com')
      const updatedItem = results.value.find(r => r.id === id)
      if (updatedItem) {
        const historyItem: any = {
          ...updatedItem,
          mode: ProcessingMode.IMAGE_TO_IMAGE
        }
        await saveHistoryItem(user.id, historyItem as any)
      }
    }
  } catch (error: any) {
    console.error('重新生成图片失败:', error)
    updateResult(id, {
      status: ProcessingStatus.ERROR,
      error: error.message || '重绘失败'
    })
  } finally {
    globalLoading.value = false
  }
}

// 更新结果状态
const updateResultStatus = (id: string, status: ProcessingStatus) => {
  const index = results.value.findIndex(r => r.id === id)
  if (index !== -1) {
    results.value[index] = { ...results.value[index], status }
  }
}

// 更新结果
const updateResult = (id: string, updates: Partial<GeneratedResult>) => {
  const index = results.value.findIndex(r => r.id === id)
  if (index !== -1) {
    results.value[index] = { ...results.value[index], ...updates }
  }
}

// 清空
const clearAll = () => {
  // 清理所有预览URL
  results.value.forEach(result => {
    if (result.originalImageUrl && result.originalImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(result.originalImageUrl)
    }
  })
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  results.value = []
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  padding: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--text-sub);
}

.mode-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.mode-btn {
  flex: 1;
  padding: 16px 24px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  border-color: var(--primary);
  background: var(--primary-fade);
}

.mode-btn.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
}

/* 文本模式 */
.text-mode {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.option-item label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.text-option-select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  font-size: 14px;
}

.text-option-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.topic-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 16px;
  resize: vertical;
  font-family: inherit;
}

.topic-input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn {
  padding: 12px 24px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.outline-pages {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.outline-page {
  padding: 16px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
}

.outline-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.outline-page-index {
  font-weight: 600;
  color: var(--text-main);
}

.outline-page-type {
  font-size: 12px;
  padding: 4px 8px;
  background: var(--primary-fade);
  color: var(--primary);
  border-radius: 4px;
}

.outline-page-content {
  color: var(--text-sub);
  line-height: 1.6;
}

.outline-raw {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
}

.outline-raw summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.outline-raw pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-sub);
  font-size: 14px;
}

/* 图生图模式 */
.image-mode-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .image-mode-layout {
    grid-template-columns: 1fr;
  }
}

.image-mode-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);
}

.upload-area:hover:not(.disabled) {
  border-color: var(--primary);
  background: var(--primary-fade);
}

.upload-area.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.upload-area.has-file {
  border-style: solid;
  padding: 16px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.file-name {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 8px;
}

.clear-btn {
  width: 100%;
  padding: 12px;
  text-align: center;
  color: #dc2626;
  background: white;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #fee2e2;
}

.image-mode-right {
  min-height: 500px;
}

.empty-workspace {
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  padding: 48px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-workspace h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.empty-workspace p {
  color: var(--text-sub);
  max-width: 400px;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--border-color);
}

.card h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16px;
}

/* 处理模式选择器 */
.processing-mode-selector {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
}

.mode-toggle-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.mode-toggle-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--primary);
}

.mode-toggle-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.mode-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 批量预览 */
.batch-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.batch-count-badge {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
}

/* 风格示例展示区域 */
.style-examples-section {
  margin-top: 48px;
  margin-bottom: 48px;
}

.style-examples-section h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.section-description {
  font-size: 14px;
  color: var(--text-sub);
  margin-bottom: 24px;
}

.style-examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .style-examples-section {
    margin-top: 32px;
    margin-bottom: 32px;
  }
  
  .style-examples-section h3 {
    font-size: 20px;
  }
  
  .style-examples-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

/* 案例演示区域样式 */
.case-demo-section {
  margin-top: 48px;
  margin-bottom: 48px;
}

.case-demo-section h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.empty-cases {
  text-align: center;
  padding: 64px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-top: 24px;
}

.empty-cases .empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-cases h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.empty-cases p {
  font-size: 14px;
  color: var(--text-sub);
  margin: 0;
}

/* 响应式设计 - 案例演示区域 */
@media (max-width: 768px) {
  .case-demo-section {
    margin-top: 32px;
    margin-bottom: 32px;
  }
  
  .case-demo-section h3 {
    font-size: 20px;
  }
  
  .case-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
  
  .empty-cases {
    padding: 48px 16px;
  }
  
  .empty-cases .empty-icon {
    font-size: 48px;
  }
  
  .empty-cases h4 {
    font-size: 16px;
  }
}
</style>
