<template>
  <PageContainer size="xl" class="home-container">
    <div class="home-content">
      <!-- 只在非创建页面显示标题 -->
      <PageHeader
        v-if="!isInCreateView"
        title="创作中心"
        subtitle="快速模式：简单高效 | 专业模式：精细控制"
      />

    <!-- 模式选择（只在非创建页面显示）- 简化为快速模式和专业模式 -->
    <div v-if="!isInCreateView" class="mode-selector">
      <button
        :class="['mode-btn', 'mode-btn-large', { active: workMode === 'quick' }]"
        @click="workMode = 'quick'"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        <div class="mode-btn-content">
          <div class="mode-btn-title">快速模式</div>
          <div class="mode-btn-desc">文生图 · 需求分析</div>
        </div>
      </button>
      <button
        :class="['mode-btn', 'mode-btn-large', { active: workMode === 'professional' }]"
        @click="workMode = 'professional'"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
        <div class="mode-btn-content">
          <div class="mode-btn-title">专业模式</div>
          <div class="mode-btn-desc">图生图 · 提示词生图</div>
        </div>
      </button>
    </div>

    <!-- 快速模式：文生图和需求分析 -->
    <div v-if="!isInCreateView && workMode === 'quick'" class="quick-mode">
      <div class="quick-mode-grid">
        <div class="quick-mode-card" @click="handleQuickModeClick('text')">
          <div class="quick-mode-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <h3>文本生成图文</h3>
          <p>输入主题，AI生成完整图文</p>
        </div>
        <div class="quick-mode-card" @click="handleQuickModeClick('requirement')">
          <div class="quick-mode-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <h3>需求分析</h3>
          <p>输入需求，AI自动分析</p>
        </div>
      </div>
    </div>

    <!-- 专业模式：图生图、提示词生图和空间设计 -->
    <div v-if="!isInCreateView && workMode === 'professional'" class="professional-mode">
      <div class="professional-mode-grid">
        <div class="professional-mode-card" @click="handleProfessionalModeClick('image')">
          <div class="professional-mode-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3>图生图文</h3>
          <p>上传图片，AI生成营销图文</p>
        </div>
        <div class="professional-mode-card" @click="handleProfessionalModeClick('prompt')">
          <div class="professional-mode-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h3>提示词生图</h3>
          <p>输入提示词，批量生成图片</p>
        </div>
        <div class="professional-mode-card" @click="handleProfessionalModeClick('space-design')">
          <div class="professional-mode-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <circle cx="6" cy="6" r="1"></circle>
              <circle cx="18" cy="18" r="1"></circle>
            </svg>
          </div>
          <h3>空间设计</h3>
          <p>上传图片，AI智能设计装修空间</p>
        </div>
      </div>
    </div>



    <!-- 文本生成图文模式（只在创建视图中显示） -->
    <div v-if="mode === 'text' && isInCreateView" class="text-mode">
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
              <option 
                v-for="style in availableStyles" 
                :key="style.id" 
                :value="style.id"
              >
                {{ style.name }}{{ style.id === 'xiaohongshu' ? '（默认）' : '' }}
              </option>
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
        <AlgorithmicButton
          variant="primary"
          :loading="loading"
          :disabled="loading || !topic.trim()"
          @click="handleGenerateOutline"
          :enable-effect="true"
        >
          生成大纲
        </AlgorithmicButton>
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

    <!-- 图生图模式（只在创建视图中显示） -->
    <div v-if="mode === 'image' && isInCreateView" class="image-mode-layout">
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
          <p>在左侧上传图片开始创作。</p>
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

    <!-- 风格示例展示区域 - 只在文本生成模式中显示 -->
    <div v-if="isInCreateView && mode === 'text'" class="style-examples-section">
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
          :selected="mode === 'text' ? textStyle === style.id : (mode === 'image' ? settings.imageStyle === style.id : false)"
          @click="handleStyleExampleClick"
        />
      </div>
    </div>

    <!-- 案例详情弹窗 -->
    <CaseDetailModal
      :caseItem="selectedCase || undefined"
      :visible="showDetailModal"
      @close="handleCloseDetailModal"
      @copyConfig="handleCopyCaseConfig"
    />
    
    <!-- 继续编辑提示模态框 -->
    <ContinueEditModal
      :visible="showContinueEditModal"
      :pagesCount="textStore.outline.pages.length"
      @confirm="handleContinueEditConfirm"
      @cancel="handleContinueEditCancel"
    />

    <!-- 新手引导模态框 -->
    <GuideModal
      :visible="showGuideModal"
      @update:visible="showGuideModal = $event"
      @start="handleGuideStart"
      @close="handleGuideClose"
    />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { analyzeProductImage, generateMarketingCopy, generateStyledImage, generateOutline } from '../services/ai'
import { saveHistoryItem, getCurrentUser, registerUser, getUserHistory } from '../services/storage'
import { v4 as uuidv4 } from 'uuid'
import { GeneratedResult, ProcessingStatus, ProcessingMode, GenerationSettings } from '../types'
import ConfigPanel from '../components/ConfigPanel.vue'
import ResultCard from '../components/ResultCard.vue'
import StyleExampleCard from '../components/StyleExampleCard.vue'
import CaseCard from '../components/CaseCard.vue'
import CaseFilter from '../components/CaseFilter.vue'
import CaseDetailModal from '../components/CaseDetailModal.vue'
import ContinueEditModal from '../components/ContinueEditModal.vue'
import GuideModal from '../components/GuideModal.vue'
import { useTextGeneratorStore } from '../stores/textGenerator'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { PageContainer, PageHeader } from '../components/layout'
import { getStylePrompt, getAllStyleConfigs } from '../config/stylePrompts'
import { useCaseData } from '../composables/useCaseData'
import { CaseItem } from '../types/case'
import AlgorithmicButton from '../components/ui/AlgorithmicButton.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const route = useRoute()
const textStore = useTextGeneratorStore()
const workspaceStore = useWorkspaceStore()

interface Props {
  mode?: 'text' | 'image' | 'prompt'
}

const props = withDefaults(defineProps<Props>(), {
  mode: undefined
})

// 根据路由自动判断 mode，如果不在创建视图中则设为 undefined
const getInitialMode = (): 'text' | 'image' | 'prompt' | undefined => {
  if (props.mode) {
    return props.mode
  }
  // 根据路由判断
  if (route.path === '/create/text') return 'text'
  if (route.path === '/create/image') return 'image'
  if (route.path === '/create/prompt') return 'prompt'
  return undefined
}

const mode = ref<'text' | 'image' | 'prompt' | undefined>(getInitialMode() as 'text' | 'image' | 'prompt' | undefined)
const workMode = ref<'quick' | 'professional'>('quick')  // 工作模式：快速模式或专业模式

// 判断是否在创建视图中（用于隐藏标题和模式选择器）
const isInCreateView = computed(() => {
  return route.path.startsWith('/create/')
})
const textStyle = ref(localStorage.getItem('TEXT_STYLE') || 'xiaohongshu')
const imageCount = ref<number>(parseInt(localStorage.getItem('TEXT_IMAGE_COUNT') || '8', 10) || 8)
const imageCountOptions = [1, 6, 7, 8, 9, 10, 11, 12]

// 头图模式：自动根据图片数量判断，选择1张图片时自动启用
const isHeadImageMode = computed(() => imageCount.value === 1)

// 获取所有可用风格（用于下拉选择器）
const availableStyles = computed(() => getAllStyleConfigs())

// 风格示例数据（使用配置中的中文描述，避免被长提示词"覆盖"或看起来像回滚）
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
  const toast = useToast()
  const styleName = styleExamples.value.find(s => s.id === styleId)?.name || styleId
  
  // 根据当前模式设置对应的风格
  if (mode.value === 'text') {
    textStyle.value = styleId
    persistTextOptions()
    toast.success(`已选择风格：${styleName}`, { title: '风格配置成功' })
  } else if (mode.value === 'image') {
    // 将样式ID强制转换为预设的 imageStyle 类型，保证类型安全
    settings.value.imageStyle = styleId as GenerationSettings['imageStyle']
    toast.success(`已选择风格：${styleName}`, { title: '风格配置成功' })
  } else {
    // 切换到对应的模式（如果不在正确的模式下）
    mode.value = 'text'
    textStyle.value = styleId
    persistTextOptions()
    toast.success(`已选择风格：${styleName}`, { title: '风格配置成功' })
  }
}

// 案例演示相关逻辑
const caseData = useCaseData()
// 为了避免模板类型报错，这里将分类和案例列表包装为 any 类型（运行时仍然是响应式的）
const caseCategories: any = caseData.getAllCategories
const filteredCases: any = caseData.filteredCases
const selectedCase = ref<CaseItem | null>(null)
const showDetailModal = ref(false)
const showContinueEditModal = ref(false)

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

// 处理快速模式点击
const handleQuickModeClick = (type: 'text' | 'requirement') => {
  if (type === 'text') {
    router.push('/create/text')
  } else if (type === 'requirement') {
    router.push('/plan/requirement')
  }
}

// 处理专业模式点击
const handleProfessionalModeClick = (type: 'image' | 'prompt' | 'space-design') => {
  if (type === 'image') {
    router.push('/create/image')
  } else if (type === 'prompt') {
    router.push('/create/prompt')
  } else if (type === 'space-design') {
    router.push('/create/space-design')
  }
}

// 新手引导相关
const GUIDE_SEEN_KEY = 'redflow_guide_seen'
const showGuideModal = ref(false)

// 检查是否需要显示引导
const checkShouldShowGuide = () => {
  // 检查是否在首页
  if (route.path !== '/') {
    return false
  }
  
  // 检查用户是否有创作记录
  const user = getCurrentUser()
  if (user) {
    const userHistory = getUserHistory(user.id)
    // 如果有历史记录，说明用户已经使用过，不需要显示引导
    if (userHistory && userHistory.length > 0) {
      return false
    }
  }
  
  // 检查是否已经看过引导
  const guideSeen = localStorage.getItem(GUIDE_SEEN_KEY)
  if (guideSeen) {
    return false
  }
  
  // 检查是否清除了缓存（通过检查是否有其他数据来判断）
  // 如果 localStorage 中只有 guide_seen，说明可能清除了缓存
  const hasOtherData = localStorage.getItem('redflow_user') || 
                       localStorage.getItem('redflow_history') ||
                       localStorage.getItem('redflow_workspaces')
  
  // 如果没有其他数据，说明可能是新用户或清除了缓存
  if (!hasOtherData) {
    return true
  }
  
  return false
}

// 处理引导开始
const handleGuideStart = () => {
  localStorage.setItem(GUIDE_SEEN_KEY, 'true')
  showGuideModal.value = false
}

// 处理引导关闭
const handleGuideClose = () => {
  localStorage.setItem(GUIDE_SEEN_KEY, 'true')
  showGuideModal.value = false
}

// 监听路由变化，在首页时检查是否需要显示引导
watch(() => route.path, (newPath) => {
  if (newPath === '/' && !isInCreateView.value) {
    if (checkShouldShowGuide()) {
      showGuideModal.value = true
    }
  }
}, { immediate: true })

// 监听清除缓存事件（通过自定义事件）
const handleStorageClear = () => {
  // 延迟一下，确保 localStorage 已清除
  setTimeout(() => {
    if (route.path === '/' && !isInCreateView.value) {
      showGuideModal.value = true
    }
  }, 100)
}

const handleShowGuide = () => {
  showGuideModal.value = true
}

// 从工作区恢复数据（仅在文本生成模式）
const restoreWorkspaceData = async () => {
  // 只在文本生成模式且不在创建视图时恢复
  if (mode.value !== 'text' || !isInCreateView.value) return
  
  const workspaceId = route.query.workspace as string
  if (!workspaceId) return

  try {
    await workspaceStore.loadWorkspaces()
    const workspace = workspaceStore.getWorkspaceById(workspaceId)
    
    if (!workspace) {
      console.warn('工作区不存在:', workspaceId)
      return
    }

    // 设置当前工作区
    workspaceStore.setCurrentWorkspace(workspace)

    // 优先从 metadata.draftData 恢复（草稿数据）
    if (workspace.metadata?.draftData) {
      restoreFromDraftData(workspace.metadata.draftData)
      return
    }

    // 如果有 relatedId，尝试从历史记录恢复
    if (workspace.relatedId) {
      const { getUserHistory } = await import('../services/storage/history')
      const currentUser = getCurrentUser()
      if (currentUser) {
        const history = getUserHistory(currentUser.id)
        const historyItem = history.find(h => h.id === workspace.relatedId)
        
        if (historyItem) {
          restoreFromHistoryItem(historyItem)
          return
        }
      }
    }

    // 如果没有历史记录，尝试从 metadata.historyItem 恢复
    if (workspace.metadata?.historyItem) {
      restoreFromHistoryItem(workspace.metadata.historyItem as GeneratedResult)
    }
  } catch (error) {
    console.error('恢复工作区数据失败:', error)
  }
}

// 从草稿数据恢复
const restoreFromDraftData = (draftData: any) => {
  if (!draftData) return

  // 恢复基础数据
  if (draftData.topic) {
    topic.value = draftData.topic
    textStore.setTopic(draftData.topic)
  }
  
  if (draftData.projectName) {
    textStore.setProjectName(draftData.projectName)
  }

  if (draftData.projectDescription) {
    textStore.projectDescription = draftData.projectDescription
  }

  if (draftData.style) {
    textStore.setStyle(draftData.style, draftData.stylePrompt)
  }

  if (draftData.headImageMode !== undefined) {
    textStore.setHeadImageMode(draftData.headImageMode)
  }

  // 恢复大纲和页面数据
  if (draftData.outline) {
    const pages = draftData.outline.pages || []
    if (pages.length > 0) {
      textStore.setOutline(draftData.outline.raw || '', pages, draftData.outline.visualGuide)
      
      // 恢复图片数据
      if (draftData.images && draftData.images.length > 0) {
        textStore.images = draftData.images
      }
      
      // 恢复进度
      if (draftData.progress) {
        textStore.progress = draftData.progress
      }
      
      // 恢复阶段
      if (draftData.stage) {
        textStore.stage = draftData.stage
      }
      
      // 根据阶段跳转
      if (draftData.stage === 'result' && draftData.recordId) {
        textStore.recordId = draftData.recordId
        setTimeout(() => {
          router.push('/text-result')
        }, 100)
      } else if (draftData.stage === 'outline' && draftData.outline.raw) {
        setTimeout(() => {
          router.push('/text-outline')
        }, 100)
      }
    }
  }
}

// 从历史记录项恢复数据
const restoreFromHistoryItem = (historyItem: GeneratedResult) => {
  if (!historyItem) return

  // 恢复基础数据
  if (historyItem.topic) {
    topic.value = historyItem.topic
    textStore.setTopic(historyItem.topic)
  }
  
  if (historyItem.projectName) {
    textStore.setProjectName(historyItem.projectName)
  }

  if (historyItem.projectDescription) {
    textStore.projectDescription = historyItem.projectDescription
  }

  // 恢复大纲和页面数据
  if (historyItem.outline && historyItem.pages) {
    const pages = historyItem.pages.map(p => ({
      index: p.index,
      type: p.title === '封面' ? 'cover' : 'content',
      content: p.content,
      imageUrl: p.imageUrl,
      imagePrompt: p.imagePrompt
    }))
    
    textStore.setOutline(historyItem.outline, pages)
    
    // 恢复图片数据
    if (historyItem.pages.length > 0) {
      textStore.images = historyItem.pages.map((page) => ({
        index: page.index,
        url: page.imageUrl || '',
        status: page.imageUrl ? 'done' : 'error'
      }))
      
      textStore.progress = {
        current: historyItem.pages.filter(p => p.imageUrl).length,
        total: historyItem.pages.length,
        status: historyItem.pages.every(p => p.imageUrl) ? 'done' : 'idle'
      }
      
      // 如果有完整的图片，跳转到结果页
      if (historyItem.pages.every(p => p.imageUrl)) {
        textStore.stage = 'result'
        textStore.recordId = historyItem.id
        // 延迟跳转，确保数据已恢复
        setTimeout(() => {
          router.push('/text-result')
        }, 100)
      } else if (historyItem.outline) {
        // 如果有大纲但图片未完成，跳转到大纲页
        textStore.stage = 'outline'
        setTimeout(() => {
          router.push('/text-outline')
        }, 100)
      }
    }
  }
}

onMounted(async () => {
  // 检查是否需要显示引导
  if (checkShouldShowGuide()) {
    showGuideModal.value = true
  }
  
  // 恢复工作区数据（如果是文本生成模式）
  await restoreWorkspaceData()
  
  // 监听 storage 事件（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === GUIDE_SEEN_KEY && !e.newValue) {
      handleStorageClear()
    }
  })
  
  // 监听自定义清除缓存事件
  window.addEventListener('redflow:clearCache', handleStorageClear)
  
  // 监听显示引导事件
  window.addEventListener('redflow:showGuide', handleShowGuide)
})

// 监听路由变化，如果 workspace 参数变化，重新恢复数据
watch(() => route.query.workspace, async () => {
  if (mode.value === 'text' && isInCreateView.value) {
    await restoreWorkspaceData()
  }
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('redflow:clearCache', handleStorageClear)
  window.removeEventListener('redflow:showGuide', handleShowGuide)
})

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

// 生成新大纲的函数
const generateNewOutline = async () => {
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
    
    // 生成大纲时传递风格信息，确保配图建议与风格一致
    const res = await generateOutline(topic.value, finalImageCount, textStyle.value)
    
    console.log('大纲生成成功:', res)
    
    // 保存头图模式状态到store
    textStore.setHeadImageMode(isHeadImageMode.value)
    
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

const handleGenerateOutline = async () => {
  if (!topic.value.trim()) return
  
  // 检查是否已有大纲内容（从历史记录返回或之前生成的大纲）
  if (textStore.outline.pages.length > 0 && textStore.stage === 'outline') {
    // 如果已有大纲，显示模态框提示用户
    showContinueEditModal.value = true
    return
  }
  
  // 继续生成新大纲
  await generateNewOutline()
}

// 处理继续编辑模态框确认
const handleContinueEditConfirm = () => {
  showContinueEditModal.value = false
  router.push('/text-outline')
}

// 处理继续编辑模态框取消（重新生成）
const handleContinueEditCancel = async () => {
  showContinueEditModal.value = false
  await generateNewOutline()
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
  position: relative;
  min-height: 100vh;
  border: none;
  background: transparent;
  box-shadow: none;
}

.home-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 200px);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 让 PageHeader 标题在左上角 */
:deep(.ui-page-header) {
  text-align: left;
  width: 100%;
  position: relative;
  margin-bottom: var(--spacing-3xl);
}

:deep(.ui-page-header__content) {
  justify-content: flex-start;
  flex-direction: row;
  align-items: flex-start;
}

:deep(.ui-page-header__title-section) {
  text-align: left;
  width: auto;
}

.page-header {
  margin-bottom: 32px;
  width: 100%;
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
  margin-top: 0;
  margin-bottom: 32px;
  justify-content: center;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  z-index: 1;
  clear: both;
}

/* 确保在小屏幕上也有足够的间距 */
@media (max-width: 1024px) {
  .mode-selector {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .mode-selector {
    margin-top: 0;
    flex-direction: column;
    gap: 12px;
  }
}

.mode-btn {
  flex: 1;
  padding: var(--spacing-lg) var(--spacing-xl);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  font-family: var(--font-family-display);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.mode-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.mode-btn:hover {
  border-color: var(--primary);
  background: var(--bg-body);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(74, 142, 255, 0.15);
}

.mode-btn:hover::before {
  opacity: 0.05;
}

.mode-btn.active {
  border-color: transparent;
  background: var(--primary-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.mode-btn.active::before {
  opacity: 0;
}

.mode-btn-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) var(--spacing-2xl);
  min-height: 80px;
  flex-direction: column;
}

.mode-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  text-align: center;
}

.mode-btn-title {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
}

.mode-btn-desc {
  font-size: var(--font-sm);
  opacity: 0.8;
}

/* 快速模式和专业模式卡片 */
.quick-mode,
.professional-mode {
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.quick-mode-grid,
.professional-mode-grid {
  display: flex;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-mode-card,
.professional-mode-card {
  flex: 1;
  min-width: 0;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-align: center;
  position: relative;
  overflow: hidden;
  font-weight: 500;
}

.quick-mode-card {
  width: 392px;
}

.professional-mode-card {
  width: 392px;
}

.quick-mode-card::before,
.professional-mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.quick-mode-card:hover,
.professional-mode-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.quick-mode-card:hover::before,
.professional-mode-card:hover::before {
  opacity: 0.05;
}

.quick-mode-icon,
.professional-mode-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-lg);
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  position: relative;
  z-index: 1;
}

.quick-mode-card h3,
.professional-mode-card h3 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
  position: relative;
  z-index: 1;
}

.quick-mode-card p,
.professional-mode-card p {
  font-size: var(--font-base);
  color: var(--text-sub);
  position: relative;
  z-index: 1;
}

/* 文本模式 */
.text-mode {
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  animation: slideUp var(--duration-normal) var(--ease-out);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.text-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  font-family: var(--font-family-display);
}

.text-option-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  font-size: var(--font-sm);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-align: left;
  text-align-last: left;
}

.text-option-select:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-focus);
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
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.outline-page {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--ease-out);
  animation: slideUp var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
  box-shadow: var(--shadow-sm);
}

.outline-page:nth-child(1) { animation-delay: 0.05s; }
.outline-page:nth-child(2) { animation-delay: 0.1s; }
.outline-page:nth-child(3) { animation-delay: 0.15s; }
.outline-page:nth-child(4) { animation-delay: 0.2s; }

.outline-page:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.12);
}

.outline-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.outline-page-index {
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  font-size: var(--font-base);
}

.outline-page-type {
  font-size: var(--font-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-semibold);
}

.outline-page-content {
  color: var(--text-sub);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-sm);
  margin-top: var(--spacing-sm);
}

.outline-raw {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal) var(--ease-out);
}

.outline-raw:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.outline-raw summary {
  cursor: pointer;
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  color: var(--primary);
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.outline-raw summary:hover {
  background: var(--primary-light);
  transform: translateX(4px);
}

.outline-raw pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-sub);
  font-size: var(--font-sm);
  font-family: var(--font-family-mono);
  line-height: var(--line-height-relaxed);
  padding: var(--spacing-md);
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

/* 图生图模式 */
.image-mode-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: var(--section-gap);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  align-items: start;
}

@media (max-width: 1400px) {
  .image-mode-left-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .image-mode-layout {
    grid-template-columns: 1fr;
  }
  
  .empty-tips {
    grid-template-columns: 1fr;
  }
}

.image-mode-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  animation: slideUp var(--duration-normal) var(--ease-out);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

/* 左侧双栏布局 */
.image-mode-left-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  height: 100%;
}

.image-mode-left-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.image-mode-right-column {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1400px) {
  .image-mode-left-grid {
    grid-template-columns: 1fr;
  }
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.upload-area:hover:not(.disabled) {
  border-color: var(--primary);
  border-style: solid;
  background: var(--bg-card-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(74, 142, 255, 0.15);
}

.upload-area:hover:not(.disabled)::before {
  opacity: 0.05;
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

.empty-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  border: 1px dashed var(--border-color);
  padding: var(--spacing-3xl);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  min-height: 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
  filter: grayscale(0.3);
}

.empty-workspace h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.empty-workspace p {
  color: var(--text-sub);
  max-width: 420px;
  font-size: var(--font-base);
  line-height: var(--line-height-relaxed);
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  background: var(--bg-card-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card h3 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-lg);
}

/* 处理模式选择器 */
.processing-mode-selector {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.processing-mode-selector:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.selector-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-main);
  font-size: var(--font-sm);
}

.mode-toggle-group {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.mode-hint {
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-sub);
  line-height: 1.4;
}

.upload-hint {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin-top: var(--spacing-sm);
}

.mode-toggle-btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-main);
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.mode-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.mode-toggle-btn:hover:not(:disabled) {
  background: var(--bg-body);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.15);
}

.mode-toggle-btn:hover:not(:disabled)::before {
  opacity: 0.05;
}

.mode-toggle-btn.active {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border-color: transparent;
  box-shadow: var(--shadow-md);
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
  margin-top: var(--section-gap);
  margin-bottom: var(--section-gap);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  border: none;
  border-top: none;
  border-bottom: none;
  background: transparent;
  box-shadow: none;
}

.style-examples-section h3 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.section-description {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin-bottom: var(--spacing-xl);
  line-height: var(--line-height-relaxed);
}

.style-examples-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  width: 100%;
}

/* 在创建视图中的样式覆盖 */
.home-container:has(.create-text-view) .style-examples-grid,
.create-text-view .style-examples-grid {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 1200px) {
  .home-container:has(.create-text-view) .style-examples-grid,
  .create-text-view .style-examples-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .home-container:has(.create-text-view) .style-examples-grid,
  .create-text-view .style-examples-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
}

/* 案例演示区域样式 */
.case-demo-section {
  margin-top: var(--section-gap);
  margin-bottom: var(--section-gap);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.case-demo-section h3 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--card-gap);
  margin-top: var(--spacing-xl);
}

.empty-cases {
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-xl);
  margin-top: var(--spacing-xl);
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.empty-cases .empty-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
  filter: grayscale(0.3);
}

.empty-cases h4 {
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.empty-cases p {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin: 0;
  line-height: var(--line-height-relaxed);
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
