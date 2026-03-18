/**
 * AutoPosterPipeline 核心数据结构定义
 */

/**
 * 配色方案定义
 */
export interface Palette {
  /** 背景色列表 */
  bg: string[];
  /** 主色 */
  primary: string;
  /** 强调色 */
  accent: string;
  /** 高亮色 */
  highlight: string;
}

/**
 * 背景生成配方
 */
export interface BackgroundRecipe {
  /** 图案类型 */
  pattern: string;
  /** 光照类型 */
  lighting: string;
  /** 复杂度级别 */
  complexity: 'low' | 'medium' | 'high';
  /** 顶部安全区比例（0-1） */
  clean_space_top: number;
  /** 底部安全区比例（0-1） */
  clean_space_bottom: number;
}

/**
 * 装饰元素集合
 */
export type MotifSet = string[];

/**
 * 后期处理效果
 */
export interface PostEffects {
  /** 颗粒感强度（0-1） */
  grain: number;
  /** 暗角强度（0-1） */
  vignette: number;
  /** 对比度调整（1.0为原始） */
  contrast: number;
  /** 饱和度调整（1.0为原始） */
  saturation: number;
}

/**
 * 布局参数
 */
export interface Layout {
  /** 边距（像素） */
  margin: number;
  /** 圆角半径（像素） */
  radius: number;
  /** 阴影类型 */
  shadow: 'none' | 'soft' | 'hard';
  /** 网格列数 */
  grid_cols: number;
  /** 网格间距（像素） */
  gutter: number;
}

/**
 * 排版参数
 */
export interface Typography {
  /** 标题字体 */
  title_font: string;
  /** 正文字体 */
  body_font: string;
  /** 标题最大行数 */
  title_max_lines: number;
}

/**
 * 风格包定义
 */
export interface StylePack {
  /** 风格ID */
  style_id: string;
  /** 配色方案 */
  palette: Palette;
  /** 背景生成配方 */
  bg_recipe: BackgroundRecipe;
  /** 装饰元素集合 */
  motif_set: MotifSet;
  /** 后期处理效果 */
  post_fx: PostEffects;
  /** 布局参数 */
  layout: Layout;
  /** 排版参数 */
  typography: Typography;
}

/**
 * 页面模板类型
 */
export type TemplateId = 'LIST_5' | 'STEP_N' | 'DO_DONT' | 'BEFORE_AFTER' | 'CARD_3' | 'QA_3' | 'COVER' | 'SUMMARY';

/**
 * 安全区域定义
 */
export interface SafeArea {
  /** 左边界（像素） */
  x: number;
  /** 上边界（像素） */
  y: number;
  /** 宽度（像素） */
  w: number;
  /** 高度（像素） */
  h: number;
}

/**
 * 图层定义
 */
export interface Layer {
  /** 图层类型 */
  type: 'title' | 'subtitle' | 'body' | 'step_list' | 'tip_box' | 'bullet_list';
  /** 最大行数 */
  maxLines?: number;
  /** 字体大小 */
  fontSize: number;
  /** 最小字体大小 */
  minFontSize?: number;
  /** 行高 */
  lineHeight: number;
  /** 透明度 */
  opacity?: number;
  /** 圆角半径 */
  radius?: number;
  /** 背景透明度 */
  bgOpacity?: number;
  /** 项目符号样式 */
  bulletStyle?: string;
}

/**
 * 页面模板DSL定义
 */
export interface PageTemplate {
  /** 模板ID */
  template_id: TemplateId;
  /** 安全区域定义 */
  safe_areas: {
    /** 标题安全区 */
    title: SafeArea;
    /** 正文安全区 */
    body: SafeArea;
  };
  /** 图层定义 */
  layers: Layer[];
}

/**
 * 生成的底图信息
 */
export interface GeneratedBackground {
  /** 底图URL */
  url: string;
  /** 生成使用的seed */
  seed: number;
  /** 是否为变体底图 */
  isVariant: boolean;
  /** 原始底图URL（如果是变体） */
  originalUrl?: string;
  /** 变体类型（如果是变体） */
  variantType?: 'crop' | 'rotate' | 'texture' | 'overlay';
}

/**
 * 页面生成请求
 */
export interface PageGenerationRequest {
  /** 页面内容 */
  pageContent: string;
  /** 页面索引 */
  pageIndex: number;
  /** 总页数 */
  totalPages: number;
  /** 主题 */
  topic: string;
  /** 页面类型 */
  pageType: 'cover' | 'content' | 'summary';
  /** 完整大纲 */
  fullOutline: string;
}

/**
 * 页面生成结果
 */
export interface PageGenerationResult {
  /** 生成的图片URL */
  imageUrl: string;
  /** 使用的模板ID */
  templateId: TemplateId;
  /** 使用的底图信息 */
  background: GeneratedBackground;
  /** 生成状态 */
  status: 'success' | 'failed';
  /** 失败原因（如果失败） */
  error?: string;
  /** 检测结果（如果启用QC） */
  qcResult?: QCResult;
}

/**
 * QC检测结果
 */
export interface QCResult {
  /** 检测时间戳 */
  timestamp: number;
  /** 文字污染检测结果 */
  textContamination: boolean;
  /** 安全区可读性检测结果 */
  safeAreaReadable: boolean;
  /** 清晰度检测结果（拉普拉斯方差） */
  sharpness: number;
  /** 合规性检测结果 */
  compliance: boolean;
  /** 检测通过状态 */
  passed: boolean;
  /** 失败原因（如果未通过） */
  failureReason?: string;
}

/**
 * AutoPosterPipeline生成结果
 */
export interface AutoPosterResult {
  /** 生成的页面结果列表 */
  pages: PageGenerationResult[];
  /** 总页数 */
  totalPages: number;
  /** 生成使用的style_pack */
  stylePack: StylePack;
  /** 生成使用的主seed */
  seedMaster: number;
  /** 生成状态 */
  status: 'success' | 'partial_success' | 'failed';
  /** 失败原因（如果完全失败） */
  error?: string;
  /** 生成耗时（毫秒） */
  duration: number;
}
