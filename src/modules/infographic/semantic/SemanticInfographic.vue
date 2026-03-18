<template>
  <div class="semantic-root" :class="layout.meta.themeId" ref="rootRef">
    <div class="bg-mesh" aria-hidden="true" />
    <section class="header-section" data-section-slot="header">
      <p v-if="layout.meta.subtitle" class="subtitle">
        {{ layout.meta.subtitle }}
      </p>
      <h1 class="title">
        {{ layout.meta.title }}
      </h1>
      <p v-if="layout.meta.tagline" class="tagline">
        {{ layout.meta.tagline }}
      </p>
    </section>

    <section class="top-row">
      <div class="card card-left" data-section-slot="background">
        <h2 class="card-title">
          {{ backgroundSection?.title || '背景与目标' }}
        </h2>
        <p v-if="backgroundContent?.intro" class="card-intro">
          {{ backgroundContent.intro }}
        </p>
        <div v-for="bullet in backgroundContent?.bullets || []" :key="bullet.label" class="bullet-group">
          <p class="bullet-label">
            {{ bullet.label }}
          </p>
          <ul class="bullet-list">
            <li v-for="item in bullet.items" :key="item">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="card card-right" data-section-slot="data">
        <h2 class="card-title card-title-light">
          {{ dataSection?.title || '4 个关键数字' }}
        </h2>
        <div class="metrics-grid">
          <div
            v-for="metric in dataContent?.metrics || []"
            :key="metric.label + metric.value"
            class="metric-item"
          >
            <div class="metric-value">
              {{ metric.value }}
            </div>
            <div class="metric-label">
              {{ metric.label }}
            </div>
            <div v-if="metric.comment" class="metric-comment">
              {{ metric.comment }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="middle-row">
      <div class="column" data-section-slot="strategy" v-if="strategyContent">
        <h2 class="section-title">
          <span class="section-title-dot" aria-hidden="true" />
          {{ strategySection?.title || '3 个动作' }}
        </h2>
        <div v-for="phase in strategyContent?.phases || []" :key="phase.name + phase.duration" class="phase">
          <div class="phase-header">
            <span class="phase-name">{{ phase.name }}</span>
            <span v-if="phase.duration" class="phase-duration">{{ phase.duration }}</span>
          </div>
          <ul class="bullet-list">
            <li v-for="item in phase.focus" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="column" data-section-slot="effect" v-if="effectContent">
        <h2 class="section-title">
          <span class="section-title-dot" aria-hidden="true" />
          {{ effectSection?.title || '3 条结论' }}
        </h2>
        <div v-for="group in effectContent?.groups || []" :key="group.heading" class="effect-group">
          <div class="effect-heading">{{ group.heading }}</div>
          <ul class="bullet-list">
            <li v-for="item in group.bullets" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="column" v-if="advantagesContent">
        <h2 class="section-title">
          <span class="section-title-dot" aria-hidden="true" />
          起号优势
        </h2>
        <div class="advantages-grid">
          <div v-for="item in advantagesContent.items" :key="item.title" class="adv-card">
            <div class="adv-title">{{ item.title }}</div>
            <div v-if="item.highlight" class="adv-highlight">
              {{ item.highlight }}
            </div>
            <p v-if="item.description" class="adv-desc">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>

      <div class="column" v-if="plansContent">
        <h2 class="section-title">
          <span class="section-title-dot" aria-hidden="true" />
          起号方案
        </h2>
        <div class="plans-row">
          <article v-for="plan in plansContent.plans" :key="plan.name" class="plan-card" :class="{ 'plan-card-main': plan.highlight }">
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
            <p v-if="plan.note" class="plan-note">
              {{ plan.note }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="summary-section" data-section-slot="summary">
      <blockquote class="summary-quote">
        <p v-for="(p, idx) in summaryContent?.paragraphs || []" :key="idx" class="summary-quote-text">
          {{ p }}
        </p>
      </blockquote>
      <div class="summary-footer">
        <span class="summary-tag">{{ reportTag }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type {
  InfographicLayout,
  BackgroundContent,
  StrategyContent,
  DataContent,
  EffectContent,
  SummaryContent,
  AdvantagesContent,
  PlansContent
} from '../schema/types'

const props = defineProps<{
  layout: InfographicLayout
}>()

const emit = defineEmits<{
  (e: 'overflowChange', payload: { overflowing: boolean }): void
}>()

const rootRef = ref<HTMLElement | null>(null)

const findSectionBySlot = (slot: string) =>
  props.layout.sections.find(section => section.slot === slot)

const backgroundSection = computed(() => findSectionBySlot('background'))
const dataSection = computed(() => findSectionBySlot('data'))
const strategySection = computed(() => findSectionBySlot('strategy'))
const effectSection = computed(() => findSectionBySlot('effect'))
const advantagesSection = computed(() => findSectionBySlot('advantages'))
const plansSection = computed(() => findSectionBySlot('plans'))
const summarySection = computed(() => findSectionBySlot('summary'))

const backgroundContent = computed<BackgroundContent | null>(() => {
  const section = backgroundSection.value
  if (!section || section.content.kind !== 'background') return null
  return section.content.data as BackgroundContent
})

const dataContent = computed<DataContent | null>(() => {
  const section = dataSection.value
  if (!section || section.content.kind !== 'data') return null
  return section.content.data as DataContent
})

const strategyContent = computed<StrategyContent | null>(() => {
  const section = strategySection.value
  if (!section || section.content.kind !== 'strategy') return null
  return section.content.data as StrategyContent
})

const effectContent = computed<EffectContent | null>(() => {
  const section = effectSection.value
  if (!section || section.content.kind !== 'effect') return null
  return section.content.data as EffectContent
})

const advantagesContent = computed<AdvantagesContent | null>(() => {
  const section = advantagesSection.value
  if (!section || section.content.kind !== 'advantages') return null
  return section.content.data as AdvantagesContent
})

const plansContent = computed<PlansContent | null>(() => {
  const section = plansSection.value
  if (!section || section.content.kind !== 'plans') return null
  return section.content.data as PlansContent
})

const summaryContent = computed<SummaryContent | null>(() => {
  const section = summarySection.value
  if (!section || section.content.kind !== 'summary') return null
  return section.content.data as SummaryContent
})

const summaryTitle = computed(() => {
  if (summaryContent.value?.title) return summaryContent.value.title
  if (summarySection.value?.title) return summarySection.value.title
  return '结语'
})

const reportTag = computed(() => {
  const label = props.layout.meta.tagLabel ?? 'REPORT'
  const year = props.layout.meta.reportYear
  if (!year) return label
  return label === 'REPORT' ? `REPORT ${year}` : `${label} · ${year}`
})

const CANVAS_HEIGHT = 1660
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return
    const height = entry.contentRect.height
    const overflowing = height > CANVAS_HEIGHT * 0.98
    emit('overflowChange', { overflowing })
  })
  if (rootRef.value) {
    resizeObserver.observe(rootRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver && rootRef.value) {
    resizeObserver.unobserve(rootRef.value)
  }
  resizeObserver = null
})
</script>

<style scoped>
.semantic-root {
  --gap-section: 44px;
  --gap-card: 28px;
  --line-height-body: 1.65;
  --font-body: 15px;
  --color-bg: #fefaf6;
  --color-surface: #ffffff;
  --color-ink: #1a1a1a;
  --color-ink-muted: #5c5c5c;
  --color-accent: #e85d4c;
  --color-accent-soft: #ffebe8;
  --color-card-dark: #1c1917;
  --color-card-dark-surface: rgba(255, 255, 255, 0.06);
  --color-metric-1: #e85d4c;
  --color-metric-2: #f59e0b;
  --color-metric-3: #10b981;
  --color-metric-4: #8b5cf6;
  --radius-card: 20px;
  --radius-metric: 14px;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-quote: 0 8px 32px rgba(232, 93, 76, 0.12);

  position: relative;
  display: grid;
  grid-template-rows: auto auto auto auto;
  row-gap: var(--gap-section);
  padding: 40px 48px 36px;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  background: var(--color-bg);
  overflow: hidden;
  align-content: start;
}

.semantic-root.platform {
  --color-bg: #f5f7fb;
  --color-surface: #ffffff;
  --color-ink: #111827;
  --color-ink-muted: #6b7280;
  --color-accent: #ef4444;
  --color-accent-soft: #fee2e2;
  --color-card-dark: #0f172a;
  --color-card-dark-surface: rgba(15, 23, 42, 0.92);
  --font-body: 16px;
}

.bg-mesh {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 80% 40% at 20% 0%, rgba(232, 93, 76, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse 60% 30% at 85% 90%, rgba(245, 158, 11, 0.05) 0%, transparent 45%);
}

.header-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--color-accent);
}

.subtitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.title {
  font-size: 38px;
  line-height: 1.15;
  font-weight: 800;
  color: var(--color-ink);
  letter-spacing: -0.03em;
}

.semantic-root.platform .title {
  font-size: 42px;
}

.tagline {
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-ink-muted);
}

.semantic-root.platform .tagline {
  font-size: 18px;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--gap-card);
}

.card {
  border-radius: var(--radius-card);
  padding: 24px 24px 32px;
  box-sizing: border-box;
  position: relative;
}

.card-left {
  background: var(--color-surface);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: var(--shadow-card);
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
  color: var(--color-ink);
  letter-spacing: 0.02em;
}

.card-title-light {
  color: #fafafa;
}

.card-intro {
  font-size: 15px;
  line-height: var(--line-height-body);
  color: var(--color-ink-muted);
  margin: 0 0 14px;
}

.bullet-group {
  margin-top: 12px;
}

.bullet-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0 0 4px;
}

.bullet-list {
  padding-left: 18px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--font-body);
  line-height: var(--line-height-body);
  color: var(--color-ink-muted);
}

.card-right {
  background: linear-gradient(165deg, var(--color-card-dark) 0%, #2d2a26 100%);
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
  border-radius: var(--radius-metric);
  background: var(--color-card-dark-surface);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid var(--color-accent);
}

.metric-value {
  font-size: 22px;
  font-weight: 800;
  color: #fafafa;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.semantic-root.platform .metric-value {
  font-size: 24px;
}

.metric-label {
  margin-top: 4px;
  font-size: 12px;
  color: #a8a29e;
  line-height: 1.35;
}

.metric-comment {
  margin-top: 4px;
  font-size: 12px;
  color: #d6d3d1;
  line-height: 1.4;
}

.middle-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  color: var(--color-ink);
  margin-bottom: 4px;
}

.adv-highlight {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: 4px;
}

.adv-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin: 0;
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
  background: var(--color-surface);
}

.plan-card-main {
  border-color: rgba(232, 93, 76, 0.5);
  box-shadow: var(--shadow-card);
}

.plan-header {
  margin-bottom: 10px;
}

.plan-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0 0 4px;
}

.semantic-root.platform .plan-name {
  font-size: 16px;
}

.plan-tagline {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin: 0 0 6px;
}

.plan-price {
  margin: 0;
}

.plan-price-main {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-accent);
}

.semantic-root.platform .plan-price-main {
  font-size: 22px;
}

.plan-price-unit {
  font-size: 12px;
  color: var(--color-ink-muted);
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
  color: var(--color-ink-muted);
}

.plan-feature-highlight {
  font-weight: 600;
  color: var(--color-ink);
}

.plan-note {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-ink);
}

.section-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.phase {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.phase:last-of-type {
  border-bottom: none;
}

.phase-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.phase-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-ink);
}

.phase-duration {
  font-size: 12px;
  color: var(--color-ink-muted);
}

.effect-group {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
}

.effect-group:last-of-type {
  border-bottom: none;
}

.effect-heading {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 4px;
}

.summary-section {
  position: relative;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.semantic-root.platform .summary-section {
  margin-top: 8px;
  padding-bottom: 48px;
}

.summary-quote {
  margin: 0;
  padding: 22px 28px;
  background: linear-gradient(135deg, var(--color-accent-soft) 0%, #fff5f3 100%);
  border-left: 5px solid var(--color-accent);
  border-radius: 16px;
  box-shadow: var(--shadow-quote);
}

.semantic-root.platform .summary-quote {
  padding: 32px 40px;
  min-height: 220px;
}

.summary-quote-text {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--color-ink);
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
  color: var(--color-ink-muted);
}
</style>

