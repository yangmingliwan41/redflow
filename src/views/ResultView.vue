<template>
  <div class="result-container">
    <div class="page-header">
      <div class="page-header-content">
        <h1 class="page-title">创作完成</h1>
        <p class="page-subtitle">恭喜！你的小红书图文已生成完毕，共 {{ store.images.length }} 张</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-download-all" @click="downloadAllContent" title="一键下载文字和图片">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          一键下载
        </button>
        <button class="btn btn-secondary" @click="startOver">
          再来一篇
        </button>
        <button class="btn btn-abandon" @click="handleAbandon">
          放弃本次生成
        </button>
      </div>
    </div>

    <!-- 项目信息编辑卡片 -->
    <div class="card project-info-card" style="max-width: 1400px; margin: 0 auto var(--spacing-lg) auto;">
      <div class="project-header">
        <h3>项目信息</h3>
        <button v-if="!isEditing" class="edit-btn" @click="startEdit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          编辑
        </button>
      </div>
      
      <div v-if="!isEditing" class="project-display">
        <div class="project-name-display">{{ store.projectName || store.topic || '未命名项目' }}</div>
        <div v-if="store.projectDescription" class="project-desc-display">{{ store.projectDescription }}</div>
        <div v-else class="project-desc-placeholder">暂无简介</div>
      </div>
      
      <div v-else class="project-edit">
        <div class="form-group">
          <label>项目名称</label>
          <input 
            v-model="editProjectName" 
            type="text" 
            placeholder="输入项目名称"
            class="form-input"
            maxlength="50"
          />
        </div>
        <div class="form-group">
          <label>项目简介</label>
          <textarea 
            v-model="editProjectDescription" 
            placeholder="输入项目简介（可选）"
            class="form-textarea"
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-secondary" @click="cancelEdit">取消</button>
          <button class="btn btn-primary" @click="saveProjectInfo">保存</button>
        </div>
      </div>
    </div>

    <div class="card" style="max-width: 1400px; margin: 0 auto;">
      <div class="grid-cols-4">
        <div v-for="image in store.images" :key="image.index" class="image-card group">
          <!-- Image Area -->
          <div 
            v-if="image.url" 
            style="position: relative; aspect-ratio: 3/4; overflow: hidden; cursor: pointer;" 
            @click="viewImage(image.url)"
          >
            <img
              :src="image.url"
              :alt="`第 ${image.index + 1} 页`"
              style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;"
              @error="handleImageError(image)"
              @load="handleImageLoad(image)"
            />
            <!-- Regenerating Overlay -->
            <div v-if="regeneratingIndex === image.index" style="position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;">
               <div class="spinner" style="width: 24px; height: 24px; border-width: 2px; border-color: var(--primary); border-top-color: transparent;"></div>
               <span style="font-size: 12px; color: var(--primary); margin-top: 8px; font-weight: 600;">重绘中...</span>
            </div>
            
            <!-- Hover Overlay -->
            <div v-else style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;" class="hover-overlay">
              预览大图
            </div>
          </div>
          
          <!-- Action Bar -->
          <div style="padding: 12px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: var(--text-sub);">Page {{ image.index + 1 }}</span>
            <div style="display: flex; gap: 8px;">
              <button 
                style="border: none; background: none; color: var(--text-sub); cursor: pointer; display: flex; align-items: center;"
                title="重新生成此图"
                @click="handleRegenerate(image)"
                :disabled="regeneratingIndex === image.index"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"></path>
                  <path d="M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
              <button 
                v-if="isDebugMode && image.debugPrompt"
                style="border: none; background: none; color: #8B5CF6; cursor: pointer; display: flex; align-items: center;"
                title="查看生成 Prompt"
                @click="showPromptDebugInfo(image)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </button>
              <button 
                style="border: none; background: none; color: var(--primary); cursor: pointer; font-size: 12px;"
                @click="downloadOne(image)"
              >
                下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文案展示区域 -->
    <div class="card content-copy-card" style="max-width: 1400px; margin: 40px auto;">
      <div class="project-header" style="margin-bottom: 20px;">
        <h3>文案内容</h3>
        <div style="display: flex; gap: 12px;">
          <button 
            v-if="store.isGeneratingCopy" 
            class="btn btn-secondary" 
            disabled
            style="opacity: 0.6; cursor: not-allowed;"
          >
            <div class="spinner" style="width: 14px; height: 14px; border-width: 2px; margin-right: 6px; display: inline-block;"></div>
            文案生成中...
          </button>
          <button 
            v-else-if="store.contentCopy && !isEditingCopy" 
            class="edit-btn" 
            @click="startEditCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            编辑
          </button>
          <button 
            v-if="store.contentCopy && !isEditingCopy" 
            class="btn btn-secondary" 
            @click="regenerateContentCopy"
            :disabled="store.isGeneratingCopy"
            style="font-size: 14px;"
            title="重新生成文案"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; display: inline-block;">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            重新生成
          </button>
          <button 
            v-if="store.contentCopy && !isEditingCopy" 
            class="btn btn-secondary" 
            @click="copyContentCopy"
            style="font-size: 14px;"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px; display: inline-block;">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制文案
          </button>
        </div>
      </div>
      
      <!-- 模拟模式提示 -->
      <div 
        v-if="store.contentCopy && (store.contentCopy.includes('【模拟模式') || store.contentCopy.includes('模拟文案'))" 
        class="mock-mode-alert"
        style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 20px;"
      >
        <div style="display: flex; align-items: start; gap: 12px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9800" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #856404; margin-bottom: 8px;">
              ⚠️ 当前处于模拟模式
            </div>
            <div style="color: #856404; font-size: 14px; line-height: 1.6;">
              当前显示的是测试文案，不会调用真实的DeepSeek API。要生成真实文案，请前往
              <router-link to="/settings" style="color: #0066cc; text-decoration: underline;">
                "系统设置"
              </router-link>
              页面，关闭"测试模式（模拟API）"开关，然后重新生成。
            </div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="!store.contentCopy && !store.isGeneratingCopy" class="content-copy-placeholder">
        <p style="color: var(--text-sub); text-align: center; padding: 40px;">
          文案生成中或未生成，请稍候...
        </p>
      </div>
      
      <div v-else-if="store.isGeneratingCopy" class="content-copy-loading">
        <div class="spinner" style="width: 24px; height: 24px; margin: 0 auto;"></div>
        <p style="text-align: center; color: var(--text-sub); margin-top: 12px;">正在生成文案...</p>
      </div>
      
      <!-- 文案内容卡片 -->
      <div v-else-if="!isEditingCopy && store.contentCopy" class="content-copy-display">
        <div class="content-copy-text-card">
          <div class="content-copy-text" style="white-space: pre-wrap; line-height: 1.8; color: var(--text-primary);">
            {{ store.contentCopy }}
          </div>
        </div>
      </div>
      
      <!-- 编辑模式 -->
      <div v-else-if="isEditingCopy" class="content-copy-edit">
        <textarea 
          v-model="editContentCopy" 
          placeholder="输入文案内容"
          class="form-textarea"
          rows="15"
          style="width: 100%; font-family: inherit; font-size: 14px; line-height: 1.8;"
        ></textarea>
        <div class="form-actions" style="margin-top: 16px;">
          <button class="btn btn-secondary" @click="cancelEditCopy">取消</button>
          <button class="btn btn-primary" @click="saveContentCopy">保存</button>
        </div>
      </div>
    </div>

    <ImagePreviewModal
      :visible="showImagePreview"
      :url="previewImageUrl"
      @close="closePreview"
    />

    <PromptDebugModal
      :visible="showPromptDebug"
      :debug-info="currentDebugInfo"
      @close="closePromptDebug"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTextGeneratorStore } from '../stores/textGenerator'
import { generatePageImage } from '../services/ai'
import { generateContentCopy } from '../services/ai/contentCopy'
import { getCurrentUser } from '../services/storage'
import { saveHistoryItem } from '../services/storage/history'
import { ProcessingMode, ProcessingStatus } from '../types'
import { v4 as uuidv4 } from 'uuid'
import ImagePreviewModal from '../components/ImagePreviewModal.vue'
import PromptDebugModal from '../components/PromptDebugModal.vue'
import { STORAGE_KEYS } from '../config/constants'

const router = useRouter()
const store = useTextGeneratorStore()
const regeneratingIndex = ref<number | null>(null)
const showImagePreview = ref(false)
const previewImageUrl = ref<string>('')
const showPromptDebug = ref(false)
const currentDebugInfo = ref<{
  pageIndex: number
  pageType: string
  style?: string
  temperature: number
  negativePrompt?: string
  prompt: string
  stylePromptPreview?: string
} | null>(null)
const isEditing = ref(false)
const editProjectName = ref('')
const editProjectDescription = ref('')
const isEditingCopy = ref(false)
const editContentCopy = ref('')

// 项目信息编辑
const startEdit = () => {
  editProjectName.value = store.projectName || store.topic || ''
  editProjectDescription.value = store.projectDescription || ''
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveProjectInfo = async () => {
  if (!editProjectName.value.trim()) {
    alert('项目名称不能为空')
    return
  }
  
  store.setProjectName(editProjectName.value.trim())
  store.setProjectDescription(editProjectDescription.value.trim())
  isEditing.value = false
  
  // 更新历史记录
  const user = getCurrentUser()
  if (user && store.recordId) {
      const historyItem: any = {
      id: store.recordId,
      topic: store.topic,
      projectName: store.projectName,
      projectDescription: store.projectDescription,
      outline: store.outline.raw,
      contentCopy: store.contentCopy || null, // 保存生成的文案
      pages: store.outline.pages.map((page, idx) => ({
        index: page.index,
        title: page.type === 'cover' ? '封面' : `第${idx}页`,
        content: page.content,
        imageUrl: store.images.find(img => img.index === page.index)?.url
      })),
      originalImageUrl: store.images[0]?.url || '',
      status: ProcessingStatus.COMPLETED,
      createdAt: Date.now(),
      userId: user.id,
      mode: 'TEXT_TO_IMAGE' as const
    }
    
      await saveHistoryItem(user.id, historyItem as any)
  }
}

// 文案编辑相关
const startEditCopy = () => {
  editContentCopy.value = store.contentCopy || ''
  isEditingCopy.value = true
}

const cancelEditCopy = () => {
  isEditingCopy.value = false
  editContentCopy.value = ''
}

const saveContentCopy = () => {
  if (editContentCopy.value.trim()) {
    store.setContentCopy(editContentCopy.value.trim())
    isEditingCopy.value = false
  }
}

const copyContentCopy = async () => {
  if (store.contentCopy) {
    try {
      await navigator.clipboard.writeText(store.contentCopy)
      alert('文案已复制到剪贴板')
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = store.contentCopy
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        alert('文案已复制到剪贴板')
      } catch (e) {
        alert('复制失败，请手动复制')
      }
      document.body.removeChild(textarea)
    }
  }
}

// 重新生成文案
const regenerateContentCopy = async () => {
  if (store.isGeneratingCopy) {
    return
  }

  if (!store.topic || !store.outline.pages.length) {
    alert('无法重新生成：缺少主题或大纲信息')
    return
  }

  try {
    console.log('🔄 开始重新生成文案...', {
      topic: store.topic,
      outlineLength: store.outline.raw.length
    })
    store.setGeneratingCopy(true)
    // 清除旧文案，显示生成中状态
    store.clearContentCopy()
    // 清除记录的主题和大纲hash，强制重新生成
    localStorage.removeItem('LAST_COPY_TOPIC')
    localStorage.removeItem('LAST_COPY_OUTLINE_HASH')
    
    const copyResult = await generateContentCopy(
      store.outline.raw,
      store.outline.pages,
      store.topic
    )
    
    store.setContentCopy(copyResult.content)
    // 更新记录的主题和大纲hash
    const currentTopic = store.topic || ''
    const currentOutlineHash = store.outline.raw ? 
      store.outline.raw.substring(0, 100) : ''
    localStorage.setItem('LAST_COPY_TOPIC', currentTopic)
    localStorage.setItem('LAST_COPY_OUTLINE_HASH', currentOutlineHash)
    
    console.log('✅ 文案重新生成成功', { 
      contentLength: copyResult.content.length,
      usage: copyResult.usage,
      topic: currentTopic
    })
  } catch (e: any) {
    console.error('❌ 文案重新生成失败:', e)
    alert(`文案重新生成失败: ${e.message || '未知错误'}`)
    store.setGeneratingCopy(false)
  }
}

// 确保保存到历史记录（统一的历史记录保存入口）
let hasSavedHistory = false // 防止重复保存

onMounted(async () => {
  // 确保有用户
  let user = getCurrentUser()
  
  if (!user) {
    console.warn('⚠️ ResultView: 未找到用户，尝试创建默认用户')
    try {
      const { registerUser, loginUser } = await import('../services/storage')
      const defaultUser = registerUser('default_user', 'default@example.com')
      console.log('已创建默认用户:', defaultUser.id)
      loginUser(defaultUser.email)
      user = defaultUser
    } catch (e: any) {
      // 如果用户已存在，尝试登录
      if (e.message && e.message.includes('Email already exists')) {
        try {
          const { loginUser } = await import('../services/storage')
          user = loginUser('default@example.com')
          console.log('使用已存在的默认用户:', user.id)
        } catch (loginError) {
          console.error('登录默认用户失败:', loginError)
          return
        }
      } else {
        console.error('创建默认用户失败:', e)
        return
      }
    }
  }
  
  // 检查是否有图片数据
  const completedImages = store.images.filter(img => img.status === 'done' && img.url)
  if (completedImages.length === 0) {
    console.warn('⚠️ ResultView: 没有成功生成的图片，跳过历史记录保存')
    return
  }
  
  // 防止重复保存
  if (hasSavedHistory) {
    console.log('⚠️ ResultView: 历史记录已保存过，跳过重复保存')
    return
  }
  
  // 保存历史记录
  await saveHistoryToResultView(user.id)
  hasSavedHistory = true
})

// 提取保存历史记录的逻辑
const saveHistoryToResultView = async (userId: string) => {
  try {
    // 自动生成项目名称（如果还没有），使用完整主题
    if (!store.projectName) {
      store.setProjectName(store.topic)
    }
    
    // 确保所有图片都已生成（只保存成功生成的图片）
    const completedImages = store.images.filter(img => img.status === 'done' && img.url)
    
    if (completedImages.length === 0) {
      console.warn('⚠️ ResultView: 没有成功生成的图片，跳过历史记录保存')
      return
    }
    
    // 头图模式下只保存单张图片，减少存储占用
    const imagesToSave = store.headImageMode ? [completedImages[0]] : completedImages
    
    // 使用已有的recordId，如果没有则创建新的并保存到store
    const recordId = store.recordId || uuidv4()
    if (!store.recordId) {
      store.recordId = recordId
    }
    
    // 构建页面数组，只保存有成功生成图片的页面
    let pagesToSave = store.outline.pages
    
    // 头图模式下只保存单张头图页面
    if (store.headImageMode) {
      // 优先选择封面页
      const coverPage = store.outline.pages.find(p => p.type === 'cover')
      pagesToSave = coverPage ? [coverPage] : [store.outline.pages[0]]
    }
    
    // 只保存有成功生成图片的页面
    pagesToSave = pagesToSave.filter(page => {
      return imagesToSave.some(img => img.index === page.index)
    })
    
    const historyItem: any = {
      id: recordId,
      topic: store.topic,
      projectName: store.projectName,
      projectDescription: store.projectDescription,
      outline: store.outline.raw,
      contentCopy: store.contentCopy || null, // 保存生成的文案
      pages: pagesToSave.map((page, idx) => ({
        index: idx, // 重新索引，确保连续
        title: page.type === 'cover' ? '封面' : `第${idx + 1}页`,
        content: page.content,
        imageUrl: imagesToSave.find(img => img.index === page.index)?.url, // 从已筛选的图片列表中获取
        imagePrompt: (page as any).imagePrompt || undefined
      })),
      originalImageUrl: imagesToSave[0]?.url || '',
      generatedImageUrl: imagesToSave[0]?.url || '', // 确保包含生成的图片
      status: ProcessingStatus.COMPLETED,
      createdAt: Date.now(),
      userId: userId,
      mode: ProcessingMode.TEXT_TO_IMAGE, // 使用枚举值
      isHeadImageMode: store.headImageMode // 记录是否为头图模式
    }
    
    console.log('=== ResultView: 保存历史记录 ===', historyItem)
    try {
      await saveHistoryItem(userId, historyItem as any)
      console.log('=== ResultView: 历史记录保存完成 ===')
      
      // 更新store中的recordId
      store.recordId = recordId
      
      // 验证保存
      const { getUserHistory } = await import('../services/storage')
      const savedHistory = getUserHistory(userId)
      console.log('验证：当前用户的历史记录数量:', savedHistory.length)
      if (savedHistory.length > 0) {
        const latestRecord = savedHistory.find(h => h.id === recordId)
        if (latestRecord) {
          console.log('✅ 历史记录验证成功！记录ID:', recordId)
        } else {
          console.warn('⚠️ 历史记录验证：未找到对应记录，但保存操作已完成')
        }
      }
    } catch (saveError: any) {
      console.error('❌ ResultView: 保存历史记录时出错:', saveError)
      // 显示用户友好的错误提示
      const errorMessage = saveError?.message || '保存失败，请重试'
      if (errorMessage.includes('存储空间不足')) {
        alert('⚠️ 存储空间不足，无法保存历史记录。\n\n建议：\n1. 清理浏览器缓存\n2. 删除一些旧的历史记录\n3. 减少图片数量后重试')
      } else {
        alert(`保存失败：${errorMessage}\n\n请检查控制台获取详细信息。`)
      }
      throw saveError // 重新抛出错误，让调用者知道保存失败
    }
  } catch (error: any) {
    console.error('❌ ResultView: saveHistoryToResultView 外层错误:', error)
    // 如果内层已经处理了错误，这里只是记录日志
    // 如果内层没有处理，这里可以添加额外的错误处理
    throw error
  }
}

const viewImage = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const closePreview = () => {
  showImagePreview.value = false
  previewImageUrl.value = ''
}

// 检查是否启用调试模式
const isDebugMode = ref(localStorage.getItem(STORAGE_KEYS.PROMPT_DEBUG_MODE) === 'true')

// 监听调试模式变化
if (typeof window !== 'undefined') {
  const checkDebugMode = () => {
    isDebugMode.value = localStorage.getItem(STORAGE_KEYS.PROMPT_DEBUG_MODE) === 'true'
  }
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.PROMPT_DEBUG_MODE) {
      checkDebugMode()
    }
  })
  // 定期检查（因为同标签页的 localStorage 变化不会触发 storage 事件）
  setInterval(checkDebugMode, 1000)
}

const showPromptDebugInfo = (image: any) => {
  const page = store.outline.pages.find(p => p.index === image.index)
  if (image.debugPrompt && image.debugInfo) {
    currentDebugInfo.value = {
      pageIndex: image.index,
      pageType: page?.type || 'content',
      style: image.debugInfo.style,
      temperature: image.debugInfo.temperature,
      negativePrompt: image.debugInfo.negativePrompt,
      prompt: image.debugPrompt,
      stylePromptPreview: image.debugInfo.stylePromptPreview
    }
    showPromptDebug.value = true
  }
}

const closePromptDebug = () => {
  showPromptDebug.value = false
  currentDebugInfo.value = null
}

const handleImageError = (image: any) => {
  console.error(`图片加载失败 (第 ${image.index + 1} 页):`, image.url)
  console.error('图片URL类型:', image.url?.startsWith('data:') ? 'Base64' : 'URL')
  console.error('图片URL长度:', image.url?.length)
}

const handleImageLoad = (image: any) => {
  console.log(`✅ 图片加载成功 (第 ${image.index + 1} 页)`)
}

const startOver = () => {
  store.reset()
  // 根据当前模式跳转到对应的生成功能页面
  // ResultView 主要用于文本生成图文模式，所以跳转到文本生成页面
  router.push('/create/text')
}

const handleAbandon = () => {
  if (confirm('确定要放弃本次生成吗？放弃后所有生成的内容将无法恢复。')) {
    store.reset()
    router.push('/')
  }
}

const downloadOne = (image: any) => {
  if (image.url) {
    const link = document.createElement('a')
    link.href = image.url
    link.download = `redflow_page_${image.index + 1}.png`
    link.click()
  }
}

// 一键下载文字和图片
const downloadAllContent = () => {
  try {
    // 1. 先下载文字内容
    downloadTextContent()
    
    // 2. 延迟下载图片，避免浏览器阻止多个下载
    setTimeout(() => {
      downloadAllImages()
    }, 500)
    
    console.log('✅ 开始下载文字和图片')
  } catch (error) {
    console.error('❌ 下载失败:', error)
    alert('下载失败: ' + (error as Error).message)
  }
}

// 下载完整文字内容（优先使用生成的文案，否则从outline.pages提取）
const downloadTextContent = () => {
  try {
    let textContent = ''
    
    // 优先使用生成的文案
    if (store.contentCopy) {
      textContent = store.contentCopy
    } else {
      // 如果没有文案，从outline.pages中提取完整文字内容
      // 添加项目信息（可选）
      if (store.projectName || store.topic) {
        textContent += `${store.projectName || store.topic}\n\n`
      }
      
      if (store.projectDescription) {
        textContent += `${store.projectDescription}\n\n`
        textContent += `${'='.repeat(50)}\n\n`
      }
      
      // 添加每页内容
      store.outline.pages.forEach((page, idx) => {
        const pageTitle = page.type === 'cover' ? '封面' : `第${idx}页`
        textContent += `【${pageTitle}】\n\n`
        
        if (page.content) {
          textContent += `${page.content}\n\n`
        }
        
        // 不包含配图建议，只包含文字内容
        textContent += `${'-'.repeat(50)}\n\n`
      })
    }
    
    // 创建下载链接（纯文本格式）
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${store.projectName || store.topic || 'redflow'}_文字内容.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('✅ 文字内容下载成功')
  } catch (error) {
    console.error('❌ 下载文字内容失败:', error)
    alert('下载文字内容失败: ' + (error as Error).message)
  }
}

// 下载所有图片
const downloadAllImages = () => {
  const imagesToDownload = store.images.filter(img => img.url && img.status === 'done')
  
  if (imagesToDownload.length === 0) {
    console.warn('没有可下载的图片')
    return
  }
  
  imagesToDownload.forEach((image, index) => {
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = image.url
      link.download = `${store.projectName || 'redflow'}_第${image.index + 1}页.png`
      link.click()
    }, index * 300)
  })
  
  console.log(`✅ 开始下载 ${imagesToDownload.length} 张图片`)
}


const handleRegenerate = async (image: any) => {
  if (regeneratingIndex.value !== null) return

  regeneratingIndex.value = image.index
  try {
    const page = store.outline.pages.find(p => p.index === image.index)
    if (!page) {
      alert('无法找到对应页面的内容')
      return
    }

    // 获取自定义prompt
    const customImagePrompt = localStorage.getItem('CUSTOM_IMAGE_PROMPT') || undefined
    
    const result = await generatePageImage(
      page.content,
      page.index,
      store.outline.pages.length,
      store.outline.raw,
      store.topic,
      page.type,
      customImagePrompt || undefined,
      (page as any).imagePrompt || undefined,
      store.style || undefined,
      store.outline.visualGuide, // 传递全局视觉指南
      page.visualMetadata // 传递当前页的视觉元数据
    )
    store.updateImage(image.index, result.imageUrl)
  } catch (e: any) {
    alert('重绘失败: ' + e.message)
  } finally {
    regeneratingIndex.value = null
  }
}
</script>

<style scoped>
.result-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-2xl);
  width: 100%;
  position: relative;
  z-index: 1;
}

.page-header {
  max-width: 1400px;
  margin: 0 auto var(--spacing-2xl) auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 0 var(--spacing-lg);
}

.page-header-content {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  position: relative;
  z-index: 20;
}

.btn-download-all {
  background: var(--primary);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.btn-download-all:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.page-title {
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin: 0;
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  border: none;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  position: relative;
  z-index: 20;
  pointer-events: auto;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.grid-cols-4 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  width: 100%;
}

@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

.image-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.image-card:hover .hover-overlay {
  opacity: 1;
}

.image-card:hover img {
  transform: scale(1.05);
}

.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.project-info-card {
  margin-bottom: 24px;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.project-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: var(--primary);
  color: white;
}

.project-display {
  padding: 16px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
}

.project-name-display {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.project-desc-display {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.6;
}

.project-desc-placeholder {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}

.project-edit {
  padding: 16px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-secondary {
  background: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-body);
}

.btn-abandon {
  background: white;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.btn-abandon:hover {
  background: #fff1f0;
  border-color: #ff4d4f;
}

/* 文案内容卡片样式 */
.content-copy-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.content-copy-placeholder {
  text-align: center;
  padding: 60px 20px;
}

.content-copy-loading {
  text-align: center;
  padding: 60px 20px;
}

.content-copy-display {
  padding: 0;
}

.content-copy-text-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 24px;
  margin: 0;
  border: 1px solid #f0f0f0;
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
  transition: all 0.2s;
}

.content-copy-text-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.content-copy-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #333;
  font-size: 15px;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
}

.content-copy-text-card::-webkit-scrollbar {
  width: 6px;
}

.content-copy-text-card::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.content-copy-text-card::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.content-copy-text-card::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.content-copy-edit {
  padding: 20px;
}
</style>

