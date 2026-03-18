<template>
  <div class="canvas-shell" ref="shellRef">
    <div class="canvas-viewport" ref="viewportRef">
      <div
        class="canvas-scaled"
        :style="scaledWrapperStyle"
      >
        <div
          ref="rootRef"
          class="infographic-root"
          :style="rootStyle"
          data-export-root="infographic"
          @click.self="clearSelection"
        >
      <template v-if="mode === 'legacy' || (!compositionSpec && !layout)">
        <template v-for="el in sortedElements" :key="el.id">
          <div
            v-if="el.type === 'text'"
            class="el text"
            :class="{ selected: el.id === selectedId }"
            :data-el-id="el.id"
            :style="getTextStyle(el)"
            @click.stop="select(el.id)"
            @dblclick.stop="beginInlineEdit(el.id)"
          >
            {{ el.text }}
          </div>

          <img
            v-else-if="el.type === 'image'"
            class="el image"
            :src="el.src"
            :data-el-id="el.id"
            :style="getImageStyle(el)"
            alt=""
            crossorigin="anonymous"
          />

          <div
            v-else-if="el.type === 'shape'"
            class="el shape"
            :data-el-id="el.id"
            :style="getShapeStyle(el)"
          />
        </template>

        <div
          v-if="selectionBox"
          class="selection-box"
          :style="selectionBox"
          data-export-ignore="true"
        />

        <textarea
          v-if="editing"
          ref="editorRef"
          class="inline-editor"
          :style="editing.style"
          :value="editing.value"
          data-export-ignore="true"
          @input="onEditorInput"
          @keydown="onEditorKeydown"
          @blur="commitInlineEdit"
        />
      </template>

      <template v-else>
        <CompositionCanvas
          v-if="compositionSpec"
          :spec="compositionSpec"
          @overflowChange="onOverflowChange"
        />
        <SemanticInfographic
          v-else
          :layout="layout!"
          @overflowChange="onOverflowChange"
        />
        <div
          v-if="showOverflowHint"
          class="overflow-hint"
          data-export-ignore="true"
        >
          当前文案较多，建议精简部分内容以获得更好的阅读体验。
        </div>
      </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import type {
  InfographicDocument,
  ImageElement,
  ShapeElement,
  TextElement,
  InfographicElement,
  InfographicLayout
} from './schema/types'
import SemanticInfographic from './semantic/SemanticInfographic.vue'
import CompositionCanvas from './semantic/CompositionCanvas.vue'
import type { CompositionSpec } from './design/compositionTypes'

const props = defineProps<{
  doc: InfographicDocument
  layout?: InfographicLayout | null
  compositionSpec?: CompositionSpec | null
  mode?: 'semantic' | 'legacy'
}>()

const emit = defineEmits<{
  (e: 'select', id: string | null): void
  (e: 'update:text', payload: { id: string; text: string }): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const editorRef = ref<HTMLTextAreaElement | null>(null)
const viewportRef = ref<HTMLElement | null>(null)

const scale = ref(1)
const MARGIN = 24

function updateScale() {
  const el = viewportRef.value
  if (!el) return
  const w = el.clientWidth
  const h = el.clientHeight
  const designW = props.doc.size.width
  const designH = props.doc.size.height
  if (w <= 0 || h <= 0) return
  const scaleX = (w - MARGIN * 2) / designW
  const scaleY = (h - MARGIN * 2) / designH
  scale.value = Math.min(scaleX, scaleY, 1.2)
}

const scaledWrapperStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  transformOrigin: 'top center'
}))

let resizeObserver: ResizeObserver | null = null
onMounted(() => {
  updateScale()
  if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
    resizeObserver = new ResizeObserver(updateScale)
    resizeObserver.observe(viewportRef.value)
  }
})
onUnmounted(() => {
  if (resizeObserver && viewportRef.value) {
    resizeObserver.unobserve(viewportRef.value)
  }
  resizeObserver = null
})

defineExpose({
  get rootEl() {
    return rootRef.value
  }
})

const selectedId = ref<string | null>(null)

const mode = computed(() => props.mode ?? 'semantic')

const showOverflowHint = ref(false)

const onOverflowChange = (payload: { overflowing: boolean }) => {
  showOverflowHint.value = payload.overflowing
}

const sortedElements = computed<InfographicElement[]>(() => {
  const els = props.doc.elements.slice()
  els.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return els
})

const rootStyle = computed(() => {
  return {
    width: `${props.doc.size.width}px`,
    height: `${props.doc.size.height}px`,
    background: props.doc.background ?? '#FFFFFF'
  }
})

const baseElStyle = (el: { position: { x: number; y: number }; rotation?: number; opacity?: number; zIndex?: number }) => {
  return {
    left: `${el.position.x}px`,
    top: `${el.position.y}px`,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    opacity: el.opacity ?? 1,
    zIndex: el.zIndex ?? 0
  } as Record<string, string | number | undefined>
}

const getTextStyle = (el: TextElement) => {
  return {
    ...baseElStyle(el),
    width: el.width ? `${el.width}px` : undefined,
    height: el.height ? `${el.height}px` : undefined,
    fontFamily: el.fontFamily ?? 'var(--font-family-base)',
    fontSize: `${el.fontSize}px`,
    fontWeight: el.fontWeight ?? 400,
    lineHeight: el.lineHeight ? String(el.lineHeight) : '1.6',
    letterSpacing: el.letterSpacing !== undefined ? `${el.letterSpacing}em` : undefined,
    color: el.color ?? 'var(--text-main)',
    textAlign: el.textAlign ?? 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  } as const
}

const getImageStyle = (el: ImageElement) => {
  return {
    ...baseElStyle(el),
    width: `${el.width}px`,
    height: `${el.height}px`,
    borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
    objectFit: el.fit ?? 'cover'
  } as const
}

const getShapeStyle = (el: ShapeElement) => {
  const isCircle = el.shape === 'circle'
  return {
    ...baseElStyle(el),
    width: `${el.width}px`,
    height: `${el.height}px`,
    background: el.fill ?? 'transparent',
    border: el.stroke ? `${el.strokeWidth ?? 1}px solid ${el.stroke}` : undefined,
    borderRadius: isCircle ? '9999px' : el.borderRadius ? `${el.borderRadius}px` : undefined
  } as const
}

const select = (id: string) => {
  selectedId.value = id
  emit('select', id)
}

const clearSelection = () => {
  selectedId.value = null
  emit('select', null)
}

const selectedEl = computed(() => {
  if (!selectedId.value) return null
  return props.doc.elements.find(e => e.id === selectedId.value) ?? null
})

const selectionBox = computed(() => {
  if (!selectedId.value || !rootRef.value) return null
  const rootRect = rootRef.value.getBoundingClientRect()
  const node = rootRef.value.querySelector<HTMLElement>(`[data-el-id="${selectedId.value}"]`)
  if (!node) return null
  const rect = node.getBoundingClientRect()
  const padding = 6
  return {
    left: `${rect.left - rootRect.left - padding}px`,
    top: `${rect.top - rootRect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`
  }
})

type EditingState = {
  id: string
  value: string
  style: Record<string, string>
  original: string
}

const editing = ref<EditingState | null>(null)

const beginInlineEdit = async (id: string) => {
  const el = props.doc.elements.find(e => e.id === id)
  if (!el || el.type !== 'text') return
  select(id)
  const root = rootRef.value
  const node = root?.querySelector<HTMLElement>(`[data-el-id="${id}"]`)
  const rect = node && root ? node.getBoundingClientRect() : null
  const rootRect = node && root ? root.getBoundingClientRect() : null

  const editorLeft = rect && rootRect ? rect.left - rootRect.left : el.position.x
  const editorTop = rect && rootRect ? rect.top - rootRect.top : el.position.y
  const editorWidth = rect ? rect.width : el.width ?? 640
  const editorHeight =
    rect?.height ?? Math.max(80, Math.round(el.fontSize * (el.lineHeight ?? 1.6) * 2))

  editing.value = {
    id,
    value: el.text,
    original: el.text,
    style: {
      position: 'absolute',
      left: `${editorLeft}px`,
      top: `${editorTop}px`,
      width: `${editorWidth}px`,
      minHeight: `${editorHeight}px`,
      padding: '8px 10px',
      resize: 'none',
      borderRadius: '14px',
      border: '2px solid var(--primary)',
      outline: 'none',
      background: 'rgba(255,255,255,0.96)',
      boxShadow: 'var(--shadow-md)',
      fontFamily: el.fontFamily ?? 'var(--font-family-base)',
      fontSize: `${el.fontSize}px`,
      fontWeight: String(el.fontWeight ?? 400),
      lineHeight: String(el.lineHeight ?? 1.6),
      letterSpacing: el.letterSpacing !== undefined ? `${el.letterSpacing}em` : 'normal',
      color: el.color ?? 'var(--text-main)',
      textAlign: el.textAlign ?? 'left',
      zIndex: '9999'
    }
  }
  await nextTick()
  editorRef.value?.focus()
  editorRef.value?.select()
}

const onEditorInput = (e: Event) => {
  if (!editing.value) return
  const target = e.target as HTMLTextAreaElement
  editing.value.value = target.value
}

const commitInlineEdit = () => {
  if (!editing.value) return
  const { id, value } = editing.value
  emit('update:text', { id, text: value })
  editing.value = null
}

const cancelInlineEdit = () => {
  if (!editing.value) return
  editing.value = null
}

const onEditorKeydown = (e: KeyboardEvent) => {
  if (!editing.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelInlineEdit()
    return
  }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    // Ctrl/Cmd+Enter 保存（避免与换行冲突）
    e.preventDefault()
    commitInlineEdit()
  }
}

watch(
  () => props.doc,
  () => {
    editing.value = null
    selectedId.value = null
    emit('select', null)
    nextTick(updateScale)
  }
)
</script>

<style scoped>
.canvas-shell {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;
}

.canvas-viewport {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
}

.canvas-scaled {
  flex-shrink: 0;
}

.infographic-root {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.el {
  position: absolute;
  box-sizing: border-box;
}

.text {
  user-select: text;
}

.selection-box {
  position: absolute;
  border: 2px solid var(--primary);
  border-radius: 16px;
  box-shadow: 0 0 0 4px var(--primary-fade);
  pointer-events: none;
}

.inline-editor {
  box-sizing: border-box;
}

.overflow-hint {
  position: absolute;
  right: 16px;
  bottom: 16px;
  max-width: 360px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  color: #e5e7eb;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4);
}
</style>

