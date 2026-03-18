<template>
  <div v-if="visible" class="continue-edit-modal-overlay" @click.self="handleCancel">
    <div class="continue-edit-modal-content">
      <div class="continue-edit-modal-header">
        <div class="info-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h2 class="continue-edit-title">检测到未完成的大纲</h2>
        <p class="continue-edit-subtitle">
          您已有未完成的大纲内容（共 {{ pagesCount }} 页），是否继续编辑？
          <br />
          <span style="color: var(--text-secondary, #999); font-size: 12px;">
            点击"继续编辑"将保留现有内容，点击"重新生成"将覆盖现有大纲
          </span>
        </p>
      </div>

      <div class="continue-edit-modal-footer">
        <button class="btn btn-secondary" @click="handleCancel">
          重新生成
        </button>
        <button class="btn btn-primary" @click="handleConfirm">
          继续编辑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  pagesCount: number
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.continue-edit-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.continue-edit-modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.continue-edit-modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.info-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.continue-edit-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main, #333);
  margin: 0 0 12px;
}

.continue-edit-subtitle {
  font-size: 14px;
  color: var(--text-sub, #666);
  margin: 0;
  line-height: 1.6;
}

.continue-edit-modal-footer {
  padding: 20px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.btn-secondary {
  background: white;
  color: var(--text-main, #333);
  border: 1px solid var(--border-color, #d9d9d9);
}

.btn-secondary:hover {
  background: var(--bg-body, #f5f5f5);
  border-color: var(--text-sub, #999);
}

.btn-primary {
  background: var(--primary, #1890ff);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover, #40a9ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}
</style>
