<template>
  <div class="studio">
    <div class="studio-left">
      <div class="panel">
        <div class="panel-title">导出</div>
        <Button :disabled="isExporting" @click="handleExport">
          {{ isExporting ? '导出中…' : '导出 PNG（2x）' }}
        </Button>
        <div v-if="exportError" class="panel-error">{{ exportError }}</div>
      </div>

      <div class="panel">
        <div class="panel-title">内容（示例）</div>
        <div class="panel-desc">
          先用高密度中文样例跑通“渲染 → 导出不乱码”。后续再把这里替换成你们流程输出的元素列表。
        </div>
        <div class="sample-switch">
          <Button
            size="sm"
            :variant="activeSample === 'case1' ? 'default' : 'secondary'"
            @click="switchSample('case1')"
          >
            案例一：起号产品介绍
          </Button>
          <Button
            size="sm"
            :variant="activeSample === 'case2' ? 'default' : 'secondary'"
            @click="switchSample('case2')"
          >
            案例二：平台优势&套餐
          </Button>
          <Button
            size="sm"
            :variant="activeSample === 'case3' ? 'default' : 'secondary'"
            @click="switchSample('case3')"
          >
            案例三：西安周末旅游攻略
          </Button>
        </div>
        <Button variant="secondary" @click="resetSample">重置当前案例</Button>
      </div>

      <div class="panel">
        <div class="panel-title">实时编辑</div>
        <div class="panel-desc">在画布上点击选中文本，双击可就地编辑；这里也可同步修改。</div>
        <template v-if="selectedTextEl">
          <label class="field-label">文本内容</label>
          <textarea
            class="field-textarea"
            :value="selectedTextEl.text"
            rows="5"
            @input="onSideTextInput"
          />

          <div class="field-grid">
            <div class="field">
              <label class="field-label">字号</label>
              <input class="field-input" type="number" :value="selectedTextEl.fontSize" @input="onFontSizeInput" />
            </div>
            <div class="field">
              <label class="field-label">粗细</label>
              <input class="field-input" type="text" :value="selectedTextEl.fontWeight ?? 400" @input="onFontWeightInput" />
            </div>
            <div class="field">
            <label class="field-label">颜色</label>
            <input
              class="field-input"
              type="color"
              :value="selectedTextEl.color ?? '#0F172A'"
              @input="onColorInput"
            />
            </div>
            <div class="field">
              <label class="field-label">对齐</label>
              <select class="field-input" :value="selectedTextEl.textAlign ?? 'left'" @change="onAlignChange">
                <option value="left">左</option>
                <option value="center">中</option>
                <option value="right">右</option>
              </select>
            </div>
          </div>
        </template>
        <div v-else class="panel-desc">先在画布上选中一个文本块。</div>
      </div>
    </div>

    <div class="studio-right">
      <InfographicCanvas
        ref="canvasRef"
        :doc="doc"
        :layout="layout || undefined"
        :composition-spec="compositionSpec"
        mode="semantic"
        @select="onSelect"
        @update:text="onUpdateText"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import Button from '@/components/ui/Button.vue'
import InfographicCanvas from './InfographicCanvas.vue'
import { layoutCase1, layoutCase2, layoutCase3 } from './schema/layoutSample'
import { buildDocumentFromLayout, buildDocumentFromComposition } from './schema/fromLayout'
import type { InfographicDocument, TextElement, InfographicLayout } from './schema/types'
import { computeComposition } from './brain'
import { exportElementToPng } from './export/exportToPng'
import { useInfographicPlanStore } from '@/stores/infographicPlan'

const planStore = useInfographicPlanStore()

type SampleId = 'case1' | 'case2' | 'case3'

const activeSample = ref<SampleId>('case1')

const getLayoutBySample = (id: SampleId): InfographicLayout => {
  if (id === 'case1') return layoutCase1
  if (id === 'case2') return layoutCase2
  return layoutCase3
}

const doc = ref<InfographicDocument>(
  planStore.doc ?? buildDocumentFromLayout(getLayoutBySample(activeSample.value))
)
const layout = computed<InfographicLayout | null>(() => planStore.layout ?? getLayoutBySample(activeSample.value))
const compositionSpec = computed(() => computeComposition({ caseId: activeSample.value }))
const canvasRef = ref<InstanceType<typeof InfographicCanvas> | null>(null)

const isExporting = ref(false)
const exportError = ref<string | null>(null)

const selectedId = ref<string | null>(null)

const selectedTextEl = computed<TextElement | null>(() => {
  if (!selectedId.value) return null
  const el = doc.value.elements.find(e => e.id === selectedId.value)
  return el && el.type === 'text' ? (el as TextElement) : null
})

const switchSample = (id: SampleId) => {
  activeSample.value = id
  const layoutToUse = getLayoutBySample(id)
  planStore.setLayout(layoutToUse)
  doc.value = buildDocumentFromLayout(layoutToUse)
  selectedId.value = null
}

const resetSample = () => {
  switchSample(activeSample.value)
}

const onSelect = (id: string | null) => {
  selectedId.value = id
}

const patchTextEl = (id: string, patch: Partial<TextElement>) => {
  const idx = doc.value.elements.findIndex(e => e.id === id)
  if (idx < 0) return
  const el = doc.value.elements[idx]
  if (el.type !== 'text') return
  doc.value.elements[idx] = { ...(el as TextElement), ...patch }
  // 将最新 doc 同步回 planStore，便于后续保存/再次打开
  planStore.setDoc(doc.value)
}

const onUpdateText = ({ id, text }: { id: string; text: string }) => {
  patchTextEl(id, { text })
}

const onSideTextInput = (e: Event) => {
  if (!selectedTextEl.value) return
  patchTextEl(selectedTextEl.value.id, { text: (e.target as HTMLTextAreaElement).value })
}

const onFontSizeInput = (e: Event) => {
  if (!selectedTextEl.value) return
  const v = Number((e.target as HTMLInputElement).value)
  if (!Number.isFinite(v) || v <= 0) return
  patchTextEl(selectedTextEl.value.id, { fontSize: v })
}

const onFontWeightInput = (e: Event) => {
  if (!selectedTextEl.value) return
  const raw = (e.target as HTMLInputElement).value
  const n = Number(raw)
  patchTextEl(selectedTextEl.value.id, { fontWeight: Number.isFinite(n) ? n : raw })
}

const onColorInput = (e: Event) => {
  if (!selectedTextEl.value) return
  patchTextEl(selectedTextEl.value.id, { color: (e.target as HTMLInputElement).value })
}

const onAlignChange = (e: Event) => {
  if (!selectedTextEl.value) return
  patchTextEl(selectedTextEl.value.id, { textAlign: (e.target as HTMLSelectElement).value as any })
}

const handleExport = async () => {
  exportError.value = null
  const el = canvasRef.value?.rootEl
  if (!el) return

  isExporting.value = true
  try {
    const dataUrl = await exportElementToPng(el, { pixelRatio: 2 })
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = 'infographic-1660x1242.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e: any) {
    exportError.value = e?.message || String(e)
  } finally {
    isExporting.value = false
  }
}

// 当 store 中 doc 被外部更新（例如重新生成规划）时，同步到本地 doc
watchEffect(() => {
  if (planStore.doc && planStore.doc !== doc.value) {
    doc.value = planStore.doc
  }
})
</script>

<style scoped>
.studio {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
  min-height: 100vh;
  height: 100vh;
}

.studio-left {
  position: sticky;
  top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.panel-title {
  font-weight: var(--font-semibold);
  color: var(--text-main);
  font-size: var(--font-base);
}

.panel-desc {
  color: var(--text-sub);
  font-size: var(--font-sm);
  line-height: var(--line-height-relaxed);
}

.panel-error {
  color: var(--danger, #ef4444);
  font-size: var(--font-sm);
  line-height: var(--line-height-relaxed);
  word-break: break-word;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: var(--font-xs);
  color: var(--text-sub);
  font-weight: var(--font-semibold);
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
}

.field-textarea {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-body);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
  resize: vertical;
}

.studio-right {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.studio-right :deep(.canvas-shell) {
  flex: 1;
  min-width: 0;
}

@media (max-width: 1200px) {
  .studio {
    grid-template-columns: 1fr;
  }

  .studio-left {
    position: static;
  }
}
</style>

