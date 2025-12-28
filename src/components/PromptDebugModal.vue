<template>
  <div v-if="visible" class="prompt-debug-modal-overlay" @click.self="close">
    <div class="prompt-debug-modal-content">
      <div class="prompt-debug-modal-header">
        <div class="header-left">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <h2>图片生成 Prompt 调试信息</h2>
        </div>
        <button class="close-btn" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="prompt-debug-modal-body" v-if="debugInfo">
        <div class="debug-info-section">
          <div class="info-item">
            <span class="info-label">页面索引：</span>
            <span class="info-value">{{ debugInfo.pageIndex + 1 }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">页面类型：</span>
            <span class="info-value">{{ debugInfo.pageType }}</span>
          </div>
          <div class="info-item" v-if="debugInfo.style">
            <span class="info-label">风格：</span>
            <span class="info-value">{{ debugInfo.style }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">温度：</span>
            <span class="info-value">{{ debugInfo.temperature }}</span>
          </div>
          <div class="info-item" v-if="debugInfo.negativePrompt">
            <span class="info-label">负面提示词：</span>
            <span class="info-value">{{ debugInfo.negativePrompt }}</span>
          </div>
        </div>

        <div class="prompt-section">
          <div class="section-header">
            <h3>完整 Prompt</h3>
            <div class="action-buttons">
              <button class="btn btn-secondary" @click="copyPrompt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制 Prompt
              </button>
            </div>
          </div>
          <div class="prompt-content">
            <pre>{{ debugInfo.prompt }}</pre>
          </div>
        </div>

        <div class="prompt-section" v-if="debugInfo.stylePromptPreview">
          <div class="section-header">
            <h3>风格提示词预览</h3>
          </div>
          <div class="prompt-content">
            <pre>{{ debugInfo.stylePromptPreview }}</pre>
          </div>
        </div>
      </div>
      <div v-else class="prompt-debug-modal-body">
        <div style="text-align: center; padding: 40px; color: var(--text-sub, #6b7280);">
          <p>暂无调试信息</p>
        </div>
      </div>

      <div class="prompt-debug-modal-footer">
        <button class="btn btn-secondary" @click="close">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface PromptDebugInfo {
  pageIndex: number
  pageType: string
  style?: string
  temperature: number
  negativePrompt?: string
  prompt: string
  stylePromptPreview?: string
}

interface Props {
  visible: boolean
  debugInfo: PromptDebugInfo | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const close = () => {
  emit('close')
}

const copyPrompt = async () => {
  if (!props.debugInfo) return
  
  try {
    await navigator.clipboard.writeText(props.debugInfo.prompt)
    alert('Prompt 已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.prompt-debug-modal-overlay {
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

.prompt-debug-modal-content {
  background: white;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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

.prompt-debug-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left svg {
  color: var(--primary, #1890ff);
}

.header-left h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-main, #111827);
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-sub, #6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-body, #f9fafb);
  color: var(--text-main, #111827);
}

.prompt-debug-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.debug-info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-body, #f9fafb);
  border-radius: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--text-sub, #6b7280);
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: var(--text-main, #111827);
  font-weight: 600;
}

.prompt-section {
  margin-bottom: 24px;
}

.prompt-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-main, #111827);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: var(--bg-body, #f5f5f5);
  color: var(--text-main, #333);
}

.btn-secondary:hover {
  background: var(--bg-body, #e8e8e8);
}

.prompt-content {
  background: var(--bg-body, #f9fafb);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.prompt-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-main, #111827);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.prompt-debug-modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: flex-end;
}
</style>



