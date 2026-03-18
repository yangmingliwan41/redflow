<template>
  <div v-if="visible && item" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>创作详情</h2>
        <button class="close-btn" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <!-- 图生图模式详情 -->
        <div v-if="item.mode === 'IMAGE_TO_IMAGE' || (!item.mode && item.analysis)" class="image-to-image-detail">
          <!-- 图片对比区域 -->
          <div class="image-comparison-section">
            <div class="image-tabs">
              <button
                :class="['tab-btn', { active: activeTab === 'original' }]"
                @click="activeTab = 'original'"
              >
                原图
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'generated' }]"
                @click="activeTab = 'generated'"
                :disabled="!item.generatedImageUrl"
              >
                AI生成图
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'compare' }]"
                @click="activeTab = 'compare'"
                :disabled="!item.generatedImageUrl"
              >
                对比
              </button>
            </div>

            <div class="image-display">
              <!-- 原图 -->
              <div v-if="activeTab === 'original'" class="image-view">
                <img :src="item.originalImageUrl" alt="原图" />
              </div>

              <!-- 生成图 -->
              <div v-if="activeTab === 'generated' && item.generatedImageUrl" class="image-view">
                <img :src="item.generatedImageUrl" alt="AI生成图" />
              </div>

              <!-- 对比 -->
              <div v-if="activeTab === 'compare' && item.generatedImageUrl" class="image-compare">
                <div class="compare-slider-container">
                  <div class="compare-image-wrapper">
                    <img :src="item.originalImageUrl" alt="原图" class="compare-image original" />
                    <img :src="item.generatedImageUrl" alt="生成图" class="compare-image generated" :style="{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }" />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    v-model.number="sliderPosition"
                    class="compare-slider"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 产品分析信息 -->
          <div v-if="item.analysis" class="info-section">
            <h3>产品分析</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>产品名称</label>
                <p>{{ item.analysis.name }}</p>
              </div>
              <div class="info-item">
                <label>产品类别</label>
                <p>{{ item.analysis.category }}</p>
              </div>
              <div class="info-item">
                <label>颜色</label>
                <p>{{ item.analysis.colors.join(', ') }}</p>
              </div>
              <div class="info-item">
                <label>材质</label>
                <p>{{ item.analysis.materials.join(', ') }}</p>
              </div>
              <div class="info-item full-width">
                <label>特征</label>
                <p>{{ item.analysis.features.join(', ') }}</p>
              </div>
            </div>
          </div>

          <!-- 营销文案 -->
          <div v-if="item.marketingCopy" class="info-section">
            <h3>营销文案</h3>
            <div class="markdown-content" v-html="renderMarkdown(item.marketingCopy)"></div>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="copyText(item.marketingCopy)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制文案
              </button>
            </div>
          </div>

          <!-- Token 使用量 -->
          <div v-if="item.tokenUsage" class="info-section">
            <h3>Token 使用量</h3>
            <div class="token-usage">
              <div class="token-item">
                <span>Prompt Tokens:</span>
                <strong>{{ item.tokenUsage.promptTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Completion Tokens:</span>
                <strong>{{ item.tokenUsage.candidatesTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Total Tokens:</span>
                <strong>{{ item.tokenUsage.totalTokens }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 提示词生成图片模式详情 -->
        <div v-else-if="item.mode === 'PROMPT_TO_IMAGE'" class="prompt-to-image-detail">
          <!-- 项目信息 -->
          <div class="info-section">
            <h3>项目信息</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <label>项目名称</label>
                <p>{{ item.projectName || '提示词生成图片' }}</p>
              </div>
              <div v-if="item.projectDescription" class="info-item full-width">
                <label>项目简介</label>
                <p>{{ item.projectDescription }}</p>
              </div>
              <div v-if="item.promptTheme" class="info-item">
                <label>主题</label>
                <p>{{ item.promptTheme }}</p>
              </div>
              <div v-if="item.promptTemplateId" class="info-item">
                <label>使用模板</label>
                <p>{{ item.promptTemplateId }}</p>
              </div>
            </div>
          </div>

          <!-- 生成的图片 -->
          <div v-if="item.generatedImageUrl" class="info-section">
            <h3>生成的图片</h3>
            <div class="image-display">
              <div class="image-view">
                <img :src="item.generatedImageUrl" alt="生成的图片" />
              </div>
            </div>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="viewPageImage(item.generatedImageUrl)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                查看大图
              </button>
            </div>
          </div>

          <!-- 提示词信息 -->
          <div v-if="item.imagePrompt" class="info-section">
            <h3>使用的提示词</h3>
            <div class="markdown-content" style="font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 13px;">
              {{ item.imagePrompt }}
            </div>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="copyText(item.imagePrompt)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制提示词
              </button>
            </div>
          </div>

          <!-- Token 使用量 -->
          <div v-if="item.tokenUsage" class="info-section">
            <h3>Token 使用量</h3>
            <div class="token-usage">
              <div class="token-item">
                <span>Prompt Tokens:</span>
                <strong>{{ item.tokenUsage.promptTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Completion Tokens:</span>
                <strong>{{ item.tokenUsage.candidatesTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Total Tokens:</span>
                <strong>{{ item.tokenUsage.totalTokens }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 文本生成图文模式详情 -->
        <div v-else-if="item.mode === 'TEXT_TO_IMAGE' || item.topic" class="text-to-image-detail">
          <!-- 项目信息 -->
          <div class="info-section">
            <h3>项目信息</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <label>项目名称</label>
                <p>{{ item.projectName || item.topic || '未命名项目' }}</p>
              </div>
              <div v-if="item.projectDescription" class="info-item full-width">
                <label>项目简介</label>
                <p>{{ item.projectDescription }}</p>
              </div>
              <div class="info-item">
                <label>主题</label>
                <p>{{ item.topic }}</p>
              </div>
              <div class="info-item">
                <label>页数</label>
                <p>{{ item.pages?.length || 0 }} 页</p>
              </div>
            </div>
          </div>

          <!-- 文案内容 -->
          <div v-if="item.contentCopy" class="info-section">
            <h3>文案内容</h3>
            <div class="markdown-content" style="white-space: pre-wrap; line-height: 1.8;">{{ item.contentCopy }}</div>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="copyText(item.contentCopy || '')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制文案
              </button>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="item.pages && item.pages.length > 0" class="pages-section">
            <h3>生成页面 ({{ item.pages.length }} 页)</h3>
            <div class="pages-grid">
              <div
                v-for="page in item.pages"
                :key="page.index"
                class="page-card"
                @click="viewPageImage(page.imageUrl)"
              >
                <div v-if="page.imageUrl" class="page-image">
                  <img :src="page.imageUrl" :alt="page.title" />
                </div>
                <div v-else class="page-image placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <div class="page-info">
                  <h4>{{ page.title }}</h4>
                  <p class="page-content-preview">{{ page.content.substring(0, 50) }}...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Token 使用量 -->
          <div v-if="item.tokenUsage" class="info-section">
            <h3>Token 使用量</h3>
            <div class="token-usage">
              <div class="token-item">
                <span>Prompt Tokens:</span>
                <strong>{{ item.tokenUsage.promptTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Completion Tokens:</span>
                <strong>{{ item.tokenUsage.candidatesTokens }}</strong>
              </div>
              <div class="token-item">
                <span>Total Tokens:</span>
                <strong>{{ item.tokenUsage.totalTokens }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">关闭</button>
        <button v-if="item.mode === 'TEXT_TO_IMAGE' || item.topic" class="btn btn-primary" @click="viewInResult">
          查看完整结果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GeneratedResult } from '../types'
import { useTextGeneratorStore } from '../stores/textGenerator'

const props = defineProps<{
  visible: boolean
  item: GeneratedResult | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const textStore = useTextGeneratorStore()

const activeTab = ref<'original' | 'generated' | 'compare'>('original')
const sliderPosition = ref(50)

const close = () => {
  emit('close')
}

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('文案已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}

const renderMarkdown = (text: string): string => {
  // 简单的 Markdown 渲染
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/#{3}\s(.+?)$/gm, '<h3>$1</h3>')
    .replace(/#{2}\s(.+?)$/gm, '<h2>$1</h2>')
    .replace(/#{1}\s(.+?)$/gm, '<h1>$1</h1>')
    .replace(/\n/g, '<br>')
}

const viewPageImage = (url?: string) => {
  if (url) {
    window.open(url, '_blank')
  }
}

const viewInResult = async () => {
  if (!props.item) return
  
  // 恢复数据到store
  if (props.item.topic && props.item.pages) {
    textStore.setTopic(props.item.topic)
    textStore.setProjectName(props.item.projectName || '')
    textStore.setProjectDescription(props.item.projectDescription || '')
    
    // 恢复文案内容
    if (props.item.contentCopy) {
      textStore.setContentCopy(props.item.contentCopy)
    } else {
      // 如果没有保存的文案，清除当前文案
      textStore.clearContentCopy()
    }
    
    textStore.setOutline(props.item.outline || '', props.item.pages.map(p => ({
      index: p.index,
      type: p.title === '封面' ? 'cover' : 'content',
      content: p.content,
      imageUrl: p.imageUrl
    })))
    
    // 恢复图片数据
    if (props.item.pages && props.item.pages.length > 0) {
      textStore.images = props.item.pages.map((page) => ({
        index: page.index,
        url: page.imageUrl || '',
        status: page.imageUrl ? 'done' : 'error'
      }))
      textStore.progress = {
        current: props.item.pages.filter(p => p.imageUrl).length,
        total: props.item.pages.length,
        status: 'done'
      }
      textStore.stage = 'result'
      textStore.recordId = props.item.id
    }
    
    close()
    router.push('/text-result')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1050);
  padding: var(--spacing-lg);
  overflow-y: auto;
  /* 确保内容可以滚动查看 */
  min-height: 100vh;
  /* 考虑 feature-nav 的宽度，在剩余空间中居中 */
  /* 左侧留白：sidebar(280px) + feature-nav(300px) + 间距，确保模态框在右侧区域居中 */
  padding-left: calc(280px + 300px + var(--spacing-lg));
  padding-right: var(--spacing-lg);
  /* 确保在剩余空间中居中 */
  justify-content: center;
}

.modal-container {
  background: white;
  border-radius: var(--radius-xl);
  max-width: 1400px;
  max-height: calc(100vh - 2 * var(--spacing-lg));
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: calc(var(--z-modal, 1050) + 1);
  /* 确保在 flexbox 中水平和垂直居中 */
  margin: auto;
  /* 确保内容可以完整查看 */
  overflow: hidden;
}

/* 当没有 feature-nav 时，恢复完全居中 */
@media (max-width: 1024px) {
  .modal-overlay {
    padding-left: calc(var(--sidebar-width, 280px) + var(--spacing-lg));
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main, #111827);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--text-sub, #6b7280);
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-main, #111827);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-xl);
  min-height: 0; /* 确保 flex 子元素可以缩小 */
  /* 确保内容可以完整滚动查看 */
  -webkit-overflow-scrolling: touch;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 10;
  flex-shrink: 0;
  margin-top: auto; /* 确保 footer 在底部 */
}

/* 图片对比区域 */
.image-comparison-section {
  margin-bottom: 32px;
}

.image-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--border-color, #e5e7eb);
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-sub, #6b7280);
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-btn:hover:not(:disabled) {
  color: var(--primary, #ef4444);
}

.tab-btn.active {
  color: var(--primary, #ef4444);
  border-bottom-color: var(--primary, #ef4444);
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-display {
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-body, #f9fafb);
}

.image-view {
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-body, #f9fafb);
}

.image-view img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-compare {
  position: relative;
  aspect-ratio: 3/4;
}

.compare-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.compare-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.compare-image.generated {
  clip-path: inset(0 50% 0 0);
}

.compare-slider-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.compare-slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 10;
}

/* 信息区域 */
.info-section {
  margin-bottom: 32px;
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-main, #111827);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  padding: 12px;
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub, #6b7280);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item p {
  margin: 0;
  font-size: 14px;
  color: var(--text-main, #111827);
  line-height: 1.5;
}

/* 营销文案 */
.markdown-content {
  padding: 16px;
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
  line-height: 1.8;
  color: var(--text-main, #111827);
  white-space: pre-wrap;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.action-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

/* Token 使用量 */
.token-usage {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
}

.token-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.token-item span {
  font-size: 12px;
  color: var(--text-sub, #6b7280);
}

.token-item strong {
  font-size: 18px;
  color: var(--primary, #ef4444);
}

/* 页面网格 */
.pages-section {
  margin-bottom: 32px;
}

.pages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 768px) {
  .pages-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.page-card {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.page-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.page-image {
  aspect-ratio: 3/4;
  background: var(--bg-body, #f9fafb);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.page-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.page-image.placeholder {
  color: var(--text-sub, #6b7280);
}

.page-info {
  padding: 12px;
}

.page-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main, #111827);
}

.page-content-preview {
  margin: 0;
  font-size: 12px;
  color: var(--text-sub, #6b7280);
  line-height: 1.4;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary {
  background: var(--bg-body, #f9fafb);
  color: var(--text-main, #111827);
  border: 1px solid var(--border-color, #e5e7eb);
}

.btn-secondary:hover {
  background: var(--border-color, #e5e7eb);
}

.btn-primary {
  background: var(--primary, #ef4444);
  color: white;
}

.btn-primary:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
</style>





