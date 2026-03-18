<template>
  <section class="header-section" data-module="header">
    <p v-if="meta.subtitle" class="subtitle">{{ meta.subtitle }}</p>
    <h1 class="title">{{ meta.title }}</h1>
    <p v-if="meta.tagline" class="tagline">{{ meta.tagline }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InfographicLayoutMeta } from '../../schema/types'

const props = defineProps<{
  content: unknown
  themeId?: string
}>()

const meta = computed(() => (props.content as InfographicLayoutMeta) || { title: '' })
</script>

<style scoped>
.header-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 3px solid var(--color-accent, #e85d4c);
}

.subtitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-accent, #e85d4c);
}

.title {
  font-size: 38px;
  line-height: 1.15;
  font-weight: 800;
  color: var(--color-ink, #1a1a1a);
  letter-spacing: -0.03em;
  margin: 0;
}

.tagline {
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-ink-muted, #5c5c5c);
  margin: 0;
}
</style>
