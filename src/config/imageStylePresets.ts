/**
 * 图片风格预设配置
 * 整合 @hongliu/image-generator 模块的风格预设功能
 */

// 直接从子模块导入，避免加载 React Hook
import {
  DEFAULT_STYLE_PRESETS,
  createStylePresets,
  getStylePreset,
  buildPrompt,
  type StylePreset
} from '@hongliu/image-generator/src/core/config/stylePresets'

// 重新导出模块的风格预设和函数
export {
  DEFAULT_STYLE_PRESETS,
  createStylePresets,
  getStylePreset,
  buildPrompt,
  type StylePreset
}

/**
 * 获取所有可用的风格预设
 */
export function getAllStylePresets(): StylePreset[] {
  return DEFAULT_STYLE_PRESETS
}

/**
 * 根据风格值获取风格预设
 */
export function getStylePresetByValue(value: string): StylePreset | undefined {
  return getStylePreset(value)
}

/**
 * 构建完整的图片生成提示词
 * @param basePrompt 基础提示词
 * @param styleValue 风格值
 * @param customPrompt 自定义提示词
 * @param brightness 亮度调整（50-150），默认100
 * @param contrast 对比度调整（50-150），默认100
 * @param saturation 饱和度调整（0-200），默认100
 */
export function buildImagePrompt(
  basePrompt: string = '根据参考图片生成家居装修效果图',
  styleValue?: string,
  customPrompt?: string,
  brightness: number = 100,
  contrast: number = 100,
  saturation: number = 100
): string {
  return buildPrompt(basePrompt, styleValue, customPrompt, brightness, contrast, saturation)
}

