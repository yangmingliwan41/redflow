<template>
  <div v-if="visible" class="guard-modal-overlay">
    <div class="guard-modal-content">
      <div class="guard-modal-header">
        <div class="warning-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2 class="guard-title">生成过程中请勿离开</h2>
        <p class="guard-subtitle">
          当前正在进行内容生成，离开此页面可能导致生成任务失败。
          <br />
          请等待生成完成或点击"再来一篇"或"放弃本次生成"后再进行操作。
        </p>
      </div>

      <div class="guard-modal-footer">
        <button class="btn btn-primary" @click="handleConfirm">
          我知道了
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
}

interface Emits {
  (e: 'confirm'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.guard-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.guard-modal-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  box-shadow: var(--shadow-lg);
  animation: scaleIn var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.guard-modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-gradient);
  opacity: 0.3;
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

.guard-modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.warning-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto var(--spacing-lg);
  border-radius: 50%;
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-hover) 100%);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn var(--duration-normal) var(--ease-spring);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.guard-title {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-md);
  line-height: var(--line-height-tight);
}

.guard-subtitle {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.guard-modal-footer {
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
}

.btn-primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.btn-primary:hover {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.btn-primary:hover::before {
  left: 100%;
}
</style>
