<template>
  <div class="outline-container">
    <div class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">编辑大纲</h1>
        <p class="page-subtitle">调整页面顺序，修改文案，打造完美内容</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="goBack">
          上一步
        </button>
        <button class="btn btn-primary" @click="startGeneration">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
            <line x1="16" y1="8" x2="2" y2="22"></line>
            <line x1="17.5" y1="15" x2="9" y2="15"></line>
          </svg>
          开始生成图片
        </button>
      </div>
    </div>

    <div class="outline-grid">
      <div 
        v-for="(page, idx) in store.outline.pages" 
        :key="page.index"
        class="card outline-card"
        :draggable="true"
        @dragstart="onDragStart($event, idx)"
        @dragover.prevent="onDragOver($event, idx)"
        @drop="onDrop($event, idx)"
        :class="{ 'dragging-over': dragOverIndex === idx }"
      >
        <!-- 顶部栏 -->
        <div class="card-top-bar">
          <div class="page-info">
            <span class="page-number">P{{ idx + 1 }}</span>
            <span class="page-type" :class="page.type">{{ getPageTypeName(page.type) }}</span>
          </div>
          
          <div class="card-controls">
            <div class="drag-handle" title="拖拽排序">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <circle cx="9" cy="12" r="1"></circle>
                <circle cx="9" cy="5" r="1"></circle>
                <circle cx="9" cy="19" r="1"></circle>
                <circle cx="15" cy="12" r="1"></circle>
                <circle cx="15" cy="5" r="1"></circle>
                <circle cx="15" cy="19" r="1"></circle>
              </svg>
            </div>
            <button class="icon-btn" @click="deletePage(idx)" title="删除此页">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 文本编辑区域 -->
        <textarea
          v-model="page.content"
          class="textarea-paper"
          placeholder="在此输入文案..."
          @input="store.updatePage(page.index, page.content)"
        />
        
        <!-- 图片生成Prompt建议（可编辑） -->
        <div class="image-prompt-suggestion">
          <div class="prompt-suggestion-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span>配图建议</span>
          </div>
          <textarea
            v-model="page.imagePrompt"
            class="prompt-suggestion-input"
            placeholder="输入该页的配图建议，用于生成图片时的参考..."
            @input="updateImagePrompt(page.index, page.imagePrompt || '')"
            rows="2"
          ></textarea>
        </div>
        
        <div class="word-count">{{ page.content.length }} 字</div>
      </div>

      <!-- 添加按钮卡片 -->
      <div class="card add-card-dashed" @click="addPage('content')">
        <div class="add-content">
          <div class="add-icon">+</div>
          <span>添加页面</span>
        </div>
      </div>
    </div>
    
    <div style="height: 100px;"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTextGeneratorStore } from '../stores/textGenerator'

const router = useRouter()
const store = useTextGeneratorStore()

const dragOverIndex = ref<number | null>(null)
const draggedIndex = ref<number | null>(null)

const getPageTypeName = (type: string) => {
  const names = {
    cover: '封面',
    content: '内容',
    summary: '总结'
  }
  return names[type as keyof typeof names] || '内容'
}

// 更新配图建议
const updateImagePrompt = (index: number, prompt: string) => {
  const page = store.outline.pages.find(p => p.index === index)
  if (page) {
    store.updatePage(index, page.content, prompt) // 保存内容和配图建议
  }
}

// 初始化配图建议（从内容中提取）
const initImagePrompts = () => {
  store.outline.pages.forEach(page => {
    // 如果已经有 imagePrompt，说明在解析时已经提取过了，跳过
    if (page.imagePrompt) {
      return
    }
    
    // 从内容中提取配图建议（支持多种格式）
    // 格式1: 配图建议：xxx
    // 格式2: 配图建议: xxx
    // 格式3: 配图建议 xxx
    // 格式4: 图片建议：xxx
    let match = page.content.match(/配图建议[：:\s]+\s*(.+?)(?=\n\n|\n$|$)/is)
    if (!match) {
      match = page.content.match(/图片建议[：:\s]+\s*(.+?)(?=\n\n|\n$|$)/is)
    }
    if (!match) {
      match = page.content.match(/建议配图[：:\s]+\s*(.+?)(?=\n\n|\n$|$)/is)
    }
    
    if (match && match[1]) {
      const imagePrompt = match[1].trim()
      // 移除可能的换行和多余空格
      const cleanedPrompt = imagePrompt.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim()
      
      if (cleanedPrompt) {
        page.imagePrompt = cleanedPrompt
        // 从内容中移除配图建议行，避免重复显示
        page.content = page.content.replace(/配图建议[：:\s]+.+?(?=\n\n|\n$|$)/is, '').trim()
        page.content = page.content.replace(/图片建议[：:\s]+.+?(?=\n\n|\n$|$)/is, '').trim()
        page.content = page.content.replace(/建议配图[：:\s]+.+?(?=\n\n|\n$|$)/is, '').trim()
        // 清理多余的空行
        page.content = page.content.replace(/\n{3,}/g, '\n\n').trim()
        store.updatePage(page.index, page.content, page.imagePrompt)
        console.log(`页面 ${page.index + 1} 提取配图建议:`, page.imagePrompt)
      }
    }
  })
  
  // 验证提取结果
  const extractedCount = store.outline.pages.filter(p => p.imagePrompt).length
  console.log(`配图建议提取完成: ${extractedCount}/${store.outline.pages.length} 页有配图建议`)
}

onMounted(() => {
  // 初次进入大纲页时，如果内容中还包含“配图建议：”等字段，自动提取到 imagePrompt
  initImagePrompts()
})

// 拖拽逻辑
const onDragStart = (e: DragEvent, index: number) => {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.dropEffect = 'move'
  }
}

const onDragOver = (e: DragEvent, index: number) => {
  if (draggedIndex.value === index) return
  dragOverIndex.value = index
}

const onDrop = (e: DragEvent, index: number) => {
  dragOverIndex.value = null
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    store.movePage(draggedIndex.value, index)
  }
  draggedIndex.value = null
}

const deletePage = (index: number) => {
  if (confirm('确定要删除这一页吗？')) {
    store.deletePage(index)
  }
}

const addPage = (type: 'cover' | 'content') => {
  store.addPage(type, '')
  // 滚动到底部
  nextTick(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  })
}

const goBack = () => {
  router.push('/')
}

const startGeneration = () => {
  if (store.outline.pages.length === 0) {
    alert('请至少添加一页内容')
    return
  }
  // 清除之前的recordId，确保这是新任务
  store.recordId = null
  // 重置进度状态，确保从idle开始
  store.progress.status = 'idle'
  store.progress.current = 0
  // 清除之前的图片
  store.images = []
  router.push('/text-generate')
}
</script>

<style scoped>
.outline-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
  width: 100%;
  position: relative;
  z-index: 1;
}

.page-header {
  max-width: 1400px;
  margin: 0 auto var(--spacing-2xl) auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 0 var(--spacing-lg);
}

.page-header-content {
  flex: 1;
}

.page-title {
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  position: relative;
  z-index: 20;
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.btn-secondary:hover {
  background: var(--bg-body);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* 网格布局 */
.outline-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
  padding: 0 var(--spacing-lg);
}

@media (max-width: 768px) {
  .outline-grid {
    grid-template-columns: 1fr;
  }
}

.outline-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  transition: all 0.2s ease;
  border: none;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  min-height: 360px;
  position: relative;
}

.outline-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.outline-card.dragging-over {
  border: 2px dashed var(--primary);
  opacity: 0.8;
}

/* 顶部栏 */
.card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-number {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  font-family: 'Inter', sans-serif;
}

.page-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.page-type.cover {
  color: #FF4D4F;
  background: #FFF1F0;
}

.page-type.content {
  color: var(--text-sub);
  background: var(--bg-body);
}

.card-controls {
  display: flex;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.outline-card:hover .card-controls {
  opacity: 1;
}

.drag-handle {
  cursor: grab;
  padding: 2px;
}

.drag-handle:active {
  cursor: grabbing;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-sub);
  padding: 2px;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: var(--primary);
}

/* 文本区域 */
.textarea-paper {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-main);
  resize: none;
  font-family: inherit;
  margin-bottom: 10px;
}

.textarea-paper:focus {
  outline: none;
}

.image-prompt-suggestion {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--primary-fade);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
}

.prompt-suggestion-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 6px;
}

.prompt-suggestion-content {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.5;
}

.prompt-suggestion-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
  color: var(--text-sub);
  background: var(--bg-card);
  resize: vertical;
  min-height: 50px;
  line-height: 1.5;
  transition: all 0.2s;
}

.prompt-suggestion-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-fade);
}

.prompt-suggestion-input::placeholder {
  color: var(--text-placeholder);
}

.word-count {
  text-align: right;
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: auto;
}

/* 添加卡片 */
.add-card-dashed {
  border: 2px dashed var(--border-color);
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  min-height: 360px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.add-card-dashed:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-fade);
}

.add-content {
  text-align: center;
}

.add-icon {
  font-size: 32px;
  font-weight: 300;
  margin-bottom: 8px;
}
</style>

