<template>
  <div class="workspace-view">
    <!-- 顶部工具栏 -->
    <div class="workspace-header">
      <div class="header-content">
        <h1 class="page-title">工作区</h1>
        <div class="header-actions">
          <button class="action-btn" @click="$router.push('/')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            开始创作
          </button>
        </div>
      </div>
    </div>

    <!-- 最近项目 -->
    <div class="workspace-section">
      <div class="section-header">
        <h2 class="section-title">最近项目</h2>
        <RouterLink to="/manage/history" class="section-link">查看全部</RouterLink>
      </div>
      <div v-if="recentWorkspaces.length > 0" class="workspace-grid">
        <div
          v-for="workspace in recentWorkspaces"
          :key="workspace.id"
          class="workspace-card"
          @click="handleWorkspaceClick(workspace)"
        >
          <div class="workspace-card-thumbnail">
            <img v-if="workspace.thumbnail" :src="workspace.thumbnail" :alt="workspace.name" />
            <div v-else class="workspace-card-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </div>
            <div class="workspace-card-status" :class="`status-${workspace.status}`">
              {{ getStatusLabel(workspace.status) }}
            </div>
          </div>
          <div class="workspace-card-content">
            <div class="workspace-card-name">{{ workspace.name }}</div>
            <div class="workspace-card-meta">
              <span class="workspace-card-type">{{ getTypeLabel(workspace.type) }}</span>
              <span class="workspace-card-time">{{ formatTime(workspace.updatedAt) }}</span>
            </div>
          </div>
          <button
            class="workspace-card-favorite"
            :class="{ active: workspace.isFavorite }"
            @click.stop="handleToggleFavorite(workspace.id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-text">还没有项目，开始创建第一个吧</div>
        <button class="empty-action" @click="$router.push('/')">开始创作</button>
      </div>
    </div>

    <!-- 创建项目模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>创建新项目</h3>
          <button class="modal-close" @click="showCreateModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>项目名称</label>
            <input
              v-model="newWorkspaceName"
              type="text"
              placeholder="输入项目名称"
              class="form-input"
              @keyup.enter="handleCreateWorkspace"
            />
          </div>
          <div class="form-group">
            <label>项目类型</label>
            <div class="type-selector">
              <button
                v-for="type in workspaceTypes"
                :key="type.value"
                class="type-option"
                :class="{ active: newWorkspaceType === type.value }"
                @click="newWorkspaceType = type.value"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path :d="type.icon"></path>
                </svg>
                <span>{{ type.label }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">取消</button>
          <button class="btn-primary" @click="handleCreateWorkspace" :disabled="!newWorkspaceName.trim()">
            创建
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../stores/workspaceStore'
import type { Workspace, WorkspaceType } from '../types/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

const showCreateModal = ref(false)
const newWorkspaceName = ref('')
const newWorkspaceType = ref<WorkspaceType>('text')

const recentWorkspaces = computed(() => workspaceStore.recentWorkspaces.slice(0, 12))

const workspaceTypes = [
  { value: 'text' as WorkspaceType, label: '文本生成图文', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
  { value: 'image' as WorkspaceType, label: '图生图文', icon: 'M3 3h18v18H3z M8.5 8.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M21 15l-5-5-11 11' },
  { value: 'prompt' as WorkspaceType, label: '提示词生图', icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' },
  { value: 'plan' as WorkspaceType, label: '内容规划', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }
]

const handleWorkspaceClick = (workspace: Workspace) => {
  workspaceStore.setCurrentWorkspace(workspace)
  if (workspace.type === 'text') {
    router.push(`/create/text?workspace=${workspace.id}`)
  } else if (workspace.type === 'image') {
    router.push(`/create/image?workspace=${workspace.id}`)
  } else if (workspace.type === 'prompt') {
    router.push(`/create/prompt?workspace=${workspace.id}`)
  } else if (workspace.type === 'plan') {
    router.push(`/plan/content?workspace=${workspace.id}`)
  } else {
    router.push(`/workspace/${workspace.id}`)
  }
}

const handleToggleFavorite = async (id: string) => {
  await workspaceStore.toggleFavorite(id)
}

const handleCreateWorkspace = async () => {
  if (!newWorkspaceName.value.trim()) return

  try {
    const workspace = await workspaceStore.createWorkspace({
      name: newWorkspaceName.value.trim(),
      type: newWorkspaceType.value
    })

    showCreateModal.value = false
    newWorkspaceName.value = ''
    newWorkspaceType.value = 'text'

    // 跳转到对应页面
    handleWorkspaceClick(workspace)
  } catch (error) {
    console.error('创建工作区失败:', error)
    alert('创建工作区失败，请重试')
  }
}

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

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: '草稿',
    'in-progress': '进行中',
    completed: '已完成',
    archived: '已归档'
  }
  return labels[status] || status
}

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await workspaceStore.loadWorkspaces()
})
</script>

<style scoped>
.workspace-view {
  padding: var(--page-padding);
  max-width: var(--container-max-width);
  margin: 0 auto;
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.workspace-header {
  margin-bottom: var(--section-gap);
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-5xl);
  font-weight: var(--font-extrabold);
  color: var(--text-main);
  margin: 0;
  letter-spacing: -1px;
  line-height: var(--line-height-tight);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.action-btn:hover {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:active {
  transform: translateY(0);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--card-gap);
  margin-bottom: var(--section-gap);
}

.action-card {
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  animation: slideUp var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
  box-shadow: var(--shadow-sm);
}

.action-card:nth-child(1) {
  animation-delay: 0.1s;
}

.action-card:nth-child(2) {
  animation-delay: 0.2s;
}

.action-card:nth-child(3) {
  animation-delay: 0.3s;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(74, 142, 255, 0.08), transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  pointer-events: none;
}

.action-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px) scale(1.01);
  background: var(--bg-card-hover);
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.action-icon::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: var(--shadow-lg);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-family-display);
}

.action-desc {
  font-size: var(--font-sm);
  color: var(--text-sub);
  line-height: var(--line-height-relaxed);
}

.workspace-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.section-link {
  font-size: 14px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.section-link:hover {
  text-decoration: underline;
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--card-gap);
}

.workspace-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  animation: scaleIn var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
}

.workspace-card:nth-child(1) { animation-delay: 0.05s; }
.workspace-card:nth-child(2) { animation-delay: 0.1s; }
.workspace-card:nth-child(3) { animation-delay: 0.15s; }
.workspace-card:nth-child(4) { animation-delay: 0.2s; }
.workspace-card:nth-child(5) { animation-delay: 0.25s; }
.workspace-card:nth-child(6) { animation-delay: 0.3s; }

.workspace-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 142, 255, 0.04), rgba(37, 99, 235, 0.04));
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  pointer-events: none;
}

.workspace-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px) scale(1.01);
  background: var(--bg-card-hover);
}

.workspace-card:hover::before {
  opacity: 1;
}

.workspace-card-thumbnail {
  width: 100%;
  height: 180px;
  background: var(--bg-body);
  position: relative;
  overflow: hidden;
  transition: transform var(--duration-normal) var(--ease-out);
}

.workspace-card:hover .workspace-card-thumbnail {
  transform: scale(1.05);
}

.workspace-card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.workspace-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.workspace-card-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-draft {
  background: var(--bg-body);
  color: var(--text-sub);
}

.status-in-progress {
  background: var(--info-light);
  color: var(--info);
}

.status-completed {
  background: var(--success-light);
  color: var(--success);
}

.status-archived {
  background: var(--bg-body);
  color: var(--text-secondary);
}

.workspace-card-content {
  padding: 16px;
}

.workspace-card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-sub);
}

.workspace-card-type {
  padding: 2px 6px;
  background: var(--bg-body);
  border-radius: 3px;
}

.workspace-card-favorite {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  opacity: 0;
  transition: all var(--duration-normal);
}

.workspace-card:hover .workspace-card-favorite {
  opacity: 1;
}

.workspace-card-favorite.active {
  opacity: 1;
  color: #fbbf24;
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
  margin-bottom: 20px;
}

.empty-action {
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.empty-action:hover {
  background: var(--primary-hover);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  animation: scaleIn var(--duration-normal) var(--ease-spring);
  position: relative;
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.2;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-sub);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--text-main);
}

.modal-body {
  padding: 24px;
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

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--bg-body);
  color: var(--text-main);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.type-option {
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--duration-normal) var(--ease-spring);
  color: var(--text-sub);
  position: relative;
  overflow: hidden;
}

.type-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.type-option:hover {
  border-color: var(--primary);
  background: var(--bg-body);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.15);
}

.type-option:hover::before {
  opacity: 0.05;
}

.type-option.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: var(--shadow-glow);
}

.type-option.active::before {
  opacity: 0.1;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-primary {
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>




