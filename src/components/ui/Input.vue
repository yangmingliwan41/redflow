<template>
  <div class="ui-input-wrapper">
    <label v-if="label" :for="inputId" :class="['ui-input__label', { 'ui-input__label--required': required }]">
      {{ label }}
    </label>
    <div class="ui-input__container">
      <div v-if="$slots.prefix" class="ui-input__prefix">
        <slot name="prefix" />
      </div>
      <input
        :id="inputId"
        :class="[
          'ui-input',
          {
            'ui-input--error': error,
            'ui-input--disabled': disabled,
            'ui-input--with-prefix': $slots.prefix,
            'ui-input--with-suffix': $slots.suffix
          }
        ]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div v-if="$slots.suffix" class="ui-input__suffix">
        <slot name="suffix" />
      </div>
    </div>
    <div v-if="error || hint" class="ui-input__hint">
      <span v-if="error" class="ui-input__error">{{ error }}</span>
      <span v-else-if="hint" class="ui-input__hint-text">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { generateId } from '@/utils/string'

interface Props {
  modelValue: string | number
  type?: string
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => `input-${generateId()}`)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style scoped>
.ui-input-wrapper {
  width: 100%;
}

.ui-input__label {
  display: block;
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
  margin-bottom: var(--spacing-sm);
}

.ui-input__label--required::after {
  content: ' *';
  color: var(--error);
}

.ui-input__container {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  font-size: var(--font-sm);
  color: var(--text-main);
  background: var(--bg-card);
  transition: all var(--duration-normal) var(--ease-out);
  font-family: inherit;
  position: relative;
}

.ui-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: var(--shadow-focus);
}

.ui-input:disabled {
  background: var(--bg-body);
  color: var(--text-placeholder);
  cursor: not-allowed;
}

.ui-input:readonly {
  background: var(--bg-body);
  cursor: default;
}

.ui-input::placeholder {
  color: var(--text-placeholder);
}

.ui-input--error {
  border-color: var(--error);
}

.ui-input--error:focus {
  box-shadow: 0 0 0 3px var(--error-fade);
}

.ui-input--with-prefix {
  padding-left: 40px;
}

.ui-input--with-suffix {
  padding-right: 40px;
}

.ui-input__prefix,
.ui-input__suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  pointer-events: none;
  z-index: 1;
}

.ui-input__prefix {
  left: 12px;
}

.ui-input__suffix {
  right: 12px;
}

.ui-input__hint {
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  min-height: 16px;
}

.ui-input__error {
  color: var(--error);
}

.ui-input__hint-text {
  color: var(--text-sub);
}
</style>




