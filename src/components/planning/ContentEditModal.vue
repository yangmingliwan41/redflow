<template>
  <Modal
    v-model="isVisible"
    title="编辑内容规划"
    size="lg"
    :closable="true"
    @close="handleClose"
  >
    <div class="content-edit-modal">
      <div class="edit-form">
        <!-- 标题 -->
        <div class="form-group">
          <label class="form-label">内容标题</label>
          <input
            v-model="editedContent.title"
            type="text"
            class="form-input"
            placeholder="请输入内容标题"
          />
        </div>

        <!-- 内容类型 -->
        <div class="form-group">
          <label class="form-label">内容类型</label>
          <select v-model="editedContent.contentType" class="form-select">
            <option value="tutorial">教程</option>
            <option value="review">测评</option>
            <option value="recommendation">种草</option>
            <option value="comparison">对比</option>
            <option value="knowledge">知识分享</option>
          </select>
        </div>

        <!-- 发布时间 -->
        <div class="form-group">
          <label class="form-label">发布日期</label>
          <input
            v-model="publishDate"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">发布时间</label>
          <input
            v-model="publishTime"
            type="time"
            class="form-input"
          />
        </div>

        <!-- 风格 -->
        <div class="form-group">
          <label class="form-label">风格</label>
          <select v-model="editedContent.stylePack.style_id" class="form-select">
            <option value="xiaohongshu">小红书</option>
            <option value="poster_2k">海报</option>
            <option value="ins_minimal">INS极简</option>
            <option value="tech_future">科技</option>
            <option value="nature_fresh">自然</option>
            <option value="morandi">莫兰迪</option>
            <option value="black_gold">黑金</option>
          </select>
        </div>

        <!-- 资源需求 -->
        <div class="form-group">
          <label class="form-label">图片数量</label>
          <input
            v-model.number="editedContent.resources.imageCount"
            type="number"
            min="0"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">预计时间（分钟）</label>
          <input
            v-model.number="editedContent.resources.estimatedTime"
            type="number"
            min="1"
            value="1"
            class="form-input"
          />
        </div>

        <!-- 大纲预览 -->
        <div class="form-group">
          <label class="form-label">大纲预览</label>
          <div class="outline-preview">
            <div
              v-for="(page, index) in editedContent.outline.pages"
              :key="index"
              class="outline-page-item"
            >
              <span class="page-index">#{{ index + 1 }}</span>
              <span class="page-title">{{ page.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <Button variant="secondary" @click="handleClose">取消</Button>
        <Button variant="primary" @click="handleSave">保存</Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { SingleContentPlan } from '../../types'
import Modal from '../ui/Modal.vue'
import Button from '../ui/Button.vue'

interface Props {
  visible: boolean
  content: SingleContentPlan | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [content: SingleContentPlan]
  close: []
}>()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const editedContent = ref<SingleContentPlan | null>(null)
const publishDate = ref('')
const publishTime = ref('')

// 监听content变化，初始化编辑数据
watch(() => props.content, (newContent) => {
  if (newContent) {
    // 深拷贝内容对象
    editedContent.value = JSON.parse(JSON.stringify(newContent))
    
    // 确保预计时间至少为1分钟
    if (!editedContent.value.resources.estimatedTime || editedContent.value.resources.estimatedTime < 1) {
      editedContent.value.resources.estimatedTime = 1
    }
    
    // 解析发布时间
    const scheduledTime = new Date(newContent.publishSchedule.scheduledTime)
    publishDate.value = scheduledTime.toISOString().split('T')[0]
    publishTime.value = `${String(scheduledTime.getHours()).padStart(2, '0')}:${String(scheduledTime.getMinutes()).padStart(2, '0')}`
  }
}, { immediate: true })

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

const handleSave = () => {
  if (!editedContent.value) return

  // 更新发布时间
  const dateTime = new Date(`${publishDate.value}T${publishTime.value}`)
  editedContent.value.publishSchedule.scheduledTime = dateTime.getTime()
  editedContent.value.publishSchedule.date = publishDate.value
  editedContent.value.publishSchedule.time = publishTime.value

  emit('save', editedContent.value)
  handleClose()
}
</script>

<style scoped>
.content-edit-modal {
  padding: var(--spacing-md);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-main);
}

.form-input,
.form-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  color: var(--text-main);
  background: var(--bg-body);
  transition: all var(--duration-normal) var(--ease-out);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.outline-preview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-body);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
}

.outline-page-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.page-index {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-fade);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
}

.page-title {
  flex: 1;
  font-size: var(--font-sm);
  color: var(--text-main);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}
</style>

