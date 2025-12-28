<template>
  <PageContainer size="xl">
    <PageHeader
      title="生成结果"
    >
      <template #extra>
        <p class="page-subtitle">
          <span v-if="isGenerating">已完成 {{ completedCount }} / {{ store.progress.total }} 页</span>
          <span v-else-if="hasFailedImages">{{ failedCount }} 张图片生成失败，可点击重试</span>
          <span v-else>全部 {{ store.progress.total }} 张图片生成完成</span>
        </p>
      </template>
      <template #actions>
        <Button
          v-if="hasFailedImages && !isGenerating"
          variant="primary"
          :loading="isRetrying"
          @click="retryAllFailed"
        >
          {{ isRetrying ? '补全中...' : '一键补全失败图片' }}
        </Button>
        <Button
          v-if="!isGenerating && store.progress.status === 'done' && store.recordId"
          variant="primary"
          @click="handleRegenerateAll"
        >
          重新生成全部图片
        </Button>
        <Button variant="secondary" @click="router.push('/text-outline')">
          返回大纲
        </Button>
      </template>
    </PageHeader>

    <Card>
      <Progress
        label="生成进度"
        :percentage="progressPercent"
        show-percentage
      />

      <div v-if="error" class="error-msg">
        {{ error }}
      </div>

      <div class="grid-cols-4" style="margin-top: 40px;">
        <div v-for="image in store.images" :key="image.index" class="image-card">
          <!-- 图片展示区域 -->
          <div v-if="image.url && image.status === 'done'" class="image-preview">
            <img :src="image.url" :alt="`第 ${image.index + 1} 页`" />
            <!-- 重新生成按钮（悬停显示） -->
            <div class="image-overlay">
              <button
                class="overlay-btn"
                @click="regenerateImage(image.index)"
                :disabled="isRetrying"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                重新生成
              </button>
            </div>
          </div>

          <!-- 生成中状态 -->
          <div v-else-if="image.status === 'generating'" class="image-placeholder">
            <div class="spinner"></div>
            <div class="status-text">生成中...</div>
          </div>

          <!-- 失败状态 -->
          <div v-else-if="image.status === 'error'" class="image-placeholder error-placeholder">
            <div class="error-icon">!</div>
            <div class="status-text">生成失败</div>
            <button
              class="retry-btn"
              @click="retrySingleImage(image.index)"
              :disabled="isRetrying"
            >
              点击重试
            </button>
          </div>

          <!-- 等待中状态 -->
          <div v-else class="image-placeholder">
            <div class="status-text">等待中</div>
          </div>

          <!-- 底部信息栏 -->
          <div class="image-footer">
            <span class="page-label">Page {{ image.index + 1 }}</span>
            <span class="status-badge" :class="image.status">
              {{ getStatusText(image.status) }}
            </span>
          </div>
        </div>
      </div>
    </Card>

    <!-- 完成提示模态框 -->
    <CompletionModal
      :visible="showCompletionModal"
      :initial-project-name="store.topic || store.projectName || ''"
      :initial-project-description="store.projectDescription"
      :completion-status="store.completionStatus"
      :failed-count="store.getFailedPages().length"
      @confirm="handleCompletionConfirm"
      @cancel="handleCompletionCancel"
    />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTextGeneratorStore } from '../stores/textGenerator'
import { generatePageImage } from '../services/ai'
// 历史记录保存已移至 ResultView 统一处理
import { v4 as uuidv4 } from 'uuid'
import { PageContainer, PageHeader } from '../components/layout'
import { Button, Card, Progress } from '../components/ui'
import CompletionModal from '../components/CompletionModal.vue'

const router = useRouter()
const store = useTextGeneratorStore()

const error = ref('')
const isRetrying = ref(false)
const showCompletionModal = ref(false)

const isGenerating = computed(() => store.progress.status === 'generating')

const progressPercent = computed(() => {
  if (store.progress.total === 0) return 0
  return (store.progress.current / store.progress.total) * 100
})

// 已完成的图片数量（用于顶部“已完成 x / y 页”展示）
const completedCount = computed(() => store.images.filter(img => img.status === 'done').length)

const hasFailedImages = computed(() => store.images.some(img => img.status === 'error'))

const failedCount = computed(() => store.images.filter(img => img.status === 'error').length)

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    generating: '生成中',
    done: '已完成',
    error: '失败'
  }
  return texts[status] || '等待中'
}

// 重试单张图片
async function retrySingleImage(index: number) {
  const page = store.outline.pages.find(p => p.index === index)
  if (!page) return

  store.setImageRetrying(index)

  try {
    const result = await generatePageImage(
      page.content,
      page.index,
      store.outline.pages.length,
      store.outline.raw,
      store.topic,
      page.type,
      undefined,
      (page as any).imagePrompt || undefined,
      store.style || undefined,
      store.outline.visualGuide, // 传递全局视觉指南
      page.visualMetadata // 传递当前页的视觉元数据
    )
    store.updateImage(index, result.imageUrl)
  } catch (e: any) {
    store.updateProgress(index, 'error', undefined, e.message || String(e))
  }
}

// 重新生成图片
function regenerateImage(index: number) {
  retrySingleImage(index)
}

// 重新生成全部图片（从历史记录返回时使用）
const handleRegenerateAll = () => {
  if (!confirm('确定要重新生成全部图片吗？这将重新调用API并可能产生费用。')) {
    return
  }
  
  // 重置完成提示相关状态
  showCompletionModal.value = false
  
  // 重置所有图片状态
  store.images.forEach(img => {
    store.updateProgress(img.index, 'generating')
  })
  
  // 重置进度状态
  store.progress.status = 'generating'
  store.progress.current = 0
  
  // 清除recordId，允许重新保存
  store.recordId = null
  
  // 开始生成任务
  if (!generationTask && !isGeneratingTask) {
    generationTask = startGenerationTask()
  }
}

// 批量重试所有失败的图片
async function retryAllFailed() {
  const failedPages = store.getFailedPages()
  if (failedPages.length === 0) return

  isRetrying.value = true

  // 设置所有失败的图片为重试状态
  failedPages.forEach(page => {
    store.setImageRetrying(page.index)
  })

  try {
    // 并发生成所有失败的图片
    await Promise.all(
      failedPages.map(async (page) => {
        try {
          const result = await generatePageImage(
            page.content,
            page.index,
            store.outline.pages.length,
            store.outline.raw,
            store.topic,
            page.type,
            undefined,
            undefined,
            store.style || undefined,
            store.outline.visualGuide, // 传递全局视觉指南
            page.visualMetadata // 传递当前页的视觉元数据
          )
          store.updateImage(page.index, result.imageUrl)
        } catch (e: any) {
          store.updateProgress(page.index, 'error', undefined, e.message || String(e))
        }
      })
    )
  } catch (e) {
    error.value = '重试失败: ' + String(e)
  } finally {
    isRetrying.value = false
  }
}

// 生成任务是否正在运行
let isGeneratingTask = false
let generationTask: Promise<void> | null = null

// 启动生成任务（可以在组件外部调用，避免路由切换时中断）
const startGenerationTask = async () => {
  if (isGeneratingTask) {
    console.log('⚠️ 生成任务已在运行中，跳过重复启动')
    return
  }
  
  if (store.outline.pages.length === 0) {
    console.warn('没有页面数据，无法生成')
    return
  }

  // 重置完成提示相关状态（确保重新生成时能正确显示完成提示）
  showCompletionModal.value = false

  const taskStartTime = Date.now()
  const taskId = `task_${taskStartTime}_${Math.random().toString(36).substr(2, 9)}`
  console.log(`=== [${taskId}] 开始生成任务 ===`, {
    pagesCount: store.outline.pages.length,
    isHeadImageMode: store.headImageMode,
    timestamp: new Date().toISOString()
  })

  isGeneratingTask = true
  store.startGeneration()

  // 获取自定义prompt（从localStorage）
  const customImagePrompt = localStorage.getItem('CUSTOM_IMAGE_PROMPT') || undefined
  // 获取风格选择（优先从store获取，否则从localStorage）
  const selectedStyle = store.style || localStorage.getItem('TEXT_STYLE') || undefined
  
  try {
    // 确定需要生成的页面列表
    let pagesToGenerate = [...store.outline.pages];
    
    // 头图模式下：只生成单张高质量头图（优先封面页，如果没有封面页则生成第一张内容页）
    if (store.headImageMode) {
      const coverPage = pagesToGenerate.find(p => p.type === 'cover');
      pagesToGenerate = coverPage ? [coverPage] : [pagesToGenerate[0]];
      console.log(`[${taskId}] 头图模式：仅生成单张头图，页面索引: ${pagesToGenerate[0].index}`);
    }
    
    // 并发生成所有需要生成的页面，提高整体速度
    const tasks = pagesToGenerate.map(async (page) => {
      // 再次检查：如果该页已经成功生成过，则完全跳过，避免重复计费
      const existingImage = store.images.find(img => img.index === page.index)
      if (existingImage && existingImage.status === 'done' && existingImage.url) {
        console.log(`[${taskId}] 跳过已生成的页面 ${page.index + 1}`)
        return
      }

      // 先标记为生成中，防止重复调用
      store.updateProgress(page.index, 'generating')
      
      try {
        console.log(`[${taskId}] 开始生成页面 ${page.index + 1} 的图片...`, { 
          style: selectedStyle,
          styleFromStore: store.style,
          styleFromLocalStorage: localStorage.getItem('TEXT_STYLE'),
          isHeadImageMode: store.headImageMode
        })
    const result = await generatePageImage(
      page.content,
      page.index,
      store.outline.pages.length,
      store.outline.raw,
      store.topic,
      page.type,
      customImagePrompt || undefined,
      (page as any).imagePrompt || undefined, // 传递用户编辑的配图建议
      selectedStyle,
      store.outline.visualGuide, // 传递全局视觉指南
      page.visualMetadata // 传递当前页的视觉元数据
    )
    console.log(`[${taskId}] ✅ 页面 ${page.index + 1} 图片生成成功`)
    store.updateProgress(page.index, 'done', result.imageUrl)
      } catch (e: any) {
        console.error(`[${taskId}] ❌ 页面 ${page.index + 1} 图片生成失败:`, e)
        store.updateProgress(page.index, 'error', undefined, e.message || String(e))
      }
    })

    await Promise.all(tasks)
    
    const taskDuration = Date.now() - taskStartTime
    console.log(`=== [${taskId}] 生成任务完成，耗时: ${taskDuration}ms ===`)
  } finally {
    isGeneratingTask = false
    console.log(`[${taskId}] 生成任务状态已重置`)
  }
}

// 监听完成状态，自动显示完成模态框
watch(
  () => store.shouldShowCompletionModal,
  (shouldShow, oldShouldShow) => {
    console.log('🔍 [完成检测] shouldShowCompletionModal 变化:', {
      shouldShow,
      oldShouldShow,
      showModal: showCompletionModal.value,
      completionStatus: store.completionStatus,
      isAllCompleted: store.isAllCompleted,
      hasFailedImages: store.hasFailedImages,
      progressStatus: store.progress.status,
      progressTotal: store.progress.total,
      progressCurrent: store.progress.current,
      imagesCount: store.images.length,
      pagesToGenerate: store.getPagesToGenerate.length,
      imagesStatus: store.images.map(img => ({ index: img.index, status: img.status, hasUrl: !!img.url }))
    })
    
    if (shouldShow && !showCompletionModal.value) {
      console.log('=== ✅ 检测到应该显示完成提示模态框 ===', {
        completionStatus: store.completionStatus,
        isAllCompleted: store.isAllCompleted,
        hasFailedImages: store.hasFailedImages,
        progressStatus: store.progress.status
      })
      
      // 确保项目名称已设置
      if (!store.projectName) {
        store.setProjectName(store.topic)
      }
      
      // 标记生成完成（如果还没有标记）
      if (store.progress.status !== 'done') {
        const taskId = 'task_' + Date.now()
        store.finishGeneration(taskId)
        console.log('📝 已调用 finishGeneration，taskId:', taskId)
      }
      
      // 显示模态框
      showCompletionModal.value = true
      console.log('✅ 完成提示模态框已显示，showCompletionModal.value =', showCompletionModal.value)
    } else if (!shouldShow) {
      console.log('⏸️ [完成检测] 不应该显示模态框，当前状态:', {
        completionStatus: store.completionStatus,
        progressStatus: store.progress.status,
        progressTotal: store.progress.total
      })
    } else if (showCompletionModal.value) {
      console.log('ℹ️ [完成检测] 模态框已经显示，跳过')
    }
  },
  { immediate: true }
)

// 处理完成提示模态框确认
const handleCompletionConfirm = async (data: { projectName: string; projectDescription: string }) => {
  try {
    // 更新项目信息（如果项目名称为空，使用完整主题）
    const finalProjectName = data.projectName.trim() || store.topic || '未命名项目'
    store.setProjectName(finalProjectName)
    store.setProjectDescription(data.projectDescription)
    
    // 确保有recordId（如果没有则创建）
    if (!store.recordId) {
      store.recordId = uuidv4()
    }
    
    console.log('=== GenerateView: 项目信息已更新，准备跳转到结果页 ===')
    console.log('recordId:', store.recordId)
    console.log('项目名称:', data.projectName)
    
    // 关闭模态框并跳转到结果页（历史记录将在ResultView中统一保存）
    showCompletionModal.value = false
    setTimeout(() => {
      router.push('/text-result')
    }, 300)
  } catch (error) {
    console.error('更新项目信息时出错:', error)
    alert('更新失败：' + (error as Error).message)
  }
}

// 处理完成提示模态框取消
const handleCompletionCancel = () => {
  showCompletionModal.value = false
  // 取消后仍然跳转到结果页，但不保存历史记录
  setTimeout(() => {
    router.push('/text-result')
  }, 300)
}

// 历史记录保存已移至 ResultView 统一处理

// 防止重复挂载的标记
let hasMounted = false

onMounted(async () => {
  if (hasMounted) {
    console.warn('⚠️ GenerateView 组件重复挂载，跳过')
    return
  }
  
  if (store.outline.pages.length === 0) {
    router.push('/')
    return
  }

  hasMounted = true
  console.log('=== GenerateView 组件挂载 ===', {
    pagesCount: store.outline.pages.length,
    currentStatus: store.progress.status,
    imagesCount: store.images.length,
    timestamp: new Date().toISOString()
  })

  // 检查是否有卡住的生成状态（所有图片都是generating但没有实际在生成）
  const allStuck = store.images.length > 0 && 
    store.images.every(img => img.status === 'generating' && !img.url) &&
    !isGeneratingTask
  
  if (allStuck) {
    console.warn('⚠️ 检测到所有图片都处于卡住的生成状态，重置状态并重新开始生成')
    // 重置所有卡住的状态
    store.images.forEach(img => {
      if (img.status === 'generating' && !img.url) {
        store.updateProgress(img.index, 'error', undefined, '状态已重置')
      }
    })
    // 重置进度状态
    store.progress.status = 'idle'
  }

  // 检查是否是从历史记录返回的（已有recordId且状态是done，且所有图片都已完成且有URL）
  const isFromHistory = store.recordId && 
                         store.progress.status === 'done' && 
                         store.images.length > 0 && 
                         store.images.every(img => img.status === 'done' && img.url)
  
  if (isFromHistory) {
    console.log('=== 检测到从历史记录返回，不自动开始生成 ===')
    console.log('recordId:', store.recordId)
    console.log('状态:', store.progress.status)
    console.log('图片数量:', store.images.length)
    // 不自动开始生成，等待用户点击"重新生成"按钮
    return
  }

  // 如果已经在生成中，继续生成
  if (store.progress.status === 'generating' && !allStuck) {
    console.log('检测到未完成的生成任务，继续生成...')
    // 检查是否有正在生成的任务
    if (!generationTask && !isGeneratingTask) {
      generationTask = startGenerationTask()
    } else {
      console.log('已有生成任务在运行，等待完成...')
    }
  } else if (store.progress.status === 'idle' || store.images.length === 0) {
    // 新任务：从大纲进入（状态是idle或没有图片），需要初始化并开始生成
    console.log('=== 检测到新任务（从大纲进入），准备开始生成 ===')
    console.log('recordId:', store.recordId)
    console.log('状态:', store.progress.status)
    console.log('图片数量:', store.images.length)
    
    // 初始化生成状态
    store.startGeneration()
    
    // 确保没有正在运行的任务
    if (!generationTask && !isGeneratingTask) {
      generationTask = startGenerationTask()
    } else {
      console.warn('⚠️ 检测到已有任务在运行，跳过新任务启动')
    }
  } else {
    console.log('当前状态:', store.progress.status, '，不自动开始生成')
    console.log('recordId:', store.recordId)
    console.log('图片数量:', store.images.length)
  }
})
</script>

<style scoped>
.page-header {
  max-width: 1400px;
  margin: 0 auto 30px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.progress-container {
  width: 100%;
  height: 8px;
  background: var(--bg-body);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}

.error-msg {
  margin-top: 16px;
  padding: 12px;
  background: #fff5f5;
  color: #ff4d4f;
  border-radius: var(--radius-md);
}

.grid-cols-4 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.image-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.image-preview {
  aspect-ratio: 3/4;
  overflow: hidden;
  position: relative;
  flex: 1;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: all 0.2s;
}

.overlay-btn:hover {
  background: var(--primary);
  color: white;
}

.overlay-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-placeholder {
  aspect-ratio: 3/4;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  min-height: 240px;
}

.error-placeholder {
  background: #fff5f5;
}

.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.status-text {
  font-size: 13px;
  color: var(--text-sub);
}

.retry-btn {
  margin-top: 8px;
  padding: 6px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.retry-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.image-footer {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-label {
  font-size: 12px;
  color: var(--text-sub);
}

.status-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-badge.done {
  background: #E6F7ED;
  color: #52C41A;
}

.status-badge.generating,
.status-badge.retrying {
  background: #E6F4FF;
  color: #1890FF;
}

.status-badge.error {
  background: #FFF1F0;
  color: #FF4D4F;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

