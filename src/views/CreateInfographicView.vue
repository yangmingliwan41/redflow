<template>
  <div class="create-infographic-view" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="header-section">
      <div class="header-actions-top">
        <button class="btn-back" @click="$router.push('/create/text')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回文本输入
        </button>
      </div>
      <h1 class="main-title">图文海报生成</h1>
      <p class="sub-title">按小红书尺寸 1660×1242 生成，可直接导出 PNG</p>
    </div>

    <div class="content-wrapper">
      <div class="content-inner">
        <InfographicStudio />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import InfographicStudio from '@/modules/infographic/InfographicStudio.vue'

const sidebarCollapsed = inject<{ value: boolean }>('sidebarCollapsed', ref(false))
const isSidebarCollapsed = computed(() => sidebarCollapsed?.value || false)
</script>

<style scoped>
.create-infographic-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: var(--spacing-2xl) var(--spacing-lg);
  margin: 0 auto;
  width: 100%;
  max-width: min(1800px, calc(100% - var(--spacing-2xl)));
  box-sizing: border-box;
}

.header-section {
  margin-top: var(--spacing-3xl);
  margin-bottom: var(--spacing-2xl);
  text-align: center;
  padding: 0 var(--spacing-lg);
  position: relative;
}

.header-actions-top {
  position: absolute;
  top: 0;
  left: var(--spacing-lg);
  z-index: 10;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.btn-back:hover {
  background: var(--bg-subtle);
  border-color: var(--primary);
  color: var(--primary);
}

.main-title {
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  font-family: var(--font-family-display);
  color: var(--text-main);
  margin: 0 0 var(--spacing-sm) 0;
  letter-spacing: -0.5px;
}

.sub-title {
  margin: 0;
  font-size: var(--font-base);
  color: var(--text-sub);
}

.content-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
  padding: 0 var(--spacing-lg);
}

.content-inner {
  width: 100%;
  max-width: 1600px;
}
</style>

