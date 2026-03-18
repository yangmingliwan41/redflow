<template>
  <section class="top-row" data-module="hero-dual">
    <div class="card card-left">
      <h2 class="card-title">{{ backgroundTitle || '背景与目标' }}</h2>
      <p v-if="background?.intro" class="card-intro">{{ background.intro }}</p>
      <div v-for="bullet in background?.bullets || []" :key="bullet.label" class="bullet-group">
        <p class="bullet-label">{{ bullet.label }}</p>
        <ul class="bullet-list">
          <li v-for="item in bullet.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
    <div class="card card-right">
      <h2 class="card-title card-title-light">{{ dataTitle || '4 个关键数字' }}</h2>
      <div class="metrics-grid">
        <div
          v-for="metric in data?.metrics || []"
          :key="metric.label + metric.value"
          class="metric-item"
        >
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div v-if="metric.comment" class="metric-comment">{{ metric.comment }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BackgroundContent, DataContent } from '../../schema/types'

const props = defineProps<{
  content: unknown
  themeId?: string
  /** 左卡标题，可选 */
  backgroundTitle?: string
  /** 右卡标题，可选 */
  dataTitle?: string
}>()

const payload = computed(() => props.content as { background?: BackgroundContent; data?: DataContent } | null)
const background = computed(() => payload.value?.background ?? null)
const data = computed(() => payload.value?.data ?? null)
</script>

<style scoped>
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
}

.card {
  border-radius: 20px;
  padding: 24px 24px 32px;
  box-sizing: border-box;
}

.card-left {
  background: var(--color-surface, #fff);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--color-ink, #1a1a1a);
}

.card-title-light {
  color: #fafafa;
}

.card-intro {
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-ink-muted, #5c5c5c);
  margin: 0 0 14px;
}

.bullet-group {
  margin-top: 12px;
}

.bullet-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink, #1a1a1a);
  margin: 0 0 4px;
}

.bullet-list {
  padding-left: 18px;
  margin: 0;
  gap: 6px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--color-ink-muted, #5c5c5c);
}

.card-right {
  background: linear-gradient(165deg, var(--color-card-dark, #1c1917) 0%, #2d2a26 100%);
  color: #e7e5e4;
  padding: 24px 24px 36px;
}

.card-right .card-title {
  color: #fafafa;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  margin-top: 18px;
}

.metric-item {
  padding: 16px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid var(--color-accent, #e85d4c);
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
  color: #fafafa;
  line-height: 1.2;
}

.metric-label {
  margin-top: 4px;
  font-size: 12px;
  color: #a8a29e;
}

.metric-comment {
  margin-top: 4px;
  font-size: 12px;
  color: #d6d3d1;
}
</style>
