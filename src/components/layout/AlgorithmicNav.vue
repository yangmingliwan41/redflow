<template>
  <nav class="algorithmic-nav">
    <div
      v-for="item in navItems"
      :key="item.path"
      class="nav-item-wrapper"
      :class="{ active: isActive(item.path) }"
      @mouseenter="handleMouseEnter(item.path)"
      @mouseleave="handleMouseLeave"
    >
      <RouterLink :to="item.path" class="nav-item">
        <div class="nav-icon" v-html="item.icon"></div>
        <span class="nav-text">{{ item.label }}</span>
        <div v-if="isActive(item.path)" class="nav-indicator"></div>
      </RouterLink>
      <!-- 算法艺术效果层 -->
      <div
        v-if="activeItem === item.path"
        ref="effectRef"
        class="nav-effect"
        :style="effectStyle"
      ></div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { navTheme } from '../../config/algorithmicThemes'
import { useComponentAlgorithmicArt } from '../../composables/useAlgorithmicArt'

interface NavItem {
  path: string
  label: string
  icon: string
}

const props = defineProps<{
  items: NavItem[]
}>()

const route = useRoute()
const activeItem = ref<string | null>(null)
const effectRef = ref<HTMLDivElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

// 使用组合式函数获取主题
const { theme } = useComponentAlgorithmicArt(navTheme, { interactive: true })

// 计算导航项（合并默认项和传入的项）
const navItems = computed(() => props.items)

// 检查路由是否激活
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// 鼠标进入处理
const handleMouseEnter = (path: string) => {
  activeItem.value = path
}

// 鼠标离开处理
const handleMouseLeave = () => {
  // 延迟清除，保持动画流畅
  setTimeout(() => {
    if (!isActive(activeItem.value || '')) {
      activeItem.value = null
    }
  }, 200)
}

// 效果样式
const effectStyle = computed(() => {
  return {
    '--particle-count': theme.value.particleCount,
    '--speed': theme.value.speed,
    '--opacity': theme.value.opacity
  }
})

// 鼠标移动跟踪
const handleMouseMove = (e: MouseEvent) => {
  if (activeItem.value && effectRef.value) {
    const rect = effectRef.value.getBoundingClientRect()
    mouseX.value = e.clientX - rect.left
    mouseY.value = e.clientY - rect.top
  }
}

onMounted(() => {
  // 设置当前激活项
  activeItem.value = route.path
  
  // 监听鼠标移动
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
.algorithmic-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.nav-item-wrapper {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.nav-item-wrapper.active {
  background: var(--primary-light);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--text-sub);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  z-index: 2;
}

.nav-item:hover {
  background: var(--primary-fade);
  color: var(--primary);
}

.nav-item-wrapper.active .nav-item {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
}

.nav-text {
  flex: 1;
}

.nav-indicator {
  position: absolute;
  right: 8px;
  width: 4px;
  height: 60%;
  background: var(--primary);
  border-radius: 2px;
  animation: slideIn 0.3s var(--ease-out);
}

@keyframes slideIn {
  from {
    transform: translateX(10px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.nav-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 36, 66, 0.1) 0%,
    transparent 50%
  );
  opacity: var(--opacity, 0.35);
  transition: opacity var(--algorithmic-transition-duration) var(--algorithmic-transition-easing);
}

.nav-item-wrapper:hover .nav-effect {
  opacity: calc(var(--opacity, 0.35) * 1.5);
}

/* 算法艺术粒子效果（使用CSS动画模拟） */
.nav-effect::before,
.nav-effect::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.nav-effect::before {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.nav-effect::after {
  top: 60%;
  right: 30%;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(10px, -10px) scale(1.5);
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .nav-effect {
    opacity: calc(var(--opacity, 0.35) * 0.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-effect,
  .nav-effect::before,
  .nav-effect::after {
    animation: none;
    opacity: 0;
  }
}
</style>




