<template>
  <PageContainer size="xl" class="manage-drafts-view">
    <PageHeader
      title="草稿箱"
      subtitle="未完成的项目和草稿"
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
    
    <div class="drafts-content">
      <div v-if="drafts.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <div class="empty-text">还没有草稿</div>
      </div>
      
      <div v-else class="drafts-grid">
        <div
          v-for="draft in drafts"
          :key="draft.id"
          class="draft-card"
          @click="handleDraftClick(draft)"
        >
          <div class="draft-name">{{ draft.name }}</div>
          <div class="draft-meta">
            <span>{{ getTypeLabel(draft.type) }}</span>
            <span>{{ formatTime(draft.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { Workspace, WorkspaceType } from '../types/workspace'
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import Button from '../components/ui/Button.vue'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const drafts = computed(() => {
  return workspaceStore.allWorkspaces.filter(w => w.status === 'draft')
})

const getTypeLabel = (type: WorkspaceType): string => {
  const labels: Record<WorkspaceType, string> = {
    text: '文本生成',
    image: '图生图',
    prompt: '提示词',
    plan: '内容规划',
    requirement: '需求分析',
    calendar: '发布日历'
  }
  return labels[type] || type
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const handleDraftClick = (draft: Workspace) => {
  workspaceStore.setCurrentWorkspace(draft)
  if (draft.type === 'text') {
    router.push(`/create/text?workspace=${draft.id}`)
  } else if (draft.type === 'image') {
    router.push(`/create/image?workspace=${draft.id}`)
  } else if (draft.type === 'prompt') {
    router.push(`/create/prompt?workspace=${draft.id}`)
  }
}

onMounted(async () => {
  await workspaceStore.loadWorkspaces()
})
</script>

<style scoped>
.manage-drafts-view {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: var(--spacing-2xl);
}

.drafts-content {
  margin-top: var(--spacing-2xl);
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: var(--bg-card);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-sub);
}

.drafts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 768px) {
  .drafts-grid {
    grid-template-columns: 1fr;
  }
}

.draft-card {
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.draft-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.draft-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.draft-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-sub);
}
</style>




