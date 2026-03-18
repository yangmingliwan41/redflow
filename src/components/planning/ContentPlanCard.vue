<template>
  <Card class="content-plan-card" hover>
    <div class="content-plan-card__header">
      <div class="content-plan-card__index">#{{ content.index }}</div>
      <div class="content-plan-card__title">{{ content.title }}</div>
      <div class="content-plan-card__badges">
        <span class="content-plan-card__badge content-plan-card__badge--type">
          {{ getContentTypeLabel(content.contentType) }}
        </span>
        <span class="content-plan-card__badge content-plan-card__badge--style">
          {{ getStyleLabel(content.stylePack.style_id) }}
        </span>
      </div>
    </div>

    <div class="content-plan-card__body">
      <div class="content-plan-card__schedule">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>{{ content.publishSchedule.date }} {{ content.publishSchedule.time }}</span>
      </div>

      <div class="content-plan-card__outline">
        <div class="content-plan-card__outline-title">大纲预览</div>
        <div class="content-plan-card__outline-pages">
          <span
            v-for="(page, index) in content.outline.pages.slice(0, 3)"
            :key="index"
            class="content-plan-card__outline-page"
          >
            {{ page.title }}
          </span>
          <span v-if="content.outline.pages.length > 3" class="content-plan-card__outline-more">
            +{{ content.outline.pages.length - 3 }} 页
          </span>
        </div>
      </div>

      <div class="content-plan-card__resources">
        <span class="content-plan-card__resource">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          {{ content.resources.imageCount }} 张图片
        </span>
        <span class="content-plan-card__resource">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ content.resources.estimatedTime }} 分钟
        </span>
      </div>
    </div>

    <template #footer>
      <div class="content-plan-card__footer">
        <Button variant="ghost" size="sm" @click="$emit('edit', content)">
          编辑
        </Button>
        <Button variant="primary" size="sm" @click="$emit('generate', content)">
          生成内容
        </Button>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { SingleContentPlan } from '../../types'
import Card from '../ui/Card.vue'
import Button from '../ui/Button.vue'

defineProps<{
  content: SingleContentPlan
}>()

defineEmits<{
  edit: [content: SingleContentPlan]
  generate: [content: SingleContentPlan]
}>()

const getContentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    tutorial: '教程',
    review: '测评',
    recommendation: '种草',
    comparison: '对比',
    knowledge: '知识分享'
  }
  return labels[type] || type
}

const getStyleLabel = (style: string): string => {
  const labels: Record<string, string> = {
    xiaohongshu: '小红书',
    poster_2k: '海报',
    ins_minimal: 'INS极简',
    tech_future: '科技',
    nature_fresh: '自然',
    morandi: '莫兰迪',
    black_gold: '黑金'
  }
  return labels[style] || style
}
</script>

<style scoped>
.content-plan-card {
  transition: all var(--duration-normal);
}

.content-plan-card__header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.content-plan-card__index {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-fade);
  color: var(--primary);
  border-radius: var(--radius-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-sm);
}

.content-plan-card__title {
  flex: 1;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  line-height: var(--line-height-tight);
}

.content-plan-card__badges {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.content-plan-card__badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.content-plan-card__badge--type {
  background: var(--primary-fade);
  color: var(--primary);
}

.content-plan-card__badge--style {
  background: var(--bg-body);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.content-plan-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-plan-card__schedule {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.content-plan-card__outline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.content-plan-card__outline-title {
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.content-plan-card__outline-pages {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.content-plan-card__outline-page {
  padding: 4px 8px;
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  color: var(--text-main);
}

.content-plan-card__outline-more {
  padding: 4px 8px;
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

.content-plan-card__resources {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.content-plan-card__resource {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.content-plan-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>


