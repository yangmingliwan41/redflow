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
        >
          <div class="draft-card-content" @click="handleDraftClick(draft)">
            <div class="draft-name">{{ draft.name }}</div>
            <div class="draft-meta">
              <span>{{ getTypeLabel(draft.type) }}</span>
              <span>{{ formatTime(draft.updatedAt) }}</span>
            </div>
          </div>
          <button
            class="draft-delete-btn"
            @click.stop="handleDeleteDraft(draft)"
            :title="`删除 ${draft.name}`"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <Modal
      v-model="deleteModalVisible"
      title="确认删除"
      size="sm"
      :close-on-backdrop="false"
    >
      <div class="delete-confirm-content">
        <div class="delete-confirm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <p class="delete-confirm-message">
          确定要删除 <strong>"{{ deletingDraftName }}"</strong> 吗？
        </p>
        <p class="delete-confirm-warning">此操作不可恢复，请谨慎操作。</p>
      </div>
      <template #footer>
        <div class="delete-confirm-actions">
          <Button variant="secondary" @click="cancelDelete">
            取消
          </Button>
          <Button variant="danger" @click="confirmDelete">
            确认删除
          </Button>
        </div>
      </template>
    </Modal>
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
import Modal from '../components/ui/Modal.vue'

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
  } else if (draft.type === 'plan') {
    router.push(`/plan/content?workspace=${draft.id}`)
  } else if (draft.type === 'requirement') {
    router.push(`/plan/requirement?workspace=${draft.id}`)
  } else if (draft.type === 'calendar') {
    router.push(`/plan/calendar?workspace=${draft.id}`)
  }
}

// 删除相关状态
const deleteModalVisible = ref(false)
const deletingDraft = ref<Workspace | null>(null)
const deletingDraftName = ref('')

const handleDeleteDraft = (draft: Workspace) => {
  deletingDraft.value = draft
  deletingDraftName.value = draft.name
  deleteModalVisible.value = true
}

const cancelDelete = () => {
  deleteModalVisible.value = false
  deletingDraft.value = null
  deletingDraftName.value = ''
}

const confirmDelete = async () => {
  if (!deletingDraft.value) {
    cancelDelete()
    return
  }

  try {
    await workspaceStore.deleteWorkspace(deletingDraft.value.id)
    cancelDelete()
  } catch (error: any) {
    console.error('删除草稿失败:', error)
    alert('删除失败：' + (error.message || '未知错误'))
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
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--duration-normal);
  overflow: hidden;
}

.draft-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.draft-card-content {
  padding: 20px;
  cursor: pointer;
}

.draft-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0;
  margin: 0;
  outline: none;
  opacity: 0;
}

.draft-card:hover .draft-delete-btn {
  opacity: 1;
}

.draft-delete-btn:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.draft-delete-btn:hover {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
  transform: scale(1.1);
}

.draft-delete-btn:active {
  transform: scale(0.95);
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

/* 删除确认弹窗样式 */
.delete-confirm-content {
  text-align: center;
  padding: var(--spacing-md) 0;
}

.delete-confirm-icon {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  color: #ff4444;
}

.delete-confirm-message {
  font-size: var(--font-base);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.delete-confirm-message strong {
  color: var(--primary);
  font-weight: var(--font-semibold);
}

.delete-confirm-warning {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin: 0;
}

.delete-confirm-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}
</style>




