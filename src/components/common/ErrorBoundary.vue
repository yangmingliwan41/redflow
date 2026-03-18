<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>出错了</h3>
      <p>{{ errorMessage }}</p>
      <button class="btn btn-primary" @click="handleRetry">重试</button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMessage.value = err.message || '发生未知错误'
  console.error('ErrorBoundary caught error:', err)
  return false // 阻止错误继续传播
})

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content svg {
  color: var(--error-color, #ef4444);
  margin-bottom: 16px;
}

.error-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.error-content p {
  color: var(--text-sub);
  margin-bottom: 24px;
  line-height: 1.6;
}
</style>





