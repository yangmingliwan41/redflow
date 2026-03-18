<template>
  <PageContainer size="xl" class="requirement-analysis-view">
    <PageHeader
      title="需求分析"
      subtitle="通过向导式问答，快速完成需求分析"
    >
      <template #actions>
        <Button variant="secondary" @click="$router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </Button>
      </template>
    </PageHeader>

    <div class="requirement-analysis-view__content">
      <!-- 模式选择 -->
      <div v-if="!showWizard && !currentRequirement" class="mode-selector">
        <div class="mode-selector__title">选择分析方式</div>
        <div class="mode-selector__options">
          <div class="mode-option" @click="showWizard = true">
            <div class="mode-option__icon">✨</div>
            <div class="mode-option__title">向导式分析</div>
            <div class="mode-option__desc">通过5个问题快速完成需求分析（推荐）</div>
          </div>
          <div class="mode-option" @click="showTextInput = true">
            <div class="mode-option__icon">📝</div>
            <div class="mode-option__title">文本输入</div>
            <div class="mode-option__desc">直接输入需求描述，AI自动分析</div>
          </div>
        </div>
      </div>

      <!-- 向导式需求分析 -->
      <div v-if="showWizard" class="wizard-container">
        <RequirementWizard
          :initial-answers="wizardAnswers"
          @complete="handleWizardComplete"
        />
      </div>

      <!-- 文本输入模式（向后兼容） -->
      <div v-if="showTextInput && !showWizard" class="text-input-container">
        <RequirementInput
          v-model="userInput"
          @input="handleInput"
        />

        <div class="requirement-analysis-view__actions">
          <Button
            variant="primary"
            :loading="loading"
            :disabled="loading || !userInput.trim()"
            @click="handleAnalyze"
          >
            开始分析
          </Button>
          <Button
            variant="secondary"
            @click="showTextInput = false"
          >
            返回
          </Button>
        </div>

        <div v-if="error" class="requirement-analysis-view__error">
          {{ error }}
        </div>
      </div>

      <!-- 分析结果弹窗 -->
      <RequirementResultModal
        :visible="showResultModal"
        :requirement="currentRequirement"
        :confidence="confidence"
        @close="handleCloseResultModal"
        @new-analysis="handleNewAnalysis"
        @confirm-and-plan="handleConfirmAndPlan"
      />

      <!-- 分析加载动画 -->
      <AnalysisLoadingCard
        :visible="showAnalysisLoading"
        :status="analysisStatus"
        :current-step="analysisCurrentStep"
        :total-steps="analysisSteps.length"
        :steps="analysisSteps"
        title="正在分析需求"
        @close="handleCloseAnalysisLoading"
      />

      <!-- 规划确认弹窗 -->
      <PlanConfirmationModal
        v-if="confirmedPlan"
        :visible="showPlanModal"
        :plan="confirmedPlan"
        @close="handleClosePlanModal"
        @confirm="handlePlanConfirm"
        @edit="handlePlanEdit"
      />

      <!-- 删除确认弹窗 -->
      <Modal
        v-model="showDeleteConfirm"
        title="确认删除"
        size="sm"
        :close-on-backdrop="false"
      >
        <div class="delete-confirm-content">
          <div class="delete-confirm-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <p class="delete-confirm-message">
            确定要删除 <strong>"{{ deletingRequirementTitle }}"</strong> 吗？
          </p>
          <p class="delete-confirm-warning">此操作不可恢复，请谨慎操作。</p>
        </div>
        <template #footer>
          <div class="delete-confirm-actions">
            <Button variant="secondary" @click="showDeleteConfirm = false">
              取消
            </Button>
            <Button variant="danger" @click="confirmDeleteRequirement">
              确认删除
            </Button>
          </div>
        </template>
      </Modal>

      <!-- 历史需求列表 -->
      <div v-if="requirements.length > 0 && !showWizard && !showTextInput" class="requirement-analysis-view__history">
        <h3 class="requirement-analysis-view__history-title">历史需求</h3>
        <div class="requirement-analysis-view__history-list">
          <Card
            v-for="req in requirements"
            :key="req.id"
            class="requirement-analysis-view__history-item"
            hover
            @click="handleSelectRequirement(req)"
          >
            <div class="requirement-analysis-view__history-item-content">
              <div class="requirement-analysis-view__history-item-topic">
                {{ req.extractedTopic || req.productDescription || req.userInput }}
              </div>
              <div class="requirement-analysis-view__history-item-meta">
                <span>{{ getContentTypeLabel(req.contentType) }}</span>
                <span>{{ formatDate(req.createdAt) }}</span>
                <span v-if="req.inputMode === 'wizard'" class="wizard-badge">向导式</span>
              </div>
            </div>
            <button
              class="requirement-analysis-view__history-item-delete"
              @click.stop="handleDeleteRequirement(req.id, req)"
              title="删除需求"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </Card>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRequirementStore } from '../stores/requirementStore'
import { generatePlanFromRequirement } from '../services/planning/planningService'
import { storage } from '../services/storage/index'
import { analyzeAndSaveRequirement, WizardInputData } from '../services/requirement/requirementAnalysis'
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import RequirementWizard from '../components/requirement/RequirementWizard.vue'
import RequirementInput from '../components/requirement/RequirementInput.vue'
import RequirementResultModal from '../components/requirement/RequirementResultModal.vue'
import PlanConfirmationModal from '../components/planning/PlanConfirmationModal.vue'
import AnalysisLoadingCard from '../components/requirement/AnalysisLoadingCard.vue'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import Modal from '../components/ui/Modal.vue'
import { ContentPlan } from '../types/planning'

const router = useRouter()
const route = useRoute()
const requirementStore = useRequirementStore()

const showWizard = ref(false)
const showTextInput = ref(false)
const userInput = ref('')
const confidence = ref(0.8)
const wizardAnswers = ref<Record<string, any>>({})
const showPlanModal = ref(false)
const confirmedPlan = ref<ContentPlan | null>(null)
const showResultModal = ref(false)

// 删除确认弹窗
const showDeleteConfirm = ref(false)
const deletingRequirementId = ref<string | null>(null)
const deletingRequirementTitle = ref<string>('')

// 分析动画状态
const showAnalysisLoading = ref(false)
const analysisStatus = ref<'loading' | 'success' | 'error'>('loading')
const analysisCurrentStep = ref(0)
const analysisSteps = ['分析产品信息', '调研平台趋势', '生成分析报告']

const loading = computed(() => requirementStore.loading)
const error = computed(() => requirementStore.error)
const currentRequirement = computed(() => requirementStore.currentRequirement)
const requirements = computed(() => requirementStore.requirements)

const handleInput = () => {
  requirementStore.clearError()
}

// 向导式完成处理
const handleWizardComplete = async (answers: Record<string, any>) => {
  try {
    // 显示分析动画
    showAnalysisLoading.value = true
    analysisStatus.value = 'loading'
    analysisCurrentStep.value = 0
    
    requirementStore.loading = true
    
    // 构建向导式输入数据
    const wizardData: WizardInputData = {
      product: answers.product || '',
      style: answers.style || [],
      sellingPoint: answers.sellingPoint || [],
      followUpAnswers: answers.followUpAnswers || {},
      questionFlow: answers.questionFlow || []
    }

    // 步骤1: 分析产品信息
    analysisCurrentStep.value = 1
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 保存需求分析
    const currentUser = await storage.getCurrentUser()
    
    // 步骤2: 调研平台趋势
    analysisCurrentStep.value = 2
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const requirementResult = await analyzeAndSaveRequirement(
      wizardData,
      currentUser?.id
    )
    
    const requirement = requirementResult.requirement
    requirementStore.setCurrentRequirement(requirement)
    confidence.value = requirementResult.confidence

    // 步骤3: 生成分析报告（显示分析结果）
    analysisCurrentStep.value = 3
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 显示成功状态
    analysisStatus.value = 'success'
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 关闭加载动画，显示分析结果弹窗
    showAnalysisLoading.value = false
    showResultModal.value = true
    
    console.log('分析完成，显示结果弹窗:', {
      hasRequirement: !!currentRequirement.value,
      showResultModal: showResultModal.value
    })
    
    // 等待用户查看分析结果后，再生成内容规划
    // 这里先不自动生成规划，让用户先查看分析结果
    // 如果需要自动生成，可以在用户确认后触发
    
  } catch (err: any) {
    console.error('需求分析失败:', err)
    requirementStore.error = err.message || '需求分析失败'
    analysisStatus.value = 'error'
    // 2秒后自动关闭错误提示
    setTimeout(() => {
      showAnalysisLoading.value = false
    }, 2000)
  } finally {
    requirementStore.loading = false
  }
}

// 关闭分析动画
const handleCloseAnalysisLoading = () => {
  showAnalysisLoading.value = false
}

// 规划确认处理
const handlePlanConfirm = async (plan: ContentPlan) => {
  try {
    const { confirmPlan } = await import('../services/planning/planningService')
    await confirmPlan(plan.id)
    
    showPlanModal.value = false
    showResultModal.value = false
    
    // 跳转到规划页面
    router.push({
      name: 'plan-content',
      query: { planId: plan.id }
    })
  } catch (err: any) {
    console.error('规划确认失败:', err)
  }
}

// 关闭规划确认弹窗
const handleClosePlanModal = () => {
  showPlanModal.value = false
  // 不清除 confirmedPlan，保留规划数据
}

// 规划编辑处理
const handlePlanEdit = (plan: ContentPlan) => {
  // 跳转到规划编辑页面
  router.push({
    name: 'plan-content',
    query: { planId: plan.id, edit: 'true' }
  })
}

// 文本输入分析（向后兼容）
const handleAnalyze = async () => {
  if (!userInput.value.trim()) {
    return
  }

  try {
    const currentUser = await storage.getCurrentUser()
    await requirementStore.analyzeRequirement(
      userInput.value,
      currentUser?.id
    )
    confidence.value = 0.8
  } catch (err: any) {
    console.error('需求分析失败:', err)
  }
}

// 关闭结果弹窗
const handleCloseResultModal = async () => {
  console.log('关闭分析结果弹窗', {
    hasRequirement: !!currentRequirement.value,
    hasPlan: !!confirmedPlan.value,
    requirementId: currentRequirement.value?.id
  })
  
  showResultModal.value = false
  
  // 关闭分析结果后，自动生成内容规划（如果还没有生成）
  if (currentRequirement.value && !confirmedPlan.value) {
    try {
      console.log('开始自动生成内容规划...')
      
      // 显示加载状态
      showAnalysisLoading.value = true
      analysisStatus.value = 'loading'
      analysisCurrentStep.value = 2
      
      const period = {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalContents: 7
      }

      console.log('调用 generatePlanFromRequirement...', { period, requirementId: currentRequirement.value.id })
      const plan = await generatePlanFromRequirement(currentRequirement.value, period)
      console.log('规划生成成功:', plan.id)
      
      // 转换为ContentPlan格式
      const contentPlan: ContentPlan = {
        id: plan.id,
        requirementId: currentRequirement.value.id,
        planType: 'multi',
        multi: plan,
        createdAt: Date.now()
      }
      
      confirmedPlan.value = contentPlan
      showAnalysisLoading.value = false
      
      console.log('显示规划确认弹窗', {
        showPlanModal: true,
        hasPlan: !!confirmedPlan.value,
        planId: contentPlan.id
      })
      
      // 使用 nextTick 确保 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100))
      showPlanModal.value = true
      
      console.log('规划确认弹窗状态:', {
        showPlanModal: showPlanModal.value,
        confirmedPlan: !!confirmedPlan.value
      })
    } catch (err: any) {
      console.error('生成内容规划失败:', err)
      showAnalysisLoading.value = false
      analysisStatus.value = 'error'
      // 显示错误提示
      requirementStore.error = err.message || '生成内容规划失败'
    }
  } else {
    console.log('跳过自动生成规划:', {
      hasRequirement: !!currentRequirement.value,
      hasPlan: !!confirmedPlan.value
    })
  }
}

// 确认结果并生成规划
const handleConfirmAndPlan = async () => {
  showResultModal.value = false
  
  // 自动生成内容规划
  if (currentRequirement.value && !confirmedPlan.value) {
    try {
      console.log('确认结果，开始生成内容规划...')
      
      // 显示加载状态
      showAnalysisLoading.value = true
      analysisStatus.value = 'loading'
      analysisCurrentStep.value = 2
      
      const period = {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalContents: 7
      }

      const plan = await generatePlanFromRequirement(currentRequirement.value, period)
      
      // 转换为ContentPlan格式
      const contentPlan: ContentPlan = {
        id: plan.id,
        requirementId: currentRequirement.value.id,
        planType: 'multi',
        multi: plan,
        createdAt: Date.now()
      }
      
      confirmedPlan.value = contentPlan
      showAnalysisLoading.value = false
      
      // 显示规划确认弹窗
      await new Promise(resolve => setTimeout(resolve, 100))
      showPlanModal.value = true
    } catch (err: any) {
      console.error('生成内容规划失败:', err)
      showAnalysisLoading.value = false
      analysisStatus.value = 'error'
      requirementStore.error = err.message || '生成内容规划失败'
    }
  }
}

// 新建分析处理
const handleNewAnalysis = () => {
  // 重置所有状态
  userInput.value = ''
  showWizard.value = false
  showTextInput.value = false
  requirementStore.setCurrentRequirement(null)
  requirementStore.clearError()
  confidence.value = 0.8
  wizardAnswers.value = {}
  showPlanModal.value = false
  confirmedPlan.value = null
  showResultModal.value = false
}

const handleSelectRequirement = (requirement: any) => {
  requirementStore.setCurrentRequirement(requirement)
  
  // 如果是向导式输入，恢复向导状态
  if (requirement.inputMode === 'wizard') {
    wizardAnswers.value = {
      product: requirement.productDescription || '',
      style: requirement.selectedStyles || [],
      sellingPoint: requirement.sellingPoints || [],
      followUpAnswers: requirement.followUpAnswers || {}
    }
    showWizard.value = true
  } else {
    userInput.value = requirement.userInput
    showTextInput.value = true
  }
}

// 删除需求处理
const handleDeleteRequirement = (id: string, requirement: any) => {
  const requirementTitle = requirement.extractedTopic || requirement.productDescription || requirement.userInput || '该需求'
  
  deletingRequirementId.value = id
  deletingRequirementTitle.value = requirementTitle
  showDeleteConfirm.value = true
}

// 确认删除需求
const confirmDeleteRequirement = async () => {
  if (!deletingRequirementId.value) return

  try {
    await requirementStore.removeRequirement(deletingRequirementId.value)
    console.log('需求删除成功:', deletingRequirementId.value)
    
    // 关闭确认弹窗
    showDeleteConfirm.value = false
    
    // 如果删除的是当前需求，清除当前需求
    if (currentRequirement.value?.id === deletingRequirementId.value) {
      requirementStore.setCurrentRequirement(null)
      showWizard.value = false
      showTextInput.value = false
      showResultModal.value = false
      wizardAnswers.value = {}
      userInput.value = ''
    }
    
    // 清除删除状态
    deletingRequirementId.value = null
    deletingRequirementTitle.value = ''
  } catch (error: any) {
    console.error('删除需求失败:', error)
    showDeleteConfirm.value = false
    
    // 显示错误提示（也可以使用弹窗，这里先用 alert）
    alert(`删除失败: ${error.message || '未知错误'}`)
    
    // 清除删除状态
    deletingRequirementId.value = null
    deletingRequirementTitle.value = ''
  }
}

const getContentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    tutorial: '教程',
    review: '测评',
    recommendation: '种草',
    comparison: '对比',
    knowledge: '知识分享'
  }
  return labels[type] || type
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  const currentUser = await storage.getCurrentUser()
  await requirementStore.loadRequirements(currentUser?.id)
  
  // 检查路由参数，如果是从内容规划跳转过来，显示新建界面
  if (route.query.new === 'true' || route.query.from === 'planning') {
    // 清除当前需求，显示模式选择界面
    requirementStore.setCurrentRequirement(null)
    showWizard.value = false
    showTextInput.value = false
    showResultModal.value = false
    showPlanModal.value = false
    confirmedPlan.value = null
    wizardAnswers.value = {}
    userInput.value = ''
    
    // 清除路由参数，避免刷新后再次触发
    router.replace({ query: {} })
  }
})
</script>

<style scoped>
.requirement-analysis-view {
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn var(--duration-normal) var(--ease-out);
}

.requirement-analysis-view__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  width: 100%;
}

/* 模式选择器 */
.mode-selector {
  padding: var(--spacing-xl);
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
}

.mode-selector__title {
  font-size: var(--font-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin-bottom: var(--spacing-lg, 24px);
  text-align: center;
}

.mode-selector__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg, 24px);
}

.mode-option {
  padding: var(--spacing-xl, 32px);
  background: var(--bg-body, #f5f5f5);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
  text-align: center;
}

.mode-option:hover {
  border-color: var(--primary, #4a8eff);
  background: var(--primary-light, rgba(74, 142, 255, 0.05));
  transform: translateY(-4px);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
}

.mode-option__icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md, 16px);
}

.mode-option__title {
  font-size: var(--font-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin-bottom: var(--spacing-sm, 8px);
}

.mode-option__desc {
  font-size: var(--font-sm, 14px);
  color: var(--text-sub, #6b7280);
  line-height: var(--line-height-relaxed, 1.6);
}

.wizard-container {
  width: 100%;
}

.text-input-container {
  width: 100%;
}

.requirement-analysis-view__actions {
  display: flex;
  gap: var(--spacing-md);
  animation: slideUp var(--duration-normal) var(--ease-out);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.requirement-analysis-view__error {
  padding: var(--spacing-lg);
  background: var(--error-light);
  color: var(--error);
  border-radius: var(--radius-lg);
  border: 1px solid var(--error);
  box-shadow: var(--shadow-sm);
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.requirement-analysis-view__history {
  margin-top: var(--spacing-xl);
}

.requirement-analysis-view__history-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.requirement-analysis-view__history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .requirement-analysis-view__history-list {
    grid-template-columns: 1fr;
  }
  
  .mode-selector__options {
    grid-template-columns: 1fr;
  }
}

.requirement-analysis-view__history-item {
  cursor: pointer;
  position: relative;
}

.requirement-analysis-view__history-item-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding-right: var(--spacing-lg);
}

.requirement-analysis-view__history-item-delete {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s) var(--ease-out);
  z-index: 10;
}

.requirement-analysis-view__history-item-delete:hover {
  background: var(--error-fade, rgba(239, 68, 68, 0.1));
  color: var(--error, #ef4444);
  transform: scale(1.1);
}

.requirement-analysis-view__history-item-delete:active {
  transform: scale(0.95);
}

.requirement-analysis-view__history-item-topic {
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.requirement-analysis-view__history-item-meta {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.wizard-badge {
  padding: 2px 8px;
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
  color: var(--primary, #4a8eff);
  border-radius: var(--radius-sm, 4px);
  font-size: 12px;
  font-weight: var(--font-medium, 500);
}

/* 删除确认弹窗样式 */
.delete-confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

.delete-confirm-icon {
  color: var(--error, #ef4444);
  margin-bottom: var(--spacing-sm);
}

.delete-confirm-message {
  font-size: var(--font-base);
  color: var(--text-main);
  margin: 0;
  line-height: 1.6;
}

.delete-confirm-message strong {
  color: var(--text-main);
  font-weight: var(--font-semibold);
}

.delete-confirm-warning {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0;
}

.delete-confirm-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-md) var(--spacing-lg);
}
</style>
