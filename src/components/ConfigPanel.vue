<template>
  <div class="config-panel">
    <div class="config-header">
      <h2>配置参数</h2>
    </div>

    <!-- AI Auto Config Button - 暂时隐藏 -->
    <button
      v-if="false"
      @click="onAutoConfigure"
      :disabled="disabled"
      class="ai-config-btn"
      title="根据第一张图片自动推荐配置"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <span>AI 智能一键配置 (自动规划)</span>
    </button>

    <div class="config-content">
      <!-- 单栏布局（移除API配置后） -->
      <div class="config-content-single">
        <!-- 补充说明 -->
        <div class="form-group">
          <label>补充说明</label>
          <textarea 
            :value="settings.additionalContext || ''"
            @input="handleChange('additionalContext', ($event.target as HTMLTextAreaElement).value)"
            :disabled="disabled"
            placeholder="例如：强调双十一优惠，适合送礼，或者指定背景元素..."
            class="context-textarea"
          />
        </div>

        <!-- 文案语气 -->
        <div class="form-group">
          <label>文案语气</label>
          <div class="tone-list">
            <button
              v-for="opt in TONE_OPTIONS"
              :key="opt.value"
              @click="handleChange('tone', opt.value)"
              :disabled="disabled"
              :class="['tone-btn', { active: settings.tone === opt.value }]"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- 文案风格 -->
        <div class="form-group">
          <label>文案风格</label>
          <div class="copy-style-list">
            <button
              v-for="opt in COPY_STYLE_OPTIONS"
              :key="opt.value"
              @click="handleChange('copyStyle', opt.value)"
              :disabled="disabled"
              :class="['copy-style-btn', { active: settings.copyStyle === opt.value }]"
            >
              <span class="copy-style-label">{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <!-- 篇幅长度 -->
        <div class="form-group">
          <label>篇幅长度</label>
          <select
            :value="settings.length"
            @change="handleChange('length', ($event.target as HTMLSelectElement).value)"
            :disabled="disabled"
            class="length-select"
          >
            <option v-for="opt in LENGTH_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 图片生成配置 -->
        <div 
          :class="['image-style-section', {
            'brightness-bright': settings.imageStyle !== 'none' && settings.brightness > 0,
            'brightness-dark': settings.imageStyle !== 'none' && settings.brightness < 0,
            'brightness-normal': settings.imageStyle === 'none' || settings.brightness === 0
          }]"
          :style="settings.imageStyle !== 'none' && settings.brightness !== 0 ? {
            '--brightness-intensity': Math.abs(settings.brightness) / 5,
            '--brightness-level': settings.brightness
          } : {}"
        >
          <label>图片生成配置</label>
          
          <select
            :value="settings.imageStyle"
            @change="handleChange('imageStyle', ($event.target as HTMLSelectElement).value)"
            :disabled="disabled"
            class="image-style-select"
          >
            <option v-for="opt in IMAGE_STYLE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          
          <div v-if="settings.imageStyle !== 'none'" class="brightness-control">
            <div class="brightness-header">
              <label>画面亮度</label>
              <span :class="['brightness-value', {
                'bright': settings.brightness > 0,
                'dark': settings.brightness < 0,
                'normal': settings.brightness === 0
              }]">
                {{ settings.brightness > 0 ? '+' : '' }}{{ settings.brightness }}
                {{ settings.brightness === 0 ? ' (自然)' : settings.brightness > 0 ? ' (明亮)' : ' (暗调)' }}
              </span>
            </div>
            <input 
              type="range" 
              min="-5" 
              max="5" 
              step="1"
              :value="settings.brightness"
              @input="handleChange('brightness', parseInt(($event.target as HTMLInputElement).value))"
              @mousedown.stop
              @touchstart.stop
              :disabled="disabled"
              class="brightness-slider"
            />
            <div class="brightness-labels">
              <span>暗调 (-5)</span>
              <span>自然 (0)</span>
              <span>明亮 (+5)</span>
            </div>
          </div>

          <p class="image-style-hint">
            * AI 会根据选定风格和亮度自动重绘产品场景，尽量保持产品主体特征。
          </p>
        </div>
      </div>

      <!-- Debug/Prompt Tuning Section - 全宽 -->
      <div class="debug-section">
        <button 
          @click="isDebugOpen = !isDebugOpen"
          class="debug-toggle"
        >
          <svg 
            :class="['debug-icon', { rotated: isDebugOpen }]"
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path d="M9 18l6-6-6-6"></path>
          </svg>
          🔧 提示词微调
        </button>
        
        <div v-if="isDebugOpen" class="debug-content">
          <div class="debug-toggle-row">
            <label>启用自定义提示词</label>
            <label class="toggle-switch">
              <input 
                type="checkbox" 
                :checked="settings.customPrompts?.enable"
                @change="handleCustomPromptChange('enable', ($event.target as HTMLInputElement).checked)"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <template v-if="settings.customPrompts?.enable">
            <div class="debug-textarea-group">
              <label>文案生成模板</label>
              <textarea 
                :value="settings.customPrompts.marketingCopyTemplate"
                @input="handleCustomPromptChange('marketingCopyTemplate', ($event.target as HTMLTextAreaElement).value)"
                class="debug-textarea"
              />
              <p class="debug-hint">
                可用变量: name, category, features, colors, materials, platformStyle, tone, copyStyle, length, additionalContext
              </p>
            </div>
            
            <div class="debug-textarea-group">
              <label>图片生成模板</label>
              <textarea 
                :value="settings.customPrompts.imageGenerationTemplate"
                @input="handleCustomPromptChange('imageGenerationTemplate', ($event.target as HTMLTextAreaElement).value)"
                class="debug-textarea"
              />
              <p class="debug-hint">
                可用变量: stylePrompt, name, colors, materials, features, additionalContext
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="config-footer">
      <button
        @click="onSubmit"
        :disabled="disabled"
        :class="['submit-btn', { disabled }]"
      >
        {{ disabled ? '处理中...' : (mode === 'BATCH' ? '批量生成对应图文' : '生成对应图文') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GenerationSettings, TONE_OPTIONS, LENGTH_OPTIONS, IMAGE_STYLE_OPTIONS, COPY_STYLE_OPTIONS, ApiProvider } from '../types'

interface Props {
  settings: GenerationSettings
  disabled: boolean
  mode: 'SINGLE' | 'BATCH'
  onAutoConfigure?: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:settings': [settings: GenerationSettings]
  'submit': []
}>()

const isDebugOpen = ref(false)

const handleChange = (key: keyof GenerationSettings, value: any) => {
  emit('update:settings', { ...props.settings, [key]: value })
}

const handleCustomPromptChange = (key: keyof GenerationSettings['customPrompts'], value: any) => {
  emit('update:settings', {
    ...props.settings,
    customPrompts: {
      ...props.settings.customPrompts,
      [key]: value
    }
  })
}

const onSubmit = () => {
  emit('submit')
}

const onAutoConfigure = () => {
  if (props.onAutoConfigure) {
    props.onAutoConfigure()
  }
}
</script>

<style scoped>
.config-panel {
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
}

.config-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.config-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}


.ai-config-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(to right, #9333ea, #4f46e5);
  color: white;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.ai-config-btn:hover:not(:disabled) {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.ai-config-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.ai-config-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.config-content-single {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.api-provider-section {
  background: #eff6ff;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid #bfdbfe;
}

.api-provider-section > label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.api-provider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.api-label {
  display: block;
  font-size: 12px;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.api-select {
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: white;
  outline: none;
  transition: all 0.2s;
}

.api-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.api-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.api-hint {
  font-size: 10px;
  color: var(--text-sub);
  margin-top: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.context-textarea {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  resize: none;
  height: 80px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.context-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.context-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tone-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tone-btn {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
}

.tone-btn:hover:not(:disabled) {
  background: var(--bg-body);
}

.tone-btn.active {
  background: #eff6ff;
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}

.tone-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copy-style-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.copy-style-btn {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-sub);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.copy-style-label {
  flex: 1;
  text-align: center;
}

.copy-style-btn:hover:not(:disabled) {
  background: var(--bg-body);
}

.copy-style-btn.active {
  background: #eff6ff;
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
}

.copy-style-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


.length-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  outline: none;
  transition: all 0.2s;
  text-align: center;
}

.length-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.length-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-style-section {
  background: var(--bg-body);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 1;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.image-style-section.brightness-bright {
  background: linear-gradient(
    135deg,
    rgba(220, 230, 245, calc(0.6 + var(--brightness-intensity, 0) * 0.4)),
    rgba(235, 240, 250, calc(0.7 + var(--brightness-intensity, 0) * 0.3))
  );
  border-color: rgba(180, 200, 220, calc(0.35 + var(--brightness-intensity, 0) * 0.45));
}

.image-style-section.brightness-dark {
  background: rgba(0, 0, 0, calc(var(--brightness-intensity, 0) * 0.12));
  border-color: rgba(0, 0, 0, calc(0.1 + var(--brightness-intensity, 0) * 0.15));
}

.image-style-section.brightness-normal {
  background: var(--bg-body);
  border-color: var(--border-color);
}

.image-style-section > label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.image-style-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  outline: none;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.image-style-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.image-style-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.brightness-control {
  margin-top: 8px;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

.brightness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.brightness-header label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
}

.brightness-value {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.brightness-value.bright {
  background: #fef3c7;
  color: #92400e;
}

.brightness-value.dark {
  background: #e5e7eb;
  color: #374151;
}

.brightness-value.normal {
  background: #f3f4f6;
  color: #6b7280;
}

.brightness-slider {
  width: 100%;
  height: 8px;
  background: var(--bg-body);
  border-radius: 4px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  pointer-events: auto;
  margin: 8px 0;
  position: relative;
  z-index: 10;
  touch-action: pan-x;
  -webkit-tap-highlight-color: transparent;
}

.brightness-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  background: var(--bg-body);
  border-radius: 4px;
  cursor: pointer;
  -webkit-appearance: none;
}

.brightness-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 50%;
  cursor: grab;
  margin-top: -6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  position: relative;
  z-index: 11;
}

.brightness-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}

.brightness-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.4);
}

.brightness-slider::-moz-range-track {
  width: 100%;
  height: 8px;
  background: var(--bg-body);
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.brightness-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 50%;
  cursor: grab;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  position: relative;
  z-index: 11;
}

.brightness-slider::-moz-range-thumb:active {
  cursor: grabbing;
  transform: scale(1.2);
}

.brightness-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.4);
}

.brightness-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.brightness-slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.brightness-slider:disabled::-moz-range-thumb {
  cursor: not-allowed;
}

.brightness-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.image-style-hint {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 12px;
  display: flex;
  align-items: start;
}

.image-style-hint::before {
  content: '*';
  margin-right: 4px;
}

.debug-section {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
  margin-top: 16px;
}

.debug-toggle {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-sub);
  font-weight: 500;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  gap: 4px;
}

.debug-toggle:hover {
  color: var(--text-main);
}

.debug-icon {
  transition: transform 0.2s;
}

.debug-icon.rotated {
  transform: rotate(90deg);
}

.debug-content {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.debug-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.debug-toggle-row label:first-child {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #22c55e;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.debug-textarea-group {
  margin-bottom: 16px;
}

.debug-textarea-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 4px;
}

.debug-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: white;
  font-size: 12px;
  font-family: monospace;
  height: 96px;
  resize: vertical;
  outline: none;
}

.debug-textarea:focus {
  border-color: var(--primary);
}

.debug-hint {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.config-footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.submit-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--primary-gradient);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--duration-slow) var(--ease-out);
}

.submit-btn:hover:not(.disabled) {
  background: var(--primary-gradient-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.submit-btn:hover:not(.disabled)::before {
  left: 100%;
}

.submit-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

.submit-btn.disabled {
  background: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>

