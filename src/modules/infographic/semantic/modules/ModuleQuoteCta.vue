<template>
  <section class="summary-section" data-module="quote-cta">
    <blockquote class="summary-quote">
      <p v-for="(p, idx) in paragraphs" :key="idx" class="summary-quote-text">{{ p }}</p>
    </blockquote>
    <div class="summary-footer">
      <span class="summary-tag">{{ reportTag }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SummaryContent, InfographicLayoutMeta } from '../../schema/types'

const props = defineProps<{
  content: unknown
  themeId?: string
  /** 底部标签，不传则从 meta 取 tagLabel / reportYear */
  tagLabel?: string
  meta?: InfographicLayoutMeta | null
}>()

const summary = computed(() => (props.content as SummaryContent) ?? null)
const paragraphs = computed(() => summary.value?.paragraphs ?? [])

const reportTag = computed(() => {
  if (props.tagLabel) return props.tagLabel
  const m = props.meta
  const label = m?.tagLabel ?? 'REPORT'
  const year = m?.reportYear
  if (!year) return label
  return label === 'REPORT' ? `REPORT ${year}` : `${label} · ${year}`
})
</script>

<style scoped>
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-quote {
  margin: 0;
  padding: 22px 28px;
  background: linear-gradient(135deg, var(--color-accent-soft, #ffebe8) 0%, #fff5f3 100%);
  border-left: 5px solid var(--color-accent, #e85d4c);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(232, 93, 76, 0.12);
}

.summary-quote-text {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--color-ink, #1a1a1a);
  margin: 0;
}

.summary-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-tag {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--color-ink-muted, #5c5c5c);
}
</style>
