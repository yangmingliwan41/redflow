<template>
  <div class="ui-progress">
    <div v-if="label || showPercentage" class="ui-progress__header">
      <span v-if="label" class="ui-progress__label">{{ label }}</span>
      <span v-if="showPercentage" class="ui-progress__percentage">
        {{ Math.round(percentage) }}%
      </span>
    </div>
    <div class="ui-progress__track" :class="`ui-progress__track--${size}`">
      <div
        class="ui-progress__bar"
        :class="[
          `ui-progress__bar--${status}`,
          {
            'ui-progress__bar--animated': animated,
            'ui-progress__bar--striped': striped
          }
        ]"
        :style="{ width: `${percentage}%` }"
      >
        <span v-if="showInnerLabel && label" class="ui-progress__inner-label">
          {{ label }}
        </span>
      </div>
    </div>
    <div v-if="hint" class="ui-progress__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  percentage: number
  label?: string
  hint?: string
  status?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  showInnerLabel?: boolean
  animated?: boolean
  striped?: boolean
}

withDefaults(defineProps<Props>(), {
  percentage: 0,
  status: 'default',
  size: 'md',
  showPercentage: false,
  showInnerLabel: false,
  animated: true,
  striped: false
})
</script>

<style scoped>
.ui-progress {
  width: 100%;
}

.ui-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.ui-progress__label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.ui-progress__percentage {
  font-size: var(--font-sm);
  color: var(--text-sub);
}

.ui-progress__track {
  width: 100%;
  background: var(--bg-body);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.ui-progress__track--sm {
  height: 4px;
}

.ui-progress__track--md {
  height: 8px;
}

.ui-progress__track--lg {
  height: 12px;
}

.ui-progress__bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.ui-progress__bar--default {
  background: var(--primary-gradient);
  position: relative;
  overflow: hidden;
}

.ui-progress__bar--default::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progressShine 2s infinite;
}

@keyframes progressShine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.ui-progress__bar--success {
  background: linear-gradient(90deg, var(--success), var(--success-hover));
}

.ui-progress__bar--warning {
  background: linear-gradient(90deg, var(--warning), var(--warning-hover));
}

.ui-progress__bar--error {
  background: linear-gradient(90deg, var(--error), var(--error-hover));
}

.ui-progress__bar--animated {
  animation: progress-animation 1.5s ease-in-out infinite;
}

.ui-progress__bar--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.ui-progress__bar--animated.ui-progress__bar--striped {
  animation: progress-animation 1.5s ease-in-out infinite,
    progress-striped 1s linear infinite;
}

.ui-progress__inner-label {
  font-size: var(--font-xs);
  color: var(--text-inverse);
  font-weight: var(--font-medium);
  white-space: nowrap;
  padding: 0 var(--spacing-sm);
}

.ui-progress__hint {
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-sub);
}

@keyframes progress-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

@keyframes progress-striped {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 1rem 0;
  }
}
</style>




