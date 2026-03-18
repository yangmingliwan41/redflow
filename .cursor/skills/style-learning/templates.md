## 风格条目模板（复制填空）

### 1) `src/config/stylePrompts.ts`

在 `DEFAULT_STYLE_PROMPTS` 中新增：

```ts
your_style_id: {
  id: 'your_style_id',
  name: '你的风格中文名',
  description: '一句话概括（用于卡片/示例，不要太长）',
  defaultPrompt: `【整体风格要求】
- ...

【视觉元素】
- 背景：...
- 配色方案：...
- 构图：...
- 装饰元素：...
- 质感：...

【文字排版】
- 标题区比例：...
- 标题字重/字号：...
- 列表/要点：...
- 对齐规则：...

【风格一致性】
- ...

【重要约束】
- 禁止水印、logo、品牌标识
- 禁止渲染技术规格信息（分辨率/像素等）
- 禁止渲染英文技术术语或参数说明
- 所有描述均为风格指导，不应作为图片中的文字内容呈现`
}
```

### 2) `src/types/generation.ts`

在 `GenerationSettings.imageStyle` 联合类型增加：

```ts
| 'your_style_id'
```

并在 `IMAGE_STYLE_OPTIONS` 增加：

```ts
{ value: 'your_style_id', label: '你的风格中文名' },
```

### 3) `src/services/ai/imageAnalysis.ts`

修改分析 prompt 的枚举字符串，加入：

```txt
...|your_style_id|...
```

### 4) `src/services/ai/imageGeneration.ts`

在 `buildNegativePrompt(style)` 中增加分支：

```ts
} else if (style === 'your_style_id') {
  baseNegative.push(
    // 写“禁忌项”：避免跑偏
    'cluttered',
    'busy background',
    'vibrant colors',
    'neon',
    'high saturation',
    'overdesigned'
  )
}
```

### 5) 验证命令（PowerShell）

在 `redflow-main` 下运行：

```powershell
npm run build
```

