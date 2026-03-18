/**
 * 美学参数配置服务
 * 管理所有美学相关的参数，包括配色方案、布局风格、材质和光影效果
 */

/**
 * 配色方案配置
 */
export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  colors: string[];
  usage: string; // 适用场景
}

/**
 * 布局风格配置
 */
export interface LayoutStyle {
  id: string;
  name: string;
  description: string;
  structure: string; // 布局结构描述
  usage: string; // 适用场景
}

/**
 * 材质效果配置
 */
export interface MaterialEffect {
  id: string;
  name: string;
  description: string;
  keywords: string[]; // 用于Prompt的关键词
  usage: string; // 适用场景
}

/**
 * 光影效果配置
 */
export interface LightingEffect {
  id: string;
  name: string;
  description: string;
  keywords: string[]; // 用于Prompt的关键词
  usage: string; // 适用场景
}

/**
 * 背景纹理配置
 */
export interface BackgroundTexture {
  id: string;
  name: string;
  description: string;
  keywords: string[]; // 用于Prompt的关键词
  usage: string; // 适用场景
}

/**
 * 所有可用的配色方案
 */
export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'dopamine',
    name: '多巴胺风格',
    description: '高饱和色彩、活力四射、撞色搭配',
    colors: ['bright pink', 'vibrant green', 'neon purple', 'sunny yellow', 'electric blue'],
    usage: '适合活力、时尚、年轻主题的内容'
  },
  {
    id: 'morandi',
    name: '莫兰迪风格',
    description: '低饱和度、高级灰、柔和雅致',
    colors: ['muted pink', 'soft blue', 'gentle green', 'warm gray', 'pale yellow'],
    usage: '适合高端、优雅、文艺主题的内容'
  },
  {
    id: 'black_gold',
    name: '黑金风格',
    description: '奢华质感、金色点缀、深色背景',
    colors: ['deep black', 'dark gray', 'navy blue', 'gold', 'bronze'],
    usage: '适合奢华、高端、商务主题的内容'
  },
  {
    id: 'minimal_white',
    name: '极简白',
    description: '纯白背景、极致简洁、突出内容',
    colors: ['pure white', 'light gray', 'soft beige'],
    usage: '适合简洁、现代、内容为王的主题'
  },
  {
    id: 'nature_fresh',
    name: '自然清新',
    description: '自然色调、清新活力、绿色环保',
    colors: ['fresh green', 'sky blue', 'warm earth', 'soft white', 'pale yellow'],
    usage: '适合自然、环保、健康主题的内容'
  },
  {
    id: 'warm_home',
    name: '温暖家居',
    description: '温暖色调、舒适感、家的感觉',
    colors: ['warm beige', 'soft brown', 'gentle yellow', 'light orange', 'cream white'],
    usage: '适合家居、生活、情感主题的内容'
  },
  {
    id: 'tech_future',
    name: '科技未来',
    description: '冷色调、霓虹光效、未来感',
    colors: ['dark blue', 'neon purple', 'cyan', 'electric pink', 'black'],
    usage: '适合科技、未来、创新主题的内容'
  },
  {
    id: 'retro_vintage',
    name: '复古怀旧',
    description: '复古色调、年代感、胶片质感',
    colors: ['sepia', 'faded red', 'old yellow', 'vintage brown', 'muted blue'],
    usage: '适合怀旧、复古、历史主题的内容'
  },
  {
    id: 'klein_blue',
    name: '克莱因蓝/瑞士主义',
    description: '极致克莱因蓝与纯白，高饱和度极简主义',
    colors: ['International Klein Blue (RGB 0, 47, 167)', 'pure white (RGB 255, 255, 255)'],
    usage: '适合强观点输出、神性主题、画廊感内容，小红书双列流中吸睛效率极高'
  },
  {
    id: 'dieter_rams',
    name: '德国博朗风',
    description: '理性极致、工业美学、功能主义',
    colors: ['off-white', 'cold gray', 'matte black', 'safety orange', 'International Klein Blue'],
    usage: '适合科技、拆解、拉片分析、说明书式内容，带有严谨感和专业度'
  },
  {
    id: 'hermes_orange',
    name: '爱马仕橙 & 深空灰',
    description: '奢华的活力，醒目昂贵，充满能量',
    colors: ['Hermès Orange (#F37021)', 'space gray', 'matte black', 'titanium silver', 'pure white'],
    usage: '适合强调痛点解决、实战实操、干货内容，突出含金量和专业度'
  }
];

/**
 * 所有可用的布局风格
 */
export const LAYOUT_STYLES: LayoutStyle[] = [
  {
    id: 'magazine',
    name: '杂志排版',
    description: '大标题覆盖、 editorial 风格，适合封面和重要内容页',
    structure: 'Top 30% for Title Area, Bottom 70% for Content Grid',
    usage: '适合封面页、重要内容页、标题页'
  },
  {
    id: 'bento_grid',
    name: '便当盒网格',
    description: '结构化内容块、清晰边界，适合多内容展示',
    structure: 'Divided into 2-4 structured content blocks with clear boundaries',
    usage: '适合多要点内容、对比内容、清单式内容'
  },
  {
    id: 'scrapbook',
    name: '剪贴簿风格',
    description: '拼贴元素、贴纸、胶带效果，适合活泼内容',
    structure: 'Collage elements with overlapping layers, stickers, washi tape effects',
    usage: '适合活泼、创意、个人化内容'
  },
  {
    id: 'minimal_centered',
    name: '极简居中',
    description: '内容居中、大量留白，适合简洁风格',
    structure: 'Content centered with maximum white space, minimal elements',
    usage: '适合极简风格、高端内容、突出单个主题'
  },
  {
    id: 'rule_of_thirds',
    name: '三分法则',
    description: '遵循三分法则的经典构图，适合平衡内容',
    structure: 'Content aligned with rule of thirds grid lines, balanced composition',
    usage: '适合平衡内容、图文结合、经典设计'
  },
  {
    id: 'asymmetric',
    name: '不对称布局',
    description: '动态不对称设计，适合现代风格',
    structure: 'Dynamic asymmetric layout with visual tension and balance',
    usage: '适合现代风格、创意内容、打破常规的设计'
  }
];

/**
 * 所有可用的材质效果
 */
export const MATERIAL_EFFECTS: MaterialEffect[] = [
  {
    id: 'paper',
    name: '纸质纹理',
    description: '真实纸张质感，增加自然感',
    keywords: ['paper texture', 'subtle paper grain', 'authentic paper feel', 'slight texture'],
    usage: '适合大多数风格，增加真实感'
  },
  {
    id: 'film',
    name: '胶片质感',
    description: '复古胶片颗粒，增加怀旧感',
    keywords: ['film grain', 'cinematic film texture', 'vintage film feel', 'photographic film grain'],
    usage: '适合复古、怀旧、电影主题内容'
  },
  {
    id: 'glass',
    name: '毛玻璃效果',
    description: '半透明磨砂玻璃质感，增加现代感',
    keywords: ['glassmorphism', 'frosted glass effect', 'translucent glass texture', 'soft blur effect'],
    usage: '适合现代、科技、高端风格'
  },
  {
    id: 'velvet',
    name: '丝绒质感',
    description: '奢华丝绒纹理，增加高级感',
    keywords: ['velvet texture', 'luxurious velvet feel', 'soft velvet surface', 'rich fabric texture'],
    usage: '适合奢华、高端、优雅风格'
  },
  {
    id: 'plastic',
    name: '塑料质感',
    description: '光滑塑料表面，适合现代产品',
    keywords: ['smooth plastic surface', 'glossy plastic texture', 'modern plastic finish', 'shiny plastic effect'],
    usage: '适合现代产品、科技产品、工业设计'
  },
  {
    id: 'metal',
    name: '金属质感',
    description: '金属光泽和纹理，增加科技感',
    keywords: ['metal texture', 'shiny metal surface', 'chrome finish', 'metallic sheen'],
    usage: '适合科技、工业、高端产品'
  },
  {
    id: 'fabric',
    name: '织物质感',
    description: '各种织物纹理，增加温暖感',
    keywords: ['fabric texture', 'soft fabric feel', 'textile surface', 'woven texture'],
    usage: '适合家居、时尚、温暖主题'
  },
  {
    id: 'concrete',
    name: '混凝土质感',
    description: '粗糙混凝土表面，增加工业感',
    keywords: ['concrete texture', 'raw concrete surface', 'industrial concrete finish', 'rough concrete feel'],
    usage: '适合工业、现代、极简风格'
  }
];

/**
 * 所有可用的光影效果
 */
export const LIGHTING_EFFECTS: LightingEffect[] = [
  {
    id: 'natural',
    name: '自然光影',
    description: '柔和自然光线，增加真实感',
    keywords: ['natural lighting', 'soft daylight', 'natural shadows', 'gentle light'],
    usage: '适合大多数风格，增加真实感'
  },
  {
    id: 'dramatic',
    name: '戏剧性光影',
    description: '强烈对比的光影，增加视觉冲击力',
    keywords: ['dramatic lighting', 'strong contrast', 'cinematic lighting', 'dramatic shadows'],
    usage: '适合电影海报、戏剧性内容、强调主题'
  },
  {
    id: 'side_backlight',
    name: '侧逆光',
    description: '侧面和背面的光线，增加深度感',
    keywords: ['side backlight', 'rim light', 'contour lighting', 'backlit effect'],
    usage: '适合人物、产品展示、增加立体感'
  },
  {
    id: 'tyndall',
    name: '丁达尔光',
    description: '光束穿过介质的效果，增加氛围感',
    keywords: ['Tyndall effect', 'light beam through particles', 'sunbeam effect', 'ray of light'],
    usage: '适合自然、梦幻、氛围感内容'
  },
  {
    id: 'neon',
    name: '霓虹光效',
    description: '霓虹灯效果，增加科技感和未来感',
    keywords: ['neon lighting', 'neon glow', 'LED lights', 'digital light effects'],
    usage: '适合科技、赛博朋克、未来风格'
  },
  {
    id: 'soft',
    name: '柔和光线',
    description: '柔和漫射光，减少阴影，适合清新风格',
    keywords: ['soft lighting', 'diffused light', 'gentle shadows', 'soft glow'],
    usage: '适合清新、柔和、女性化内容'
  },
  {
    id: 'warm',
    name: '温暖光线',
    description: '暖色调光线，增加温暖感',
    keywords: ['warm lighting', 'golden hour', 'warm glow', 'cozy light'],
    usage: '适合家居、生活、情感主题'
  },
  {
    id: 'cool',
    name: '冷色调光线',
    description: '冷色调光线，增加科技感',
    keywords: ['cool lighting', 'blue tone light', 'modern light', 'tech-inspired lighting'],
    usage: '适合科技、未来、现代风格'
  }
];

/**
 * 所有可用的背景纹理
 */
export const BACKGROUND_TEXTURES: BackgroundTexture[] = [
  {
    id: 'clean',
    name: '干净背景',
    description: '纯色或渐变背景，简洁干净',
    keywords: ['clean background', 'solid color', 'subtle gradient', 'simple background'],
    usage: '适合大多数风格，突出内容'
  },
  {
    id: 'crumped_paper',
    name: '皱纸纹理',
    description: '皱巴巴的纸张效果，增加真实感',
    keywords: ['crumped paper texture', 'wrinkled paper', 'textured paper background', 'old paper effect'],
    usage: '适合复古、手工、真实感内容'
  },
  {
    id: 'frosted_glass',
    name: '磨砂玻璃',
    description: '半透明磨砂效果，增加现代感',
    keywords: ['frosted glass effect', 'translucent background', 'glass texture', 'soft blur background'],
    usage: '适合现代、科技、高端风格'
  },
  {
    id: 'tech_pattern',
    name: '科技图案',
    description: '电路板、网格等科技图案，增加科技感',
    keywords: ['tech pattern', 'circuit board background', 'digital grid', 'futuristic pattern'],
    usage: '适合科技、未来、创新主题'
  },
  {
    id: 'natural_scene',
    name: '自然场景',
    description: '自然风景背景，增加自然感',
    keywords: ['natural scene', 'landscape background', 'greenery', 'nature backdrop'],
    usage: '适合自然、环保、健康主题'
  },
  {
    id: 'abstract',
    name: '抽象图案',
    description: '抽象几何或有机图案，增加创意感',
    keywords: ['abstract pattern', 'geometric design', 'organic shape', 'creative background'],
    usage: '适合创意、艺术、设计主题'
  },
  {
    id: 'vintage',
    name: '复古纹理',
    description: '复古纸张、纹理，增加年代感',
    keywords: ['vintage texture', 'old paper background', 'retro pattern', 'antique feel'],
    usage: '适合怀旧、复古、历史主题'
  }
];

/**
 * 根据主题内容动态选择配色方案
 * @param content 页面内容
 * @returns 推荐的配色方案ID
 */
export function getRecommendedColorPalette(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // 主题关键词匹配
  if (lowerContent.includes('科技') || lowerContent.includes('未来') || lowerContent.includes('创新')) {
    return 'tech_future';
  } else if (lowerContent.includes('自然') || lowerContent.includes('环保') || lowerContent.includes('健康')) {
    return 'nature_fresh';
  } else if (lowerContent.includes('奢华') || lowerContent.includes('高端') || lowerContent.includes('商务')) {
    return 'black_gold';
  } else if (lowerContent.includes('复古') || lowerContent.includes('怀旧') || lowerContent.includes('历史')) {
    return 'retro_vintage';
  } else if (lowerContent.includes('克莱因') || lowerContent.includes('瑞士') || lowerContent.includes('纯粹') || lowerContent.includes('神性') || lowerContent.includes('画廊')) {
    return 'klein_blue';
  } else if (lowerContent.includes('博朗') || lowerContent.includes('理性') || lowerContent.includes('功能主义') || lowerContent.includes('工业设计') || lowerContent.includes('拆解') || lowerContent.includes('拉片')) {
    return 'dieter_rams';
  } else if (lowerContent.includes('爱马仕') || lowerContent.includes('橙色') || lowerContent.includes('奢华') || lowerContent.includes('实战') || lowerContent.includes('实操') || lowerContent.includes('干货')) {
    return 'hermes_orange';
  } else if (lowerContent.includes('极简') || lowerContent.includes('简洁') || lowerContent.includes('现代')) {
    return 'minimal_white';
  } else if (lowerContent.includes('温暖') || lowerContent.includes('家居') || lowerContent.includes('生活')) {
    return 'warm_home';
  } else if (lowerContent.includes('文艺') || lowerContent.includes('优雅') || lowerContent.includes('高端')) {
    return 'morandi';
  } else {
    // 默认返回多巴胺风格，适合大多数内容
    return 'dopamine';
  }
}

/**
 * 根据页面类型推荐布局风格
 * @param pageType 页面类型
 * @returns 推荐的布局风格ID
 */
export function getRecommendedLayoutStyle(pageType: string): string {
  switch (pageType) {
    case 'cover':
      return 'magazine'; // 封面页适合杂志排版
    case 'summary':
      return 'bento_grid'; // 总结页适合网格布局
    case 'content':
      return 'rule_of_thirds'; // 内容页适合三分法则
    default:
      return 'magazine'; // 默认使用杂志排版
  }
}

/**
 * 获取随机材质效果关键词
 * @param count 关键词数量
 * @returns 随机材质效果关键词
 */
export function getRandomMaterialKeywords(count: number = 2): string[] {
  const allKeywords = MATERIAL_EFFECTS.flatMap(material => material.keywords);
  const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * 获取随机光影效果关键词
 * @param count 关键词数量
 * @returns 随机光影效果关键词
 */
export function getRandomLightingKeywords(count: number = 2): string[] {
  const allKeywords = LIGHTING_EFFECTS.flatMap(lighting => lighting.keywords);
  const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}