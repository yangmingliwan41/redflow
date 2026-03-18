<template>
  <div class="requirement-wizard">
    <!-- 步骤指示器 -->
    <div class="wizard-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercent}%` }"
        ></div>
      </div>
      <div class="progress-text">
        步骤 {{ currentStep }} / {{ totalSteps }}
      </div>
    </div>

    <!-- 下一步按钮（在步骤指示器下方，问题内容上方） -->
    <div v-if="currentQuestion && currentQuestion.type === 'style'" class="wizard-actions-top">
      <div class="wizard-actions-top-right">
        <button
          class="wizard-next-btn wizard-next-btn--top"
          :disabled="!canProceed"
          @click="handleNext"
        >
          下一步
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

      <!-- 问题内容区域 -->
      <div class="wizard-content">
        <div v-if="currentQuestion" class="question-section">
          <h3 class="question-title">{{ currentQuestion.text }}</h3>
        
        <!-- 问题1：产品描述 -->
        <div v-if="currentQuestion.type === 'product'" class="question-input">
          <textarea
            v-model="productAnswer"
            :placeholder="currentQuestion.text"
            class="product-input"
            rows="4"
            @input="validateAnswer"
          ></textarea>
          <div class="product-input-hints">
            <div class="hints-title">💡 输入提示（至少5个字）：</div>
            <div class="hints-examples">
              <span class="hint-example">例如：推广新款口红，目标用户是18-25岁女性</span>
              <span class="hint-example">例如：销售智能手表，面向科技爱好者和运动人群</span>
              <span class="hint-example">例如：推广有机护肤品，主打天然成分和温和配方</span>
            </div>
          </div>
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>

        <!-- 问题2：风格选择 -->
        <div v-else-if="currentQuestion.type === 'style'" class="question-input">
          <StyleCardSelector
            v-model="styleAnswer"
            :min-selection="1"
            @update:modelValue="handleStyleChange"
          />
        </div>

        <!-- 问题3：卖点选择 -->
        <div v-else-if="currentQuestion.type === 'sellingPoint'" class="question-input">
          <SellingPointSelector
            v-model="sellingPointAnswer"
            :min-selection="1"
            :allow-custom="true"
            @update:modelValue="handleSellingPointChange"
          />
        </div>

        <!-- 追问问题（卡片选择器） -->
        <div v-else-if="currentQuestion && currentQuestion.type === 'followUp'" class="question-input">
          <FollowUpCardSelector
            v-if="currentQuestion.cardSelectorType"
            :question-type="currentQuestion.cardSelectorType"
            :model-value="followUpAnswers[currentQuestion.id]"
            @update:model-value="handleFollowUpChange(currentQuestion.id, $event)"
          />
          <!-- 兼容旧版文本输入（如果没有cardSelectorType） -->
          <input
            v-else
            type="text"
            :value="followUpAnswers[currentQuestion.id] || ''"
            @input="handleFollowUpInput(currentQuestion.id, $event)"
            :placeholder="currentQuestion.text"
            class="follow-up-input"
          />
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div v-else-if="isComplete" class="completion-section">
        <div class="completion-icon">✓</div>
        <h3 class="completion-title">需求分析完成</h3>
        <p class="completion-description">请确认您的需求信息，然后点击完成按钮</p>
        <div class="answers-summary">
          <div class="summary-item">
            <span class="summary-label">产品描述：</span>
            <span class="summary-value">{{ allAnswers.product || '未填写' }}</span>
            <button class="summary-edit-btn" @click="handleEditItem('product')" title="编辑">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          <div class="summary-item">
            <span class="summary-label">喜欢的风格：</span>
            <span class="summary-value">{{ getStyleLabels(allAnswers.style || []) || '未选择' }}</span>
            <button class="summary-edit-btn" @click="handleEditItem('style')" title="编辑">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
          <div class="summary-item">
            <span class="summary-label">产品卖点：</span>
            <span class="summary-value">{{ (allAnswers.sellingPoint || []).join('、') || '未选择' }}</span>
            <button class="summary-edit-btn" @click="handleEditItem('sellingPoint')" title="编辑">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="wizard-actions">
      <button
        v-if="currentQuestion && currentStep > 1"
        class="wizard-prev-btn"
        @click="handlePrevious"
      >
        上一步
      </button>
      <div class="wizard-actions-right">
        <button
          v-if="currentQuestion"
          class="wizard-next-btn"
          :disabled="!canProceed"
          @click="handleNext"
        >
          下一步
        </button>
        <button
          v-else-if="isComplete"
          class="wizard-complete-btn"
          @click="handleComplete"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { QuestionFlowManager } from '../../services/requirement/questionFlow'
import { QuestionDefinition } from '../../types/requirement'
import { getFollowUpQuestions, FollowUpContext } from '../../services/requirement/followUpQuestions'
import StyleCardSelector from './StyleCardSelector.vue'
import SellingPointSelector from './SellingPointSelector.vue'
import FollowUpCardSelector from './FollowUpCardSelector.vue'

interface Props {
  initialAnswers?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  initialAnswers: () => ({})
})

const emit = defineEmits<{
  (e: 'complete', answers: Record<string, any>): void
}>()

// 基础问题定义
const baseQuestions: QuestionDefinition[] = [
  {
    id: 'product',
    type: 'product',
    text: '请用一句话描述你的产品或者服务',
    required: true,
    validation: (answer: string) => {
      if (!answer || answer.trim().length === 0) {
        return '请输入产品描述'
      }
      if (answer.trim().length < 5) {
        return '产品描述至少需要5个字符'
      }
      return true
    }
  },
  {
    id: 'style',
    type: 'style',
    text: '选择你喜欢的风格',
    required: true,
    validation: (answer: string[]) => {
      if (!answer || answer.length === 0) {
        return '请至少选择一个风格'
      }
      return true
    }
  },
  {
    id: 'sellingPoint',
    type: 'sellingPoint',
    text: '选择产品卖点',
    required: true,
    validation: (answer: string[]) => {
      if (!answer || answer.length === 0) {
        return '请至少选择一个卖点'
      }
      return true
    }
  }
]

// 问题流程管理器 - 在setup中初始化
const flowManager = new QuestionFlowManager(baseQuestions)

// 当前答案状态
const productAnswer = ref('')
const styleAnswer = ref<string[]>([])
const sellingPointAnswer = ref<string[]>([])
const followUpAnswers = ref<Record<string, any>>({})
const errorMessage = ref('')

// 响应式跟踪当前问题索引，用于触发computed更新
const currentQuestionIndex = ref(0)

// 初始化答案状态
if (Object.keys(props.initialAnswers).length > 0) {
  productAnswer.value = props.initialAnswers.product || ''
  styleAnswer.value = props.initialAnswers.style || []
  sellingPointAnswer.value = props.initialAnswers.sellingPoint || []
  followUpAnswers.value = props.initialAnswers.followUpAnswers || {}
}

// 计算属性 - 使用响应式的currentQuestionIndex来触发更新
const currentQuestion = computed(() => {
  // 同步flowManager的索引（如果不同步）
  const managerIndex = flowManager['currentQuestionIndex']
  if (managerIndex !== currentQuestionIndex.value) {
    currentQuestionIndex.value = managerIndex
  }
  return flowManager.getCurrentQuestion()
})
const totalSteps = computed(() => {
  // 确保响应式更新
  currentQuestionIndex.value // 触发依赖
  return flowManager.getTotalQuestions()
})
const currentStep = computed(() => {
  // 确保响应式更新
  const index = currentQuestionIndex.value
  const total = flowManager.getTotalQuestions()
  // 当前步骤 = 当前索引 + 1（因为索引从0开始）
  return Math.max(1, Math.min(index + 1, total))
})
const progressPercent = computed(() => {
  // 确保响应式更新
  const index = currentQuestionIndex.value
  const total = flowManager.getTotalQuestions()
  if (total === 0) return 0
  // 进度 = 已完成的步骤数 / 总步骤数
  // 已完成 = 当前索引（因为索引指向下一个要回答的问题）
  return Math.min(100, (index / total) * 100)
})
const isComplete = computed(() => flowManager.isComplete())
const allAnswers = computed(() => flowManager.getAllAnswers())

const canProceed = computed(() => {
  if (!currentQuestion.value) return false
  
  let result = false
  switch (currentQuestion.value.type) {
    case 'product':
      result = productAnswer.value.trim().length >= 5
      break
    case 'style':
      result = styleAnswer.value.length > 0
      break
    case 'sellingPoint':
      result = sellingPointAnswer.value.length > 0
      break
    case 'followUp':
      // 追问问题：如果required为false，可以为空；如果required为true，必须有值
      const followUpAnswer = followUpAnswers.value[currentQuestion.value.id]
      if (currentQuestion.value.required) {
        // 对于卡片选择器，检查是否有有效值
        if (currentQuestion.value.cardSelectorType === 'targetAudience') {
          result = followUpAnswer && typeof followUpAnswer === 'object' && (followUpAnswer.age || followUpAnswer.gender)
        } else {
          result = followUpAnswer && (typeof followUpAnswer === 'string' ? followUpAnswer.trim().length > 0 : true)
        }
      } else {
        // 非必需问题，即使为空也可以继续
        result = true
      }
      break
    default:
      result = true
  }
  return result
})

// 方法
const validateAnswer = () => {
  errorMessage.value = ''
  if (!currentQuestion.value) return
  
  if (currentQuestion.value.type === 'product') {
    const validation = currentQuestion.value.validation
    if (validation) {
      const result = validation(productAnswer.value)
      if (result !== true) {
        errorMessage.value = typeof result === 'string' ? result : '答案验证失败'
      }
    }
  }
}

const handleStyleChange = (value: string[]) => {
  styleAnswer.value = value
}

const handleSellingPointChange = (value: string[]) => {
  sellingPointAnswer.value = value
}

const handleFollowUpChange = (questionId: string, value: any) => {
  followUpAnswers.value[questionId] = value
  // 清除错误信息
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const handleFollowUpInput = (questionId: string, event: Event) => {
  const target = event.target as HTMLInputElement
  followUpAnswers.value[questionId] = target.value
  // 清除错误信息
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const handleNext = () => {
  if (!currentQuestion.value) {
    return
  }
  
  errorMessage.value = ''
  let answer: any
  
  switch (currentQuestion.value.type) {
    case 'product':
      answer = productAnswer.value.trim()
      break
    case 'style':
      answer = styleAnswer.value
      break
    case 'sellingPoint':
      answer = sellingPointAnswer.value
      break
    default:
      answer = followUpAnswers.value[currentQuestion.value.id]
  }
  
  const result = flowManager.answerQuestion(currentQuestion.value.id, answer)
  
  if (!result.success) {
    errorMessage.value = result.error || '答案验证失败'
    return
  }
  
  // 更新响应式索引，触发computed重新计算
  currentQuestionIndex.value = flowManager['currentQuestionIndex']
  
  // 当完成第3个基础问题（sellingPoint）后，检查是否需要添加追问问题
  if (currentQuestion.value && currentQuestion.value.id === 'sellingPoint') {
    checkFollowUpQuestions()
  }
}

const handlePrevious = () => {
  flowManager.goToPrevious()
  
  // 更新响应式索引
  currentQuestionIndex.value = flowManager['currentQuestionIndex']
  
  // 恢复答案状态
  const answers = flowManager.getAllAnswers()
  productAnswer.value = answers.product || ''
  styleAnswer.value = answers.style || []
  sellingPointAnswer.value = answers.sellingPoint || []
  
  // 清除错误信息
  errorMessage.value = ''
}

const handleComplete = () => {
  const allAnswers = flowManager.getAllAnswers()
  emit('complete', allAnswers)
}

// 获取风格中文标签
const getStyleLabel = (style: string): string => {
  const labels: Record<string, string> = {
    xiaohongshu: '小红书爆款',
    poster_2k: '海报风格',
    ins_minimal: 'INS极简',
    tech_future: '科技未来',
    nature_fresh: '自然清新',
    morandi: '莫兰迪',
    black_gold: '黑金',
    minimal_white: '极简白',
    dopamine: '多巴胺',
    cyberpunk: '赛博朋克',
    retro_vintage: '复古怀旧'
  }
  return labels[style] || style
}

// 获取多个风格的中文标签
const getStyleLabels = (styles: string[]): string => {
  return styles.map(style => getStyleLabel(style)).join('、')
}

// 编辑某项
const handleEditItem = (itemId: string) => {
  // 跳转到对应的问题
  if (itemId === 'product') {
    flowManager.goToQuestion('product')
  } else if (itemId === 'style') {
    flowManager.goToQuestion('style')
  } else if (itemId === 'sellingPoint') {
    flowManager.goToQuestion('sellingPoint')
  }
  
  // 更新响应式索引
  currentQuestionIndex.value = flowManager['currentQuestionIndex']
}

const checkFollowUpQuestions = () => {
  // 检查是否需要添加追问问题
  const context: FollowUpContext = {
    productDescription: productAnswer.value,
    selectedStyles: styleAnswer.value,
    sellingPoints: sellingPointAnswer.value
  }
  
  const followUpQuestions = getFollowUpQuestions(context)
  
  // 添加追问问题到流程管理器
  followUpQuestions.forEach(question => {
    flowManager.addFollowUpQuestion(question)
  })
}

// 监听currentQuestion的变化，恢复答案状态
watch(currentQuestion, (newQuestion) => {
  // 当问题切换时，从flowManager恢复答案状态
  if (newQuestion) {
    const allAnswers = flowManager.getAllAnswers()
    // 恢复基础问题的答案
    if (allAnswers.product !== undefined) {
      productAnswer.value = allAnswers.product || ''
    }
    if (allAnswers.style !== undefined) {
      styleAnswer.value = Array.isArray(allAnswers.style) ? allAnswers.style : []
    }
    if (allAnswers.sellingPoint !== undefined) {
      sellingPointAnswer.value = Array.isArray(allAnswers.sellingPoint) ? allAnswers.sellingPoint : []
    }
    // 恢复追问答案（追问问题的ID可能是targetAudience、publishFrequency等）
    Object.keys(allAnswers).forEach(key => {
      if (!['product', 'style', 'sellingPoint'].includes(key)) {
        followUpAnswers.value[key] = allAnswers[key]
      }
    })
  }
}, { immediate: true })
</script>

<style scoped>
.requirement-wizard {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg, 24px);
}

.wizard-progress {
  margin-bottom: var(--spacing-xl, 32px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-body, #f5f5f5);
  border-radius: var(--radius-full, 9999px);
  overflow: hidden;
  margin-bottom: var(--spacing-sm, 8px);
}

.progress-fill {
  height: 100%;
  background: var(--primary, #4a8eff);
  border-radius: var(--radius-full, 9999px);
  transition: width var(--duration-normal, 0.3s) var(--ease-out, ease-out);
}

.progress-text {
  text-align: center;
  font-size: var(--font-sm, 14px);
  color: var(--text-sub, #6b7280);
}

.wizard-content {
  min-height: 400px;
  margin-bottom: var(--spacing-xl, 32px);
}

.question-section {
  animation: fadeIn var(--duration-normal, 0.3s) var(--ease-out, ease-out);
}

.question-title {
  font-size: var(--font-xl, 20px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin-bottom: var(--spacing-lg, 24px);
}

.question-input {
  margin-top: var(--spacing-md, 16px);
}

.product-input {
  width: 100%;
  padding: var(--spacing-md, 16px);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-base, 16px);
  font-family: inherit;
  resize: vertical;
  transition: border-color var(--duration-normal, 0.3s);
}

.product-input:focus {
  outline: none;
  border-color: var(--primary, #4a8eff);
}

.product-input-hints {
  margin-top: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  background: var(--primary-light, rgba(74, 142, 255, 0.05));
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--primary-fade, rgba(74, 142, 255, 0.2));
}

.hints-title {
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--primary, #4a8eff);
  margin-bottom: var(--spacing-sm, 8px);
}

.hints-examples {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
}

.hint-example {
  font-size: var(--font-sm, 14px);
  color: var(--text-secondary, #6b7280);
  line-height: var(--line-height-relaxed, 1.6);
}

.follow-up-input {
  width: 100%;
  padding: var(--spacing-md, 16px);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-base, 16px);
  font-family: inherit;
  transition: border-color var(--duration-normal, 0.3s);
}

.follow-up-input:focus {
  outline: none;
  border-color: var(--primary, #4a8eff);
  box-shadow: 0 0 0 3px var(--primary-fade, rgba(74, 142, 255, 0.1));
}

.error-message {
  margin-top: var(--spacing-sm, 8px);
  color: var(--error, #ef4444);
  font-size: var(--font-sm, 14px);
}

.completion-section {
  text-align: center;
  padding: var(--spacing-xl, 32px);
}

.completion-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md, 16px);
  background: var(--primary, #4a8eff);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.completion-title {
  font-size: var(--font-xl, 20px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin-bottom: var(--spacing-sm, 8px);
}

.completion-description {
  font-size: var(--font-base, 16px);
  color: var(--text-sub, #6b7280);
  margin-bottom: var(--spacing-lg, 24px);
}

.answers-summary {
  text-align: left;
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg, 24px);
  border: 1px solid var(--border-color, #e5e7eb);
}

.summary-item {
  margin-bottom: var(--spacing-md, 16px);
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: var(--font-medium, 500);
  color: var(--text-sub, #6b7280);
  margin-right: var(--spacing-sm, 8px);
}

.summary-value {
  color: var(--text-main, #1f2937);
}

.summary-item {
  position: relative;
  padding-right: 32px;
}

.summary-edit-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  border-radius: var(--radius-md, 8px);
  transition: all var(--duration-normal, 0.3s);
  padding: 0;
}

.summary-edit-btn:hover {
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
  color: var(--primary, #4a8eff);
}

.summary-edit-btn svg {
  width: 14px;
  height: 14px;
}

.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg, 24px);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.wizard-actions-right {
  margin-left: auto;
}

.wizard-prev-btn,
.wizard-next-btn,
.wizard-complete-btn {
  padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-base, 16px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
}

.wizard-prev-btn {
  background: var(--bg-body, #f5f5f5);
  color: var(--text-main, #1f2937);
}

.wizard-prev-btn:hover {
  background: var(--bg-card, #ffffff);
}

.wizard-next-btn,
.wizard-complete-btn {
  background: var(--primary, #4a8eff);
  color: white;
}

.wizard-next-btn:hover:not(:disabled),
.wizard-complete-btn:hover {
  background: var(--primary-hover, #3a7eef);
}

.wizard-next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 风格选择器内的下一步按钮 */
.style-selector-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.style-selector-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.wizard-next-btn--inline {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
}

/* 步骤上方的下一步按钮 */
.wizard-actions-top {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md, 16px) 0;
  margin-bottom: var(--spacing-md, 16px);
}

.wizard-actions-top-right {
  margin-left: auto;
}

.wizard-next-btn--top {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .requirement-wizard {
    padding: var(--spacing-md, 16px);
  }
  
  .question-title {
    font-size: var(--font-lg, 18px);
  }
  
  .wizard-actions {
    flex-direction: column;
    gap: var(--spacing-sm, 8px);
  }
  
  .wizard-actions-right {
    margin-left: 0;
    width: 100%;
  }
  
  .wizard-next-btn,
  .wizard-complete-btn {
    width: 100%;
  }
}
</style>

