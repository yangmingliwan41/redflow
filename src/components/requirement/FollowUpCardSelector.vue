<template>
  <div class="follow-up-card-selector">
    <!-- 目标受众选择器 -->
    <div v-if="questionType === 'targetAudience'" class="follow-up-selector">
      <!-- 年龄选择（多选） -->
      <div class="follow-up-group">
        <label class="follow-up-group-label">年龄范围（可多选）</label>
        <div class="follow-up-options">
          <button
            v-for="age in ageOptions"
            :key="age.value"
            class="follow-up-option follow-up-option--tag"
            :class="{ 'selected': selectedAges.includes(age.value) }"
            @click="handleAgeToggle(age.value)"
          >
            {{ age.label }}
          </button>
        </div>
      </div>

      <!-- 性别选择 -->
      <div class="follow-up-group">
        <label class="follow-up-group-label">性别</label>
        <div class="follow-up-options">
          <button
            v-for="gender in genderOptions"
            :key="gender.value"
            class="follow-up-option"
            :class="{ 'selected': selectedAudience?.gender === gender.value }"
            @click="handleGenderSelect(gender.value)"
          >
            {{ gender.label }}
          </button>
        </div>
      </div>

      <!-- 目标客群和产品涉及领域 -->
      <div class="follow-up-group">
        <label class="follow-up-group-label">目标客群和产品的涉及领域（可多选）</label>
        <div class="follow-up-options">
          <button
            v-for="interest in interestOptions"
            :key="interest"
            class="follow-up-option follow-up-option--tag"
            :class="{ 'selected': selectedInterests.includes(interest) }"
            @click="handleInterestToggle(interest)"
          >
            {{ interest }}
          </button>
          <!-- 自定义标签 -->
          <button
            v-for="interest in customInterests"
            :key="`custom-${interest}`"
            class="follow-up-option follow-up-option--tag follow-up-option--custom"
            :class="{ 'selected': selectedInterests.includes(interest) }"
            @click="handleInterestToggle(interest)"
          >
            {{ interest }}
            <span class="remove-custom" @click.stop="removeCustomInterest(interest)">×</span>
          </button>
        </div>
        
        <!-- 自定义输入区域 -->
        <div class="custom-interest-section">
          <input
            v-model="customInterest"
            type="text"
            class="custom-interest-input"
            placeholder="输入自定义领域标签..."
            @keyup.enter="addCustomInterest"
            @blur="addCustomInterest"
            maxlength="20"
          />
          <button
            class="add-custom-btn"
            @click="addCustomInterest"
            :disabled="!customInterest.trim()"
          >
            添加
          </button>
        </div>
      </div>
    </div>

    <!-- 发布频率选择器 -->
    <div v-else-if="questionType === 'publishFrequency'" class="follow-up-selector">
      <div class="follow-up-options follow-up-options--grid">
        <button
          v-for="frequency in frequencyOptions"
          :key="frequency.value"
          class="follow-up-option follow-up-option--card"
          :class="{ 'selected': selectedValue === frequency.value }"
          @click="handleFrequencySelect(frequency.value)"
        >
          <div class="follow-up-option-icon">{{ frequency.icon }}</div>
          <div class="follow-up-option-label">{{ frequency.label }}</div>
          <div class="follow-up-option-desc">{{ frequency.desc }}</div>
        </button>
      </div>
    </div>

    <!-- 内容类型选择器 -->
    <div v-else-if="questionType === 'contentType'" class="follow-up-selector">
      <div class="follow-up-options follow-up-options--grid">
        <button
          v-for="type in contentTypeOptions"
          :key="type.value"
          class="follow-up-option follow-up-option--card"
          :class="{ 'selected': selectedValue === type.value }"
          @click="handleContentTypeSelect(type.value)"
        >
          <div class="follow-up-option-icon">{{ type.icon }}</div>
          <div class="follow-up-option-label">{{ type.label }}</div>
          <div class="follow-up-option-desc">{{ type.desc }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  questionType: 'targetAudience' | 'publishFrequency' | 'contentType'
  modelValue?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// 年龄选项
const ageOptions = [
  { value: '18-25', label: '18-25岁' },
  { value: '26-35', label: '26-35岁' },
  { value: '36-45', label: '36-45岁' },
  { value: '46-55', label: '46-55岁' },
  { value: '18-35', label: '18-35岁' },
  { value: '不限', label: '不限' }
]

// 性别选项
const genderOptions = [
  { value: '女性', label: '女性' },
  { value: '男性', label: '男性' },
  { value: '不限', label: '不限' }
]

// 兴趣选项
const interestOptions = [
  '美妆护肤', '时尚穿搭', '美食探店', '旅行攻略', '健身运动',
  '数码科技', '家居生活', '读书学习', '宠物萌宠', '摄影艺术',
  '音乐电影', '游戏娱乐', '母婴育儿', '职场技能', '理财投资'
]

// 发布频率选项
const frequencyOptions = [
  { value: 'daily', label: '每天1篇', desc: '高频发布，保持活跃', icon: '📅' },
  { value: '2-3perWeek', label: '每周2-3篇', desc: '稳定更新，平衡质量', icon: '📆' },
  { value: 'weekly', label: '每周1篇', desc: '精耕细作，注重质量', icon: '📝' },
  { value: 'biweekly', label: '每两周1篇', desc: '深度内容，长期价值', icon: '📚' },
  { value: 'flexible', label: '灵活发布', desc: '根据情况调整', icon: '🔄' }
]

// 内容类型选项
const contentTypeOptions = [
  { value: 'tutorial', label: '教程', desc: '教学类内容，步骤清晰', icon: '📖' },
  { value: 'review', label: '测评', desc: '产品体验，真实评价', icon: '⭐' },
  { value: 'recommendation', label: '种草', desc: '好物推荐，分享体验', icon: '💝' },
  { value: 'comparison', label: '对比', desc: '多产品对比分析', icon: '⚖️' },
  { value: 'knowledge', label: '知识分享', desc: '专业知识，价值输出', icon: '💡' }
]

// 目标受众相关状态
const selectedAudience = ref<{ age?: string | string[]; gender?: string } | null>(null)
const selectedAges = ref<string[]>([])
const selectedInterests = ref<string[]>([])

// 自定义兴趣标签
const customInterest = ref('')
const customInterests = ref<string[]>([])

// 其他问题的选中值
const selectedValue = ref<string | null>(null)

// 初始化值
watch(() => props.modelValue, (newVal) => {
  if (props.questionType === 'targetAudience') {
    if (typeof newVal === 'object' && newVal) {
      selectedAudience.value = {
        age: newVal.age,
        gender: newVal.gender
      }
      // 处理年龄（可能是字符串或数组）
      if (Array.isArray(newVal.age)) {
        selectedAges.value = newVal.age
      } else if (typeof newVal.age === 'string') {
        selectedAges.value = [newVal.age]
      } else {
        selectedAges.value = []
      }
      const interests = newVal.interests || []
      selectedInterests.value = interests
      // 区分预设和自定义标签
      customInterests.value = interests.filter(interest => !interestOptions.includes(interest))
    } else if (typeof newVal === 'string') {
      // 尝试解析字符串格式
      const ageMatch = newVal.match(/(\d+)[-~](\d+)/)
      const genderMatch = newVal.match(/(男|女|不限)/)
      const age = ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : undefined
      selectedAudience.value = {
        age: age,
        gender: genderMatch ? genderMatch[1] : undefined
      }
      selectedAges.value = age ? [age] : []
    }
  } else {
    selectedValue.value = newVal || null
  }
}, { immediate: true })

// 处理年龄切换（多选）
const handleAgeToggle = (age: string) => {
  const index = selectedAges.value.indexOf(age)
  if (index > -1) {
    selectedAges.value.splice(index, 1)
  } else {
    selectedAges.value.push(age)
  }
  emitValue()
}

// 处理性别选择
const handleGenderSelect = (gender: string) => {
  if (!selectedAudience.value) {
    selectedAudience.value = {}
  }
  selectedAudience.value.gender = gender
  emitValue()
}

// 处理兴趣切换
const handleInterestToggle = (interest: string) => {
  const index = selectedInterests.value.indexOf(interest)
  if (index > -1) {
    selectedInterests.value.splice(index, 1)
  } else {
    selectedInterests.value.push(interest)
  }
  emitValue()
}

// 添加自定义兴趣标签
const addCustomInterest = (): void => {
  const trimmed = customInterest.value.trim()
  if (trimmed && trimmed.length > 0 && trimmed.length <= 20) {
    // 检查是否已存在（预设或自定义）
    if (!interestOptions.includes(trimmed) && !customInterests.value.includes(trimmed)) {
      customInterests.value.push(trimmed)
      // 自动选中新添加的标签
      if (!selectedInterests.value.includes(trimmed)) {
        selectedInterests.value.push(trimmed)
      }
      emitValue()
    }
    customInterest.value = ''
  }
}

// 移除自定义兴趣标签
const removeCustomInterest = (interest: string): void => {
  const index = customInterests.value.indexOf(interest)
  if (index > -1) {
    customInterests.value.splice(index, 1)
    // 如果该标签被选中，从选中列表中移除
    const selectedIndex = selectedInterests.value.indexOf(interest)
    if (selectedIndex > -1) {
      selectedInterests.value.splice(selectedIndex, 1)
      emitValue()
    }
  }
}

// 处理发布频率选择
const handleFrequencySelect = (value: string) => {
  selectedValue.value = value
  emit('update:modelValue', value)
}

// 处理内容类型选择
const handleContentTypeSelect = (value: string) => {
  selectedValue.value = value
  emit('update:modelValue', value)
}

// 发出更新值
const emitValue = () => {
  if (props.questionType === 'targetAudience') {
    const result = {
      age: selectedAges.value.length > 0 ? (selectedAges.value.length === 1 ? selectedAges.value[0] : selectedAges.value) : '18-35',
      gender: selectedAudience.value?.gender || '不限',
      interests: selectedInterests.value
    }
    emit('update:modelValue', result)
  }
}
</script>

<style scoped>
.follow-up-card-selector {
  width: 100%;
}

.follow-up-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.follow-up-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.follow-up-group-label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
  margin-bottom: var(--spacing-xs);
}

.follow-up-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.follow-up-options--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.follow-up-option {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-main);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  text-align: center;
}

.follow-up-option:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.follow-up-option.selected {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(74, 142, 255, 0.3);
}

.follow-up-option--tag {
  border-radius: var(--radius-full);
}

.follow-up-option--card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  min-height: 120px;
  justify-content: center;
}

.follow-up-option-icon {
  font-size: 32px;
  margin-bottom: var(--spacing-xs);
}

.follow-up-option-label {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
}

.follow-up-option-desc {
  font-size: var(--font-xs);
  color: var(--text-secondary);
  text-align: center;
  line-height: var(--line-height-relaxed);
}

.follow-up-option--card.selected {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: white;
}

.follow-up-option--card.selected .follow-up-option-desc {
  color: rgba(255, 255, 255, 0.9);
}

.follow-up-option--custom {
  padding-right: var(--spacing-lg, 24px);
  position: relative;
}

.remove-custom {
  position: absolute;
  right: var(--spacing-xs, 4px);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background var(--duration-fast, 0.2s);
}

.follow-up-option.selected .remove-custom {
  background: rgba(255, 255, 255, 0.2);
}

.remove-custom:hover {
  background: rgba(0, 0, 0, 0.2);
}

.follow-up-option.selected .remove-custom:hover {
  background: rgba(255, 255, 255, 0.3);
}

.custom-interest-section {
  display: flex;
  gap: var(--spacing-sm, 8px);
  margin-top: var(--spacing-md, 16px);
  padding-top: var(--spacing-md, 16px);
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.custom-interest-input {
  flex: 1;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 2px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-sm, 14px);
  transition: border-color var(--duration-normal, 0.3s);
}

.custom-interest-input:focus {
  outline: none;
  border-color: var(--primary, #4a8eff);
}

.add-custom-btn {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 2px solid var(--primary, #4a8eff);
  border-radius: var(--radius-md, 8px);
  background: var(--primary, #4a8eff);
  color: white;
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-medium, 500);
  cursor: pointer;
  transition: all var(--duration-normal, 0.3s);
  white-space: nowrap;
}

.add-custom-btn:hover:not(:disabled) {
  background: var(--primary-hover, #3a7eef);
  border-color: var(--primary-hover, #3a7eef);
}

.add-custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .follow-up-options--grid {
    grid-template-columns: 1fr;
  }
  
  .follow-up-option--card {
    min-height: 100px;
  }
  
  .custom-interest-section {
    flex-direction: column;
  }
  
  .add-custom-btn {
    width: 100%;
  }
}
</style>

