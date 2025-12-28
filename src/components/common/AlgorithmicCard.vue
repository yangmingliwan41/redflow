<template>
  <div
    class="algorithmic-card"
    :class="{ 'interactive': interactive, 'hovered': isHovered }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
  >
    <!-- 算法艺术背景层 -->
    <div
      class="card-effect"
      :style="effectStyle"
    ></div>
    
    <!-- 内容层 -->
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { cardTheme } from '../../config/algorithmicThemes'
import { useComponentAlgorithmicArt } from '../../composables/useAlgorithmicArt'

interface Props {
  /** 是否启用交互 */
  interactive?: boolean
  /** 是否启用算法艺术效果 */
  enableEffect?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  interactive: true,
  enableEffect: true
})

const isHovered = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)

// 使用组合式函数获取主题
const { theme } = useComponentAlgorithmicArt(cardTheme, {
  interactive: props.interactive
})

// 效果样式
const effectStyle = computed(() => {
  if (!props.enableEffect) {
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

// 鼠标进入
const handleMouseEnter = () => {
  if (props.interactive) {
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
  if (props.interactive && props.enableEffect) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    mouseX.value = e.clientX - rect.left
    mouseY.value = e.clientY - rect.top
  }
}
</script>

<style scoped>
.algorithmic-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: var(--shadow-sm);
}

.algorithmic-card.interactive {
  cursor: pointer;
}

.algorithmic-card.interactive:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  background: var(--bg-card-hover);
}

.algorithmic-card.hovered {
  border-color: var(--primary);
}

.card-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(74, 142, 255, 0.08) 0%,
    rgba(37, 99, 235, 0.04) 40%,
    transparent 70%
  );
  opacity: var(--opacity, 0.3);
  transition: opacity var(--duration-normal) var(--ease-out);
  border-radius: inherit;
}

.algorithmic-card.hovered .card-effect {
  opacity: calc(var(--opacity, 0.3) * 1.5);
}

/* 算法艺术粒子效果 */
.card-effect::before,
.card-effect::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 3px;
  background: var(--primary);
  box-shadow: 0 0 8px rgba(74, 142, 255, 0.3);
  border-radius: 50%;
  opacity: 0.15;
  animation: particleFloat 4s ease-in-out infinite;
}

.card-effect::before {
  top: 15%;
  left: 15%;
  animation-delay: 0s;
}

.card-effect::after {
  bottom: 20%;
  right: 20%;
  animation-delay: 2s;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.2;
  }
  25% {
    transform: translate(15px, -15px) scale(1.3);
    opacity: 0.4;
  }
  50% {
    transform: translate(-10px, -25px) scale(1.5);
    opacity: 0.5;
  }
  75% {
    transform: translate(-20px, -10px) scale(1.2);
    opacity: 0.3;
  }
}

/* 噪声场纹理效果 */
.card-effect::after {
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(74, 142, 255, 0.03) 50%,
    rgba(37, 99, 235, 0.02) 60%,
    transparent 70%
  );
  width: 100%;
  height: 100%;
  border-radius: 0;
  animation: noiseShift 10s ease-in-out infinite;
}

@keyframes noiseShift {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.03;
  }
  50% {
    transform: translate(10px, 10px);
    opacity: 0.05;
  }
}

.card-content {
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .card-effect {
    opacity: calc(var(--opacity, 0.3) * 0.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-effect,
  .card-effect::before,
  .card-effect::after {
    animation: none;
    opacity: 0;
  }
  
  .algorithmic-card.interactive:hover {
    transform: none;
  }
}
</style>




