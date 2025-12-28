<template>
  <PageContainer size="xl" class="prompt-generate-container">

    <!-- 输入面板 -->
    <Card class="input-panel">
      <div class="input-header">
        <h3>生成配置</h3>
      </div>

      <!-- 风格选择 -->
      <div class="form-group">
        <label>选择风格模板</label>
        <select
          v-model="selectedTemplateId"
          :disabled="isGenerating"
          class="template-select"
        >
          <option
            v-for="template in availableTemplates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }} - {{ template.description }}
          </option>
        </select>
      </div>

      <!-- 输入模式切换 -->
      <div class="form-group">
        <label>输入模式</label>
        <div class="input-mode-toggle">
          <button
            :class="['mode-toggle-btn', { active: inputMode === 'theme' }]"
            @click="inputMode = 'theme'"
            :disabled="isGenerating"
          >
            主题输入
          </button>
          <button
            :class="['mode-toggle-btn', { active: inputMode === 'prompt' }]"
            @click="inputMode = 'prompt'"
            :disabled="isGenerating"
          >
            直接提示词
          </button>
        </div>
        <p class="mode-hint">
          {{ inputMode === 'theme' 
            ? '输入主题，系统将根据模板自动生成图片提示词' 
            : '直接输入图片生成提示词（英文）' }}
        </p>
      </div>

      <!-- 批量输入区域 -->
      <div class="form-group">
        <label>
          批量输入（每行一个{{ inputMode === 'theme' ? '主题' : '提示词' }}）
          <span class="count-hint">最多 {{ maxCount }} 个，确保成本可控</span>
        </label>
        <textarea
          v-model="inputText"
          :placeholder="inputMode === 'theme' 
            ? '例如：\n指环王：护戒使者\n星际穿越\n蝙蝠侠：黑暗骑士' 
            : '例如：\nA stylized 3D diorama poster, isometric view...\nAnother prompt here...'"
          class="batch-input"
          rows="8"
          :disabled="isGenerating"
        ></textarea>
        <p class="input-count">
          当前输入：{{ inputItems.length }} / {{ maxCount }} 个
        </p>
      </div>

      <!-- 生成按钮 -->
      <div class="action-group">
        <Button
          variant="primary"
          :loading="isGenerating"
          :disabled="!canGenerate"
          @click="handleGenerate"
        >
          {{ isGenerating ? '生成中...' : `开始生成 (${inputItems.length}个)` }}
        </Button>
      </div>
    </Card>

    <!-- 进度展示 -->
    <Card v-if="isGenerating || results.length > 0" class="progress-panel">
      <div class="progress-header">
        <h3>生成进度</h3>
        <span class="progress-text">
          {{ isGenerating 
            ? `进行中: ${completedCount} / ${totalCount}` 
            : `已完成: ${completedCount} / ${totalCount}` }}
        </span>
      </div>
      <Progress
        v-if="totalCount > 0"
        label=""
        :percentage="progressPercent"
        show-percentage
      />
    </Card>

    <!-- 风格示例展示 - 已隐藏（提示词生图不需要风格示例） -->
    <!-- <div class="style-examples-section">
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
    </div> -->

    <!-- 结果展示 -->
    <div v-if="results.length > 0" class="results-section">
      <h3 class="results-title">生成结果</h3>
      <div class="results-grid">
        <div
          v-for="(result, index) in results"
          :key="result.id"
          class="result-card"
        >
          <div class="result-header">
            <span class="result-index">#{{ index + 1 }}</span>
            <span class="result-theme">{{ result.theme || result.prompt?.substring(0, 30) + '...' }}</span>
          </div>
          
          <div v-if="result.status === 'generating'" class="result-placeholder">
            <div class="spinner"></div>
            <p>生成中...</p>
          </div>
          
          <div v-else-if="result.status === 'error'" class="result-placeholder error">
            <div class="error-icon">!</div>
            <p>{{ result.error || '生成失败' }}</p>
            <Button
              variant="secondary"
              size="small"
              @click="retryGenerate(result.id)"
            >
              重试
            </Button>
          </div>
          
          <div v-else-if="result.imageUrl" class="result-image">
            <img :src="result.imageUrl" :alt="result.theme || 'Generated image'" />
            <div class="image-overlay">
              <Button
                variant="secondary"
                size="small"
                @click="downloadImage(result.imageUrl!, result.theme || `image_${index + 1}`)"
              >
                下载
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PageContainer, PageHeader } from '../components/layout'
import { Button, Card, Progress } from '../components/ui'
import StyleExampleCard from '../components/StyleExampleCard.vue'
import { getEnabledTemplates } from '../config/promptTemplates'
import { generateImagePromptFromTemplate, generateImagePromptsBatch } from '../services/ai/promptTemplate'
import { generateImageFromPrompt } from '../services/ai/imageGeneration'
import { generatePromptBatchPlan } from '../services/ai/promptBatch'
import { DEFAULT_STYLE_PROMPTS } from '../config/stylePrompts'
import { saveHistoryItem, getCurrentUser, registerUser } from '../services/storage'
import { ProcessingMode, ProcessingStatus } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface GenerationResult {
  id: string
  theme?: string
  prompt?: string
  imageUrl?: string
  status: 'idle' | 'generating' | 'done' | 'error'
  error?: string
}

const availableTemplates = getEnabledTemplates()
const selectedTemplateId = ref(availableTemplates[0]?.id || '')
const inputMode = ref<'theme' | 'prompt'>('theme')
const inputText = ref('')
const maxCount = ref(10) // 最大生成数量限制
const isGenerating = ref(false)
const results = ref<GenerationResult[]>([])

// 暴露给父组件
defineExpose({
  isGenerating,
  results
})

// 风格示例数据
const styleExamples = computed(() => {
  return Object.values(DEFAULT_STYLE_PROMPTS).map(style => ({
    id: style.id,
    name: style.name,
    // 使用 public 目录路径，Vite 会将 public 目录中的文件原样复制到构建后的根目录
    imageUrl: `/style-examples/${style.id}.png`,
    prompt: style.defaultPrompt.split('\n')[0] // 使用提示词的第一行作为示例
  }))
})

// 处理风格示例点击
const handleStyleExampleClick = (styleId: string) => {
  // 在提示词生成模式下，风格示例主要用于参考，不直接设置
  console.log('风格示例点击:', styleId)
}

// 解析输入文本为数组
const inputItems = computed(() => {
  if (!inputText.value.trim()) return []
  const items = inputText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, maxCount.value)
  return items
})

// 是否可以生成
const canGenerate = computed(() => {
  return !isGenerating.value && 
         inputItems.value.length > 0 && 
         selectedTemplateId.value.length > 0
})

// 进度计算
const totalCount = computed(() => results.value.length)
const completedCount = computed(() => 
  results.value.filter(r => r.status === 'done').length
)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})

// 开始生成
const handleGenerate = async () => {
  if (!canGenerate.value) return

  // 检查API Key
  const mockMode = localStorage.getItem('MOCK_MODE') === 'true'
  if (!mockMode) {
    const deepseekKey = localStorage.getItem('DEEPSEEK_API_KEY')
    const googleKey = localStorage.getItem('GOOGLE_API_KEY')
    
    if (inputMode.value === 'theme' && !deepseekKey) {
      alert('请先在"系统设置"中配置 DeepSeek API Key（用于生成提示词），或开启模拟模式进行测试')
      return
    }
    
    if (!googleKey) {
      alert('请先在"系统设置"中配置 Google GenAI API Key（用于生成图片），或开启模拟模式进行测试')
      return
    }
  }

  isGenerating.value = true
  results.value = []

  try {
    // 规划批量任务
    const plan = inputMode.value === 'theme'
      ? generatePromptBatchPlan(inputItems.value, undefined, maxCount.value)
      : generatePromptBatchPlan(undefined, inputItems.value, maxCount.value)

    // 初始化结果列表
    results.value = plan.tasks.map(task => ({
      id: uuidv4(),
      theme: task.theme,
      prompt: task.prompt,
      status: 'idle' as const
    }))

    // 开始生成流程
    if (inputMode.value === 'theme') {
      // 主题模式：先批量生成提示词，再生成图片
      await generateFromThemes(plan.tasks.map(t => t.theme!))
    } else {
      // 提示词模式：直接生成图片
      await generateFromPrompts(plan.tasks.map(t => t.prompt!))
    }

    // 保存历史记录
    await saveHistory()
  } catch (error: any) {
    console.error('生成失败:', error)
    alert(`生成失败: ${error.message || '未知错误'}`)
  } finally {
    isGenerating.value = false
  }
}

// 从主题生成
const generateFromThemes = async (themes: string[]) => {
  // 批量生成提示词
  const promptResults = await generateImagePromptsBatch(selectedTemplateId.value, themes)
  
  // 更新结果列表，添加生成的提示词
  promptResults.forEach((pr, index) => {
    const result = results.value[index]
    if (result) {
      result.prompt = pr.prompt
      result.status = 'generating'
    }
  })

  // 并发生成所有图片
  const imageTasks = promptResults.map(async (pr, index) => {
    const result = results.value[index]
    if (!result) return

    try {
      const imageResult = await generateImageFromPrompt(pr.prompt, '3:4')
      result.imageUrl = imageResult.imageUrl
      result.status = 'done'
    } catch (error: any) {
      result.status = 'error'
      result.error = error.message || '生成失败'
    }
  })

  await Promise.all(imageTasks)
}

// 从提示词生成
const generateFromPrompts = async (prompts: string[]) => {
  // 直接并发生成所有图片
  const imageTasks = prompts.map(async (prompt, index) => {
    const result = results.value[index]
    if (!result) {
      result.status = 'generating'
      return
    }

    result.status = 'generating'
    try {
      const imageResult = await generateImageFromPrompt(prompt, '3:4')
      result.imageUrl = imageResult.imageUrl
      result.status = 'done'
    } catch (error: any) {
      result.status = 'error'
      result.error = error.message || '生成失败'
    }
  })

  await Promise.all(imageTasks)
}

// 重试生成
const retryGenerate = async (resultId: string) => {
  const result = results.value.find(r => r.id === resultId)
  if (!result) return

  result.status = 'generating'
  result.error = undefined

  try {
    const prompt = result.prompt || result.theme
    if (!prompt) {
      throw new Error('缺少提示词或主题')
    }

    // 如果是主题，需要先生成提示词
    if (result.theme && !result.prompt) {
      const promptResult = await generateImagePromptFromTemplate(selectedTemplateId.value, result.theme)
      result.prompt = promptResult.prompt
    }

    const imageResult = await generateImageFromPrompt(result.prompt!, '3:4')
    result.imageUrl = imageResult.imageUrl
    result.status = 'done'
  } catch (error: any) {
    result.status = 'error'
    result.error = error.message || '生成失败'
  }
}

// 下载图片
const downloadImage = (imageUrl: string, filename: string) => {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 保存历史记录
const saveHistory = async () => {
  const user = getCurrentUser() || registerUser('default_user', 'default@example.com')
  
  // 为每个成功生成的结果创建历史记录
  const completedResults = results.value.filter(r => r.status === 'done' && r.imageUrl)
  
  for (const result of completedResults) {
    const historyItem = {
      id: uuidv4(),
      originalImageUrl: result.imageUrl!,
      generatedImageUrl: result.imageUrl!,
      status: ProcessingStatus.COMPLETED,
      createdAt: Date.now(),
      userId: user.id,
      mode: ProcessingMode.PROMPT_TO_IMAGE,
      promptTemplateId: selectedTemplateId.value,
      promptTheme: result.theme,
      imagePrompt: result.prompt,
      projectName: result.theme || `提示词生成_${Date.now()}`,
      tokenUsage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
    }
    
    await saveHistoryItem(user.id, historyItem)
  }
}

onMounted(() => {
  console.log('PromptGenerateView 已挂载')
})
</script>

<style scoped>
.prompt-generate-container {
  max-width: 1400px;
  padding: 32px;
}

.input-panel {
  margin-bottom: 24px;
}

.input-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.input-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.count-hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-sub);
  margin-left: 8px;
}

.template-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  outline: none;
  transition: all 0.2s;
}

.template-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.input-mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mode-toggle-btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-main);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.mode-toggle-btn:hover:not(:disabled) {
  background: var(--bg-body);
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

.mode-hint {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 4px;
}

.batch-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: all 0.2s;
}

.batch-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.batch-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-count {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 8px;
}

.action-group {
  margin-top: 24px;
}

.progress-panel {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.progress-text {
  font-size: 14px;
  color: var(--text-sub);
}

.results-section {
  margin-top: 32px;
}

.results-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 24px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.result-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-index {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
}

.result-theme {
  font-size: 14px;
  color: var(--text-main);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-placeholder {
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  background: var(--bg-body);
  min-height: 240px;
}

.result-placeholder.error {
  background: #fff5f5;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.result-image {
  aspect-ratio: 3/4;
  position: relative;
  overflow: hidden;
}

.result-image img {
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

.result-image:hover .image-overlay {
  opacity: 1;
}

/* 风格示例展示已隐藏（提示词生图不需要风格示例） */
.style-examples-section {
  display: none;
}
</style>








