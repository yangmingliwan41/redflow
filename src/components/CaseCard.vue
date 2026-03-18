<template>
  <div class="case-card" @click="handleCardClick">
    <div class="case-image-wrapper">
      <img 
        :src="caseItem.imageUrl" 
        :alt="caseItem.title" 
        class="case-image"
        loading="lazy"
      />
      <div class="case-overlay">
        <div class="case-actions">
          <button 
            class="action-btn" 
            @click.stop="handleCopyConfig"
            title="复制配置"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button 
            class="action-btn" 
            @click.stop="handleViewDetail"
            title="查看详情"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button 
            class="action-btn favorite-btn" 
            :class="{ active: caseItem.isFavorite }"
            @click.stop="handleToggleFavorite"
            :title="caseItem.isFavorite ? '取消收藏' : '收藏'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="case-info">
      <div class="case-category">
        <span class="category-tag">{{ getCategoryName(caseItem.category) }}</span>
        <span class="case-style">{{ caseItem.style }}</span>
      </div>
      <h3 class="case-title">{{ caseItem.title }}</h3>
      <p class="case-description">{{ caseItem.description }}</p>
      <div class="case-meta">
        <div class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span>{{ caseItem.likes }}</span>
        </div>
        <div class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>{{ caseItem.views }}</span>
        </div>
        <div class="meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{{ formatDate(caseItem.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaseItem, CaseCategory } from '../types/case'

interface Props {
  caseItem: CaseItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'click', caseItem: CaseItem): void
  (e: 'viewDetail', caseItem: CaseItem): void
  (e: 'copyConfig', caseItem: CaseItem): void
  (e: 'toggleFavorite', caseItem: CaseItem): void
}>()

/**
 * 处理卡片点击
 */
const handleCardClick = () => {
  emit('click', props.caseItem)
}

/**
 * 处理查看详情
 */
const handleViewDetail = () => {
  emit('viewDetail', props.caseItem)
}

/**
 * 处理复制配置
 */
const handleCopyConfig = () => {
  emit('copyConfig', props.caseItem)
}

/**
 * 处理切换收藏
 */
const handleToggleFavorite = () => {
  emit('toggleFavorite', props.caseItem)
}

/**
 * 获取分类名称
 */
const getCategoryName = (category: CaseCategory): string => {
  const categoryMap: Record<CaseCategory, string> = {
    fashion: '时尚',
    beauty: '美妆',
    lifestyle: '生活方式',
    food: '美食',
    travel: '旅行',
    technology: '科技',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.case-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  position: relative;
}

.case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.case-card:hover .case-overlay {
  opacity: 1;
}

.case-image-wrapper {
  width: 100%;
  padding-top: 133.33%; /* 3:4 比例 */
  position: relative;
  overflow: hidden;
}

.case-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.case-card:hover .case-image {
  transform: scale(1.05);
}

.case-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.case-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #ff4d4f;
  background: rgba(255, 77, 79, 0.1);
}

.favorite-btn.active:hover {
  background: rgba(255, 77, 79, 0.2);
}

.case-info {
  padding: 16px;
}

.case-category {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.category-tag {
  background: var(--primary-fade);
  color: var(--primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.case-style {
  font-size: 12px;
  color: var(--text-sub);
  background: var(--bg-body);
  padding: 2px 6px;
  border-radius: 3px;
}

.case-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-main);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.case-description {
  font-size: 13px;
  color: var(--text-sub);
  line-height: 1.5;
  margin: 0 0 12px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.case-meta {
  display: flex;
  gap: 16px;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-sub);
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-card {
    max-width: 100%;
  }
  
  .case-info {
    padding: 12px;
  }
  
  .case-title {
    font-size: 14px;
  }
  
  .case-description {
    font-size: 12px;
  }
  
  .case-meta {
    gap: 12px;
  }
  
  .meta-item {
    font-size: 11px;
  }
}
</style>