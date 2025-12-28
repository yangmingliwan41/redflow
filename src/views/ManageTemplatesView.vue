<template>
  <PageContainer size="xl" class="manage-templates-view">
    <PageHeader
      title="模板库"
      subtitle="使用模板快速创建项目"
    >
      <template #actions>
        <Button variant="secondary" @click="$router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </Button>
      </template>
    </PageHeader>
    
    <div class="templates-content">
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">模板功能正在开发中</div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '../components/layout/PageContainer.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import Button from '../components/ui/Button.vue'
</script>

<style scoped>
.manage-templates-view {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: var(--spacing-2xl);
}

.templates-content {
  margin-top: var(--spacing-2xl);
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: var(--bg-card);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: var(--text-sub);
}
</style>




