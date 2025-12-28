<template>
  <nav 
    class="feature-nav" 
    :style="{ 
      left: navLeft,
      '--current-sidebar-width': sidebarCollapsed?.value ? '80px' : '280px'
    }"
  >
    <!-- 创作工具 -->
    <div class="nav-section">
      <div class="section-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <span class="section-title">创作工具</span>
      </div>
      <div class="nav-items">
        <RouterLink
          to="/create/text"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">文本生成图文</div>
            <div class="nav-item-desc">输入主题，AI生成完整图文</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/create/image"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">图生图文</div>
            <div class="nav-item-desc">上传图片，AI生成营销图文</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/create/prompt"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">提示词生图</div>
            <div class="nav-item-desc">输入提示词，批量生成图片</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/create/space-design"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <circle cx="6" cy="6" r="1"></circle>
              <circle cx="18" cy="18" r="1"></circle>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">空间设计</div>
            <div class="nav-item-desc">上传图片，AI智能设计装修空间</div>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 规划工具 -->
    <div class="nav-section">
      <div class="section-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span class="section-title">规划工具</span>
      </div>
      <div class="nav-items">
        <RouterLink
          to="/plan/requirement"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">需求分析</div>
            <div class="nav-item-desc">输入需求，AI自动分析</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/plan/content"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">内容规划</div>
            <div class="nav-item-desc">基于需求生成创作计划</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/plan/calendar"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">发布日历</div>
            <div class="nav-item-desc">管理和查看发布计划</div>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- 管理工具 -->
    <div class="nav-section">
      <div class="section-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span class="section-title">管理工具</span>
      </div>
      <div class="nav-items">
        <RouterLink
          to="/manage/history"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">历史记录</div>
            <div class="nav-item-desc">查看所有创作历史</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/manage/drafts"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">草稿箱</div>
            <div class="nav-item-desc">未完成的项目</div>
          </div>
        </RouterLink>

        <RouterLink
          to="/manage/templates"
          class="nav-item"
          active-class="active"
        >
          <div class="nav-item-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="3" y1="9" x2="21" y2="9"></line>
            </svg>
          </div>
          <div class="nav-item-content">
            <div class="nav-item-title">模板库</div>
            <div class="nav-item-desc">使用模板快速创建</div>
          </div>
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { inject, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

// 注入侧边栏收起状态
const sidebarCollapsed = inject<{ value: boolean }>('sidebarCollapsed', ref(false))

// 计算left位置
const navLeft = computed(() => {
  if (!sidebarCollapsed) {
    return '280px'
  }
  return sidebarCollapsed.value ? '80px' : '280px'
})
</script>

<style scoped>
.feature-nav {
  width: var(--feature-nav-width);
  height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  padding: var(--spacing-lg) 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  top: 0;
  z-index: var(--z-fixed);
  transition: left var(--duration-normal) var(--ease-smooth);
  box-shadow: var(--shadow-sm);
}

.feature-nav::-webkit-scrollbar {
  width: 4px;
}

.feature-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 126, 126, 0.2);
}

.nav-section {
  margin-bottom: 24px;
}

.section-header {
  padding: 0 var(--spacing-lg) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  margin-bottom: var(--spacing-xs);
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--spacing-lg);
  right: var(--spacing-lg);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  opacity: 0.2;
}

.section-title {
  flex: 1;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  margin: 0 var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-main);
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.nav-item:hover {
  background: var(--bg-body);
  color: var(--text-main);
  transform: translateX(4px);
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
  box-shadow: 0 0 20px rgba(255, 126, 126, 0.15);
}

.nav-item.active::before {
  opacity: 1;
}

.nav-item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  border-radius: var(--radius-sm);
  background: var(--primary-light);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
}

.nav-item-icon svg {
  stroke: currentColor;
  position: relative;
  z-index: 1;
}

.nav-item:hover .nav-item-icon {
  background: var(--primary-light);
  transform: scale(1.1) rotate(5deg);
}

.nav-item.active .nav-item-icon {
  background: var(--primary);
  color: var(--text-inverse);
}

.nav-item.active .nav-item-icon svg {
  stroke: var(--text-inverse);
}

.nav-item-content {
  flex: 1;
  min-width: 0;
}

.nav-item-title {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
  font-family: var(--font-family-display);
}

.nav-item-desc {
  font-size: var(--font-xs);
  opacity: 0.7;
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
}

.nav-item.active .nav-item-desc {
  opacity: 0.8;
  color: var(--text-sub);
}

@media (max-width: 1024px) {
  .feature-nav {
    display: none;
  }
}
</style>




