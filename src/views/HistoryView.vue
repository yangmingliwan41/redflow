<template>
  <PageContainer size="xl">
    <PageHeader
      title="历史记录"
      subtitle="查看和管理你的创作历史"
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

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="history.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <h3>暂无历史记录</h3>
      <p>开始创作后，你的作品会显示在这里</p>
    </div>

    <div v-else class="history-grid">
      <div
        v-for="item in history"
        :key="item.id"
        class="history-card"
      >
        <div class="card-image-wrapper" @click="openDetail(item)">
          <div v-if="item.originalImageUrl || (item.pages && item.pages[0]?.imageUrl)" class="card-image">
            <img :src="item.originalImageUrl || item.pages?.[0]?.imageUrl" alt="Preview" />
            <!-- 类型标签 -->
            <div class="card-type-badge">
              <span v-if="item.mode === 'PROMPT_TO_IMAGE'">🎨 提示词生成</span>
              <span v-else-if="item.mode === 'TEXT_TO_IMAGE' || item.topic">📝 文本生成</span>
              <span v-else-if="item.mode === 'IMAGE_TO_IMAGE' || item.analysis">🖼️ 图生图</span>
              <span v-else>📝 文本生成</span>
            </div>
          </div>
        </div>
        <div class="card-content" @click="openDetail(item)">
          <h4>{{ item.projectName || item.analysis?.name || item.topic || '未命名作品' }}</h4>
          <p class="card-meta">
            {{ new Date(item.createdAt || 0).toLocaleDateString() }}
            <span v-if="item.pages" class="page-count"> · {{ item.pages.length }} 页</span>
          </p>
          <div v-if="item.marketingCopy" class="card-preview">
            {{ item.marketingCopy.substring(0, 100) }}...
          </div>
          <div v-else-if="item.topic" class="card-preview">
            {{ item.topic }}
          </div>
        </div>
        <!-- 删除按钮 -->
        <button
          class="delete-button"
          @click.stop.prevent="handleDelete(item)"
          @mousedown.stop
          title="删除此记录"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <HistoryDetailModal
      :visible="detailModalVisible"
      :item="selectedItem"
      @close="closeDetailModal"
    />

    <!-- 删除确认弹窗 -->
    <Modal
      v-model="deleteModalVisible"
      title="确认删除"
      size="sm"
      :closable="true"
      :closeOnBackdrop="true"
      @close="cancelDelete"
    >
      <div class="delete-confirm-content">
        <div class="delete-confirm-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </div>
        <p class="delete-confirm-message">
          确定要删除「<strong>{{ deleteItemName }}</strong>」吗？
        </p>
        <p class="delete-confirm-warning">此操作不可恢复，请谨慎操作。</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="cancelDelete">取消</Button>
        <Button variant="danger" @click="confirmDelete">确认删除</Button>
      </template>
    </Modal>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getUserHistory, getCurrentUser, registerUser, loginUser, deleteHistoryItem } from '../services/storage'
import { GeneratedResult } from '../types'
import HistoryDetailModal from '../components/HistoryDetailModal.vue'
import { PageContainer, PageHeader } from '../components/layout'
import { Modal, Button } from '../components/ui'

const route = useRoute()
const loading = ref(false)
const history = ref<GeneratedResult[]>([])
const detailModalVisible = ref(false)
const selectedItem = ref<GeneratedResult | null>(null)

// 删除确认 Modal 状态
const deleteModalVisible = ref(false)
const itemToDelete = ref<GeneratedResult | null>(null)
const deleteItemName = ref('')

const loadHistory = () => {
  console.log('=== 开始加载历史记录 ===')
  const user = getCurrentUser()
  
  if (user) {
    console.log('找到用户:', user.id, user.username)
    const userHistory = getUserHistory(user.id)
    console.log('加载历史记录:', {
      userId: user.id,
      count: userHistory.length,
      items: userHistory.map(h => ({
        id: h.id,
        mode: h.mode,
        topic: h.topic,
        projectName: h.projectName,
        createdAt: h.createdAt
      }))
    })
    
    // 检查 localStorage 中的实际数据
    const key = `redflow_history_${user.id}`
    const rawData = localStorage.getItem(key)
    console.log('localStorage 原始数据:', rawData ? `长度: ${rawData.length}` : 'null')
    
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData)
        console.log('解析后的数据:', parsed)
      } catch (e) {
        console.error('解析历史记录数据失败:', e)
      }
    }
    
    history.value = userHistory
    console.log('=== 历史记录加载完成，显示数量:', history.value.length, '===')
  } else {
    console.warn('未找到当前用户，无法加载历史记录')
    // 尝试获取或创建默认用户
    try {
      // 先尝试登录已存在的默认用户
      try {
        const existingUser = loginUser('default@example.com')
        console.log('找到已存在的默认用户:', existingUser.id)
        loginUser(existingUser.email)
        history.value = getUserHistory(existingUser.id)
        console.log('默认用户历史记录数量:', history.value.length)
      } catch (loginError) {
        // 如果登录失败，尝试创建新用户
        console.log('默认用户不存在，尝试创建...')
        const defaultUser = registerUser('default_user', 'default@example.com')
        if (defaultUser) {
          console.log('已创建默认用户:', defaultUser.id)
          loginUser(defaultUser.email)
          history.value = getUserHistory(defaultUser.id)
          console.log('默认用户历史记录数量:', history.value.length)
        }
      }
    } catch (e: any) {
      console.error('处理默认用户失败:', e)
      // 如果邮箱已存在，尝试直接使用该用户
      if (e.message && e.message.includes('Email already exists')) {
        try {
          const usersStr = localStorage.getItem('redflow_users')
          const users = usersStr ? JSON.parse(usersStr) : []
          const defaultUser = users.find((u: any) => u.email === 'default@example.com')
          if (defaultUser) {
            console.log('使用已存在的默认用户:', defaultUser.id)
            loginUser(defaultUser.email)
            history.value = getUserHistory(defaultUser.id)
            console.log('默认用户历史记录数量:', history.value.length)
          }
        } catch (fallbackError) {
          console.error('回退方案也失败:', fallbackError)
        }
      }
    }
  }
}

const openDetail = (item: GeneratedResult) => {
  selectedItem.value = item
  detailModalVisible.value = true
}

const closeDetailModal = () => {
  detailModalVisible.value = false
  selectedItem.value = null
}

const viewDetail = async (item: GeneratedResult) => {
  // 如果是文本生成图文模式，可以选择直接跳转或显示详情
  // 这里我们统一使用详情弹窗，用户可以在弹窗中选择"查看完整结果"
  openDetail(item)
}

const handleDelete = (item: GeneratedResult) => {
  // 显示删除确认 Modal
  itemToDelete.value = item
  deleteItemName.value = item.projectName || item.analysis?.name || item.topic || '未命名作品'
  deleteModalVisible.value = true
}

const cancelDelete = () => {
  deleteModalVisible.value = false
  itemToDelete.value = null
  deleteItemName.value = ''
}

const confirmDelete = async () => {
  if (!itemToDelete.value) {
    deleteModalVisible.value = false
    return
  }

  try {
    const item = itemToDelete.value
    const user = getCurrentUser()
    
    if (!user) {
      alert('未找到用户信息，无法删除')
      console.error('删除失败：未找到用户')
      deleteModalVisible.value = false
      return
    }
    
    if (!item.id) {
      alert('删除失败：记录ID不存在')
      console.error('删除失败：item.id 不存在', item)
      deleteModalVisible.value = false
      return
    }
    
    console.log('开始删除历史记录:', { userId: user.id, itemId: item.id, itemName: deleteItemName.value })
    
    const success = deleteHistoryItem(user.id, item.id)
    
    if (success) {
      console.log('✅ 历史记录已删除:', item.id)
      
      // 同步删除对应的工作区（如果存在）
      try {
        const { useWorkspaceStore } = await import('../stores/workspaceStore')
        const workspaceStore = useWorkspaceStore()
        
        // 查找通过 relatedId 关联到该历史记录的工作区
        const relatedWorkspace = workspaceStore.allWorkspaces.find(w => w.relatedId === item.id)
        
        if (relatedWorkspace) {
          await workspaceStore.deleteWorkspace(relatedWorkspace.id)
          console.log('✅ 已同步删除对应的工作区:', relatedWorkspace.id)
        }
      } catch (workspaceError) {
        console.warn('⚠️ 删除工作区失败（不影响历史记录删除）:', workspaceError)
        // 不抛出错误，因为历史记录删除已经成功
      }
      
      // 关闭 Modal
      deleteModalVisible.value = false
      itemToDelete.value = null
      deleteItemName.value = ''
      // 重新加载历史记录
      loadHistory()
    } else {
      console.error('删除失败：deleteHistoryItem 返回 false')
      alert('删除失败，请检查控制台获取详细信息')
    }
  } catch (error: any) {
    console.error('❌ 删除历史记录时出错:', error)
    alert(`删除失败：${error?.message || '未知错误'}\n\n请检查控制台获取详细信息。`)
  } finally {
    deleteModalVisible.value = false
  }
}

onMounted(() => {
  loadHistory()
})

// 监听路由变化，当从其他页面返回时重新加载历史记录
watch(() => route.path, (newPath) => {
  if (newPath === '/history') {
    console.log('=== 路由切换到历史记录页面，重新加载 ===')
    loadHistory()
  }
})
</script>

<style scoped>
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  color: var(--text-sub);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  background: var(--bg-card);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-xl);
  margin-top: var(--section-gap);
}

.empty-state svg {
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  font-size: var(--font-base);
  color: var(--text-sub);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  animation: fadeIn var(--duration-normal) var(--ease-out);
  width: 100%;
}

@media (max-width: 768px) {
  .history-grid {
    grid-template-columns: 1fr;
  }
}

.history-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: visible;
  transition: all var(--duration-normal) var(--ease-spring);
  border: 1px solid var(--border-color);
  position: relative;
  animation: scaleIn var(--duration-normal) var(--ease-out);
  animation-fill-mode: both;
  box-shadow: var(--shadow-sm);
}

.history-card:nth-child(1) { animation-delay: 0.05s; }
.history-card:nth-child(2) { animation-delay: 0.1s; }
.history-card:nth-child(3) { animation-delay: 0.15s; }
.history-card:nth-child(4) { animation-delay: 0.2s; }
.history-card:nth-child(5) { animation-delay: 0.25s; }
.history-card:nth-child(6) { animation-delay: 0.3s; }

.history-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 142, 255, 0.04), rgba(37, 99, 235, 0.04));
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  border-radius: inherit;
  pointer-events: none;
}

.history-card .card-image-wrapper {
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: transform var(--duration-normal) var(--ease-out);
}

.history-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
  background: var(--bg-card-hover);
}

.history-card:hover::before {
  opacity: 1;
}

.history-card:hover .card-image-wrapper {
  transform: scale(1.05);
}

.card-image-wrapper {
  cursor: pointer;
}

.card-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--bg-body);
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.history-card:hover .card-image img {
  transform: scale(1.1);
}

.card-type-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-inverse);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
}

.card-content {
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
}

.card-content h4 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  margin-bottom: var(--spacing-sm);
  color: var(--text-main);
  line-height: var(--line-height-tight);
}

.card-meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.page-count {
  color: var(--primary);
  font-weight: 500;
}

.card-preview {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.5;
}

.card-content {
  cursor: pointer;
}

.delete-button {
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
  z-index: 100;
  color: var(--text-main);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0;
  margin: 0;
  outline: none;
}

.delete-button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.delete-button:hover {
  background: #ff4444;
  color: white;
  border-color: #ff4444;
  transform: scale(1.1);
}

.delete-button:active {
  transform: scale(0.95);
}

.delete-button svg {
  width: 16px;
  height: 16px;
}

/* 删除确认 Modal 样式 */
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

.delete-confirm-icon svg {
  width: 48px;
  height: 48px;
}

.delete-confirm-message {
  font-size: var(--font-lg);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

.delete-confirm-message strong {
  color: var(--primary);
  font-weight: 600;
}

.delete-confirm-warning {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin-top: var(--spacing-md);
}
</style>

