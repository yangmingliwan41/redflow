<template>
  <aside class="workspace-sidebar" :class="{ 'collapsed': isCollapsed }">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-area" @click="$router.push('/')" style="cursor: pointer;">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <span v-if="!isCollapsed" class="logo-text">红流云创</span>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar" :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
        <svg v-if="isCollapsed" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div v-if="!isCollapsed" class="search-area">
      <div class="search-input-wrapper">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索项目..."
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 快速创建按钮 -->
    <div v-if="!isCollapsed" class="quick-create-area">
      <button class="quick-create-btn" @click="showCreateMenu = !showCreateMenu">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        快速创建
      </button>
      
      <!-- 创建菜单 -->
      <div v-if="showCreateMenu" class="create-menu" @click.stop>
        <button class="create-menu-item" @click="handleCreate('text')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <div>
            <div class="menu-item-title">文本生成图文</div>
            <div class="menu-item-desc">输入主题，AI生成完整图文</div>
          </div>
        </button>
        <button class="create-menu-item" @click="handleCreate('image')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <div>
            <div class="menu-item-title">图生图文</div>
            <div class="menu-item-desc">上传图片，AI生成营销图文</div>
          </div>
        </button>
        <button class="create-menu-item" @click="handleCreate('prompt')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <div>
            <div class="menu-item-title">提示词生图</div>
            <div class="menu-item-desc">输入提示词，批量生成图片</div>
          </div>
        </button>
      </div>
    </div>

    <!-- 工作区分组列表 -->
    <div v-if="!isCollapsed" class="workspace-groups">
      <div
        v-for="group in filteredGroups"
        :key="group.type"
        class="workspace-group"
      >
        <div class="group-header" @click="toggleGroup(group.type)">
          <span class="group-name">{{ group.name }}</span>
          <span class="group-count">({{ group.workspaces.length }})</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="group-arrow"
            :class="{ expanded: expandedGroups[group.type] }"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div v-if="expandedGroups[group.type]" class="group-workspaces">
          <div
            v-for="workspace in group.workspaces"
            :key="workspace.id"
            class="workspace-item"
            :class="{ active: currentWorkspace?.id === workspace.id }"
            @click="handleWorkspaceClick(workspace)"
            @contextmenu.prevent="handleWorkspaceContextMenu($event, workspace)"
          >
            <div class="workspace-thumbnail">
              <img v-if="workspace.thumbnail" :src="workspace.thumbnail" :alt="workspace.name" />
              <div v-else class="workspace-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
              </div>
            </div>
            <div class="workspace-info">
              <div class="workspace-name">{{ workspace.name }}</div>
              <div class="workspace-meta">
                <span class="workspace-type">{{ getTypeLabel(workspace.type) }}</span>
                <span class="workspace-time">{{ formatTime(workspace.updatedAt) }}</span>
              </div>
            </div>
            <button
              v-if="workspace.isFavorite"
              class="favorite-icon"
              @click.stop="handleToggleFavorite(workspace.id)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区 -->
    <div class="sidebar-footer" :class="{ 'collapsed': isCollapsed }">
      <button class="footer-btn" :title="isCollapsed ? '历史记录' : ''" @click="$router.push('/manage/history')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3h18v18H3zM7 3v18M3 7h18"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <span v-if="!isCollapsed">历史记录</span>
      </button>
      <button class="footer-btn" :title="isCollapsed ? '新手引导' : ''" @click="handleShowGuide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span v-if="!isCollapsed">新手引导</span>
      </button>
      <button class="footer-btn" :title="isCollapsed ? '设置' : ''" @click="$router.push('/settings')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m-6-6h6m6 0h-6"></path>
        </svg>
        <span v-if="!isCollapsed">设置</span>
      </button>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
      @click.stop
    >
      <button class="context-menu-item" @click="handleRename">重命名</button>
      <button class="context-menu-item" @click="handleToggleFavoriteFromMenu">收藏/取消收藏</button>
      <button class="context-menu-item" @click="handleDelete">删除</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import type { Workspace, WorkspaceType } from '../../types/workspace'

const router = useRouter()
const workspaceStore = useWorkspaceStore()

// 尝试从App.vue注入侧边栏状态（如果存在）
const appSidebarCollapsed = inject<{ value: boolean } | undefined>('sidebarCollapsed', undefined)

// 处理显示新手引导
const handleShowGuide = () => {
  // 触发自定义事件，让 HomeView 显示引导
  window.dispatchEvent(new CustomEvent('redflow:showGuide'))
  // 如果不在首页，先跳转到首页
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

const searchQuery = ref('')
const showCreateMenu = ref(false)
const isCollapsed = ref(false)
const expandedGroups = ref<Record<string, boolean>>({
  recent: true,
  favorite: true,
  all: false
})

// 从localStorage恢复收起状态
onMounted(() => {
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    isCollapsed.value = saved === 'true'
    // 如果App.vue提供了状态，同步更新
    if (appSidebarCollapsed) {
      appSidebarCollapsed.value = isCollapsed.value
    }
  } else if (appSidebarCollapsed) {
    // 如果App.vue有初始状态，使用它
    isCollapsed.value = appSidebarCollapsed.value
  }
})

// 监听App.vue中的状态变化（如果存在）
if (appSidebarCollapsed) {
  watch(() => appSidebarCollapsed.value, (newVal) => {
    isCollapsed.value = newVal
  })
}

// 切换侧边栏收起状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  // 同步到App.vue的状态（如果存在）
  if (appSidebarCollapsed) {
    appSidebarCollapsed.value = isCollapsed.value
  }
  // 触发自定义事件，通知其他组件
  window.dispatchEvent(new CustomEvent('sidebar-toggle'))
}

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  workspace: null as Workspace | null
})

// 计算属性
const workspaceGroups = computed(() => workspaceStore.workspaceGroups)
const currentWorkspace = computed(() => workspaceStore.currentWorkspace)

const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) {
    return workspaceGroups.value
  }

  const query = searchQuery.value.toLowerCase()
  return workspaceGroups.value.map(group => ({
    ...group,
    workspaces: group.workspaces.filter(w =>
      w.name.toLowerCase().includes(query) ||
      w.description?.toLowerCase().includes(query) ||
      w.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  })).filter(group => group.workspaces.length > 0)
})

// 方法
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleCreate = (type: WorkspaceType) => {
  showCreateMenu.value = false
  if (type === 'text') {
    router.push('/create/text')
  } else if (type === 'image') {
    router.push('/create/image')
  } else if (type === 'prompt') {
    router.push('/create/prompt')
  }
}

const toggleGroup = (type: string) => {
  expandedGroups.value[type] = !expandedGroups.value[type]
}

const handleWorkspaceClick = (workspace: Workspace) => {
  workspaceStore.setCurrentWorkspace(workspace)
  // 根据工作区类型跳转到对应页面
  if (workspace.relatedId) {
    if (workspace.type === 'text') {
      router.push(`/create/text?workspace=${workspace.id}`)
    } else if (workspace.type === 'image') {
      router.push(`/create/image?workspace=${workspace.id}`)
    } else if (workspace.type === 'prompt') {
      router.push(`/create/prompt?workspace=${workspace.id}`)
    } else if (workspace.type === 'plan') {
      router.push(`/plan/content?workspace=${workspace.id}`)
    } else if (workspace.type === 'requirement') {
      router.push(`/plan/requirement?workspace=${workspace.id}`)
    } else if (workspace.type === 'calendar') {
      router.push(`/plan/calendar?workspace=${workspace.id}`)
    }
  } else {
    router.push(`/workspace/${workspace.id}`)
  }
}

const handleWorkspaceContextMenu = (event: MouseEvent, workspace: Workspace) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    workspace
  }
}

const handleToggleFavorite = async (id: string) => {
  await workspaceStore.toggleFavorite(id)
}

const handleToggleFavoriteFromMenu = async () => {
  if (contextMenu.value.workspace) {
    await handleToggleFavorite(contextMenu.value.workspace.id)
    contextMenu.value.visible = false
  }
}

const handleRename = () => {
  if (contextMenu.value.workspace) {
    const newName = prompt('请输入新名称:', contextMenu.value.workspace.name)
    if (newName && newName.trim()) {
      workspaceStore.updateWorkspace(contextMenu.value.workspace!.id, { name: newName.trim() })
    }
    contextMenu.value.visible = false
  }
}

const handleDelete = async () => {
  if (contextMenu.value.workspace) {
    if (confirm(`确定要删除"${contextMenu.value.workspace.name}"吗？`)) {
      await workspaceStore.deleteWorkspace(contextMenu.value.workspace!.id)
    }
    contextMenu.value.visible = false
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

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (showCreateMenu.value) {
    const target = event.target as HTMLElement
    if (!target.closest('.quick-create-area')) {
      showCreateMenu.value = false
    }
  }
  if (contextMenu.value.visible) {
    contextMenu.value.visible = false
  }
}

onMounted(async () => {
  // 加载工作区数据
  await workspaceStore.loadWorkspaces()
  
  // 确保从历史记录同步最近项目
  try {
    const currentUser = await import('../../services/storage').then(m => m.getCurrentUser())
    if (currentUser) {
      const { getUserHistory } = await import('../../services/storage/history')
      const history = getUserHistory(currentUser.id)
      
      // 为每个历史记录项创建或更新工作区
      for (const historyItem of history) {
        const existingWorkspace = workspaceStore.allWorkspaces.find(w => w.relatedId === historyItem.id)
        if (!existingWorkspace) {
          try {
            await workspaceStore.createWorkspaceFromHistory(historyItem.id, currentUser.id)
          } catch (error) {
            // 忽略已存在的错误
            console.debug('工作区可能已存在:', error)
          }
        }
      }
    }
  } catch (error) {
    console.warn('同步历史记录到工作区失败:', error)
  }
  
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.workspace-sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: var(--z-fixed);
  transition: width var(--duration-normal) var(--ease-smooth);
  box-shadow: var(--shadow-sm);
}

.workspace-sidebar.collapsed {
  width: 80px;
}

.workspace-sidebar.collapsed .logo-text,
.workspace-sidebar.collapsed .search-area,
.workspace-sidebar.collapsed .quick-create-area,
.workspace-sidebar.collapsed .workspace-groups {
  display: none;
}

.workspace-sidebar.collapsed .logo-area {
  justify-content: center;
}

/* 滚动条样式 */
.workspace-sidebar::-webkit-scrollbar {
  width: 4px;
}

.workspace-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 126, 126, 0.2);
}

.sidebar-header {
  padding: var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.workspace-sidebar.collapsed .sidebar-header {
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-body, #f5f5f5);
  border-radius: var(--radius-md, 8px);
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
  color: var(--primary, #4a8eff);
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--spacing-lg);
  right: var(--spacing-lg);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.3;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform var(--duration-fast) var(--ease-out);
}

.logo-area:hover {
  transform: translateX(2px);
}

.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
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

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

.logo-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 0 30px rgba(255, 126, 126, 0.5);
}

.logo-text {
  font-size: var(--font-xl);
  font-weight: var(--font-extrabold);
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.search-area {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
  transition: color var(--duration-fast) var(--ease-out);
}

.search-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  background: var(--bg-body);
  color: var(--text-main);
  transition: all var(--duration-normal) var(--ease-out);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-focus);
}

.search-input:focus + .search-icon,
.search-input:focus ~ .search-icon {
  color: var(--primary);
}

.quick-create-area {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.quick-create-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.quick-create-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.quick-create-btn:hover {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.quick-create-btn:hover::before {
  left: 100%;
}

.quick-create-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.create-menu {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  left: var(--spacing-lg);
  right: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  animation: slideUp var(--duration-fast) var(--ease-out);
}

.create-menu-item {
  padding: var(--spacing-md);
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.create-menu-item::before {
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

.create-menu-item:hover {
  background: var(--bg-body);
  transform: translateX(4px);
}

.create-menu-item:hover::before {
  opacity: 0.05;
}

.create-menu-item svg {
  position: relative;
  z-index: 1;
  color: var(--primary);
  transition: transform var(--duration-fast) var(--ease-spring);
}

.create-menu-item:hover svg {
  transform: scale(1.1) rotate(5deg);
}

.menu-item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 4px;
}

.menu-item-desc {
  font-size: 12px;
  color: var(--text-sub);
}

.workspace-groups {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.workspace-group {
  margin-bottom: 8px;
}

.group-header {
  padding: var(--spacing-sm) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color var(--duration-fast) var(--ease-out);
  position: relative;
}

.group-header:hover {
  color: var(--text-sub);
}

.group-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--primary-gradient);
  transition: height var(--duration-normal) var(--ease-out);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.group-header:hover::before {
  height: 60%;
}

.group-name {
  flex: 1;
}

.group-count {
  color: var(--text-secondary);
  font-weight: normal;
}

.group-arrow {
  transition: transform var(--duration-normal);
}

.group-arrow.expanded {
  transform: rotate(180deg);
}

.group-workspaces {
  padding: 4px 0;
}

.workspace-item {
  padding: var(--spacing-sm) var(--spacing-lg);
  margin: 0 var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.workspace-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.workspace-item:hover {
  background: var(--bg-body);
  transform: translateX(4px);
}

.workspace-item:hover::before {
  opacity: 1;
}

.workspace-item.active {
  background: var(--primary-light);
  border-left: 3px solid transparent;
  border-image: var(--primary-gradient) 1;
}

.workspace-item.active::before {
  opacity: 1;
}

.workspace-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
}

.workspace-item:hover .workspace-thumbnail {
  border-color: var(--primary);
  box-shadow: 0 0 12px rgba(255, 126, 126, 0.3);
  transform: scale(1.05);
}

.workspace-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.workspace-icon {
  color: var(--text-secondary);
}

.workspace-info {
  flex: 1;
  min-width: 0;
}

.workspace-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.workspace-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
}

.workspace-type {
  padding: 2px 6px;
  background: var(--bg-body);
  border-radius: 3px;
}

.favorite-icon {
  color: #fbbf24;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

.workspace-item:hover .favorite-icon {
  opacity: 1;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.sidebar-footer.collapsed {
  padding: 12px;
  align-items: center;
}

.footer-btn {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-sub);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.sidebar-footer.collapsed .footer-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  border-radius: var(--radius-md);
  justify-content: center;
}

.sidebar-footer.collapsed .footer-btn svg {
  width: 20px;
  height: 20px;
}

.footer-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: var(--primary-gradient);
  opacity: 0.1;
  transition: left var(--duration-normal) var(--ease-out);
}

.footer-btn:hover {
  background: var(--bg-body);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.15);
}

.footer-btn:hover::before {
  left: 0;
}

.context-menu {
  position: fixed;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-popover);
  min-width: 140px;
  padding: var(--spacing-xs);
  animation: scaleIn var(--duration-fast) var(--ease-spring);
}

.context-menu-item {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
  position: relative;
}

.context-menu-item:hover {
  background: var(--bg-body);
  color: var(--primary);
  transform: translateX(4px);
}
</style>




