<template>
  <div class="case-filter">
    <div class="filter-header">
      <h3>案例分类浏览</h3>
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索案例标题或描述..." 
          class="search-input"
          @input="handleSearch"
        />
      </div>
    </div>
    <div class="filter-content">
      <div class="filter-section">
        <label>分类筛选</label>
        <div class="category-buttons">
          <button 
            class="category-btn" 
            :class="{ active: selectedCategory === undefined }"
            @click="handleCategoryChange(undefined)"
          >
            全部
          </button>
          <button 
            v-for="category in categories" 
            :key="category"
            class="category-btn" 
            :class="{ active: selectedCategory === category }"
            @click="handleCategoryChange(category)"
          >
            {{ getCategoryName(category) }}
          </button>
        </div>
      </div>
      <div class="filter-section">
        <label>排序方式</label>
        <div class="sort-buttons">
          <button 
            v-for="sortBy in sortOptions" 
            :key="sortBy.value"
            class="sort-btn" 
            :class="{ active: selectedSortBy === sortBy.value }"
            @click="handleSortChange(sortBy.value)"
          >
            {{ sortBy.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { CaseCategory, CaseSortBy } from '../types/case'

interface Props {
  /** 可用的分类列表 */
  categories: CaseCategory[]
  /** 默认的排序方式 */
  defaultSortBy?: CaseSortBy
}

const props = withDefaults(defineProps<Props>(), {
  defaultSortBy: 'latest'
})

const emit = defineEmits<{
  (e: 'filterChange', category?: CaseCategory, sortBy: CaseSortBy, search?: string): void
}>()

// 分类映射关系
const categoryMap: Record<CaseCategory, string> = {
  fashion: '时尚',
  beauty: '美妆',
  lifestyle: '生活方式',
  food: '美食',
  travel: '旅行',
  technology: '科技',
  other: '其他'
}

// 排序选项
const sortOptions = [
  { value: 'latest' as CaseSortBy, label: '最新' },
  { value: 'popular' as CaseSortBy, label: '最热' },
  { value: 'recommended' as CaseSortBy, label: '推荐' }
]

// 选中的分类
const selectedCategory = ref<CaseCategory | undefined>(undefined)
// 选中的排序方式
const selectedSortBy = ref<CaseSortBy>(props.defaultSortBy)
// 搜索关键词
const searchQuery = ref('')

/**
 * 获取分类名称
 */
const getCategoryName = (category: CaseCategory): string => {
  return categoryMap[category] || '其他'
}

/**
 * 处理分类变化
 */
const handleCategoryChange = (category: CaseCategory | undefined) => {
  selectedCategory.value = category
  emitFilterChange()
}

/**
 * 处理排序变化
 */
const handleSortChange = (sortBy: CaseSortBy) => {
  selectedSortBy.value = sortBy
  emitFilterChange()
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  emitFilterChange()
}

/**
 * 触发筛选变化事件
 */
const emitFilterChange = () => {
  emit('filterChange', selectedCategory.value, selectedSortBy.value, searchQuery.value || undefined)
}
</script>

<style scoped>
.case-filter {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;
  max-width: 100%;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: var(--text-sub);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.filter-content {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 200px;
}

.filter-section label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.category-buttons,
.sort-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-btn,
.sort-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-btn:hover,
.sort-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-fade);
}

.category-btn.active,
.sort-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-filter {
    padding: 16px;
  }
  
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-box {
    width: 100%;
  }
  
  .filter-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .category-buttons,
  .sort-buttons {
    gap: 6px;
  }
  
  .category-btn,
  .sort-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>