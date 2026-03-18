<template>
  <div 
    class="style-example-card" 
    :class="{ 'selected': selected }"
    @click="handleClick"
  >
    <div class="style-image-wrapper">
      <img 
        :src="imageUrl" 
        :alt="name" 
        class="style-image"
        loading="lazy"
      />
      <div v-if="selected" class="selected-badge">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>
    <div class="style-info">
      <h4 class="style-name">{{ name }}</h4>
      <div class="style-prompt">
        <p>{{ prompt }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  name: string;
  imageUrl: string;
  prompt: string;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
});

const emit = defineEmits<{
  (e: 'click', id: string): void;
}>();

const handleClick = () => {
  emit('click', props.id);
};
</script>

<style scoped>
.style-example-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  cursor: pointer;
  width: 100%;
  position: relative;
}

.style-example-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
}

.style-example-card.selected {
  border-color: var(--primary);
  box-shadow: var(--shadow-hover), 0 0 0 3px var(--primary-fade);
  background: var(--primary-light);
}

.style-example-card.selected:hover {
  border-color: var(--primary-hover);
  box-shadow: var(--shadow-hover), 0 0 0 3px var(--primary-fade);
}

.style-image-wrapper {
  width: 100%;
  padding-top: 133.33%; /* 3:4 比例 */
  position: relative;
  overflow: hidden;
  background: var(--bg-body);
}

.style-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-normal) var(--ease-out);
}

.style-example-card:hover .style-image {
  transform: scale(1.05);
}

.selected-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.4);
  animation: scaleIn var(--duration-fast) var(--ease-spring);
}

.selected-badge svg {
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.style-info {
  padding: var(--spacing-md);
  background: var(--bg-card);
}

.style-name {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-main);
  font-family: var(--font-family-display);
}

.style-example-card.selected .style-name {
  color: var(--primary);
}

.style-prompt {
  font-size: var(--font-sm);
  color: var(--text-sub);
  line-height: var(--line-height-relaxed);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .style-example-card {
    max-width: 100%;
  }
  
  .style-info {
    padding: 12px;
  }
  
  .style-name {
    font-size: 14px;
  }
  
  .style-prompt {
    font-size: 13px;
  }
}
</style>