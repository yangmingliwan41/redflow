<template>
  <PageContainer size="xl">
    <PageHeader
      title="系统设置"
      subtitle="配置API密钥和服务设置"
    >
      <template #actions>
        <Button variant="secondary" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </Button>
      </template>
    </PageHeader>

    <!-- 模拟模式开关 -->
    <div class="mock-mode-section">
      <div class="mock-mode-card">
        <div class="mock-mode-header">
          <div>
            <h3>🧪 测试模式（模拟API）</h3>
            <p class="mock-mode-desc">开启后使用模拟数据，不消耗真实API费用。用于功能测试和调试。</p>
          </div>
          <label class="mock-mode-toggle">
            <input
              type="checkbox"
              :checked="mockMode"
              @change="handleMockModeChange"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div v-if="mockMode" class="mock-mode-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span>当前处于模拟模式，所有AI调用将返回模拟数据，不会产生费用。</span>
        </div>
      </div>
    </div>

    <div class="settings-grid">
      <!-- DeepSeek配置卡片 -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: #1a1a1a;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <h3>DeepSeek API</h3>
              <p class="card-subtitle">文本生成服务</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- API Key 卡片式输入 -->
          <div class="api-key-card" :class="{ 'editing': editingDeepseek, 'saved': savedDeepseek }">
            <div class="api-key-card-header">
              <div class="api-key-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>API Key</span>
                <span v-if="savedDeepseek" class="saved-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  已保存
                </span>
                <span v-else-if="editingDeepseek" class="editing-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  编辑中
                </span>
              </div>
              <div class="api-key-actions">
                <button
                  v-if="!editingDeepseek"
                  type="button"
                  class="action-btn edit-btn"
                  @click="startEdit('deepseek')"
                  title="编辑"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  v-if="editingDeepseek"
                  type="button"
                  class="action-btn save-btn"
                  @click="saveApiKeyCard('deepseek')"
                  :disabled="savingDeepseek"
                  title="保存"
                >
                  <svg v-if="!savingDeepseek" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else class="spinner-small"></span>
                </button>
                <button
                  v-if="editingDeepseek"
                  type="button"
                  class="action-btn cancel-btn"
                  @click="cancelEdit('deepseek')"
                  title="取消"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button
                  type="button"
                  class="action-btn visibility-btn"
                  @click="toggleVisibility('deepseek')"
                  :title="showDeepseekKey ? '隐藏' : '显示'"
                >
                  <svg v-if="showDeepseekKey" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="api-key-card-body">
              <div v-if="!editingDeepseek && deepseekApiKey" class="api-key-display">
                <code class="api-key-masked">{{ showDeepseekKey ? deepseekApiKey : maskApiKey(deepseekApiKey) }}</code>
                <p class="api-key-hint">点击编辑按钮修改</p>
              </div>
              <div v-else class="api-key-input-wrapper">
                <input
                  :type="showDeepseekKey ? 'text' : 'password'"
                  v-model="deepseekApiKey"
                  @focus="editingDeepseek = true"
                  placeholder="sk-..."
                  class="api-key-input"
                  :class="{ 'has-value': deepseekApiKey }"
                />
                <p class="api-key-hint">输入您的 DeepSeek API Key</p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>API Endpoint（可选）</label>
            <input
              v-model="deepseekEndpoint"
              type="text"
              placeholder="https://api.deepseek.com/chat/completions"
              @blur="saveApiKey('DEEPSEEK_API_ENDPOINT', deepseekEndpoint)"
              class="api-input"
            />
          </div>
          <div class="form-group">
            <label>Model（可选）</label>
            <input
              v-model="deepseekModel"
              type="text"
              placeholder="deepseek-chat"
              @blur="saveApiKey('DEEPSEEK_MODEL', deepseekModel)"
              class="api-input"
            />
          </div>
        </div>
      </div>

      <!-- 智谱AI配置卡片 -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: #1677FF;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h3>智谱AI API</h3>
              <p class="card-subtitle">文本生成服务（支持联网搜索）</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- API Key 卡片式输入 -->
          <div class="api-key-card" :class="{ 'editing': editingZhipu, 'saved': savedZhipu }">
            <div class="api-key-card-header">
              <div class="api-key-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>API Key</span>
                <span v-if="savedZhipu" class="saved-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  已保存
                </span>
                <span v-else-if="editingZhipu" class="editing-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  编辑中
                </span>
              </div>
              <div class="api-key-actions">
                <button
                  v-if="!editingZhipu"
                  type="button"
                  class="action-btn edit-btn"
                  @click="startEdit('zhipu')"
                  title="编辑"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  v-if="editingZhipu"
                  type="button"
                  class="action-btn save-btn"
                  @click="saveApiKeyCard('zhipu')"
                  :disabled="savingZhipu"
                  title="保存"
                >
                  <svg v-if="!savingZhipu" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else class="spinner-small"></span>
                </button>
                <button
                  v-if="editingZhipu"
                  type="button"
                  class="action-btn cancel-btn"
                  @click="cancelEdit('zhipu')"
                  title="取消"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button
                  type="button"
                  class="action-btn visibility-btn"
                  @click="toggleVisibility('zhipu')"
                  :title="showZhipuKey ? '隐藏' : '显示'"
                >
                  <svg v-if="showZhipuKey" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="api-key-card-body">
              <div v-if="!editingZhipu && zhipuApiKey" class="api-key-display">
                <code class="api-key-masked">{{ showZhipuKey ? zhipuApiKey : maskApiKey(zhipuApiKey) }}</code>
                <p class="api-key-hint">点击编辑按钮修改</p>
              </div>
              <div v-else class="api-key-input-wrapper">
                <input
                  :type="showZhipuKey ? 'text' : 'password'"
                  v-model="zhipuApiKey"
                  @focus="editingZhipu = true"
                  placeholder="输入API Key"
                  class="api-key-input"
                  :class="{ 'has-value': zhipuApiKey }"
                />
                <p class="api-key-hint">
                  推荐使用：
                  <a href="https://open.bigmodel.cn/" target="_blank">智谱AI开放平台</a>
                </p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>API Endpoint（可选）</label>
            <input
              v-model="zhipuEndpoint"
              type="text"
              placeholder="https://open.bigmodel.cn/api/paas/v4/chat/completions"
              @blur="saveApiKey('ZHIPU_API_ENDPOINT', zhipuEndpoint)"
              class="api-input"
            />
          </div>
          <div class="form-group">
            <label>Model（可选）</label>
            <input
              v-model="zhipuModel"
              type="text"
              placeholder="glm-4.7"
              @blur="saveApiKey('ZHIPU_MODEL', zhipuModel)"
              class="api-input"
            />
            <p class="form-hint">支持的模型：glm-4.7（支持联网搜索）</p>
          </div>
        </div>
      </div>

      <!-- Google GenAI配置卡片 -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: #4285F4;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            </div>
            <div>
              <h3>Google GenAI API</h3>
              <p class="card-subtitle">图片生成服务（OpenAI兼容模式）</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <!-- API Key 卡片式输入 -->
          <div class="api-key-card" :class="{ 'editing': editingGoogle, 'saved': savedGoogle }">
            <div class="api-key-card-header">
              <div class="api-key-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>API Key</span>
                <span v-if="savedGoogle" class="saved-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  已保存
                </span>
                <span v-else-if="editingGoogle" class="editing-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  编辑中
                </span>
              </div>
              <div class="api-key-actions">
                <button
                  v-if="!editingGoogle"
                  type="button"
                  class="action-btn edit-btn"
                  @click="startEdit('google')"
                  title="编辑"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button
                  v-if="editingGoogle"
                  type="button"
                  class="action-btn save-btn"
                  @click="saveApiKeyCard('google')"
                  :disabled="savingGoogle"
                  title="保存"
                >
                  <svg v-if="!savingGoogle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else class="spinner-small"></span>
                </button>
                <button
                  v-if="editingGoogle"
                  type="button"
                  class="action-btn cancel-btn"
                  @click="cancelEdit('google')"
                  title="取消"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button
                  type="button"
                  class="action-btn visibility-btn"
                  @click="toggleVisibility('google')"
                  :title="showGoogleKey ? '隐藏' : '显示'"
                >
                  <svg v-if="showGoogleKey" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
              </div>
            </div>
            <div class="api-key-card-body">
              <div v-if="!editingGoogle && googleApiKey" class="api-key-display">
                <code class="api-key-masked">{{ showGoogleKey ? googleApiKey : maskApiKey(googleApiKey) }}</code>
                <p class="api-key-hint">点击编辑按钮修改</p>
              </div>
              <div v-else class="api-key-input-wrapper">
                <input
                  :type="showGoogleKey ? 'text' : 'password'"
                  v-model="googleApiKey"
                  @focus="editingGoogle = true"
                  placeholder="输入API Key"
                  class="api-key-input"
                  :class="{ 'has-value': googleApiKey }"
                />
                <p class="api-key-hint">
                  推荐使用：
                  <a href="https://api.laozhang.ai/register/?aff_code=b57h" target="_blank">laozhang.ai</a>
                </p>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>API Endpoint</label>
            <input
              v-model="googleEndpoint"
              type="text"
              placeholder="https://api.laozhang.ai/v1/chat/completions"
              @blur="saveApiKey('GOOGLE_API_ENDPOINT', googleEndpoint)"
              class="api-input"
            />
            <p class="form-hint">OpenAI兼容模式的API端点</p>
          </div>
          <div class="form-group">
            <label>Model</label>
            <input
              v-model="googleModel"
              type="text"
              placeholder="gemini-3-pro-image-preview"
              @blur="saveApiKey('GOOGLE_MODEL', googleModel)"
              class="api-input"
            />
            <p class="form-hint">支持的模型：gemini-3-pro-image-preview, gemini-2.5-flash 等</p>
          </div>
        </div>
      </div>

      <!-- 风格提示词管理卡片 -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: #10B981;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <h3>风格提示词管理</h3>
              <p class="card-subtitle">自定义每个风格的详细提示词模板</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>选择风格</label>
            <select v-model="selectedStyleForEdit" class="api-input" style="margin-bottom: 16px;">
              <option v-for="style in availableStyles" :key="style.id" :value="style.id">
                {{ style.name }} - {{ style.description }}
              </option>
            </select>
          </div>
          
          <div class="form-group" v-if="selectedStyleForEdit && currentStyleConfig">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <label style="margin: 0;">自定义提示词</label>
              <label class="debug-toggle" style="cursor: pointer;">
                <input
                  type="checkbox"
                  :checked="showDefaultPrompt"
                  @change="showDefaultPrompt = ($event.target as HTMLInputElement).checked"
                  style="cursor: pointer;"
                />
                <span style="user-select: none;">显示默认提示词</span>
              </label>
            </div>
            
            <!-- 调试信息 -->
            <div v-if="false" style="padding: 8px; background: #f0f0f0; margin-bottom: 8px; font-size: 12px;">
              <p>showDefaultPrompt: {{ showDefaultPrompt }}</p>
              <p>selectedStyleForEdit: {{ selectedStyleForEdit }}</p>
              <p>currentStyleConfig: {{ currentStyleConfig ? '存在' : '不存在' }}</p>
              <p v-if="currentStyleConfig">hasDefaultPrompt: {{ !!currentStyleConfig.defaultPrompt }}</p>
            </div>
            
            <div v-if="showDefaultPrompt" class="default-prompt-section">
              <div class="default-prompt-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>默认提示词（参考）</span>
              </div>
              <div class="default-prompt-content">
                <pre v-if="currentStyleConfig?.defaultPrompt">{{ currentStyleConfig.defaultPrompt }}</pre>
                <p v-else style="color: var(--warning); margin: 0;">无法加载默认提示词，请检查风格配置</p>
              </div>
            </div>
            
            <textarea
              v-model="editingStylePrompt"
              placeholder="留空则使用默认提示词"
              class="prompt-textarea"
              rows="15"
            ></textarea>
            <p class="form-hint">
              自定义提示词将覆盖默认提示词。留空则恢复使用默认提示词。
            </p>
            <div style="margin-top: 12px;">
              <button class="btn btn-secondary" @click="resetStylePrompt" style="margin-right: 8px;">
                恢复默认
              </button>
              <button class="btn btn-primary" @click="saveStylePrompt">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 图片生成Prompt配置卡片 -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon" style="background: #8B5CF6;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3>图片生成 Prompt 模板</h3>
              <p class="card-subtitle">自定义文生图模式的图片生成提示词</p>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <label style="margin: 0;">自定义 Prompt 模板（可选）</label>
              <label class="debug-toggle">
                <input
                  type="checkbox"
                  :checked="showPromptDebug"
                  @change="handleDebugToggle"
                />
                <span>调试模式（显示原始Prompt）</span>
              </label>
            </div>
            <textarea
              v-model="customImagePrompt"
              placeholder="留空则使用内置的默认 Prompt 模板"
              class="prompt-textarea"
              rows="12"
              @blur="saveCustomPrompt"
            ></textarea>
            <p class="form-hint">
              可用变量：
              <code>{"{{page_content}}"}</code> - 页面内容
              <code>{"{{page_type}}"}</code> - 页面类型（cover/content）
              <code>{"{{page_index}}"}</code> - 页码（从1开始）
              <code>{"{{total_pages}}"}</code> - 总页数
              <code>{"{{topic}}"}</code> - 主题
              <code>{"{{full_outline}}"}</code> - 完整大纲（已废弃，为避免内容污染已移除，请使用 visualGuide 保证风格一致性）
            </p>
            <div v-if="showPromptDebug" class="debug-prompt-section">
              <div class="debug-prompt-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>调试信息：原始 Prompt 模板</span>
              </div>
              <div class="debug-prompt-content">
                <pre>{{ getDefaultPromptTemplate() }}</pre>
              </div>
            </div>
            <div style="margin-top: 12px;">
              <button class="btn btn-secondary" @click="resetPrompt" style="margin-right: 8px;">
                恢复默认
              </button>
              <button class="btn btn-primary" @click="saveCustomPrompt">
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <h3>使用说明</h3>
      <ul>
        <li>文本生成使用 <strong>DeepSeek</strong> 或 <strong>智谱AI</strong> API，需要配置相应的 API Key</li>
        <li>图片生成使用 <strong>Google GenAI</strong> API（OpenAI兼容模式），支持自定义端点</li>
        <li>智谱AI GLM-4.7 支持联网搜索功能，可作为 DeepSeek 的备选方案</li>
        <li>所有配置保存在浏览器本地存储中，不会上传到服务器</li>
        <li>API Key 配置后立即生效，无需重启</li>
        <li>点击眼睛图标可以显示/隐藏 API Key，保护隐私</li>
      </ul>
      <div style="margin-top: 16px;">
        <button class="btn btn-secondary" @click="clearLocalStorage">
          清理本地存储（API 密钥 & 历史记录）
        </button>
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PageContainer, PageHeader } from '../components/layout'
import { Button } from '../components/ui'
import { getAllStyleConfigs, getStyleConfig, saveCustomPrompt as saveStylePromptConfig, resetCustomPrompt } from '../config/stylePrompts'

const router = useRouter()

const goBack = () => {
  router.push('/')
}

const deepseekApiKey = ref('')
const deepseekEndpoint = ref('')
const deepseekModel = ref('')
const googleApiKey = ref('')
const googleEndpoint = ref('')
const googleModel = ref('')
const zhipuApiKey = ref('')
const zhipuEndpoint = ref('')
const zhipuModel = ref('')

const showDeepseekKey = ref(false)
const showGoogleKey = ref(false)
const showZhipuKey = ref(false)
const mockMode = ref(false)
const customImagePrompt = ref('')
const showPromptDebug = ref(false)

// 风格提示词管理
const availableStyles = ref(getAllStyleConfigs())
const selectedStyleForEdit = ref(availableStyles.value[0]?.id || '')
const editingStylePrompt = ref('')
const showDefaultPrompt = ref(false)

// API Key 卡片编辑状态
const editingDeepseek = ref(false)
const editingGoogle = ref(false)
const editingZhipu = ref(false)
const savingDeepseek = ref(false)
const savingGoogle = ref(false)
const savingZhipu = ref(false)
const savedDeepseek = ref(false)
const savedGoogle = ref(false)
const savedZhipu = ref(false)
const originalDeepseekKey = ref('')
const originalGoogleKey = ref('')
const originalZhipuKey = ref('')

// 打码显示的API Key
const displayDeepseekKey = computed(() => {
  if (!deepseekApiKey.value) return ''
  if (showDeepseekKey.value) return deepseekApiKey.value
  return maskApiKey(deepseekApiKey.value)
})

const displayGoogleKey = computed(() => {
  if (!googleApiKey.value) return ''
  if (showGoogleKey.value) return googleApiKey.value
  return maskApiKey(googleApiKey.value)
})

// 当前选中风格的配置
const currentStyleConfig = computed(() => {
  if (!selectedStyleForEdit.value) return null
  const config = getStyleConfig(selectedStyleForEdit.value)
  return config || null
})

// 打码函数：显示前4位和后4位，中间用*替代
const maskApiKey = (key: string): string => {
  if (key.length <= 8) return '•'.repeat(key.length)
  const start = key.substring(0, 4)
  const end = key.substring(key.length - 4)
  const middle = '•'.repeat(Math.max(0, key.length - 8))
  return `${start}${middle}${end}`
}

const toggleVisibility = (type: 'deepseek' | 'google' | 'zhipu') => {
  if (type === 'deepseek') {
    showDeepseekKey.value = !showDeepseekKey.value
  } else if (type === 'google') {
    showGoogleKey.value = !showGoogleKey.value
  } else {
    showZhipuKey.value = !showZhipuKey.value
  }
}

// 开始编辑API Key
const startEdit = (type: 'deepseek' | 'google' | 'zhipu') => {
  if (type === 'deepseek') {
    editingDeepseek.value = true
    savedDeepseek.value = false
    originalDeepseekKey.value = deepseekApiKey.value
  } else if (type === 'google') {
    editingGoogle.value = true
    savedGoogle.value = false
    originalGoogleKey.value = googleApiKey.value
  } else {
    editingZhipu.value = true
    savedZhipu.value = false
    originalZhipuKey.value = zhipuApiKey.value
  }
}

// 取消编辑
const cancelEdit = (type: 'deepseek' | 'google' | 'zhipu') => {
  if (type === 'deepseek') {
    deepseekApiKey.value = originalDeepseekKey.value
    editingDeepseek.value = false
    savedDeepseek.value = false
  } else if (type === 'google') {
    googleApiKey.value = originalGoogleKey.value
    editingGoogle.value = false
    savedGoogle.value = false
  } else {
    zhipuApiKey.value = originalZhipuKey.value
    editingZhipu.value = false
    savedZhipu.value = false
  }
}

// 保存API Key（卡片式）
const saveApiKeyCard = async (type: 'deepseek' | 'google' | 'zhipu') => {
  if (type === 'deepseek') {
    savingDeepseek.value = true
    try {
      saveApiKey('DEEPSEEK_API_KEY', deepseekApiKey.value)
      editingDeepseek.value = false
      savedDeepseek.value = true
      originalDeepseekKey.value = deepseekApiKey.value
      // 3秒后隐藏保存提示
      setTimeout(() => {
        savedDeepseek.value = false
      }, 3000)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      savingDeepseek.value = false
    }
  } else if (type === 'google') {
    savingGoogle.value = true
    try {
      saveApiKey('GOOGLE_API_KEY', googleApiKey.value)
      editingGoogle.value = false
      savedGoogle.value = true
      originalGoogleKey.value = googleApiKey.value
      // 3秒后隐藏保存提示
      setTimeout(() => {
        savedGoogle.value = false
      }, 3000)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      savingGoogle.value = false
    }
  } else {
    savingZhipu.value = true
    try {
      saveApiKey('ZHIPU_API_KEY', zhipuApiKey.value)
      editingZhipu.value = false
      savedZhipu.value = true
      originalZhipuKey.value = zhipuApiKey.value
      // 3秒后隐藏保存提示
      setTimeout(() => {
        savedZhipu.value = false
      }, 3000)
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      savingZhipu.value = false
    }
  }
}

// handleApiKeyInput 函数已移除，直接使用 v-model 绑定

const loadApiKeys = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    deepseekApiKey.value = localStorage.getItem('DEEPSEEK_API_KEY') || ''
    deepseekEndpoint.value = localStorage.getItem('DEEPSEEK_API_ENDPOINT') || ''
    deepseekModel.value = localStorage.getItem('DEEPSEEK_MODEL') || ''
    googleApiKey.value = localStorage.getItem('GOOGLE_API_KEY') || ''
    googleEndpoint.value = localStorage.getItem('GOOGLE_API_ENDPOINT') || 'https://api.laozhang.ai/v1/chat/completions'
    googleModel.value = localStorage.getItem('GOOGLE_MODEL') || 'gemini-3-pro-image-preview'
    zhipuApiKey.value = localStorage.getItem('ZHIPU_API_KEY') || ''
    zhipuEndpoint.value = localStorage.getItem('ZHIPU_API_ENDPOINT') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    zhipuModel.value = localStorage.getItem('ZHIPU_MODEL') || 'glm-4.7'
    // 初始化原始值
    originalDeepseekKey.value = deepseekApiKey.value
    originalGoogleKey.value = googleApiKey.value
    originalZhipuKey.value = zhipuApiKey.value
    
    // 加载模拟模式设置
    const savedMockMode = localStorage.getItem('MOCK_MODE')
    mockMode.value = savedMockMode === 'true'
    // 加载自定义prompt
    customImagePrompt.value = localStorage.getItem('CUSTOM_IMAGE_PROMPT') || ''
    // 加载调试模式设置
    const savedDebugMode = localStorage.getItem('PROMPT_DEBUG_MODE')
    showPromptDebug.value = savedDebugMode === 'true'
  }
}

const handleDebugToggle = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  showPromptDebug.value = checked
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('PROMPT_DEBUG_MODE', checked ? 'true' : 'false')
  }
}

const getDefaultPromptTemplate = () => {
  return `请生成一张小红书风格的图文内容图片。
【合规特别注意的】注意不要带有任何小红书的logo，不要有右下角的用户id以及logo
【合规特别注意的】用户给到的参考图片里如果有水印和logo（尤其是注意右下角，左上角），请一定要去掉

页面内容：
{{page_content}}

页面类型：{{page_type}}

如果当前页面类型不是封面页的话，你要参考最后一张图片作为封面的样式

后续生成风格要严格参考封面的风格，要保持风格统一。

设计要求：

1. 整体风格
- 小红书爆款图文风格
- 清新、精致、有设计感
- 适合年轻人审美
- 配色和谐，视觉吸引力强

2. 文字排版
- 文字清晰可读，字号适中
- 重要信息突出显示
- 排版美观，留白合理
- 支持 emoji 和符号
- 如果是封面，标题要大而醒目

3. 视觉元素
- 背景简洁但不单调
- 可以有装饰性元素（如图标、插画）
- 配色温暖或清新
- 保持专业感

4. 页面类型特殊要求

[封面] 类型：
- 标题占据主要位置，字号最大
- 副标题居中或在标题下方
- 整体设计要有吸引力和冲击力
- 背景可以更丰富，有视觉焦点

[内容] 类型：
- 信息层次分明
- 列表项清晰展示
- 重点内容用颜色或粗体强调
- 可以有小图标辅助说明

5. 技术规格
- 竖版 3:4 比例（小红书标准）
- 高清画质
- 适合手机屏幕查看
- 所有文字内容必须完整呈现
- 【特别注意】无论是给到的图片还是参考文字，请仔细思考，让其符合正确的竖屏观看的排版，不能左右旋转或者是倒置。

6. 整体风格一致性
为确保所有页面风格统一，系统会自动注入【全局视觉指南】，包含：
- 整体色调和配色方案（主色调、辅助色调）
- 设计风格（字体风格、布局风格、装饰元素）
- 视觉元素的一致性
- 排版布局的统一风格

用户原始需求：
{{topic}}

注意：{{full_outline}} 变量已废弃（为避免大纲内容污染图片生成），风格一致性由系统自动通过【全局视觉指南】保证。

请根据以上要求，生成一张精美的小红书风格图片。请直接给出图片，不要有任何手机边框，或者是白色留边。`
}

const handleMockModeChange = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  mockMode.value = checked
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('MOCK_MODE', checked ? 'true' : 'false')
  }
  // 提示用户
  if (checked) {
    console.log('🧪 模拟模式已开启，所有AI调用将使用模拟数据')
  } else {
    console.log('✅ 模拟模式已关闭，将使用真实API')
  }
}

// 清理 API Key，移除可能的特殊字符和非 ASCII 字符
// 注意：只移除明显的无效字符，不要过度清理
const cleanApiKey = (key: string): string => {
  if (!key) return ''
  let cleaned = key.trim()

  // 如果用户把整行 "Bearer sk-xxx" 粘进来，先去掉 Bearer 前缀
  const lower = cleaned.toLowerCase()
  if (lower.startsWith('bearer ')) {
    cleaned = cleaned.slice(7).trim()
  }

  // 检查是否包含非 ASCII 字符
  const hasNonAscii = /[^\x00-\x7F]/.test(cleaned)
  
  if (hasNonAscii) {
    // 只移除非 ASCII 字符，保留所有 ASCII 可打印字符（32-126）
    const beforeLength = cleaned.length
    cleaned = cleaned
      .split('')
      .filter(char => {
        const code = char.charCodeAt(0)
        // 保留 ASCII 可打印字符（32-126）
        return code >= 32 && code <= 126
      })
      .join('')
      .trim()
    
    // 如果清理后长度变化超过5%，记录警告
    if (cleaned.length < beforeLength * 0.95) {
      console.warn('API Key 清理后长度变化:', {
        before: beforeLength,
        after: cleaned.length,
        beforePrefix: key.substring(0, 20),
        afterPrefix: cleaned.substring(0, 20)
      })
    }
  }

  return cleaned
}

const saveCustomPrompt = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (customImagePrompt.value.trim()) {
      localStorage.setItem('CUSTOM_IMAGE_PROMPT', customImagePrompt.value.trim())
      alert('Prompt 模板已保存')
    } else {
      localStorage.removeItem('CUSTOM_IMAGE_PROMPT')
      alert('已清除自定义 Prompt，将使用默认模板')
    }
  }
}

const resetPrompt = () => {
  customImagePrompt.value = ''
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('CUSTOM_IMAGE_PROMPT')
    alert('已恢复默认 Prompt 模板')
  }
}

const saveApiKey = (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (value) {
      // 清理 API Key 后再保存
      const cleaned = cleanApiKey(value)
      
      // 验证清理后的 Key 是否有效（长度应该合理）
      if (cleaned.length < 10) {
        console.warn('API Key 清理后长度过短，可能有问题:', {
          key,
          originalLength: value.length,
          cleanedLength: cleaned.length,
          originalPrefix: value.substring(0, 20),
          cleanedPrefix: cleaned.substring(0, 20)
        })
      }
      
      localStorage.setItem(key, cleaned)
      
      // 如果是 API Key，同步更新显示的值
      if (key === 'DEEPSEEK_API_KEY') {
        deepseekApiKey.value = cleaned
      } else if (key === 'GOOGLE_API_KEY') {
        googleApiKey.value = cleaned
      } else if (key === 'ZHIPU_API_KEY') {
        zhipuApiKey.value = cleaned
      }
      
      console.log('API Key 已保存:', {
        key,
        length: cleaned.length,
        prefix: cleaned.substring(0, 15) + '...'
      })
    } else {
      localStorage.removeItem(key)
    }
  }
}

// 清理本地存储（API 密钥、历史记录、用户信息等）
const clearLocalStorage = () => {
  // 触发清除缓存事件，让 HomeView 显示引导
  window.dispatchEvent(new CustomEvent('redflow:clearCache'))
  if (typeof window === 'undefined' || !window.localStorage) return

  const confirmed = window.confirm(
    '确定要清理本地存储吗？这将删除：\n\n' +
    '- API 密钥（DEEPSEEK / GOOGLE）\n' +
    '- 模拟模式 / 调试配置\n' +
    '- 文本生成图文的中间状态\n' +
    '- 用户与历史记录数据\n\n' +
    '清理后需要重新配置 API 密钥，且历史记录将无法恢复。'
  )
  if (!confirmed) return

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((k) => {
      if (
        k.startsWith('DEEPSEEK_') ||
        k.startsWith('GOOGLE_') ||
        k.startsWith('ZHIPU_') ||
        k === 'MOCK_MODE' ||
        k === 'CUSTOM_IMAGE_PROMPT' ||
        k === 'PROMPT_DEBUG_MODE' ||
        k === 'text-generator-state' ||
        k.startsWith('redflow_') ||
        k === 'current_user'
      ) {
        localStorage.removeItem(k)
      }
    })
    // 清除引导标记，让新用户引导重新显示
    localStorage.removeItem('redflow_guide_seen')
    
    // 触发清除缓存事件，让 HomeView 显示引导
    window.dispatchEvent(new CustomEvent('redflow:clearCache'))
    
    alert('本地存储已清理完毕。\n\n建议刷新页面后重新开始使用，并在此处重新配置 API Key。')
  } catch (e) {
    console.error('清理本地存储失败:', e)
    alert('清理本地存储时发生错误，请查看控制台日志。')
  }
}

// 加载风格提示词
const loadStylePrompt = () => {
  if (selectedStyleForEdit.value) {
    const config = getStyleConfig(selectedStyleForEdit.value)
    if (config) {
      editingStylePrompt.value = config.customPrompt || ''
    }
    // 切换风格时重置显示默认提示词的状态
    showDefaultPrompt.value = false
  }
}

// 保存风格提示词
const saveStylePrompt = () => {
  if (!selectedStyleForEdit.value) return
  
  if (editingStylePrompt.value.trim()) {
    saveStylePromptConfig(selectedStyleForEdit.value, editingStylePrompt.value)
    alert('风格提示词已保存')
  } else {
    resetStylePrompt()
    alert('已恢复默认提示词')
  }
  
  // 重新加载配置
  availableStyles.value = getAllStyleConfigs()
}

// 恢复默认提示词
const resetStylePrompt = () => {
  if (!selectedStyleForEdit.value) return
  resetCustomPrompt(selectedStyleForEdit.value)
  editingStylePrompt.value = ''
  availableStyles.value = getAllStyleConfigs()
  alert('已恢复默认提示词')
}

onMounted(() => {
  loadApiKeys()
  loadStylePrompt()
  
  // 监听风格选择变化
  watch(selectedStyleForEdit, () => {
    loadStylePrompt()
  })
})
</script>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.config-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
  box-shadow: var(--shadow-sm);
  position: relative;
}

.config-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(74, 142, 255, 0.02), rgba(37, 99, 235, 0.02));
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
  pointer-events: none;
}

.config-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-4px);
  border-color: var(--border-hover);
  background: var(--bg-card-hover);
}

.config-card:hover::before {
  opacity: 1;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-body);
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-title-group h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-main);
}

.card-subtitle {
  font-size: 13px;
  color: var(--text-sub);
  margin: 0;
}

.card-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-main);
}

.toggle-visibility {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--text-sub);
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.toggle-visibility:hover {
  color: var(--primary);
}

.input-wrapper {
  position: relative;
}

.api-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  transition: border-color 0.2s;
  background: var(--bg-body);
}

.api-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.api-input::placeholder {
  color: var(--text-placeholder);
  font-family: inherit;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 6px;
  line-height: 1.5;
}

.form-hint a {
  color: var(--primary);
  text-decoration: none;
}

.form-hint a:hover {
  text-decoration: underline;
}

.prompt-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
  transition: all 0.2s;
}

.prompt-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
}

.prompt-textarea::placeholder {
  color: var(--text-placeholder);
}

.debug-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-sub);
  cursor: pointer;
  user-select: none;
}

.debug-toggle input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.debug-prompt-section {
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.debug-prompt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
}

.debug-prompt-content {
  max-height: 400px;
  overflow-y: auto;
  background: var(--bg-card);
  padding: 12px;
  border-radius: var(--radius-sm);
}

.debug-prompt-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-sub);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.default-prompt-section {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-body);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.default-prompt-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 10px;
}

.default-prompt-content {
  max-height: 300px;
  overflow-y: auto;
  background: var(--bg-card);
  padding: 12px;
  border-radius: var(--radius-sm);
}

.default-prompt-content pre {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-sub);
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.form-hint code {
  background: var(--bg-body);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  color: var(--primary);
}

.info-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid var(--border-color);
}

.info-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--text-main);
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 8px 0;
  color: var(--text-sub);
  line-height: 1.6;
  position: relative;
  padding-left: 20px;
}

.info-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.info-section li strong {
  color: var(--primary);
}

.mock-mode-section {
  margin-bottom: 32px;
}

.mock-mode-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.mock-mode-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.mock-mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mock-mode-header h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-main);
}

.mock-mode-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.mock-mode-toggle {
  position: relative;
  display: inline-block;
  width: 56px;
  height: 32px;
  flex-shrink: 0;
}

.mock-mode-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.mock-mode-toggle .toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.3);
  transition: 0.3s;
  border-radius: 32px;
}

.mock-mode-toggle .toggle-slider:before {
  position: absolute;
  content: "";
  height: 24px;
  width: 24px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mock-mode-toggle input:checked + .toggle-slider {
  background-color: rgba(255, 255, 255, 0.5);
}

.mock-mode-toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.mock-mode-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.mock-mode-notice svg {
  flex-shrink: 0;
}

/* API Key 卡片式输入样式 */
.api-key-card {
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.api-key-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--border-color);
  transition: background 0.3s ease;
}

.api-key-card.editing {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-fade);
  background: var(--primary-light);
}

.api-key-card.editing::before {
  background: var(--primary);
}

.api-key-card.saved {
  border-color: var(--success);
  box-shadow: 0 0 0 3px var(--success-fade);
}

.api-key-card.saved::before {
  background: var(--success);
}

.api-key-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.api-key-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
}

.api-key-title svg {
  color: var(--primary);
}

.saved-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--success-light);
  color: var(--success);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  animation: fadeIn 0.3s ease;
}

.editing-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--warning-light);
  color: var(--warning);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.api-key-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-sub);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  padding: 0;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.action-btn:hover:not(:disabled) {
  background: var(--bg-card-hover);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 126, 126, 0.2);
}

.action-btn:hover:not(:disabled)::before {
  opacity: 0.05;
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn:hover:not(:disabled) {
  background: var(--info-light);
  border-color: var(--info);
  color: var(--info);
}

.save-btn {
  background: var(--success-gradient);
  color: var(--text-inverse);
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--success-hover) 0%, var(--success) 100%);
  transform: translateY(-2px) scale(1.05);
  box-shadow: var(--shadow-hover);
}

.cancel-btn:hover:not(:disabled) {
  background: var(--error-light);
  border-color: var(--error);
  color: var(--error);
}

.visibility-btn:hover:not(:disabled) {
  background: var(--bg-body);
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.api-key-card-body {
  min-height: 60px;
}

.api-key-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-key-masked {
  display: block;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-family-mono);
  font-size: var(--font-sm);
  color: var(--text-main);
  word-break: break-all;
  user-select: all;
  cursor: text;
  transition: all var(--duration-normal) var(--ease-out);
}

.api-key-masked:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.api-key-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.api-key-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-family: var(--font-family-mono);
  transition: all var(--duration-normal) var(--ease-out);
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--text-main);
}

.api-key-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
  background: var(--bg-card-hover);
  transform: translateY(-1px);
}

.api-key-input.has-value {
  border-color: var(--primary);
}

.api-key-input::placeholder {
  color: var(--text-placeholder);
  font-family: inherit;
}

.api-key-hint {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
  line-height: 1.5;
}

.api-key-hint a {
  color: var(--primary);
  text-decoration: none;
}

.api-key-hint a:hover {
  text-decoration: underline;
}
</style>
