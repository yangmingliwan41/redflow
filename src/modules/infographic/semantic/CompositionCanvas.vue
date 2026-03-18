<template>
  <div class="composition-root" :class="spec.themeId" ref="rootRef">
    <div class="bg-mesh" aria-hidden="true" />
    <template v-for="(row, rowIndex) in spec.rows" :key="rowIndex">
      <div
        class="composition-row"
        :style="rowStyle(row)"
      >
        <component
          v-for="(mod, modIndex) in row.modules"
          :key="modIndex"
          :is="getComponent(mod.moduleId)"
          :content="mod.content"
          :theme-id="spec.themeId"
          :meta="mod.moduleId === 'quote-cta' ? spec.meta : undefined"
          class="composition-module"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { CompositionSpec, RowSpec } from '../design/compositionTypes'
import { MODULE_COMPONENTS } from '../design/moduleRegistry'
import type { ModuleId } from '../design/moduleTypes'

const props = defineProps<{
  spec: CompositionSpec
}>()

const emit = defineEmits<{
  (e: 'overflowChange', payload: { overflowing: boolean }): void
}>()

const rootRef = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

function getComponent(id: ModuleId) {
  return MODULE_COMPONENTS[id] ?? null
}

function rowStyle(row: RowSpec): Record<string, string> {
  const gap = row.gap ?? 28
  const n = row.modules.length
  const cols = n >= 2 ? '1fr 1fr' : '1fr'
  return {
    gap: `${gap}px`,
    alignItems: row.align ?? 'stretch',
    gridTemplateColumns: n > 2 ? `repeat(${n}, minmax(0, 1fr))` : cols
  }
}

const CANVAS_HEIGHT = 1660

onMounted(() => {
  if (typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(entries => {
    const entry = entries[0]
    if (!entry) return
    const overflowing = entry.contentRect.height > CANVAS_HEIGHT * 0.98
    emit('overflowChange', { overflowing })
  })
  if (rootRef.value) resizeObserver.observe(rootRef.value)
})

onUnmounted(() => {
  if (resizeObserver && rootRef.value) resizeObserver.unobserve(rootRef.value)
  resizeObserver = null
})
</script>

<style scoped>
.composition-root {
  --gap-section: 48px;
  --line-height-body: 1.65;
  --font-body: 15px;
  --color-bg: #fefaf6;
  --color-surface: #ffffff;
  --color-ink: #1a1a1a;
  --color-ink-muted: #5c5c5c;
  --color-accent: #e85d4c;
  --color-accent-soft: #ffebe8;
  --color-card-dark: #1c1917;
  --radius-card: 20px;
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-quote: 0 8px 32px rgba(232, 93, 76, 0.12);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--gap-section);
  padding: 40px 48px 36px;
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  background: var(--color-bg);
  overflow: hidden;
  align-content: start;
}

.composition-root.platform {
  --color-bg: #f5f7fb;
  --color-ink: #111827;
  --color-ink-muted: #6b7280;
  --color-accent: #ef4444;
  --color-accent-soft: #fee2e2;
  --color-card-dark: #0f172a;
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

.composition-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  position: relative;
}

.composition-module {
  min-width: 0;
}
</style>
