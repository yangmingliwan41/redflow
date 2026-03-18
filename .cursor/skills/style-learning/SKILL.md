---
name: style-learning
description: Learns a new image style from reference images and integrates it into RedFlow (红流云创) as a selectable style. Use when the user asks to add/adjust an image style, create a new style preset, tune style prompts, or frequently iterates style libraries (风格学习/风格库/图片风格/文生图风格/图生图风格).
---

# 风格学习（Style Learning）→ 一键接入红流云创

将“参考图风格”沉淀为可复用的**风格模板**，并把它作为新风格接入红流云创（UI 可选、AI 可推荐、生成可控）。

## 快速开始（你要做什么）

当用户说“根据这些图新增/调整风格”“要经常加风格”“做一个风格学习功能”时，按以下流程执行并交付：

1. **收集输入**（风格名、参考图、适用场景、是否要允许少量品牌色/强调色）
2. **从参考图抽取风格 DNA**（配色、排版/构图、材质/光线、装饰元素、禁忌项）
3. **生成两类提示词资产**
   - 风格正向提示词：写入 `src/config/stylePrompts.ts`
   - 风格负面提示词：补充到 `src/services/ai/imageGeneration.ts` 的 `buildNegativePrompt`
4. **把风格“接入产品”**
   - UI 选择：`src/types/generation.ts` → `IMAGE_STYLE_OPTIONS` + `GenerationSettings['imageStyle']`
   - AI 自动推荐白名单：`src/services/ai/imageAnalysis.ts`（枚举字符串）
5. **质量校验**
   - 运行 `npm run build` 确认可构建
   - 读取编辑器诊断（lints/ts）确保无新增错误

## 半自动化工具（推荐使用）

本 skill 自带两个脚本，减少“手抄/漏改”的概率：

- **生成代码骨架（不改文件）**：`scripts/scaffold-style.mjs`
  - 用途：生成 `stylePrompts` 条目骨架、`generation.ts` 的 union/options 片段、`imageAnalysis.ts` 枚举提示、`imageGeneration.ts` 负面提示分支骨架
  - 适合：你先让我从参考图抽取风格 DNA 后，快速产出可粘贴的代码骨架

- **一键校验接入完整性**：`scripts/validate-style.mjs`
  - 用途：检查风格 ID 是否出现在 4 个关键接入点（并提示建议补充项）
  - 适合：提交前快速发现“漏加 union / 漏加 options / 漏加枚举”等问题

### 脚本用法（PowerShell）

在 `redflow-main` 目录下运行：

```powershell
# 建议先切到 UTF-8，避免脚本输出出现乱码（仅影响显示/复制，不影响执行）
chcp 65001
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new()

# 生成骨架
node .cursor/skills/style-learning/scripts/scaffold-style.mjs --id muji_minimal --name "无印良品风"

# 校验接入完整性
node .cursor/skills/style-learning/scripts/validate-style.mjs --id muji_minimal

# 最终构建校验
npm run build
```

## 输入契约（必须拿到的信息）

最少输入：
- **风格中文名**：例如“无印良品风”
- **风格 ID**（用于代码 key）：小写 + 下划线，建议结构为 `brand_or_theme_modifier`，例如 `muji_minimal`
- **参考图路径列表**：至少 3 张（封面/产品图/信息图最好都包含）

可选但强烈建议：
- **适用模式**：图生图（产品一致性）、文生图（封面/信息图）、空间设计（装修风格）
- **必须保留的元素**：例如“大留白 + 米白底 + 少量深红强调 + 线性 icon”
- **必须禁止的元素**：例如“高饱和撞色、贴纸涂鸦、复杂纹样、渐变大背景”

## 输出契约（你最终要交付的内容）

必须输出：
- `stylePrompts.ts` 中新增一个风格条目（包含 `id/name/description/defaultPrompt`）
- `generation.ts` 中新增 UI 选项 + 类型联合
- `imageAnalysis.ts` 枚举允许 AI 推荐该风格
- `imageGeneration.ts` 为该风格新增负面提示词分支

建议输出（可选）：
- 提供一段“风格说明文案”（1-2 句）给产品/运营用
- 给出 2-3 条“用户可用补充说明示例”（帮助用户写 additionalContext）

## 风格学习方法（从参考图抽取“可复用”的风格）

对参考图进行结构化抽取，得到 5 类要素（写进 prompt）：

- **色彩与背景**：主色/辅色/强调色；背景是否纯色、纸纹、布纹、颗粒
- **光线与质感**：柔光/硬光；真实摄影感 vs 插画感；材质关键词（paper/fabric/film grain）
- **构图与留白**：居中、网格、三分法、标题区比例、边距（大留白/紧凑）
- **文字与信息层级**：标题字重/字号；副标题位置；列表结构；对齐规则
- **装饰元素与禁忌**：线性 icon / 分隔线 / 小标签；禁止贴纸、涂鸦、复杂花纹、过多字体

产出时务必做到：
- **可控性**：风格 prompt 要能约束“版式/配色/元素数量/留白”，避免模型自由发挥跑偏
- **不侵入内容**：prompt 是“风格指导”，不能要求把“规格参数”渲染成文字
- **合规**：默认禁止水印/logo/品牌标识（包含风格名相关字样）

## 代码接入点（红流云创当前结构）

按这 4 个文件改动即可形成完整闭环：

1. **风格提示词库**：`src/config/stylePrompts.ts`
   - 在 `DEFAULT_STYLE_PROMPTS` 增加 `your_style_id: { id, name, description, defaultPrompt }`
2. **图片风格 UI & 类型**：`src/types/generation.ts`
   - `GenerationSettings.imageStyle` 联合类型新增 `your_style_id`
   - `IMAGE_STYLE_OPTIONS` 新增 `{ value: 'your_style_id', label: '你的风格名' }`
3. **AI 自动推荐白名单**：`src/services/ai/imageAnalysis.ts`
   - 修改 prompt 中 `"imageStyle": "..."` 的枚举字符串，加入 `your_style_id`
4. **负面提示词**：`src/services/ai/imageGeneration.ts`
   - 在 `buildNegativePrompt(style)` 增加 `else if (style === 'your_style_id') baseNegative.push(...)`

## 风格条目模板

新增风格条目请直接复制 [templates.md](templates.md) 的模板填空，保持一致性与可维护性。

## 验证清单（提交前必须完成）

- [ ] `stylePrompts.ts` 新增条目：`id` 与 key 一致，`description` 简短，`defaultPrompt` 不超过约 200 行
- [ ] `generation.ts`：类型联合 + `IMAGE_STYLE_OPTIONS` 两处都加了该 ID
- [ ] `imageAnalysis.ts`：枚举字符串包含该 ID
- [ ] `imageGeneration.ts`：负面提示包含该风格的“禁止项”
- [ ] `npm run build` 通过

## 示例

用户输入：
- “根据这些图新增一个无印良品风，并接入图片风格下拉”
- 参考图：5 张（封面/产品图/信息图）

输出：
- 新增风格 ID：`muji_minimal`
- 风格模板：米白底/大留白/网格秩序/少量深红强调/线性 icon/轻纸纹
- 完整接入：UI 可选 + AI 可推荐 + 负面提示抑制“高饱和/杂乱/贴纸风”

