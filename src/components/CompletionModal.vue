<template>
  <div v-if="visible" class="completion-modal-overlay" @click.self="handleCancel">
    <div class="completion-modal-content">
      <div class="completion-modal-header">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="completion-title">{{ completionStatus === 'partial' ? '部分生成完成' : '生成完成！' }}</h2>
        <p class="completion-subtitle">
          <span v-if="completionStatus === 'partial'">
            有 {{ failedCount }} 张图片生成失败，您可以继续保存或重试失败的图片
          </span>
          <span v-else>
            所有图片已生成完毕，请完善项目信息后保存
          </span>
        </p>
      </div>

      <div class="completion-modal-body">
        <div class="form-group">
          <label class="form-label">项目名称</label>
          <input
            v-model="projectName"
            type="text"
            class="form-input"
            placeholder="输入项目名称"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label class="form-label">项目备注</label>
          <textarea
            v-model="projectDescription"
            class="form-textarea"
            placeholder="输入项目备注（可选）"
            rows="3"
            maxlength="200"
          ></textarea>
        </div>
      </div>

      <div class="completion-modal-footer">
        <button class="btn btn-secondary" @click="handleCancel" :disabled="saving">
          取消
        </button>
        <button class="btn btn-primary" @click="handleConfirm" :disabled="saving || !projectName.trim()">
          <span v-if="saving">保存中...</span>
          <span v-else>{{ completionStatus === 'partial' ? '保存（部分完成）' : '完成并保存' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  visible: boolean
  initialProjectName?: string
  initialProjectDescription?: string
  completionStatus?: 'completed' | 'partial'
  failedCount?: number
}

interface Emits {
  (e: 'confirm', data: { projectName: string; projectDescription: string }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  initialProjectName: '',
  initialProjectDescription: '',
  completionStatus: 'completed',
  failedCount: 0
})

const emit = defineEmits<Emits>()

const projectName = ref('')
const projectDescription = ref('')
const saving = ref(false)

// 监听 visible 变化，初始化表单数据
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 优先使用传入的项目名称，如果为空则使用主题
    projectName.value = props.initialProjectName || ''
    projectDescription.value = props.initialProjectDescription || ''
    saving.value = false
  }
}, { immediate: true })

const handleConfirm = () => {
  if (!projectName.value.trim()) {
    return
  }
  
  saving.value = true
  emit('confirm', {
    projectName: projectName.value.trim(),
    projectDescription: projectDescription.value.trim()
  })
}

const handleCancel = () => {
  if (saving.value) return
  emit('cancel')
}
</script>

<style scoped>
.completion-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal, 1050);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  backdrop-filter: blur(4px);
  overflow-y: auto;
}

.completion-modal-content {
  background: white;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  animation: slideUp 0.3s ease-out;
  margin: auto;
  position: relative;
  z-index: calc(var(--z-modal, 1050) + 1);
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

.completion-modal-header {
  padding: 32px 32px 24px;
  text-align: center;
  border-bottom: 1px solid var(--border-color, #f0f0f0);
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
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

.completion-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main, #333);
  margin: 0 0 8px;
}

.completion-subtitle {
  font-size: 14px;
  color: var(--text-sub, #666);
  margin: 0;
}

.completion-modal-body {
  padding: 24px 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main, #333);
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-body, #fff);
  color: var(--text-main, #333);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary, #1890ff);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.completion-modal-footer {
  padding: 20px 32px 32px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color, #f0f0f0);
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-body, #f5f5f5);
  color: var(--text-main, #333);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-body, #e8e8e8);
}

.btn-primary {
  background: var(--primary, #1890ff);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover, #40a9ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}
</style>


