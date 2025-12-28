<template>
  <div class="space-design-view">
    <!-- 标题和进度区域 -->
    <div class="header-section">
      <div class="header-actions-top">
        <button class="btn-back" @click="$router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
      </div>
      <h1 class="main-title">空间设计</h1>
      <p class="subtitle">上传图片，AI智能设计装修空间</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="content-inner">
        <!-- 左侧：上传和配置 -->
        <div class="left-panel">
          <!-- 上传区域 -->
          <div
            class="upload-area"
            @click="fileInputRef?.click()"
            :class="{ 'has-file': selectedFile, 'disabled': isGenerating }"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
            />
            <svg v-if="!selectedFile" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <img v-if="selectedFile" :src="previewUrl" class="preview-image" />
            <p v-if="!selectedFile">点击上传参考图片</p>
            <p v-if="selectedFile" class="file-name">{{ selectedFile.name }}</p>
          </div>

          <!-- 风格选择 -->
          <div class="style-selector">
            <label>装修风格</label>
            <select v-model="selectedStyle" :disabled="isGenerating" class="style-select">
              <option v-for="style in stylePresets" :key="style.value" :value="style.value">
                {{ style.label }}
              </option>
            </select>
          </div>

          <!-- 自定义提示词 -->
          <div class="custom-prompt">
            <label>自定义需求（可选）</label>
            <textarea
              v-model="customPrompt"
              placeholder="例如：增加绿植装饰、调整灯光效果等"
              rows="3"
              :disabled="isGenerating"
              class="prompt-textarea"
            ></textarea>
          </div>

          <!-- 批量生成设置 -->
          <div class="batch-settings">
            <label>
              <input
                type="checkbox"
                v-model="enableBatch"
                :disabled="isGenerating"
              />
              批量生成
            </label>
            <input
              v-if="enableBatch"
              type="number"
              v-model.number="batchCount"
              min="1"
              max="5"
              :disabled="isGenerating"
              class="batch-input"
            />
            <span v-if="enableBatch" class="batch-hint">生成 {{ batchCount }} 张效果图</span>
          </div>

          <!-- 生成按钮 -->
          <button
            class="generate-btn"
            @click="handleGenerate"
            :disabled="!selectedFile || isGenerating"
          >
            <span v-if="isGenerating">生成中...</span>
            <span v-else>开始生成</span>
          </button>

          <!-- 清空按钮 -->
          <button
            v-if="generatedImages.length > 0 && !isGenerating"
            @click="clearAll"
            class="clear-btn"
          >
            清空结果
          </button>
        </div>

        <!-- 右侧：结果显示 -->
        <div class="right-panel">
          <div v-if="generatedImages.length === 0" class="empty-state">
            <div class="empty-icon">🏠</div>
            <h3>欢迎使用空间设计</h3>
            <p>在左侧上传图片并选择风格开始设计</p>
          </div>

          <div v-else class="results-grid">
            <div
              v-for="image in generatedImages"
              :key="image.id"
              class="result-card"
            >
              <img :src="image.url" :alt="image.prompt" class="result-image" />
              <div class="result-info">
                <p class="result-prompt">{{ image.prompt }}</p>
                <div class="result-actions">
                  <button @click="downloadImage(image.url, `空间设计_${image.id}.png`)" class="action-btn">
                    下载
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { generateImageWithAdapter } from '../services/image/imageApiAdapter'
import { buildImagePrompt, getAllStylePresets, type StylePreset } from '../config/imageStylePresets'
import { validateImage, downloadImage as downloadImageUtil } from '../utils/image'
import { useToast } from '../composables/useToast'
import { logger } from '../composables/useLogger'

const router = useRouter()
const toast = useToast()

// 状态
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedStyle = ref<string>('modern-minimalist')
const customPrompt = ref<string>('')
const enableBatch = ref(false)
const batchCount = ref(2)
const isGenerating = ref(false)
const generatedImages = ref<Array<{
  id: string
  url: string
  prompt: string
  timestamp: number
}>>([])

// 风格预设
const stylePresets = computed(() => getAllStylePresets())

// 处理文件选择
const handleFileSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 验证图片
  const validation = validateImage(file, 20)
  if (!validation.valid) {
    toast.error(validation.error || '图片验证失败')
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 处理生成
const handleGenerate = async () => {
  if (!selectedFile.value) {
    toast.error('请先上传图片')
    return
  }

  const mockMode = localStorage.getItem('MOCK_MODE') === 'true'
  if (!mockMode) {
    const googleKey = localStorage.getItem('GOOGLE_API_KEY')
    if (!googleKey) {
      toast.error('请先在"系统设置"中配置 Google GenAI API Key')
      return
    }
  }

  isGenerating.value = true
  const imagesToGenerate = enableBatch.value ? batchCount.value : 1

  try {
    // 构建提示词
    const stylePreset = stylePresets.value.find(s => s.value === selectedStyle.value)
    const basePrompt = '根据参考图片生成家居装修效果图'
    const prompt = buildImagePrompt(
      basePrompt,
      selectedStyle.value,
      customPrompt.value || undefined
    )

    logger.debug('开始生成空间设计图片', {
      style: selectedStyle.value,
      styleLabel: stylePreset?.label,
      customPrompt: customPrompt.value,
      batchCount: imagesToGenerate,
      prompt
    })

    // 批量生成
    const newImages: typeof generatedImages.value = []
    for (let i = 0; i < imagesToGenerate; i++) {
      try {
        const result = await generateImageWithAdapter(selectedFile.value!, prompt)
        
        newImages.push({
          id: `img_${Date.now()}_${i}`,
          url: result.imageUrl,
          prompt: `${stylePreset?.label || selectedStyle.value}${customPrompt.value ? ' - ' + customPrompt.value : ''}`,
          timestamp: Date.now()
        })

        toast.success(`第 ${i + 1} 张图片生成成功`)
      } catch (error: any) {
        logger.error(`第 ${i + 1} 张图片生成失败`, error)
        toast.error(`第 ${i + 1} 张图片生成失败: ${error.message}`)
      }
    }

    generatedImages.value = [...generatedImages.value, ...newImages]
    
    if (newImages.length > 0) {
      toast.success(`成功生成 ${newImages.length} 张效果图`)
    }
  } catch (error: any) {
    logger.error('空间设计生成失败', error)
    toast.error(`生成失败: ${error.message}`)
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = (imageUrl: string, filename: string) => {
  downloadImageUtil(imageUrl, filename)
  toast.success('图片下载已开始')
}

// 清空所有
const clearAll = () => {
  // 清理预览 URL
  if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  
  selectedFile.value = null
  previewUrl.value = ''
  generatedImages.value = []
  
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<style scoped>
.space-design-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: var(--spacing-2xl) var(--spacing-lg);
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

.header-section {
  margin-top: var(--spacing-3xl);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  padding: 0 var(--spacing-lg);
  position: relative;
}

.header-actions-top {
  position: absolute;
  top: 0;
  left: var(--spacing-lg);
  z-index: 10;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  font-size: var(--font-sm);
}

.btn-back:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
}

.main-title {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: var(--font-base);
  color: var(--text-sub);
}

.content-wrapper {
  flex: 1;
  overflow: auto;
}

.content-inner {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--spacing-2xl);
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

@media (max-width: 1024px) {
  .content-inner {
    grid-template-columns: 1fr;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: sticky;
  top: var(--spacing-xl);
  align-self: start;
  max-height: calc(100vh - var(--spacing-3xl));
  overflow-y: auto;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  text-align: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  background: var(--bg-card);
  min-height: 200px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.upload-area:hover:not(.disabled) {
  border-color: var(--primary);
  background: var(--bg-card-hover);
}

.upload-area.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-area.has-file {
  padding: var(--spacing-md);
  min-height: auto;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.file-name {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin-top: var(--spacing-sm);
}

.style-selector,
.custom-prompt,
.batch-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.style-selector label,
.custom-prompt label,
.batch-settings label {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.style-select {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: var(--font-sm);
  cursor: pointer;
}

.style-select:focus {
  outline: none;
  border-color: var(--primary);
}

.prompt-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: var(--font-sm);
  resize: vertical;
  font-family: inherit;
}

.prompt-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.batch-settings {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-md);
}

.batch-input {
  width: 60px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: var(--font-sm);
}

.batch-hint {
  font-size: var(--font-xs);
  color: var(--text-sub);
}

.generate-btn {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.clear-btn:hover {
  background: var(--bg-card-hover);
  border-color: var(--primary);
}

.right-panel {
  display: flex;
  flex-direction: column;
}

.empty-state {
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
}

.empty-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--text-sub);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.result-image {
  width: 100%;
  height: auto;
  display: block;
}

.result-info {
  padding: var(--spacing-md);
}

.result-prompt {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin-bottom: var(--spacing-sm);
}

.result-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-xs);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.action-btn:hover {
  background: var(--primary-hover);
}
</style>

