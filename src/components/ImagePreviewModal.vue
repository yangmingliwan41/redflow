<template>
  <div v-if="visible" class="preview-overlay" @click.self="handleClose">
    <div class="preview-header">
      <div class="preview-actions-left">
        <span class="preview-title">大图预览</span>
      </div>
      <div class="preview-actions">
        <button class="preview-btn" @click.stop="zoomOut" :disabled="scale <= minScale">-</button>
        <span class="preview-scale">{{ Math.round(scale * 100) }}%</span>
        <button class="preview-btn" @click.stop="zoomIn" :disabled="scale >= maxScale">+</button>
        <button class="preview-btn" @click.stop="resetView">重置</button>
        <button class="preview-btn close" @click.stop="handleClose">关闭</button>
      </div>
    </div>

    <div class="preview-body" @wheel.prevent="onWheel" @dblclick.stop="resetView">
      <div
        class="preview-image-wrapper"
        :style="{
          transform: `scale(${scale})`,
          maxWidth: '90vw',
          maxHeight: '85vh'
        }"
      >
        <img v-if="url" :src="url" alt="预览图片" @error="onError" />
        <div v-else class="preview-placeholder">无图片可预览</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

interface Props {
  visible: boolean
  url?: string
  minScale?: number
  maxScale?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  url: '',
  minScale: 0.5,
  maxScale: 3
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const scale = ref(1)
const minScale = props.minScale
const maxScale = props.maxScale

const handleClose = () => {
  emit('close')
}

const resetView = () => {
  scale.value = 1
}

const zoomIn = () => {
  scale.value = Math.min(maxScale, scale.value + 0.1)
}

const zoomOut = () => {
  scale.value = Math.max(minScale, scale.value - 0.1)
}

const onWheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    zoomOut()
  } else {
    zoomIn()
  }
}

const onKeydown = (e: KeyboardEvent) => {
  if (!props.visible) return
  if (e.key === 'Escape') {
    handleClose()
  } else if (e.key === '+' || e.key === '=') {
    zoomIn()
  } else if (e.key === '-' || e.key === '_') {
    zoomOut()
  } else if (e.key.toLowerCase() === 'r') {
    resetView()
  }
}

const onError = () => {
  // 简单兜底，关闭模态
  alert('图片加载失败')
  handleClose()
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetView()
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(4px);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.preview-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.preview-btn.close {
  background: rgba(255, 75, 75, 0.2);
  border-color: rgba(255, 75, 75, 0.4);
}

.preview-scale {
  color: #fff;
  font-size: 13px;
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-out;
}

.preview-image-wrapper img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.preview-placeholder {
  color: #fff;
  font-size: 14px;
}
</style>





