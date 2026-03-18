/**
 * 装修风格预设配置
 */

/**
 * 风格预设接口
 */
export interface StylePreset {
  /** 风格值（唯一标识） */
  value: string;
  /** 风格显示名称 */
  label: string;
  /** 风格描述提示词（可选） */
  prompt?: string;
}

/**
 * 默认风格预设列表
 */
export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  { value: 'none', label: '原始风格' },
  {
    value: 'modern-minimalist',
    label: '现代简约',
    prompt: '现代简约风格，线条简洁流畅，色彩清新淡雅，空间通透明亮，注重功能性与美观性的完美结合',
  },
  {
    value: 'scandinavian',
    label: '北欧风格',
    prompt: '北欧风格，以白色为主色调，搭配原木色家具，简洁自然，温馨舒适，强调自然光线和通透感',
  },
  {
    value: 'natural-wood',
    label: '原木风格',
    prompt: '原木风格，大量使用天然木材，保留木材原始纹理和色泽，自然质朴，温暖舒适，回归自然本真，营造温馨宜居的生活空间',
  },
  {
    value: 'light-luxury',
    label: '轻奢风格',
    prompt: '轻奢风格，低调奢华有内涵，运用高级灰、米色、金色等色调，搭配精致的软装和质感材料，优雅大气',
  },
  {
    value: 'new-chinese',
    label: '新中式',
    prompt: '新中式风格，传统中式元素与现代设计相融合，木质家具搭配简约线条，意境深远，文化底蕴浓厚',
  },
  {
    value: 'industrial',
    label: '工业风格',
    prompt: '工业风格，裸露的砖墙、水泥墙面，金属管道和复古家具，粗犷硬朗，个性十足，充满原始质感',
  },
  {
    value: 'japanese',
    label: '日式风格',
    prompt: '日式风格，原木色调为主，榻榻米、推拉门等传统元素，简洁自然，禅意十足，营造宁静舒适的居住氛围',
  },
  {
    value: 'french',
    label: '法式风格',
    prompt: '法式风格，浪漫优雅，运用白色、米色等柔和色调，精致的雕花装饰，水晶吊灯，营造高贵典雅的氛围',
  },
  {
    value: 'american',
    label: '美式风格',
    prompt: '美式风格，自由随性，深色木质家具，舒适的布艺沙发，注重实用性和舒适度，温馨大气',
  },
  {
    value: 'mediterranean',
    label: '地中海风格',
    prompt: '地中海风格，蓝白色调为主，拱形门窗，马赛克装饰，充满海洋气息，浪漫自然，清新明快',
  },
];

/**
 * 创建风格预设列表（支持自定义扩展）
 * 
 * @param customPresets 自定义风格预设数组
 * @returns 合并后的风格预设列表
 * 
 * @example
 * ```typescript
 * const customStyles = [
 *   { value: 'custom', label: '自定义风格', prompt: '...' }
 * ];
 * const allStyles = createStylePresets(customStyles);
 * ```
 */
export const createStylePresets = (customPresets: StylePreset[] = []): StylePreset[] => {
  // 合并默认预设和自定义预设，自定义预设会覆盖同value的默认预设
  const presetMap = new Map<string, StylePreset>();
  
  // 先添加默认预设
  DEFAULT_STYLE_PRESETS.forEach(preset => {
    presetMap.set(preset.value, preset);
  });
  
  // 再添加自定义预设（会覆盖同value的默认预设）
  customPresets.forEach(preset => {
    presetMap.set(preset.value, preset);
  });
  
  return Array.from(presetMap.values());
};

/**
 * 根据风格值获取风格预设
 * 
 * @param styleValue 风格值
 * @param presets 风格预设列表，默认使用DEFAULT_STYLE_PRESETS
 * @returns 找到的风格预设，如果未找到返回undefined
 * 
 * @example
 * ```typescript
 * const style = getStylePreset('modern-minimalist');
 * if (style) {
 *   console.log(style.label); // "现代简约"
 * }
 * ```
 */
export const getStylePreset = (
  styleValue: string,
  presets: StylePreset[] = DEFAULT_STYLE_PRESETS
): StylePreset | undefined => {
  return presets.find(preset => preset.value === styleValue);
};

/**
 * 构建完整的提示词
 * 
 * @param basePrompt 基础提示词
 * @param styleValue 风格值
 * @param customPrompt 自定义提示词
 * @param brightness 亮度调整（50-150）
 * @param contrast 对比度调整（50-150）
 * @param saturation 饱和度调整（0-200）
 * @param presets 风格预设列表
 * @returns 完整的提示词字符串
 * 
 * @example
 * ```typescript
 * const prompt = buildPrompt(
 *   '根据参考图片生成家居装修效果图',
 *   'modern-minimalist',
 *   '增加绿植装饰',
 *   110,
 *   100,
 *   100
 * );
 * ```
 */
export const buildPrompt = (
  basePrompt: string = '根据参考图片生成家居装修效果图',
  styleValue?: string,
  customPrompt?: string,
  brightness: number = 100,
  contrast: number = 100,
  saturation: number = 100,
  presets: StylePreset[] = DEFAULT_STYLE_PRESETS
): string => {
  let prompt = customPrompt || basePrompt;

  // 添加风格描述
  if (styleValue && styleValue !== 'none') {
    const stylePreset = getStylePreset(styleValue, presets);
    if (stylePreset?.prompt) {
      prompt += `，${stylePreset.prompt}`;
    }
  }

  // 添加亮度调整描述
  if (brightness !== 100) {
    if (brightness > 100) {
      prompt += `，空间明亮度提高${brightness - 100}%`;
    } else {
      prompt += `，空间明亮度降低${100 - brightness}%`;
    }
  }

  // 添加对比度调整描述
  if (contrast !== 100) {
    if (contrast > 100) {
      prompt += `，对比度增强，层次分明`;
    } else {
      prompt += `，对比度柔和，氛围温馨`;
    }
  }

  // 添加饱和度调整描述
  if (saturation !== 100) {
    if (saturation > 100) {
      prompt += `，色彩饱和度提高，视觉冲击力强`;
    } else {
      prompt += `，色彩饱和度降低，淡雅清新`;
    }
  }

  return prompt;
};

