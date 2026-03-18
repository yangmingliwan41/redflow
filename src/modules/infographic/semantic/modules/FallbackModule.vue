<template>
  <section class="fallback" :data-module="moduleId">
    <slot />
  </section>
</template>

<script setup lang="ts">
import type { ModuleId } from '../../design/moduleTypes'

defineProps<{
  moduleId?: ModuleId
  content?: unknown
}>()
</script>

<style scoped>
.fallback {
  min-height: 60px;
}
</style>
