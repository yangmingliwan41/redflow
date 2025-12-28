<template>
  <div id="app">
    <!-- 工作区侧边栏 -->
    <WorkspaceSidebar />

    <!-- 功能导航栏（可选，根据路由显示） -->
    <FeatureNav v-if="showFeatureNav" :class="{ 'sidebar-collapsed': sidebarCollapsed.value }" />

    <!-- 主内容区 -->
    <main 
      class="layout-main" 
      :class="{ 
        'with-feature-nav': showFeatureNav, 
        'sidebar-collapsed': sidebarCollapsed.value 
      }"
      :style="computedMainStyle"
    >
      <RouterView v-slot="{ Component, route: currentRoute }">
        <div class="router-view-wrapper">
          <component :is="Component" />

          <!-- 全局页脚版权信息（特定页面显示） -->
          <footer v-if="shouldShowFooter(currentRoute.path)" class="global-footer">
            <div class="footer-content">
              <div class="footer-text">
                © 2025 红流云创 v{{ appVersion }}
              </div>
              <div class="footer-license">
                AI 驱动的图文创作助手
              </div>
            </div>
          </footer>
        </div>
      </RouterView>
    </main>
    
    <!-- Toast 消息提示 -->
    <Toast />
    
    <!-- 导航守卫提示 -->
    <NavigationGuardModal
      :visible="store.showNavigationGuard"
      @confirm="handleNavigationGuardConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Toast from './components/ui/Toast.vue'
import NavigationGuardModal from './components/NavigationGuardModal.vue'
import { useTextGeneratorStore } from './stores/textGenerator'
import WorkspaceSidebar from './components/layout/WorkspaceSidebar.vue'
import FeatureNav from './components/layout/FeatureNav.vue'

const route = useRoute()
const store = useTextGeneratorStore()

// 管理侧边栏收起状态（从localStorage读取，并监听变化）
const sidebarCollapsed = ref(false)

// 从localStorage恢复状态
onMounted(() => {
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }
  
  // 监听localStorage变化（用于跨组件同步）
  window.addEventListener('storage', handleStorageChange)
  
  // 监听自定义事件（用于同窗口内同步）
  window.addEventListener('sidebar-toggle', handleSidebarToggle)
})

// 处理localStorage变化
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'sidebar-collapsed') {
    sidebarCollapsed.value = e.newValue === 'true'
  }
}

// 处理侧边栏切换事件
const handleSidebarToggle = () => {
  const saved = localStorage.getItem('sidebar-collapsed')
  if (saved !== null) {
    sidebarCollapsed.value = saved === 'true'
  }
}

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('sidebar-toggle', handleSidebarToggle)
})

// 提供侧边栏收起状态给所有子组件
provide('sidebarCollapsed', sidebarCollapsed)


// 判断是否显示功能导航栏
const showFeatureNav = computed(() => {
  const path = route.path
  return path.startsWith('/create') || path.startsWith('/plan') || path.startsWith('/manage')
})

// 计算主内容区的样式（使用computed确保响应式）
const computedMainStyle = computed(() => {
  const marginLeft = sidebarCollapsed.value 
    ? (showFeatureNav.value ? 'calc(80px + var(--feature-nav-width))' : '80px')
    : (showFeatureNav.value ? 'calc(var(--sidebar-width) + var(--feature-nav-width))' : 'var(--sidebar-width)')
  
  return {
    marginLeft
  }
})

// 判断是否显示页脚
const shouldShowFooter = (path: string): boolean => {
  // 只在设置页面显示页脚
  return path === '/settings'
}

const handleNavigationGuardConfirm = () => {
  store.hideNavigationGuardModal()
}

// 获取版本号（如果已注入）
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.3.9.2'
</script>

<style scoped>
#app {
  display: flex;
  min-height: 100vh;
  background: var(--bg-body);
}

.layout-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 0 8px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}

.layout-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  position: relative;
  transition: margin-left var(--duration-normal) var(--ease-smooth), transform var(--duration-normal) var(--ease-smooth);
  display: flex;
  flex-direction: column;
  will-change: margin-left, transform;
}

/* 侧边栏收起时的基础样式（优先级最高） */
.layout-main.sidebar-collapsed {
  margin-left: 80px !important;
  transform: translateX(0);
}

/* 有功能导航栏时的样式 */
.layout-main.with-feature-nav {
  margin-left: calc(var(--sidebar-width) + var(--feature-nav-width));
}

/* 侧边栏收起且有功能导航栏时（最高优先级） */
.layout-main.sidebar-collapsed.with-feature-nav {
  margin-left: calc(80px + var(--feature-nav-width)) !important;
}

.router-view-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  border: none;
  background: transparent;
}

/* 主内容区背景 - 微妙的算法艺术背景 */
.layout-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 50%, rgba(74, 142, 255, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.global-footer {
  margin-top: var(--spacing-3xl);
  padding: var(--spacing-xl);
  text-align: center;
  width: 100%;
  flex-shrink: 0;
}

.footer-content {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

.footer-text {
  font-size: var(--font-sm);
  color: var(--text-sub);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-normal);
}

.footer-license {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  opacity: 0.7;
}

@media (max-width: 1024px) {
  .layout-main.with-feature-nav {
    margin-left: var(--sidebar-width);
  }
  
  .layout-main::before {
    left: var(--sidebar-width);
  }
}

@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }
  
  .layout-main::before {
    left: 0;
  }
}
</style>

