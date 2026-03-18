<template>
  <section class="column" data-module="advantage-grid">
    <h2 class="section-title">
      <span class="section-title-dot" aria-hidden="true" />
      {{ sectionTitle || '优势' }}
    </h2>
    <div class="advantages-grid">
      <div v-for="item in items" :key="item.title" class="adv-card">
        <div class="adv-title">{{ item.title }}</div>
        <div v-if="item.highlight" class="adv-highlight">{{ item.highlight }}</div>
        <p v-if="item.description" class="adv-desc">{{ item.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdvantagesContent } from '../../schema/types'

const props = defineProps<{
  content: unknown
  themeId?: string
  sectionTitle?: string
}>()

const data = computed(() => (props.content as AdvantagesContent) ?? null)
const items = computed(() => data.value?.items ?? [])
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-ink, #1a1a1a);
}

.section-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent, #e85d4c);
  flex-shrink: 0;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.adv-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid rgba(248, 113, 113, 0.35);
}

.adv-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink, #1a1a1a);
  margin-bottom: 4px;
}

.adv-highlight {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent, #e85d4c);
  margin-bottom: 4px;
}

.adv-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink-muted, #5c5c5c);
  margin: 0;
}
</style>
