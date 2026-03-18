<template>
  <PageContainer size="xl" class="planning-view">
    <PageHeader
      title="内容规划"
      subtitle="基于需求分析自动生成多内容创作计划"
    >
      <template #actions>
        <Button variant="secondary" @click="$router.push('/')" style="margin-right: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </Button>
        <Button
          v-if="!hasCurrentPlan"
          variant="primary"
          :loading="loading"
          @click="handleCreatePlan"
        >
          创建规划
        </Button>
      </template>
    </PageHeader>

    <!-- 创建规划表单 -->
    <Card v-if="!hasCurrentPlan && !loading" class="planning-view__create-form">
      <h3>创建新规划</h3>
      <div class="planning-view__form-content">
        <div class="planning-view__form-item">
          <label>选择需求分析</label>
          <select v-model="selectedRequirementId" class="planning-view__select">
            <option value="">请选择需求分析</option>
            <option
              v-for="req in requirements"
              :key="req.id"
              :value="req.id"
            >
              {{ req.extractedTopic || req.productDescription || req.userInput || `需求 ${req.id.slice(0, 8)}` }}
            </option>
          </select>
        </div>
        <div class="planning-view__form-row">
          <div class="planning-view__form-item">
            <label>开始日期</label>
            <input
              v-model="planForm.startDate"
              type="date"
              class="planning-view__input"
            />
          </div>
          <div class="planning-view__form-item">
            <label>结束日期</label>
            <input
              v-model="planForm.endDate"
              type="date"
              class="planning-view__input"
            />
          </div>
          <div class="planning-view__form-item">
            <label>内容数量</label>
            <input
              v-model.number="planForm.totalContents"
              type="number"
              min="1"
              max="30"
              class="planning-view__input"
            />
          </div>
        </div>
        <Button
          variant="primary"
          :disabled="!canCreatePlan"
          @click="handleCreatePlan"
        >
          生成规划
        </Button>
      </div>
    </Card>

    <!-- 加载状态 -->
    <div v-if="loading && !hasCurrentPlan" class="planning-view__loading">
      <div class="spinner"></div>
      <p>正在生成规划...</p>
    </div>

    <!-- 规划结果 -->
    <div v-if="currentMultiPlan" class="planning-view__plan">
      <!-- 规划概览 -->
      <Card class="planning-view__overview">
        <div class="planning-view__overview-content">
          <div class="planning-view__overview-item">
            <div class="planning-view__overview-label">规划名称</div>
            <div class="planning-view__overview-value">{{ currentMultiPlan.planName }}</div>
          </div>
          <div class="planning-view__overview-item">
            <div class="planning-view__overview-label">内容数量</div>
            <div class="planning-view__overview-value">{{ currentMultiPlan.contents.length }} 篇</div>
          </div>
          <div class="planning-view__overview-item">
            <div class="planning-view__overview-label">多样性评分</div>
            <div class="planning-view__overview-value">
              {{ (currentMultiPlan.overallStrategy.diversityScore * 100).toFixed(0) }}%
            </div>
          </div>
          <div class="planning-view__overview-item">
            <div class="planning-view__overview-label">预计总时间</div>
            <div class="planning-view__overview-value">
              {{ Math.ceil(currentMultiPlan.resources.totalEstimatedTime / 60) }} 小时
            </div>
          </div>
        </div>
      </Card>

      <!-- 冲突检测结果 -->
      <ConflictList :conflicts="currentMultiPlan.conflictCheck.conflicts" />

      <!-- 内容列表 -->
      <div class="planning-view__contents">
        <h3 class="planning-view__contents-title">内容规划列表</h3>
        <div class="planning-view__contents-grid">
          <ContentPlanCard
            v-for="content in currentMultiPlan.contents"
            :key="content.id"
            :content="content"
            @edit="handleEditContent"
            @generate="handleGenerateContent"
          />
        </div>
      </div>
    </div>

    <!-- 内容编辑弹窗 -->
    <ContentEditModal
      v-model:visible="showEditModal"
      :content="editingContent"
      @save="handleSaveContent"
      @close="handleCloseEditModal"
    />

    <!-- 空状态 -->
    <div v-if="!hasCurrentPlan && !loading && requirements.length === 0" class="planning-view__empty">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
      <h3>暂无规划</h3>
      <p>请先进行需求分析，然后创建内容规划</p>
      <Button variant="primary" @click="$router.push({ path: '/plan/requirement', query: { new: 'true', from: 'planning' } })">
        去需求分析
      </Button>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanningStore } from '../stores/planningStore'
import { useRequirementStore } from '../stores/requirementStore'
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import Card from '../components/ui/Card.vue'
import Button from '../components/ui/Button.vue'
import ContentPlanCard from '../components/planning/ContentPlanCard.vue'
import ConflictList from '../components/planning/ConflictList.vue'
import ContentEditModal from '../components/planning/ContentEditModal.vue'
import { SingleContentPlan, ContentPlan } from '../types'

const router = useRouter()
const planningStore = usePlanningStore()
const requirementStore = useRequirementStore()

const selectedRequirementId = ref('')
// 格式化日期为 YYYY-MM-DD（使用本地时区）
const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const planForm = ref({
  startDate: formatDateInput(new Date()),
  endDate: formatDateInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  totalContents: 7
})

const loading = computed(() => planningStore.loading)
const hasCurrentPlan = computed(() => planningStore.hasCurrentPlan)
const currentMultiPlan = computed(() => planningStore.currentMultiPlan)
const requirements = computed(() => requirementStore.requirements)

const canCreatePlan = computed(() => {
  return selectedRequirementId.value && planForm.value.startDate && planForm.value.endDate && planForm.value.totalContents > 0
})

const handleCreatePlan = async () => {
  if (!canCreatePlan.value) {
    console.warn('无法创建规划，条件不满足:', {
      hasRequirement: !!selectedRequirementId.value,
      startDate: planForm.value.startDate,
      endDate: planForm.value.endDate,
      totalContents: planForm.value.totalContents
    })
    return
  }

  console.log('开始创建规划:', {
    requirementId: selectedRequirementId.value,
    period: {
      startDate: planForm.value.startDate,
      endDate: planForm.value.endDate,
      totalContents: planForm.value.totalContents
    }
  })

  try {
    const plan = await planningStore.generatePlan(selectedRequirementId.value, {
      startDate: planForm.value.startDate,
      endDate: planForm.value.endDate,
      totalContents: planForm.value.totalContents
    })
    console.log('规划创建成功:', plan.id)
  } catch (error: any) {
    console.error('创建规划失败:', error)
    // 显示错误提示
    alert(`创建规划失败: ${error.message || '未知错误'}`)
  }
}

const showEditModal = ref(false)
const editingContent = ref<SingleContentPlan | null>(null)

const handleEditContent = (content: SingleContentPlan) => {
  editingContent.value = content
  showEditModal.value = true
}

const handleSaveContent = async (content: SingleContentPlan) => {
  if (!currentMultiPlan.value || !planningStore.currentPlan) return
  
  try {
    // 更新规划中的内容
    const contentIndex = currentMultiPlan.value.contents.findIndex(c => c.id === content.id)
    if (contentIndex >= 0) {
      currentMultiPlan.value.contents[contentIndex] = content
      
      // 更新当前规划对象
      const updatedPlan: ContentPlan = {
        ...planningStore.currentPlan,
        multi: currentMultiPlan.value,
        updatedAt: Date.now()
      }
      
      // 保存到store
      await planningStore.updatePlan(updatedPlan)
      console.log('内容更新成功:', content.id)
    }
  } catch (error: any) {
    console.error('更新内容失败:', error)
    alert(`更新内容失败: ${error.message || '未知错误'}`)
  }
}

const handleCloseEditModal = () => {
  showEditModal.value = false
  editingContent.value = null
}

const handleGenerateContent = (content: SingleContentPlan) => {
  // TODO: 实现生成功能
  console.log('生成内容:', content)
  router.push('/text-outline')
}

onMounted(async () => {
  console.log('PlanningView mounted, 加载需求列表...')
  try {
    await requirementStore.loadRequirements()
    console.log('需求列表加载完成:', requirementStore.requirements.length)
  } catch (error: any) {
    console.error('加载需求列表失败:', error)
  }
  
  // 如果有规划ID参数，加载该规划
  const planId = router.currentRoute.value.query.planId as string
  if (planId) {
    console.log('加载规划:', planId)
    try {
      await planningStore.loadPlan(planId)
    } catch (error: any) {
      console.error('加载规划失败:', error)
    }
  }
})
</script>

<style scoped>
.planning-view {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.planning-view__create-form {
  margin-bottom: var(--spacing-xl);
}

.planning-view__create-form h3 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.planning-view__form-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.planning-view__form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.planning-view__form-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.planning-view__form-item label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.planning-view__select,
.planning-view__input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-family: inherit;
  transition: border-color var(--duration-normal);
}

.planning-view__select:focus,
.planning-view__input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.planning-view__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  gap: var(--spacing-md);
}

.planning-view__loading .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.planning-view__plan {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.planning-view__overview {
  margin-bottom: var(--spacing-lg);
}

.planning-view__overview-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.planning-view__overview-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.planning-view__overview-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.planning-view__overview-value {
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.planning-view__contents {
  margin-top: var(--spacing-xl);
}

.planning-view__contents-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
}

.planning-view__contents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

.planning-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  gap: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
}

.planning-view__empty svg {
  color: var(--text-tertiary);
}

.planning-view__empty h3 {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--text-main);
}

@media (max-width: 768px) {
  .planning-view__form-row {
    grid-template-columns: 1fr;
  }

  .planning-view__contents-grid {
    grid-template-columns: 1fr;
  }

  .planning-view__overview-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>


