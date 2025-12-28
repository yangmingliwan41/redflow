<template>
  <button
    :class="['algorithmic-button', `variant-${variant}`, { 'loading': loading, 'disabled': disabled, 'hovered': isHovered }]"
    :disabled="disabled || loading"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- 算法艺术效果层 -->
    <div
      v-if="enableEffect"
      class="button-effect"
      :style="effectStyle"
    ></div>
    
    <!-- 涟漪效果 -->
    <span
      v-if="rippleVisible"
      class="ripple"
      :style="rippleStyle"
    ></span>
    
    <!-- 内容 -->
    <span class="button-content">
      <slot v-if="!loading"></slot>
      <span v-else class="loading-text">
        <span class="loading-spinner"></span>
        {{ loadingText }}
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { buttonTheme } from '../../config/algorithmicThemes'
import { useComponentAlgorithmicArt } from '../../composables/useAlgorithmicArt'

interface Props {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'outline'
  /** 是否加载中 */
  loading?: boolean
  /** 加载文本 */
  loadingText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否启用算法艺术效果 */
  enableEffect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  loadingText: '加载中...',
  disabled: false,
  enableEffect: true
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const rippleVisible = ref(false)
const rippleX = ref(0)
const rippleY = ref(0)

// 使用组合式函数获取主题
const { theme } = useComponentAlgorithmicArt(buttonTheme, {
  interactive: !props.disabled && !props.loading
})

// 效果样式
const effectStyle = computed(() => {
  if (!props.enableEffect || props.disabled || props.loading) {
    return { display: 'none' }
  }
  
  return {
    '--mouse-x': `${mouseX.value}px`,
    '--mouse-y': `${mouseY.value}px`,
    '--particle-count': theme.value.particleCount,
    '--speed': theme.value.speed,
    '--opacity': theme.value.opacity
  }
})

// 涟漪样式
const rippleStyle = computed(() => {
  return {
    left: `${rippleX.value}px`,
    top: `${rippleY.value}px`
  }
})

// 鼠标进入
const handleMouseEnter = () => {
  if (!props.disabled && !props.loading) {
    isHovered.value = true
  }
}

// 鼠标离开
const handleMouseLeave = () => {
  isHovered.value = false
  mouseX.value = 0
  mouseY.value = 0
}

// 鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (props.enableEffect && !props.disabled && !props.loading) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseX.value = e.clientX - rect.left
    mouseY.value = e.clientY - rect.top
  }
}

// 点击处理
const handleClick = (e: MouseEvent) => {
  if (props.disabled || props.loading) return
  
  // 创建涟漪效果
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  rippleX.value = e.clientX - rect.left
  rippleY.value = e.clientY - rect.top
  rippleVisible.value = true
  
  setTimeout(() => {
    rippleVisible.value = false
  }, 600)
  
  emit('click', e)
}
</script>

<style scoped>
.algorithmic-button {
  position: relative;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-family-display);
  cursor: pointer;
  border: none;
  outline: none;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  transition: all var(--duration-normal) var(--ease-out);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 主要按钮 - 渐变流光效果 */
.algorithmic-button.variant-primary {
  background: var(--primary-gradient);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
  position: relative;
}

.algorithmic-button.variant-primary::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.algorithmic-button.variant-primary:hover:not(.disabled):not(.loading) {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover), var(--shadow-glow);
}

.algorithmic-button.variant-primary:hover:not(.disabled):not(.loading)::after {
  left: 100%;
}

.algorithmic-button.variant-primary.hovered {
  box-shadow: var(--shadow-hover), 0 0 30px rgba(74, 142, 255, 0.3);
}

.algorithmic-button.variant-primary:active:not(.disabled):not(.loading) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* 次要按钮 - 玻璃态 */
.algorithmic-button.variant-secondary {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.algorithmic-button.variant-secondary:hover:not(.disabled):not(.loading) {
  border-color: var(--primary);
  background: var(--bg-body);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(74, 142, 255, 0.15);
}

/* 轮廓按钮 - 边框流光 */
.algorithmic-button.variant-outline {
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);
  position: relative;
  overflow: hidden;
}

.algorithmic-button.variant-outline::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -100%;
  width: 100%;
  height: calc(100% + 4px);
  background: var(--primary-gradient);
  transition: left var(--duration-slow) var(--ease-out);
  z-index: -1;
}

.algorithmic-button.variant-outline:hover:not(.disabled):not(.loading) {
  color: var(--text-inverse);
  border-color: transparent;
}

.algorithmic-button.variant-outline:hover:not(.disabled):not(.loading)::before {
  left: 0;
}

/* 禁用状态 */
.algorithmic-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 加载状态 */
.algorithmic-button.loading {
  cursor: wait;
  pointer-events: none;
}

.button-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.2) 0%,
    rgba(74, 142, 255, 0.08) 30%,
    transparent 70%
  );
  opacity: var(--opacity, 0.4);
  transition: opacity var(--duration-normal) var(--ease-out);
  border-radius: inherit;
}

.algorithmic-button.hovered .button-effect {
  opacity: calc(var(--opacity, 0.4) * 1.5);
}

/* 粒子效果 */
.button-effect::before,
.button-effect::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.4;
  animation: buttonParticle 2s ease-in-out infinite;
}

.button-effect::before {
  top: 30%;
  left: 20%;
  animation-delay: 0s;
}

.button-effect::after {
  bottom: 30%;
  right: 20%;
  animation-delay: 1s;
}

@keyframes buttonParticle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(8px, -8px) scale(1.5);
    opacity: 0.8;
  }
}

/* 涟漪效果 */
.ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%) scale(0);
  animation: rippleExpand 0.6s ease-out;
  pointer-events: none;
  z-index: 1;
}

@keyframes rippleExpand {
  to {
    transform: translate(-50%, -50%) scale(20);
    opacity: 0;
  }
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .button-effect,
  .button-effect::before,
  .button-effect::after,
  .ripple {
    animation: none;
    opacity: 0;
  }
  
  .algorithmic-button:hover {
    transform: none;
  }
}
</style>




