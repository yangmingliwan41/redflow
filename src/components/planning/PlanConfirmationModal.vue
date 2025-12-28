<template>
  <div v-if="visible" class="plan-confirmation-modal-overlay" @click="handleOverlayClick">
    <div class="plan-confirmation-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">内容规划确认</h2>
        <button class="modal-close" @click="handleClose">×</button>
      </div>

      <div class="modal-content">
        <div v-if="plan" class="plan-summary">
          <div class="summary-section">
            <h3 class="section-title">规划概览</h3>
            <div class="summary-info">
              <div class="info-item">
                <span class="info-label">规划名称：</span>
                <span class="info-value">{{ plan.multi?.planName || plan.single?.title || '未命名规划' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">内容数量：</span>
                <span class="info-value">{{ getTotalContents() }} 篇</span>
              </div>
              <div class="info-item" v-if="plan.multi?.period">
                <span class="info-label">规划周期：</span>
                <span class="info-value">{{ plan.multi.period.startDate }} 至 {{ plan.multi.period.endDate }}</span>
              </div>
            </div>
          </div>

          <div class="summary-section" v-if="plan.multi">
            <h3 class="section-title">内容列表</h3>
            <div class="contents-list">
              <div
                v-for="(content, index) in plan.multi.contents"
                :key="content.id"
                class="content-item"
              >
                <div class="content-index">#{{ index + 1 }}</div>
                <div class="content-info">
                  <div class="content-title">{{ content.title || `内容 ${index + 1}` }}</div>
                  <div class="content-meta">
                    <span class="content-type">{{ content.contentType }}</span>
                    <span class="content-style">{{ content.stylePack?.style_name || '默认风格' }}</span>
                    <span class="content-date" v-if="content.targetDate">{{ content.targetDate }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="summary-section" v-if="plan.multi?.overallStrategy">
            <h3 class="section-title">策略分析</h3>
            <div class="strategy-info">
              <div class="strategy-item">
                <span class="strategy-label">多样性评分：</span>
                <span class="strategy-value">{{ (plan.multi.overallStrategy.diversityScore * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="loading-state">
          <p>加载规划中...</p>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" @click="handleClose">取消</button>
        <button class="btn-primary" @click="handleEdit" v-if="allowEdit">编辑</button>
        <button class="btn-primary" @click="handleConfirm" :disabled="!plan">确认规划</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ContentPlan } from '../../types/planning'

interface Props {
  visible: boolean
  plan: ContentPlan | null
  allowEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  plan: null,
  allowEdit: true
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', plan: ContentPlan): void
  (e: 'edit', plan: ContentPlan): void
}>()

const getTotalContents = (): number => {
  if (!props.plan) return 0
  if (props.plan.planType === 'multi' && props.plan.multi) {
    return props.plan.multi.contents.length
  }
  return 1
}

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  handleClose()
}

const handleConfirm = () => {
  if (props.plan) {
    emit('confirm', props.plan)
  }
}

const handleEdit = () => {
  if (props.plan) {
    emit('edit', props.plan)
  }
}
</script>

<style scoped>
.plan-confirmation-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn var(--duration-normal, 0.3s);
}

.plan-confirmation-modal {
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  animation: slideUp var(--duration-normal, 0.3s);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg, 24px);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.modal-title {
  font-size: var(--font-xl, 20px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: var(--text-sub, #6b7280);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md, 8px);
  transition: all var(--duration-fast, 0.2s);
}

.modal-close:hover {
  background: var(--bg-body, #f5f5f5);
  color: var(--text-main, #1f2937);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg, 24px);
}

.plan-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
}

.summary-section {
  padding: var(--spacing-md, 16px);
  background: var(--bg-body, #f5f5f5);
  border-radius: var(--radius-md, 8px);
}

.section-title {
  font-size: var(--font-base, 16px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
  margin: 0 0 var(--spacing-md, 16px) 0;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: var(--font-medium, 500);
  color: var(--text-sub, #6b7280);
  margin-right: var(--spacing-sm, 8px);
  min-width: 100px;
}

.info-value {
  color: var(--text-main, #1f2937);
}

.contents-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  max-height: 300px;
  overflow-y: auto;
}

.content-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 8px);
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, #e5e7eb);
}

.content-index {
  font-weight: var(--font-semibold, 600);
  color: var(--primary, #4a8eff);
  min-width: 40px;
}

.content-info {
  flex: 1;
}

.content-title {
  font-weight: var(--font-medium, 500);
  color: var(--text-main, #1f2937);
  margin-bottom: var(--spacing-xs, 4px);
}

.content-meta {
  display: flex;
  gap: var(--spacing-sm, 8px);
  font-size: var(--font-sm, 14px);
  color: var(--text-sub, #6b7280);
}

.content-type,
.content-style,
.content-date {
  padding: 2px 8px;
  background: var(--bg-body, #f5f5f5);
  border-radius: var(--radius-sm, 4px);
}

.strategy-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
}

.strategy-item {
  display: flex;
  align-items: center;
}

.strategy-label {
  font-weight: var(--font-medium, 500);
  color: var(--text-sub, #6b7280);
  margin-right: var(--spacing-sm, 8px);
}

.strategy-value {
  color: var(--primary, #4a8eff);
  font-weight: var(--font-semibold, 600);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-xl, 32px);
  color: var(--text-sub, #6b7280);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-lg, 24px);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.btn-primary,
.btn-secondary {
  padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-base, 16px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
}

.btn-primary {
  background: var(--primary, #4a8eff);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover, #3a7eef);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-body, #f5f5f5);
  color: var(--text-main, #1f2937);
}

.btn-secondary:hover {
  background: var(--bg-card, #ffffff);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .plan-confirmation-modal {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-actions {
    padding: var(--spacing-md, 16px);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>

