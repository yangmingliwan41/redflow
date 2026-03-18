<template>
  <Modal
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    size="lg"
    :close-on-backdrop="false"
  >
    <template #header>
      <div class="guide-header">
        <div class="guide-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <h2 class="guide-title">欢迎使用红流云创</h2>
        <p class="guide-subtitle">快速了解创作工具的使用方式</p>
      </div>
    </template>

    <div class="guide-content">
      <div class="guide-cards">
        <!-- 快速模式卡片 -->
        <div class="guide-card">
          <div class="guide-card-header">
            <div class="guide-card-icon quick">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 class="guide-card-title">快速模式</h3>
          </div>
          <div class="guide-card-body">
            <div class="guide-feature">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <div class="feature-text">
                <div class="feature-name">文本生成图文</div>
                <div class="feature-desc">输入主题，AI生成完整图文</div>
              </div>
            </div>
            <div class="guide-feature">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
              </div>
              <div class="feature-text">
                <div class="feature-name">需求分析</div>
                <div class="feature-desc">输入需求，AI自动分析</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 专业模式卡片 -->
        <div class="guide-card">
          <div class="guide-card-header">
            <div class="guide-card-icon professional">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3 class="guide-card-title">专业模式</h3>
          </div>
          <div class="guide-card-body">
            <div class="guide-feature">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div class="feature-text">
                <div class="feature-name">图生图文</div>
                <div class="feature-desc">上传图片，AI生成营销图文</div>
              </div>
            </div>
            <div class="guide-feature">
              <div class="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="feature-text">
                <div class="feature-name">提示词生图</div>
                <div class="feature-desc">输入提示词，批量生成图片</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="guide-tips">
        <div class="tip-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>点击首页的模式按钮切换快速模式和专业模式</span>
        </div>
        <div class="tip-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>左侧工作区可以管理您的创作项目和历史记录</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="guide-footer">
        <button class="guide-btn guide-btn-primary" @click="handleStart">
          开始创作
        </button>
        <button class="guide-btn guide-btn-secondary" @click="handleClose">
          稍后再说
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './ui/Modal.vue'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'start'): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleStart = () => {
  emit('update:visible', false)
  emit('start')
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
/* 让 Modal header 内容居中 */
:deep(.ui-modal__header) {
  justify-content: center;
  position: relative;
}

:deep(.ui-modal__close) {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
}

.guide-header {
  text-align: center;
  padding: var(--spacing-lg) 0;
  width: 100%;
  margin: 0 auto;
}

.guide-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  position: relative;
  box-shadow: 0 8px 24px rgba(74, 142, 255, 0.2);
}

.guide-icon::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  background: var(--primary-gradient);
  opacity: 0.3;
  filter: blur(8px);
  z-index: -1;
}

.guide-icon svg {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.guide-title {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-main);
  margin: 0 0 var(--spacing-xs);
  font-family: var(--font-family-display);
}

.guide-subtitle {
  font-size: var(--font-base);
  color: var(--text-sub);
  margin: 0;
}

.guide-content {
  padding: var(--spacing-lg) 0;
}

.guide-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.guide-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--duration-normal) var(--ease-out);
}

.guide-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.1);
}

.guide-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.guide-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  transition: all var(--duration-normal) var(--ease-out);
}

.guide-card-icon.quick {
  background: linear-gradient(135deg, #4A8EFF 0%, #3B7FE8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.25);
}

.guide-card-icon.quick::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #4A8EFF 0%, #3B7FE8 100%);
  opacity: 0.2;
  filter: blur(6px);
  z-index: -1;
}

.guide-card-icon.quick svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.guide-card-icon.professional {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
}

.guide-card-icon.professional::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  opacity: 0.2;
  filter: blur(6px);
  z-index: -1;
}

.guide-card-icon.professional svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.guide-card:hover .guide-card-icon {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(74, 142, 255, 0.3);
}

.guide-card-title {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-main);
  margin: 0;
}

.guide-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.guide-feature {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
  border: 1px solid var(--border-color);
  transition: all var(--duration-fast) var(--ease-out);
}

.guide-feature:hover .feature-icon {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
  transform: scale(1.1);
}

.feature-text {
  flex: 1;
}

.feature-name {
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  color: var(--text-main);
  margin-bottom: 2px;
}

.feature-desc {
  font-size: var(--font-sm);
  color: var(--text-sub);
  line-height: 1.5;
}

.guide-tips {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-sub);
  line-height: 1.6;
}

.tip-item svg {
  flex-shrink: 0;
  color: var(--primary);
}

.guide-footer {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  padding-top: var(--spacing-md);
}

.guide-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-medium);
  border: none;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  min-width: 120px;
}

.guide-btn-primary {
  background: var(--primary-gradient);
  color: white;
}

.guide-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 142, 255, 0.3);
}

.guide-btn-secondary {
  background: var(--bg-subtle);
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.guide-btn-secondary:hover {
  background: var(--bg-card);
  border-color: var(--primary);
}

@media (max-width: 768px) {
  .guide-cards {
    grid-template-columns: 1fr;
  }

  .guide-footer {
    flex-direction: column;
  }

  .guide-btn {
    width: 100%;
  }
}
</style>



