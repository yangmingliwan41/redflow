# 红流云创 - 功能说明文档

> 本文档用于梳理项目逻辑和功能，便于后续UI重新设计

## 一、项目概述

### 1.1 项目定位
**红流云创**是一个AI驱动的图文创作助手，专注于小红书平台的内容创作。核心价值是：
- 降低创作门槛：无需专业设计技能
- 提高创作效率：自动化传统图文创作流程
- 提升内容质量：生成符合小红书风格的爆款内容

### 1.2 技术栈
- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **UI风格**: 自定义CSS变量系统 + 算法艺术背景

### 1.3 核心功能模块
1. **创作中心** - 三种创作模式（文本生成、图生图、提示词生图）
2. **规划中心** - 需求分析、内容规划、发布日历
3. **管理中心** - 历史记录、草稿箱、模板库
4. **工作区系统** - 项目管理和组织

---

## 二、路由结构

### 2.1 路由层级

```
/ (工作区概览)
├── /workspace/:id (工作区详情)
├── /create (创建中心)
│   ├── /create/text (文本生成图文)
│   ├── /create/image (图生图文)
│   └── /create/prompt (提示词生图)
├── /plan (规划中心)
│   ├── /plan/requirement (需求分析)
│   ├── /plan/content (内容规划)
│   └── /plan/calendar (发布日历)
├── /manage (管理中心)
│   ├── /manage/history (历史记录)
│   ├── /manage/drafts (草稿箱)
│   └── /manage/templates (模板库)
└── /settings (系统设置)
```

### 2.2 路由守卫规则

**受保护的路由**（生成过程中不能访问）:
- `/`, `/workspace`, `/manage/history`, `/settings`, `/create/prompt`

**生成流程路由**（生成过程中可以访问）:
- `/text-outline`, `/text-generate`, `/text-result`, `/create`

**路由守卫逻辑**:
- 图片生成过程中（`progress.status === 'generating'`）阻止导航到受保护路由
- 大纲阶段和生成完成后允许自由导航
- 显示导航守卫提示模态框

---

## 三、核心功能模块详解

### 3.1 创作中心 (Create Center)

#### 3.1.1 文本生成图文模式 (`/create/text`)

**功能流程**:
1. **输入阶段** (`stage: 'input'`)
   - 用户输入主题（如："西安周末旅游攻略"）
   - 选择风格（13种风格可选）
   - 选择图片数量（1-12张，1张时自动启用头图模式）
   - 点击"生成大纲"按钮

2. **大纲生成阶段** (`stage: 'outline'`)
   - AI生成小红书风格图文大纲
   - 显示多页面结构（封面、内容页、总结页）
   - 每页包含：内容文本、配图建议、视觉元数据
   - 用户可编辑大纲内容
   - 点击"开始生成图片"进入生成阶段

3. **图片生成阶段** (`stage: 'generating'`)
   - 批量生成所有页面图片
   - 实时显示生成进度（当前/总数）
   - 支持重试失败的图片
   - 生成过程中阻止导航到其他页面

4. **结果展示阶段** (`stage: 'result'`)
   - 展示所有生成的图片
   - 支持单张下载或批量下载
   - 支持下载完整内容（Markdown + 所有图片）
   - 支持继续编辑和重新生成

**数据模型**:
```typescript
interface Page {
  index: number
  type: 'cover' | 'content' | 'summary'
  content: string
  imageUrl?: string
  imagePrompt?: string
  visualMetadata?: {
    primaryColor?: string
    secondaryColors?: string[]
    visualFocus?: string
    decorativeStyle?: string
    layoutPattern?: string
  }
}

interface VisualStyleGuide {
  colorPalette: { primary: string, secondary: string[] }
  typographyStyle: string
  layoutStyle: string
  decorativeElements: string
  overallAesthetic: string
}
```

**支持的风格**:
- 小红书爆款风格（默认）
- 海报风格（2K）
- INS极简
- 科技未来
- 自然清新
- 多巴胺风格
- 莫兰迪风格
- 黑金风格
- 极简白
- 赛博朋克
- 复古怀旧
- 克莱因蓝/瑞士主义
- 德国博朗风
- 爱马仕橙 & 深空灰

#### 3.1.2 图生图文模式 (`/create/image`)

**功能流程**:
1. **上传图片**
   - 支持单张或批量上传
   - 图片格式验证

2. **AI分析阶段**
   - 分析产品特征（颜色、材质、类别、卖点等）
   - 生成产品分析报告

3. **配置推荐**
   - AI自动推荐最适合的风格
   - AI推荐语气和文案风格
   - 用户可手动调整

4. **生成阶段**
   - 生成营销文案（小红书风格）
   - 生成风格化图片（13种风格可选）
   - 实时显示进度

5. **结果展示**
   - 展示生成的文案和图片
   - 支持下载和编辑

#### 3.1.3 提示词生图模式 (`/create/prompt`)

**功能流程**:
1. **输入模式选择**
   - 主题输入模式：输入主题，AI自动生成提示词
   - 直接提示词模式：直接输入提示词

2. **风格模板选择**
   - 13种风格模板可选
   - 每个模板包含详细的提示词配置

3. **批量生成**
   - 支持一次输入多个主题/提示词
   - 限制批量生成数量（成本控制）
   - 实时显示生成进度

4. **结果展示**
   - 网格展示所有生成的图片
   - 支持单张下载或批量下载

### 3.2 规划中心 (Planning Center)

#### 3.2.1 需求分析 (`/plan/requirement`)

**功能**:
- 输入需求描述
- AI自动分析需求，提取关键信息
- 生成需求分析报告
- 支持保存和管理需求分析记录

**数据模型**:
```typescript
interface RequirementAnalysis {
  id: string
  userInput: string
  analysis: {
    targetAudience: string
    contentTheme: string
    keyPoints: string[]
    suggestedStyle: string
  }
  createdAt: number
  updatedAt: number
}
```

#### 3.2.2 内容规划 (`/plan/content`)

**功能**:
- 基于需求分析生成内容规划
- 创建内容计划（主题、发布时间、风格等）
- 管理多个内容计划
- 支持编辑和删除

#### 3.2.3 发布日历 (`/plan/calendar`)

**功能**:
- 日历视图展示发布计划
- 支持拖拽调整发布时间
- 显示计划状态（待发布、已发布、已取消）
- 支持提醒功能

### 3.3 管理中心 (Management Center)

#### 3.3.1 历史记录 (`/manage/history`)

**功能**:
- 展示所有创作历史
- 支持按类型、时间筛选
- 支持查看详情
- 支持从历史记录重新编辑
- 支持删除历史记录

#### 3.3.2 草稿箱 (`/manage/drafts`)

**功能**:
- 展示所有未完成的项目（状态为'draft'）
- 支持继续编辑草稿
- 支持删除草稿

#### 3.3.3 模板库 (`/manage/templates`)

**功能**:
- 模板功能（正在开发中）
- 未来支持保存和复用创作模板

### 3.4 工作区系统 (Workspace System)

#### 3.4.1 工作区概览 (`/`)

**功能**:
- 显示最近项目网格
- 快速操作卡片（三种创建模式）
- 统计数据概览
- 新建项目按钮

#### 3.4.2 工作区侧边栏

**功能**:
- Logo和搜索框
- 快速创建按钮（下拉菜单：文本生成、图生图、提示词生图）
- 项目列表（最近、收藏、全部）
- 项目卡片（显示缩略图、标题、更新时间、状态）
- 右键菜单（重命名、删除、收藏等）
- 底部设置按钮

**工作区数据结构**:
```typescript
interface Workspace {
  id: string
  name: string
  type: 'text' | 'image' | 'prompt' | 'plan' | 'requirement' | 'calendar'
  thumbnail?: string
  updatedAt: number
  createdAt: number
  isFavorite: boolean
  status: 'draft' | 'in-progress' | 'completed' | 'archived'
  userId: string
  description?: string
  tags?: string[]
  relatedId?: string  // 关联的数据ID（如历史记录ID）
  metadata?: Record<string, any>
}
```

---

## 四、状态管理 (Pinia Stores)

### 4.1 textGenerator Store

**职责**: 管理文本生成图文的状态和流程

**状态**:
```typescript
interface TextGeneratorState {
  stage: 'input' | 'outline' | 'generating' | 'result'
  topic: string
  projectName: string
  projectDescription: string
  style?: string
  stylePrompt?: string
  headImageMode: boolean
  outline: {
    raw: string
    pages: Page[]
    visualGuide?: VisualStyleGuide
  }
  progress: {
    current: number
    total: number
    status: 'idle' | 'generating' | 'done' | 'error'
  }
  images: GeneratedImage[]
  taskId: string | null
  recordId: string | null
  showNavigationGuard: boolean
}
```

**主要Actions**:
- `generateOutline()` - 生成大纲
- `startImageGeneration()` - 开始生成图片
- `retryImageGeneration()` - 重试失败的图片
- `saveToHistory()` - 保存到历史记录
- `loadFromHistory()` - 从历史记录加载

### 4.2 workspaceStore

**职责**: 管理工作区/项目的状态

**状态**:
```typescript
interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  loading: boolean
  error: string | null
  recentWorkspaceIds: string[]
}
```

**主要Actions**:
- `loadWorkspaces()` - 加载工作区列表
- `createWorkspace()` - 创建工作区
- `updateWorkspace()` - 更新工作区
- `deleteWorkspace()` - 删除工作区
- `setCurrentWorkspace()` - 设置当前工作区
- `toggleFavorite()` - 切换收藏状态
- `addToRecent()` - 添加到最近访问

**Getters**:
- `allWorkspaces` - 所有工作区
- `recentWorkspaces` - 最近工作区
- `favoriteWorkspaces` - 收藏的工作区
- `workspacesByType()` - 按类型分组
- `workspaceGroups` - 工作区分组（最近、收藏、全部）

### 4.3 requirementStore

**职责**: 管理需求分析的状态

**主要Actions**:
- `analyzeRequirement()` - 分析需求
- `loadRequirements()` - 加载需求列表
- `getRequirement()` - 获取单个需求
- `deleteRequirement()` - 删除需求

### 4.4 planningStore

**职责**: 管理内容规划的状态

### 4.5 calendarStore

**职责**: 管理发布日历的状态

### 4.6 workflowStore

**职责**: 管理工作流的状态

---

## 五、服务层 (Services)

### 5.1 AI服务 (`src/services/ai/`)

**核心服务**:
- `outline.ts` - 大纲生成服务
- `imageGeneration.ts` - 图片生成服务
- `imageAnalysis.ts` - 图片分析服务
- `marketingCopy.ts` - 营销文案生成服务
- `requirementAnalysis.ts` - 需求分析服务
- `planningAgent.ts` - 规划代理服务
- `promptTemplate.ts` - 提示词模板服务
- `promptBatch.ts` - 批量提示词生成服务

**AI提供商**:
- DeepSeek API
- Google GenAI API
- Mock模式（开发测试用）

### 5.2 存储服务 (`src/services/storage/`)

**适配器模式**:
- `LocalStorageAdapter` - 本地存储适配器
- `StorageAdapter` - 抽象存储适配器接口
- `factory.ts` - 存储适配器工厂

**主要功能**:
- 用户数据存储
- 历史记录存储
- 工作区数据存储

### 5.3 工作流服务 (`src/services/workflows/`)

**工作流引擎**:
- `WorkflowEngine` - 工作流执行引擎
- `fullAutoWorkflow` - 全流程自动化工作流

**工作流步骤**:
- `analyzeStep` - 分析步骤
- `planStep` - 规划步骤
- `createStep` - 创建步骤
- `scheduleStep` - 调度步骤

### 5.4 日历服务 (`src/services/calendar/`)

**功能**:
- 发布日历管理
- 提醒服务

### 5.5 规划服务 (`src/services/planning/`)

**功能**:
- 内容规划服务
- 冲突检测
- 自动规划器

---

## 六、UI组件结构

### 6.1 布局组件 (`src/components/layout/`)

- `WorkspaceSidebar.vue` - 工作区侧边栏（240px）
- `FeatureNav.vue` - 功能导航栏（280px，可选）
- `PageContainer.vue` - 页面容器
- `PageHeader.vue` - 页面头部

### 6.2 通用组件 (`src/components/common/`)

- `AlgorithmicBackground.vue` - 算法艺术背景
- `AlgorithmicCard.vue` - 算法艺术卡片
- `LoadingSpinner.vue` - 加载动画
- `ErrorBoundary.vue` - 错误边界

### 6.3 UI组件 (`src/components/ui/`)

- `Button.vue` - 基础按钮
- `AlgorithmicButton.vue` - 算法艺术按钮（带特效）
- `Card.vue` - 卡片组件
- `Input.vue` - 输入框
- `Modal.vue` - 模态框
- `Toast.vue` - 消息提示
- `Progress.vue` - 进度条

### 6.4 业务组件 (`src/components/`)

- `ConfigPanel.vue` - 配置面板
- `ResultCard.vue` - 结果卡片
- `StyleExampleCard.vue` - 风格示例卡片
- `CaseCard.vue` - 案例卡片
- `CaseFilter.vue` - 案例筛选器
- `CaseDetailModal.vue` - 案例详情模态框
- `ContinueEditModal.vue` - 继续编辑模态框
- `NavigationGuardModal.vue` - 导航守卫提示模态框

---

## 七、数据流和状态流转

### 7.1 文本生成图文流程

```
用户输入主题
  ↓
[textGenerator Store] stage: 'input'
  ↓
点击"生成大纲"
  ↓
调用 AI 服务 generateOutline()
  ↓
[textGenerator Store] stage: 'outline', 保存大纲数据
  ↓
用户编辑大纲（可选）
  ↓
点击"开始生成图片"
  ↓
[textGenerator Store] stage: 'generating', progress.status: 'generating'
  ↓
批量调用图片生成服务 generateStyledImage()
  ↓
实时更新 progress.current, images[]
  ↓
所有图片生成完成
  ↓
[textGenerator Store] stage: 'result', progress.status: 'done'
  ↓
保存到历史记录 saveToHistory()
  ↓
显示结果页面
```

### 7.2 工作区创建流程

```
用户点击"新建项目"
  ↓
显示创建模态框
  ↓
输入项目名称和类型
  ↓
调用 workspaceStore.createWorkspace()
  ↓
创建工作区数据，保存到 localStorage
  ↓
添加到最近访问列表
  ↓
根据类型跳转到对应页面
  ↓
设置当前工作区 workspaceStore.setCurrentWorkspace()
```

### 7.3 历史记录加载流程

```
用户访问历史记录页面
  ↓
调用 storage.getHistory()
  ↓
从 localStorage 加载历史数据
  ↓
展示历史记录列表
  ↓
用户点击某个历史记录
  ↓
调用 textGenerator Store 的 loadFromHistory()
  ↓
恢复生成状态（大纲、图片等）
  ↓
跳转到对应页面继续编辑
```

---

## 八、关键配置和常量

### 8.1 风格配置 (`src/config/stylePrompts.ts`)

包含13种风格的详细配置：
- 风格ID
- 风格名称
- 风格描述
- 风格提示词模板
- 风格示例图片

### 8.2 算法艺术主题 (`src/config/algorithmicThemes.ts`)

路由对应的算法艺术主题配置：
- 不同路由使用不同的视觉效果
- 性能自适应（根据设备性能调整参数）
- 支持 `prefers-reduced-motion`

### 8.3 CSS变量 (`src/assets/css/variables.css`)

全局样式变量：
- 颜色系统（主色、辅助色、背景色等）
- 间距系统
- 圆角系统
- 阴影系统
- 动画时长

---

## 九、关键交互逻辑

### 9.1 导航守卫

**触发条件**: 图片生成过程中（`progress.status === 'generating'`）

**行为**:
- 阻止导航到受保护路由
- 显示导航守卫提示模态框
- 允许在生成流程路由间切换

### 9.2 状态持久化

**持久化位置**: localStorage

**持久化数据**:
- 文本生成状态 (`text-generator-state`)
- 工作区列表 (`workspaces`)
- 最近访问记录 (`recent_workspaces`)
- 用户数据
- 历史记录

### 9.3 错误处理

**错误类型**:
- API调用失败
- 图片生成失败
- 存储失败

**处理方式**:
- 显示错误提示（Toast）
- 支持重试
- 保存错误状态到历史记录

---

## 十、UI设计要点

### 10.1 布局结构

**三栏布局**:
- 左侧栏（240px固定）: 工作区侧边栏
- 中间栏（280px固定，可选）: 功能导航栏
- 右侧主内容区（自适应）: 页面内容

**响应式**:
- 移动端自动隐藏功能导航栏
- 侧边栏可折叠（未来功能）

### 10.2 视觉风格

**设计原则**:
- 简洁实用，去除过度装饰
- 专注于内容创作
- 保持算法艺术背景（但不过度使用）

**颜色系统**:
- 使用CSS变量统一管理
- 支持主题切换（未来功能）

### 10.3 交互反馈

**加载状态**:
- 按钮loading状态
- 进度条显示
- 骨架屏（未来功能）

**操作反馈**:
- Toast消息提示
- 模态框确认
- 动画过渡

---

## 十一、待完善功能

### 11.1 模板库
- 保存创作模板
- 模板复用
- 模板分享

### 11.2 协作功能
- 多人协作（未来功能）
- 评论和反馈（未来功能）

### 11.3 高级功能
- 批量处理优化
- 更多风格模板
- 自定义风格
- 导出格式扩展（PDF、PPT等）

---

## 十二、技术债务和优化点

### 12.1 性能优化
- 图片懒加载
- 虚拟滚动（长列表）
- 代码分割和懒加载

### 12.2 用户体验
- 骨架屏加载
- 更好的错误提示
- 操作引导（新手教程）

### 12.3 代码质量
- 单元测试覆盖
- E2E测试
- 类型安全加强

---

## 附录：文件结构速查

```
src/
├── assets/          # 静态资源
│   └── css/         # 样式文件
├── components/       # 组件
│   ├── common/      # 通用组件
│   ├── layout/     # 布局组件
│   └── ui/         # UI基础组件
├── composables/     # 组合式函数
├── config/          # 配置文件
├── router/          # 路由配置
├── services/        # 服务层
│   ├── ai/         # AI服务
│   ├── storage/    # 存储服务
│   ├── workflows/  # 工作流服务
│   └── ...
├── stores/          # Pinia状态管理
├── types/           # TypeScript类型定义
└── views/           # 页面视图
```

---

**文档版本**: v1.0  
**最后更新**: 2025-01-XX  
**维护者**: 红流云创团队



