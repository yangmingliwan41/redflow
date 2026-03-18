<template>
  <div v-if="requirement" class="requirement-result">
    <div class="requirement-result__content">
      <!-- 核心主题卡片 - 特殊样式 -->
      <div class="requirement-result__card requirement-result__card--featured">
        <div class="requirement-result__card-header requirement-result__card-header--featured">
          <div class="requirement-result__icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <h4 class="requirement-result__section-title requirement-result__section-title--featured">核心主题</h4>
            <p class="requirement-result__topic requirement-result__topic--featured">{{ requirement.extractedTopic }}</p>
          </div>
        </div>
      </div>

      <!-- 基础信息网格 - 卡片式布局 -->
      <div class="requirement-result__grid">
        <!-- 目标受众卡片 -->
        <div class="requirement-result__card requirement-result__card--audience">
          <div class="requirement-result__card-header">
            <div class="requirement-result__icon-wrapper requirement-result__icon-wrapper--small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h4 class="requirement-result__section-title">目标受众</h4>
          </div>
          <div class="requirement-result__audience-grid">
            <div class="requirement-result__audience-item">
              <span class="requirement-result__audience-label">年龄</span>
              <span class="requirement-result__audience-value">{{ requirement.targetAudience.age }}</span>
            </div>
            <div class="requirement-result__audience-item">
              <span class="requirement-result__audience-label">性别</span>
              <span class="requirement-result__audience-value">{{ requirement.targetAudience.gender }}</span>
            </div>
            <div v-if="requirement.targetAudience.interests.length > 0" class="requirement-result__audience-item requirement-result__audience-item--full">
              <span class="requirement-result__audience-label">兴趣领域</span>
              <div class="requirement-result__interests">
                <span
                  v-for="(interest, index) in requirement.targetAudience.interests"
                  :key="index"
                  class="requirement-result__tag requirement-result__tag--interest"
                >
                  {{ interest }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容类型卡片 -->
        <div class="requirement-result__card requirement-result__card--content-type">
          <div class="requirement-result__card-header">
            <div class="requirement-result__icon-wrapper requirement-result__icon-wrapper--small">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
              </svg>
            </div>
            <h4 class="requirement-result__section-title">内容类型</h4>
          </div>
          <div class="requirement-result__content-type-wrapper">
            <span class="requirement-result__content-type requirement-result__content-type--enhanced">
              {{ getContentTypeLabel(requirement.contentType) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 推荐风格卡片 -->
      <div class="requirement-result__card requirement-result__card--styles">
        <div class="requirement-result__card-header">
          <div class="requirement-result__icon-wrapper requirement-result__icon-wrapper--small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
          </div>
          <h4 class="requirement-result__section-title">推荐风格</h4>
        </div>
        <div class="requirement-result__styles requirement-result__styles--cloud">
          <span
            v-for="(style, index) in requirement.suggestedStyles"
            :key="index"
            class="requirement-result__tag requirement-result__tag--style"
            :style="{ '--tag-index': index }"
          >
            {{ getStyleLabel(style) }}
          </span>
        </div>
      </div>

      <!-- 关键词卡片 -->
      <div v-if="requirement.keywords.length > 0" class="requirement-result__card requirement-result__card--keywords">
        <div class="requirement-result__card-header">
          <div class="requirement-result__icon-wrapper requirement-result__icon-wrapper--small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
          </div>
          <h4 class="requirement-result__section-title">关键词</h4>
        </div>
        <div class="requirement-result__keywords requirement-result__keywords--cloud">
          <span
            v-for="(keyword, index) in requirement.keywords"
            :key="index"
            class="requirement-result__tag requirement-result__tag--keyword"
            :style="{ '--tag-index': index }"
          >
            #{{ keyword }}
          </span>
        </div>
      </div>

      <!-- 调研数据卡片 -->
      <div v-if="requirement.researchData" class="requirement-result__card requirement-result__card--research">
        <div class="requirement-result__card-header requirement-result__card-header--research">
          <div class="requirement-result__icon-wrapper requirement-result__icon-wrapper--small">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <h4 class="requirement-result__section-title requirement-result__section-title--research">深度调研分析</h4>
        </div>
        
        <div class="requirement-result__research-content">
          <!-- 平台趋势 -->
          <div v-if="requirement.researchData.platformTrends && requirement.researchData.platformTrends.length > 0" class="requirement-result__research-item">
            <h5 class="requirement-result__research-title">平台趋势</h5>
            <div class="requirement-result__research-tags">
              <span
                v-for="(trend, index) in requirement.researchData.platformTrends"
                :key="index"
                class="requirement-result__tag requirement-result__tag--trend"
              >
                {{ trend }}
              </span>
            </div>
          </div>

          <!-- 竞品分析 -->
          <div v-if="requirement.researchData.competitorAnalysis" class="requirement-result__research-item">
            <h5 class="requirement-result__research-title">竞品分析</h5>
            <div 
              class="requirement-result__research-text requirement-result__research-text--formatted"
              v-html="formatResearchText(requirement.researchData.competitorAnalysis)"
            ></div>
          </div>

          <!-- 市场洞察 -->
          <div v-if="requirement.researchData.marketInsights" class="requirement-result__research-item">
            <h5 class="requirement-result__research-title">市场洞察</h5>
            <div 
              class="requirement-result__research-text requirement-result__research-text--formatted"
              v-html="formatResearchText(requirement.researchData.marketInsights)"
            ></div>
          </div>

          <!-- 平台运营建议 -->
          <div v-if="requirement.researchData.platformTips && requirement.researchData.platformTips.length > 0" class="requirement-result__research-item">
            <h5 class="requirement-result__research-title">平台运营建议</h5>
            <ul class="requirement-result__research-list">
              <li
                v-for="(tip, index) in requirement.researchData.platformTips"
                :key="index"
                class="requirement-result__research-list-item"
              >
                {{ tip }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="requirement-result__actions">
      <Button variant="primary" @click="handleConfirmAndGoToPlanning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        确认结果，生成内容规划
      </Button>
      <Button variant="secondary" @click="handleNewAnalysis">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建分析
      </Button>
      <Button variant="ghost" @click="handleGoHome">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        返回首页
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RequirementAnalysis } from '../../types'
import Button from '../ui/Button.vue'
import { useRouter } from 'vue-router'
import { formatTextToHTML, cleanMarkdown } from '../../utils/textFormatter'

const props = defineProps<{
  requirement: RequirementAnalysis | null
  confidence?: number
}>()

const emit = defineEmits<{
  (e: 'new-analysis'): void
  (e: 'confirm-and-plan'): void
}>()

const router = useRouter()

const handleNewAnalysis = () => {
  emit('new-analysis')
}

const handleGoHome = () => {
  router.push('/')
}

const handleConfirmAndGoToPlanning = () => {
  emit('confirm-and-plan')
}

const getContentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    tutorial: '教程',
    review: '测评',
    recommendation: '种草',
    comparison: '对比',
    knowledge: '知识分享'
  }
  return labels[type] || type
}

const getStyleLabel = (style: string): string => {
  const labels: Record<string, string> = {
    xiaohongshu: '小红书爆款',
    poster_2k: '海报风格',
    ins_minimal: 'INS极简',
    tech_future: '科技未来',
    nature_fresh: '自然清新',
    morandi: '莫兰迪',
    black_gold: '黑金',
    minimal_white: '极简白',
    dopamine: '多巴胺',
    cyberpunk: '赛博朋克',
    retro_vintage: '复古怀旧'
  }
  return labels[style] || style
}

// 格式化调研文本
const formatResearchText = (text: string): string => {
  if (!text) return ''
  // 先清理markdown格式，然后提取并高亮关键信息
  return formatTextToHTML(text)
}
</script>

<style scoped>
.requirement-result {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  animation: fadeInUp 0.5s var(--ease-out);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.requirement-result__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 24px);
}

.requirement-result__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg, 20px);
}

.requirement-result__card {
  padding: var(--spacing-xl, 24px);
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-lg, 12px);
  transition: all var(--duration-normal, 0.3s) var(--ease-out);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
  animation: slideIn 0.4s var(--ease-out) backwards;
}

.requirement-result__card:nth-child(1) { animation-delay: 0.1s; }
.requirement-result__card:nth-child(2) { animation-delay: 0.2s; }
.requirement-result__card:nth-child(3) { animation-delay: 0.3s; }
.requirement-result__card:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.requirement-result__card:hover {
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  transform: translateY(-4px);
  border-color: var(--primary, #4a8eff);
}

/* 核心主题卡片 - 特殊样式 */
.requirement-result__card--featured {
  background: linear-gradient(135deg, var(--primary, #4a8eff) 0%, var(--primary-hover, #3a7eef) 100%);
  border: none;
  color: white;
  padding: var(--spacing-2xl, 32px);
  box-shadow: 0 8px 24px rgba(74, 142, 255, 0.3);
}

.requirement-result__card--featured:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(74, 142, 255, 0.4);
}

.requirement-result__card-header--featured {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--spacing-lg, 20px);
  margin-bottom: 0;
}

.requirement-result__icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg, 12px);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.requirement-result__icon-wrapper--small {
  width: 40px;
  height: 40px;
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
}

.requirement-result__icon-wrapper svg {
  color: white;
}

.requirement-result__icon-wrapper--small svg {
  color: var(--primary, #4a8eff);
}

.requirement-result__section-title--featured {
  color: white;
  font-size: var(--font-lg, 18px);
  margin-bottom: var(--spacing-sm, 8px);
}

.requirement-result__topic--featured {
  color: white;
  font-size: var(--font-xl, 24px);
  font-weight: var(--font-semibold, 600);
  line-height: 1.4;
  margin: 0;
}

/* 目标受众卡片 */
.requirement-result__card--audience {
  background: linear-gradient(135deg, rgba(74, 142, 255, 0.05) 0%, rgba(74, 142, 255, 0.02) 100%);
}

.requirement-result__audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-md, 16px);
}

.requirement-result__audience-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-md, 16px);
  background: var(--bg-body, #f9fafb);
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--border-color, #e5e7eb);
}

.requirement-result__audience-item--full {
  grid-column: 1 / -1;
}

.requirement-result__audience-label {
  font-size: var(--font-xs, 12px);
  color: var(--text-secondary, #6b7280);
  font-weight: var(--font-medium, 500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.requirement-result__audience-value {
  font-size: var(--font-base, 16px);
  color: var(--text-main, #1f2937);
  font-weight: var(--font-semibold, 600);
}

.requirement-result__card--content-type {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.requirement-result__content-type-wrapper {
  margin-top: var(--spacing-md, 16px);
  text-align: center;
}

.requirement-result__content-type--enhanced {
  display: inline-block;
  padding: var(--spacing-md, 16px) var(--spacing-xl, 24px);
  background: linear-gradient(135deg, var(--success, #22c55e) 0%, var(--success-hover, #16a34a) 100%);
  color: white;
  border-radius: var(--radius-lg, 12px);
  font-size: var(--font-lg, 18px);
  font-weight: var(--font-semibold, 600);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.requirement-result__card--research {
  background: linear-gradient(135deg, var(--primary-fade, rgba(74, 142, 255, 0.1)) 0%, var(--bg-card, #ffffff) 100%);
  border-color: var(--primary, #4a8eff);
  border-width: 2px;
}

.requirement-result__card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 12px);
  margin-bottom: var(--spacing-lg, 20px);
}

.requirement-result__card-header--research {
  border-bottom: 2px solid var(--primary, #4a8eff);
  padding-bottom: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-xl, 24px);
}

.requirement-result__section-title {
  margin: 0;
  font-size: var(--font-lg, 18px);
  font-weight: var(--font-semibold, 600);
  color: var(--text-main, #1f2937);
}

.requirement-result__section-title--research {
  color: var(--primary, #4a8eff);
  font-size: var(--font-xl, 20px);
}

.requirement-result__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 8px);
  align-items: center;
  margin-top: var(--spacing-sm, 8px);
}

.requirement-result__styles--cloud,
.requirement-result__keywords--cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 12px);
  margin-top: var(--spacing-md, 16px);
}

.requirement-result__tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-body);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
}

.requirement-result__tag--style {
  background: linear-gradient(135deg, var(--primary, #4a8eff) 0%, var(--primary-hover, #3a7eef) 100%);
  color: white;
  border-color: var(--primary, #4a8eff);
  font-weight: var(--font-semibold, 600);
  padding: var(--spacing-sm, 8px) var(--spacing-lg, 20px);
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.2);
  animation: tagFadeIn 0.3s var(--ease-out) backwards;
  animation-delay: calc(var(--tag-index, 0) * 0.1s);
}

.requirement-result__tag--keyword {
  background: var(--bg-body, #f9fafb);
  color: var(--text-main, #1f2937);
  border-color: var(--border-color, #e5e7eb);
  font-weight: var(--font-medium, 500);
  animation: tagFadeIn 0.3s var(--ease-out) backwards;
  animation-delay: calc(var(--tag-index, 0) * 0.1s);
}

.requirement-result__tag--interest {
  background: var(--primary-light, rgba(74, 142, 255, 0.1));
  color: var(--primary, #4a8eff);
  border-color: var(--primary, #4a8eff);
}

@keyframes tagFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.requirement-result__research-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.requirement-result__research-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.requirement-result__research-title {
  margin: 0;
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--text-main);
}

.requirement-result__research-text {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.requirement-result__research-text--formatted {
  color: var(--text-main, #1f2937);
}

.requirement-result__research-text--formatted :deep(.highlight) {
  font-weight: var(--font-semibold, 600);
  color: var(--primary, #4a8eff);
}

.requirement-result__research-text--formatted :deep(.highlight--percentage) {
  color: var(--success, #22c55e);
  font-weight: var(--font-bold, 700);
}

.requirement-result__research-text--formatted :deep(.highlight--number) {
  color: var(--primary, #4a8eff);
  font-weight: var(--font-semibold, 600);
}

.requirement-result__research-text--formatted :deep(.highlight--keyword) {
  color: var(--warning, #f59e0b);
  font-weight: var(--font-semibold, 600);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 4px;
  border-radius: var(--radius-sm, 4px);
}

.requirement-result__research-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.requirement-result__tag--trend {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: white;
  border-color: var(--primary);
}

.requirement-result__research-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  list-style: none;
}

.requirement-result__research-list-item {
  position: relative;
  padding-left: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.requirement-result__research-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.requirement-result__actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .requirement-result__actions {
    flex-direction: column;
  }
  
  .requirement-result__actions button {
    width: 100%;
  }
}
</style>


