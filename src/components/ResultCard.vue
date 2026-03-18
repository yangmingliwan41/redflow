<template>
  <!-- 错误状态 -->
  <div v-if="result.status === ProcessingStatus.ERROR" class="result-card error-state">
    <p class="error-message">{{ result.error || '发生未知错误' }}</p>
    <button @click="onRetry" class="retry-btn">
      重试
    </button>
  </div>

  <!-- 空闲状态 -->
  <div v-else-if="result.status === ProcessingStatus.IDLE" class="result-card idle-state">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
    <p>AI 魔法准备就绪，等待指令...</p>
  </div>

  <!-- 正常结果展示 -->
  <div v-else class="result-card normal-state">
    <!-- 左侧：图片区域 -->
    <div class="image-section">
      <div class="image-tabs">
        <div class="tab-buttons">
          <button
            @click="activeTab = 'original'"
            :class="['tab-btn', { active: activeTab === 'original' }]"
          >
            原图
          </button>
          <button
            @click="activeTab = 'generated'"
            :disabled="!result.generatedImageUrl && !isLoading"
            :class="['tab-btn', { active: activeTab === 'generated' }]"
          >
            AI生成图
          </button>
          <button
            @click="activeTab = 'compare'"
            :disabled="!result.generatedImageUrl"
            :class="['tab-btn', { active: activeTab === 'compare' }]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            对比
          </button>
        </div>

        <button
          v-if="canRegenerate"
          @click="onRegenerateImage"
          title="使用当前配置重新生成图片"
          class="regenerate-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重绘
        </button>
      </div>

      <div class="image-container">
        <!-- 原图 -->
        <div v-if="activeTab === 'original'" class="image-view">
          <img :src="result.originalImageUrl" alt="Original" class="result-image" />
        </div>

        <!-- AI生成图 -->
        <div v-else-if="activeTab === 'generated'" class="image-view">
          <div v-if="isLoading && !result.generatedImageUrl" class="loading-state">
            <div class="spinner"></div>
            <p>正在绘制创意图片...</p>
          </div>
          <img
            v-else-if="result.generatedImageUrl"
            :src="result.generatedImageUrl"
            alt="Generated"
            class="result-image fade-in"
          />
          <div v-else class="empty-state">
            <p>未选择生成图片模式</p>
            <button @click="activeTab = 'original'" class="link-btn">查看原图</button>
          </div>
        </div>

        <!-- 对比模式 -->
        <div
          v-else-if="activeTab === 'compare' && result.generatedImageUrl"
          class="compare-view"
          ref="compareContainerRef"
          @mousemove="handleMouseMove"
          @touchmove="handleTouchMove"
          @mousedown="handleMouseDown"
          @touchstart="handleMouseDown"
        >
          <!-- 背景图：原图或上一次生成的图 -->
          <img
            :src="compareBase === 'original' ? result.originalImageUrl : (result.previousGeneratedImageUrl || result.originalImageUrl)"
            alt="Background Base"
            class="compare-bg"
          />

          <!-- 前景图：新生成的图（裁剪显示） -->
          <div
            class="compare-fg"
            :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }"
          >
            <img
              :src="result.generatedImageUrl"
              alt="Generated"
              class="compare-fg-img"
              @error="handleImageError"
            />
          </div>

          <!-- 滑块控制 -->
          <div
            class="compare-slider"
            :style="{ left: `${sliderPosition}%` }"
          >
            <div class="slider-handle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>

          <!-- 对比基准切换（如果有上一次生成的图） -->
          <div v-if="result.previousGeneratedImageUrl" class="compare-toggles">
            <button
              @click.stop="compareBase = 'original'"
              :class="['compare-toggle', { active: compareBase === 'original' }]"
            >
              原图
            </button>
            <button
              @click.stop="compareBase = 'previous'"
              :class="['compare-toggle', { active: compareBase === 'previous' }]"
            >
              上一次
            </button>
          </div>

          <!-- 标签 -->
          <div class="compare-label left">新风格</div>
          <div class="compare-label right">
            {{ compareBase === 'original' ? '原图' : '旧图' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：文案区域 -->
    <div class="content-section">
      <div class="content-header">
        <h3 class="content-title">
          <span class="title-indicator"></span>
          文案生成结果
        </h3>
        <div class="content-badges">
          <span v-if="result.tokenUsage" class="token-badge" :title="`消耗 ${result.tokenUsage.totalTokens} tokens`">
            🪙 {{ result.tokenUsage.totalTokens }} Tokens
          </span>
          <span v-if="result.analysis" class="category-badge">
            {{ result.analysis.category }}
          </span>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading && !result.marketingCopy" class="content-loading">
        <div class="skeleton-line" style="width: 75%"></div>
        <div class="skeleton-line" style="width: 50%"></div>
        <div class="skeleton-line" style="width: 100%; height: 80px; margin-top: 16px"></div>
        <div class="skeleton-line" style="width: 66%"></div>
      </div>

      <!-- 文案内容（Markdown渲染） -->
      <div v-else class="content-body">
        <div
          v-html="renderedCopy"
          class="markdown-content"
        />
      </div>

      <!-- 操作按钮 -->
      <div v-if="result.status === ProcessingStatus.COMPLETED" class="content-actions">
        <button @click="onRetry" class="action-btn" title="使用当前配置重新生成文案和图片">
          🔄 重新生成
        </button>
        <button @click="copyToClipboard" class="action-btn">
          📋 复制文案
        </button>
        <a
          v-if="result.generatedImageUrl"
          :href="result.generatedImageUrl"
          :download="`smartpost_${result.id}.png`"
          class="action-btn primary"
        >
          ⬇️ 下载图片
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import { GeneratedResult, ProcessingStatus } from '../types'

interface Props {
  result: GeneratedResult
  onRetry: () => void
  onRegenerateImage: () => void
}

const props = defineProps<Props>()

const activeTab = ref<'original' | 'generated' | 'compare'>('generated')
const sliderPosition = ref(50)
const compareBase = ref<'original' | 'previous'>('original')
const compareContainerRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)

const isLoading = computed(() => props.result.status !== ProcessingStatus.COMPLETED)
const canRegenerate = computed(() => props.result.status === ProcessingStatus.COMPLETED)

// Markdown渲染
const renderedCopy = computed(() => {
  if (!props.result.marketingCopy) return ''
  return marked.parse(props.result.marketingCopy)
})

// 监听生成图片状态，自动切换到生成图标签
watch(
  () => [props.result.generatedImageUrl, props.result.status],
  ([imageUrl, status]) => {
    if (!imageUrl && (activeTab.value === 'generated' || activeTab.value === 'compare')) {
      activeTab.value = 'original'
    } else if (imageUrl && status === ProcessingStatus.COMPLETED && activeTab.value === 'original') {
      activeTab.value = 'generated'
    }
  }
)

// 监听上一次生成的图片，自动切换对比基准
watch(
  () => props.result.previousGeneratedImageUrl,
  (prevUrl) => {
    if (prevUrl && activeTab.value === 'compare') {
      compareBase.value = 'previous'
    }
  }
)

// 对比模式拖拽
const handleMouseDown = () => {
  isDragging.value = true
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleMove = (clientX: number) => {
  if (!isDragging.value || !compareContainerRef.value) return
  const rect = compareContainerRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
  const percentage = (x / rect.width) * 100
  sliderPosition.value = percentage
}

const handleMouseMove = (e: MouseEvent) => {
  handleMove(e.clientX)
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches[0]) {
    handleMove(e.touches[0].clientX)
  }
}

// 全局鼠标释放监听
onMounted(() => {
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('touchend', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('touchend', handleMouseUp)
})

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  console.error('Failed to load generated image:', props.result.generatedImageUrl)
  if (img.crossOrigin) {
    img.crossOrigin = null
    img.src = img.src // 重新加载
  }
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!props.result.marketingCopy) return
  try {
    await navigator.clipboard.writeText(props.result.marketingCopy)
    // 可以添加成功提示
    console.log('文案已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.result-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

@media (min-width: 1024px) {
  .result-card.normal-state {
    flex-direction: row;
  }
}

/* 错误状态 */
.error-state {
  padding: 48px;
  text-align: center;
  background: #fef2f2;
  border-color: #fecaca;
}

.error-message {
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #fca5a5;
  color: #dc2626;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #fee2e2;
}

/* 空闲状态 */
.idle-state {
  padding: 48px;
  text-align: center;
  background: var(--bg-body);
  border: 2px dashed var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.idle-state svg {
  opacity: 0.5;
  margin-bottom: 16px;
}

/* 图片区域 */
.image-section {
  background: var(--bg-body);
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

@media (min-width: 1024px) {
  .image-section {
    width: 50%;
  }
}

.image-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tab-buttons {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tab-btn:hover:not(:disabled) {
  background: var(--bg-body);
}

.tab-btn.active {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.regenerate-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  color: var(--primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.regenerate-btn:hover {
  background: var(--primary-fade);
}

.image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: white;
  min-height: 300px;
  position: relative;
}

.image-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.fade-in {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #dbeafe;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 24px;
}

.link-btn {
  color: var(--primary);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

/* 对比模式 */
.compare-view {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  overflow: hidden;
}

.compare-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.compare-fg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.compare-fg-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.compare-slider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: white;
  cursor: ew-resize;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-handle {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  margin-left: -15px;
}

.compare-toggles {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 999px;
  padding: 4px;
  display: flex;
  gap: 4px;
  z-index: 30;
}

.compare-toggle {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.compare-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.compare-toggle.active {
  background: white;
  color: black;
  font-weight: 700;
}

.compare-label {
  position: absolute;
  top: 16px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  pointer-events: none;
}

.compare-label.left {
  left: 16px;
}

.compare-label.right {
  right: 16px;
}

/* 文案区域 */
.content-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 800px;
}

@media (min-width: 1024px) {
  .content-section {
    width: 50%;
    border-left: 1px solid var(--border-color);
  }
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-title {
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.title-indicator {
  width: 4px;
  height: 24px;
  background: #22c55e;
  border-radius: 2px;
}

.content-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.token-badge {
  font-size: 10px;
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 4px;
}

.category-badge {
  font-size: 12px;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
}

.content-loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.skeleton-line {
  height: 16px;
  background: var(--bg-body);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.content-body {
  flex: 1;
}

.markdown-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: var(--text-main);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: var(--text-main);
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-content :deep(p) {
  color: var(--text-sub);
  margin-bottom: 12px;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 20px;
  margin-bottom: 12px;
}

.markdown-content :deep(li) {
  margin-bottom: 4px;
  color: var(--text-sub);
}

.content-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.action-btn:hover {
  background: var(--border-hover);
}

.action-btn.primary {
  background: var(--primary-fade);
  color: var(--primary);
  border-color: var(--primary);
}

.action-btn.primary:hover {
  background: var(--primary-light);
}
</style>





