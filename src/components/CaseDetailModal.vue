<template>
  <div v-if="visible" class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ caseItem?.title }}</h3>
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="case-detail-content">
          <div class="case-image-section">
            <img 
              :src="caseItem?.imageUrl" 
              :alt="caseItem?.title" 
              class="case-detail-image"
            />
          </div>
          <div class="case-info-section">
            <div class="info-item">
              <label>分类</label>
              <span class="category-tag">{{ getCategoryName(caseItem?.category || 'other') }}</span>
            </div>
            <div class="info-item">
              <label>风格</label>
              <span>{{ caseItem?.style }}</span>
            </div>
            <div class="info-item">
              <label>创建时间</label>
              <span>{{ formatDate(caseItem?.createdAt || '') }}</span>
            </div>
            <div class="info-item stats">
              <div class="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>{{ caseItem?.likes }} 点赞</span>
              </div>
              <div class="stat-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>{{ caseItem?.views }} 浏览</span>
              </div>
            </div>
            <div class="info-item">
              <label>描述</label>
              <p>{{ caseItem?.description }}</p>
            </div>
          </div>
          <div class="case-config-section">
            <h4>配置信息</h4>
            <div class="config-item">
              <label>生成提示词</label>
              <div class="config-content prompt-content">
                <pre>{{ caseItem?.config.prompt }}</pre>
                <button class="copy-btn" @click="handleCopyPrompt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制提示词
                </button>
              </div>
            </div>
            <div class="config-item">
              <label>风格ID</label>
              <div class="config-content">
                <code>{{ caseItem?.config.styleId }}</code>
              </div>
            </div>
            <div class="config-item">
              <label>其他参数</label>
              <div class="config-content">
                <pre>{{ JSON.stringify(caseItem?.config.otherParams, null, 2) }}</pre>
              </div>
            </div>
            <div class="config-actions">
              <button class="btn btn-primary" @click="handleCopyAllConfig">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制完整配置
              </button>
              <button class="btn btn-secondary" @click="handleClose">
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CaseItem, CaseCategory } from '../types/case'

interface Props {
  /** 案例数据 */
  caseItem?: CaseItem
  /** 是否可见 */
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copyConfig', caseItem: CaseItem): void
  (e: 'copyPrompt', prompt: string): void
}>()

/**
 * 处理关闭弹窗
 */
const handleClose = () => {
  emit('close')
}

/**
 * 处理复制完整配置
 */
const handleCopyAllConfig = () => {
  if (props.caseItem) {
    emit('copyConfig', props.caseItem)
  }
}

/**
 * 处理复制提示词
 */
const handleCopyPrompt = () => {
  if (props.caseItem?.config.prompt) {
    emit('copyPrompt', props.caseItem.config.prompt)
  }
}

/**
 * 获取分类名称
 */
const getCategoryName = (category: CaseCategory): string => {
  const categoryMap: Record<CaseCategory, string> = {
    fashion: '时尚',
    beauty: '美妆',
    lifestyle: '生活方式',
    food: '美食',
    travel: '旅行',
    technology: '科技',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-body);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-sub);
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.modal-body {
  padding: 24px;
}

.case-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.case-image-section {
  text-align: center;
  margin-bottom: 16px;
}

.case-detail-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.case-info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.info-item span {
  font-size: 14px;
  color: var(--text-sub);
}

.info-item p {
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.6;
  margin: 0;
}

.category-tag {
  background: var(--primary-fade);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  width: fit-content;
}

.info-item.stats {
  flex-direction: row;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-sub);
  font-size: 14px;
}

.stat-item svg {
  width: 16px;
  height: 16px;
  color: var(--text-sub);
}

.case-config-section {
  border-top: 1px solid var(--border-color);
  padding-top: 24px;
}

.case-config-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0 0 16px 0;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.config-item label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.config-content {
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: 14px;
  position: relative;
}

.config-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-main);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
}

.config-content code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  color: var(--primary);
  background: var(--primary-fade);
  padding: 2px 4px;
  border-radius: 3px;
}

.prompt-content {
  padding-right: 100px;
}

.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border: none;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--primary-hover);
}

.config-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-header h3 {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .info-item.stats {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .case-detail-image {
    max-height: 300px;
  }
  
  .config-content {
    padding: 12px;
  }
  
  .prompt-content {
    padding-right: 80px;
  }
  
  .copy-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .config-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>