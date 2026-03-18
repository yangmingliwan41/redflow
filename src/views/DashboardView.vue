<template>
  <PageContainer size="xl" class="dashboard-view">
    <div class="dashboard-content">
      <PageHeader
        title="仪表盘"
        subtitle="内容创作全流程管理中心"
      />

    <!-- 统计数据 -->
    <div class="dashboard-view__stats">
      <StatsCard
        label="需求分析"
        :value="requirementsCount"
        icon-bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </template>
      </StatsCard>

      <StatsCard
        label="内容规划"
        :value="plansCount"
        icon-bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        </template>
      </StatsCard>

      <StatsCard
        label="发布计划"
        :value="schedulesCount"
        icon-bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </template>
      </StatsCard>

      <StatsCard
        label="历史记录"
        :value="historyCount"
        icon-bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </template>
      </StatsCard>
    </div>

    <!-- 快速操作 -->
    <div class="dashboard-view__quick-actions">
      <h3 class="dashboard-view__section-title">快速操作</h3>
      <div class="dashboard-view__actions-grid">
        <QuickActionCard
          title="需求分析"
          description="输入需求，AI自动分析主题、受众和内容类型"
          @click="$router.push('/requirement-analysis')"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </template>
        </QuickActionCard>

        <QuickActionCard
          title="内容规划"
          description="基于需求自动生成多内容创作计划"
          @click="$router.push('/planning')"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </template>
        </QuickActionCard>

        <QuickActionCard
          title="发布日历"
          description="管理和查看内容发布计划"
          @click="$router.push('/calendar')"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </template>
        </QuickActionCard>

        <QuickActionCard
          title="开始创作"
          description="文本生成图文、图生图、提示词生成图片"
          @click="$router.push('/')"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </template>
        </QuickActionCard>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="dashboard-view__recent">
      <h3 class="dashboard-view__section-title">最近活动</h3>
      <div class="dashboard-view__recent-content">
        <!-- 最近需求 -->
        <AlgorithmicCard v-if="recentRequirements.length > 0" class="dashboard-view__recent-section" :interactive="true">
          <Card>
          <template #header>
            <h4>最近需求分析</h4>
          </template>
          <div class="dashboard-view__recent-list">
            <div
              v-for="req in recentRequirements"
              :key="req.id"
              class="dashboard-view__recent-item"
              @click="$router.push('/requirement-analysis')"
            >
              <div class="dashboard-view__recent-item-title">{{ req.extractedTopic }}</div>
              <div class="dashboard-view__recent-item-meta">
                {{ formatDate(req.createdAt) }}
              </div>
            </div>
          </div>
          </Card>
        </AlgorithmicCard>

        <!-- 最近规划 -->
        <AlgorithmicCard v-if="recentPlans.length > 0" class="dashboard-view__recent-section" :interactive="true">
          <Card>
          <template #header>
            <h4>最近内容规划</h4>
          </template>
          <div class="dashboard-view__recent-list">
            <div
              v-for="plan in recentPlans"
              :key="plan.id"
              class="dashboard-view__recent-item"
              @click="$router.push({ name: 'planning', query: { planId: plan.id } })"
            >
              <div class="dashboard-view__recent-item-title">
                {{ plan.planType === 'multi' && plan.multi ? plan.multi.planName : '单篇规划' }}
              </div>
              <div class="dashboard-view__recent-item-meta">
                {{ formatDate(plan.createdAt) }}
              </div>
            </div>
          </div>
          </Card>
        </AlgorithmicCard>
      </div>
    </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRequirementStore } from '../stores/requirementStore'
import { usePlanningStore } from '../stores/planningStore'
import { useCalendarStore } from '../stores/calendarStore'
import { storage } from '../services/storage/index'
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import StatsCard from '../components/dashboard/StatsCard.vue'
import QuickActionCard from '../components/dashboard/QuickActionCard.vue'
import Card from '../components/ui/Card.vue'
import AlgorithmicCard from '../components/common/AlgorithmicCard.vue'
const requirementStore = useRequirementStore()
const planningStore = usePlanningStore()
const calendarStore = useCalendarStore()

const historyCount = ref(0)

const requirementsCount = computed(() => requirementStore.requirementsCount)
const plansCount = computed(() => planningStore.plansCount)
const schedulesCount = computed(() => calendarStore.schedulesCount)

const recentRequirements = computed(() => requirementStore.requirements.slice(0, 5))
const recentPlans = computed(() => planningStore.plans.slice(0, 5))

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  const currentUser = await storage.getCurrentUser()
  
  // 加载各模块数据
  await Promise.all([
    requirementStore.loadRequirements(currentUser?.id),
    planningStore.loadPlans(),
    calendarStore.loadEvents({
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }, 'month')
  ])

  // 加载历史记录数量
  if (currentUser) {
    const history = await storage.getHistory(currentUser.id)
    historyCount.value = history.length
  }
})
</script>

<style scoped>
.dashboard-view {
  max-width: 1400px;
  position: relative;
  min-height: 100vh;
}

.dashboard-content {
  position: relative;
  z-index: 1;
}

.dashboard-view__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.dashboard-view__quick-actions {
  margin-bottom: var(--spacing-2xl);
}

.dashboard-view__section-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.dashboard-view__actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.dashboard-view__recent {
  margin-top: var(--spacing-2xl);
}

.dashboard-view__recent-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.dashboard-view__recent-section h4 {
  margin: 0;
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
}

.dashboard-view__recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.dashboard-view__recent-item {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.dashboard-view__recent-item:hover {
  background: var(--bg-body);
  border-color: var(--primary);
  transform: translateX(4px);
}

.dashboard-view__recent-item-title {
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
}

.dashboard-view__recent-item-meta {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .dashboard-view__stats {
    grid-template-columns: 1fr;
  }

  .dashboard-view__actions-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-view__recent-content {
    grid-template-columns: 1fr;
  }
}
</style>


