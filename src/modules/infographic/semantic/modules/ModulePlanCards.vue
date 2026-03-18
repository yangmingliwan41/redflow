<template>
  <section class="column" data-module="plan-cards">
    <h2 class="section-title">
      <span class="section-title-dot" aria-hidden="true" />
      {{ sectionTitle || '方案' }}
    </h2>
    <div class="plans-row">
      <article
        v-for="plan in plans"
        :key="plan.name"
        class="plan-card"
        :class="{ 'plan-card-main': plan.highlight }"
      >
        <header class="plan-header">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <p v-if="plan.tagline" class="plan-tagline">{{ plan.tagline }}</p>
          <p v-if="plan.price" class="plan-price">
            <span class="plan-price-main">{{ plan.price }}</span>
            <span v-if="plan.unit" class="plan-price-unit">{{ plan.unit }}</span>
          </p>
        </header>
        <ul class="plan-features">
          <li v-for="f in plan.features" :key="f.label" :class="{ 'plan-feature-highlight': f.highlight }">
            {{ f.label }}
          </li>
        </ul>
        <p v-if="plan.note" class="plan-note">{{ plan.note }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlansContent } from '../../schema/types'

const props = defineProps<{
  content: unknown
  themeId?: string
  sectionTitle?: string
}>()

const data = computed(() => (props.content as PlansContent) ?? null)
const plans = computed(() => data.value?.plans ?? [])
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

.plans-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.plan-card {
  border-radius: 16px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: var(--color-surface, #fff);
}

.plan-card-main {
  border-color: rgba(232, 93, 76, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.plan-header {
  margin-bottom: 10px;
}

.plan-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink, #1a1a1a);
  margin: 0 0 4px;
}

.plan-tagline {
  font-size: 13px;
  color: var(--color-ink-muted, #5c5c5c);
  margin: 0 0 6px;
}

.plan-price {
  margin: 0;
}

.plan-price-main {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-accent, #e85d4c);
}

.plan-price-unit {
  font-size: 12px;
  color: var(--color-ink-muted, #5c5c5c);
  margin-left: 4px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--color-ink-muted, #5c5c5c);
}

.plan-feature-highlight {
  font-weight: 600;
  color: var(--color-ink, #1a1a1a);
}

.plan-note {
  font-size: 12px;
  color: var(--color-ink-muted, #5c5c5c);
  margin: 0;
}
</style>
