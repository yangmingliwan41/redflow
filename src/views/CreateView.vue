<template>
  <div class="create-view">
    <!-- 内容区域 -->
    <div class="create-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped>
.create-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.create-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  border: none;
  background: transparent;
}

.tab-content {
  height: 100%;
}

.text-mode-wrapper,
.image-mode-wrapper,
.prompt-mode-wrapper {
  height: 100%;
}

.prompt-mode-content {
  padding: 48px;
  text-align: center;
}

.prompt-mode-content h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12px;
}

.prompt-mode-content p {
  font-size: 16px;
  color: var(--text-sub);
}
</style>




