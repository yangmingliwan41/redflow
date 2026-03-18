/**
 * 大纲生成服务
 */

import { Page, VisualStyleGuide } from '../../stores/textGenerator'
import { logger } from '../../composables/useLogger'
import { callDeepSeekAPI } from './deepseek'
import { isMockMode, mockGenerateOutline } from './mock'
import { getStylePrompt, getStyleConfig } from '../../config/stylePrompts'

/**
 * 生成大纲（文本生成图文模式，使用DeepSeek）
 * @param topic 主题内容
 * @param targetPageCount 目标页面数量（包括封面），如果不指定则使用默认范围
 * @param style 可选的视觉风格ID，用于生成匹配风格的配图建议
 */
export async function generateOutline(
  topic: string,
  targetPageCount?: number,
  style?: string
): Promise<{ outline: string; pages: Array<Page>; visualGuide?: VisualStyleGuide }> {
  if (isMockMode()) {
    logger.debug('🧪 [模拟模式] 生成大纲')
    // mock 不区分风格，这里暂时忽略 style 参数
    return await mockGenerateOutline(topic, targetPageCount)
  }
  
  // 确定目标页面数量
  const pageCount = targetPageCount || 8 // 默认8页
  
  console.log('=== generateOutline 调试信息 ===')
  console.log('topic:', topic)
  console.log('targetPageCount:', targetPageCount)
  console.log('pageCount:', pageCount)
  console.log('style:', style)
  
  // 获取风格信息（如果提供了风格ID）
  let styleInfo = ''
  let styleName = ''
  if (style) {
    const styleConfig = getStyleConfig(style)
    if (styleConfig) {
      styleName = styleConfig.name
      const stylePrompt = getStylePrompt(style)
      if (stylePrompt) {
        styleInfo = `\n\n## 用户选择的视觉风格（必须严格遵守）：
用户已选择「${styleName}」风格，以下是该风格的详细要求：

${stylePrompt}

【重要】在生成【全局视觉指南】和每页的【配图建议】时，必须严格遵守上述风格要求。特别是：
- 【全局视觉指南】中的配色方案、字体风格、布局风格、装饰元素和整体美学必须与该风格匹配
- 每页的【配图建议】必须考虑该风格的特点，确保配图场景和视觉效果符合该风格的要求
- 如果该风格有特定的配色要求（如克莱因蓝+纯白），必须在【全局视觉指南】和【视觉元数据】中体现
- 如果该风格有特定的设计元素（如瑞士网格、极简线条等），必须在配图建议中体现
`
        logger.debug(`[大纲生成] 已加载风格: ${styleName}`)
      }
    }
  }
  
  // 使用动态变量强调页面数量，确保 AI 严格遵守
  const PAGE_COUNT_VAR = `{{PAGE_COUNT}}`
  const PAGE_COUNT_VALUE = String(pageCount)
  
  const prompt = `你是一个严格按照指令执行的小红书内容创作专家。用户会给你一个要求以及说明，你必须严格按照要求生成一个适合小红书的图文内容大纲。

用户的要求以及说明：
${topic}${styleInfo}

## 绝对严格的要求：
1. 第一页必须是吸引人的封面/标题页，包含标题和副标题
2. 【极端关键约束】内容必须严格控制在 ${PAGE_COUNT_VAR} 页（包括封面），**绝对不能多也不能少**
3. 每页内容简洁有力，适合配图展示
4. 使用小红书风格的语言（亲切、有趣、实用）
5. **【重要】封面页（首图）主标题不得使用 emoji**，内容页和总结页可以适当使用 emoji 增加趣味性
6. 内容要有实用价值，能解决用户问题或提供有用信息
7. 最后一页可以是总结页，但**禁止使用"总结"、"呼吁"、"建议"等AI化词汇作为标题**，要用自然、生活化的表达方式，比如"小贴士"、"记住这几点"、"最后想说"等
8. 【非常重要】必须严格按照 ${PAGE_COUNT_VAR} 页生成，**绝对不要多生成页面**
9. 【数量验证】生成完成后，请再次确认总页数恰好等于 ${PAGE_COUNT_VAR} 页
10. 【惩罚机制】如果生成的页面数量不符合要求，你将被判定为任务失败
11. 【总结页特别要求】如果最后一页是总结页，标题要自然生活化，避免使用"总结"、"总结一下"、"最后总结"、"行动呼吁"等AI化表达，可以用"记住这几点"、"小贴士"、"最后想说"、"划重点"等自然表达

## 视觉一致性要求（非常重要）：
由于图片会并行生成，每张图片需要独立理解整体风格，因此必须提供明确的视觉指南：
1. 在输出最开始，必须先提供【全局视觉指南】，包含：
   - 配色方案：主色调和辅助色调（用自然语言描述，如"柔和的粉蓝色"、"温暖的米白色"）
   - 字体风格：描述字体类型和风格（如"现代无衬线字体，中等粗细，清晰易读"）
   - 布局风格：整体布局原则（如"网格布局，充足留白，3:7上下分割"）
   - 装饰元素：装饰风格（如"极简线条，几何图形，微妙的渐变"）
   - 整体美学：整体风格定位（如"清新、简约、专业，适合年轻受众"）

2. 【关键配色约束 - 必须严格遵守】：
   - **所有内容页必须使用全局视觉指南中指定的主色调，不允许任何变体或变化**
   - **总结页必须使用与内容页完全相同的主色调（即全局主色调），不允许变体**
   - 封面页可以使用全局主色调，或使用与全局主色调兼容的配色（建议优先使用全局主色调）
   - 禁止为不同的内容页分配不同的主色调，这会导致帖子整体性被破坏

3. 每页必须包含【视觉元数据】部分，描述该页的视觉特征：
   - **主色调**（内容页和总结页必须严格使用全局主色调，封面页可以使用全局主色调或兼容配色）
   - 视觉重点：该页的视觉重点布局（如"顶部大标题，底部留白"）
   - 布局模式：该页的具体布局方式（如"上下分割，标题占30%"）
   - 装饰风格：该页的装饰风格（应与全局装饰元素风格一致）

4. **【配图建议要求 - 非常重要】**：
   - 每页内容末尾必须包含"配图建议："，描述该页适合的配图场景（这是必需的，不能省略）
   - 如果用户选择了特定风格，配图建议必须考虑该风格的特点
   - 配图建议应该包含：场景描述、视觉元素、配色参考（如果有特定要求）、构图建议
   - 配图建议要具体、可执行，便于后续图片生成时应用

## 输出格式（必须严格遵守，否则任务失败）：
- **输出顺序**：首先输出【全局视觉指南】，然后才是各页面内容
- 必须使用 <page> 标签作为每一页的分隔符（这是强制分隔符，必须在每一页前使用）
- 每页第一行必须是页面类型标记，只能是 [封面]、[内容] 或 [总结] 中的一个
- 每页必须包含【视觉元数据】部分（在页面类型标记之后，具体内容之前）
- 页面内容要具体、详细，方便后续生成图片
- 每页内容末尾必须包含"配图建议："，描述该页适合的配图场景（这是必需的，不能省略）
- **配图建议必须与用户选择的风格匹配**（如果用户选择了特定风格）
- 避免在内容中使用 | 竖线符号（会与 markdown 表格冲突）
- 不要在输出中添加任何多余的内容或说明

## 头图模式特别要求（当 ${PAGE_COUNT_VAR} 为1时）：
- 只生成一个封面页
- 封面页必须包含完整的标题和副标题
- 封面页的内容要简洁有力，适合作为小红书的头图
- 配图建议要适合头图使用场景，并符合用户选择的风格（如果有）

## 示例输出（当 ${PAGE_COUNT_VAR} 为1时）：

【全局视觉指南】
配色方案：主色调 - 温暖的咖啡棕色，辅助色 - 米白色、浅灰色、淡金色
字体风格：现代无衬线字体，中等粗细，清晰易读
布局风格：简洁布局，充足留白，上下分割结构
装饰元素：极简线条，温暖色调的几何图形，微妙的渐变
整体美学：温馨、舒适、专业，适合生活分享场景

<page>
[封面]
【视觉元数据】
- 主色调：温暖的咖啡棕色
- 视觉重点：顶部大标题，中间配图区域，底部留白
- 布局模式：上下分割，标题占30%，配图占50%，留白占20%
- 装饰风格：极简线条，温暖色调的几何图形

标题：5分钟学会手冲咖啡
副标题：新手也能做出咖啡店的味道
背景：温馨的咖啡场景，一个家庭布局的咖啡角

配图建议：温馨的咖啡角场景，摆放整齐的咖啡器具

## 示例输出（当 ${PAGE_COUNT_VAR} 为3时）：

【全局视觉指南】
配色方案：主色调 - 温暖的咖啡棕色，辅助色 - 米白色、浅灰色、淡金色
字体风格：现代无衬线字体，中等粗细，清晰易读
布局风格：简洁布局，充足留白，上下分割结构
装饰元素：极简线条，温暖色调的几何图形，微妙的渐变
整体美学：温馨、舒适、专业，适合生活分享场景

<page>
[封面]
【视觉元数据】
- 主色调：温暖的咖啡棕色
- 视觉重点：顶部大标题，中间配图区域，底部留白
- 布局模式：上下分割，标题占30%，配图占50%，留白占20%
- 装饰风格：极简线条，温暖色调的几何图形

标题：5分钟学会手冲咖啡
副标题：新手也能做出咖啡店的味道
背景：温馨的咖啡场景，一个家庭布局的咖啡角

配图建议：温馨的咖啡角场景，摆放整齐的咖啡器具

<page>
[内容]
【视觉元数据】
- 主色调：温暖的咖啡棕色（与全局一致）
- 视觉重点：左侧内容列表，右侧留白或小配图
- 布局模式：左右分割，内容占70%，留白占30%
- 装饰风格：极简线条，温暖色调的几何图形

第一步：准备器具

必备工具：
• 手冲壶（细嘴壶）
• 滤杯和滤纸
• 咖啡豆 15g
• 热水 250ml（92-96℃）
• 磨豆机
• 电子秤

配图建议：整齐摆放的咖啡器具

<page>
[内容]
【视觉元数据】
- 主色调：温暖的咖啡棕色（与全局一致）
- 视觉重点：上方标题，中间内容，下方小贴士
- 布局模式：上下分割，标题占20%，内容占60%，贴士占20%
- 装饰风格：极简线条，温暖色调的几何图形

第二步：研磨咖啡豆

研磨粗细度：中细研磨（像细砂糖）
重量：15克
新鲜度：建议现磨现冲

小贴士💡：
咖啡豆最好是烘焙后2周内的
研磨后要在15分钟内冲泡完成

配图建议：研磨咖啡豆的特写

### 最后
现在，请根据用户的主题生成大纲。记住：
1. **首先输出【全局视觉指南】**，定义统一的配色、字体、布局、装饰和整体美学
   ${style ? `**特别重要**：如果用户选择了「${styleName}」风格，【全局视觉指南】必须与该风格的要求匹配，包括配色、字体、布局、装饰元素等所有方面。` : ''}
2. 严格使用 <page> 标签分割每一页
3. 每页开头标注类型：[封面]、[内容]、[总结]
4. **每页必须包含【视觉元数据】**，描述该页的视觉特征（与全局指南保持一致）
5. **【配色统一性】所有内容页和总结页必须使用全局视觉指南中指定的主色调，不允许任何变体**
6. **【封面标题要求】封面页（首图）主标题不得使用 emoji，保持简洁专业**
7. 内容要详细、具体、专业、有价值
8. 适合制作成小红书图文
9. 每页末尾必须包含"配图建议："描述配图场景
   ${style ? `**特别重要**：每页的配图建议必须考虑「${styleName}」风格的特点，确保配图场景、视觉元素、配色等与该风格匹配。` : ''}
10. 避免使用竖线符号 | （会与 markdown 表格冲突）
11. 【极端关键】必须生成恰好 ${PAGE_COUNT_VAR} 页，不能多也不能少
12. 【数量检查】在开始生成前，请先规划好这 ${PAGE_COUNT_VAR} 页的内容结构，确保最终输出恰好 ${PAGE_COUNT_VAR} 页
13. 【头图模式检查】如果 ${PAGE_COUNT_VAR} 为1，只生成一个封面页
14. 【视觉一致性】确保所有页面的视觉元数据与全局视觉指南保持一致，这样可以保证并行生成的图片风格统一

【特别的！！注意】直接给出大纲内容（不要有任何多余的说明，也就是你直接从【全局视觉指南】开始，不要有针对用户的回应对话），请输出：`
  
  // 在发送给 AI 之前，将动态变量替换为实际值
  const finalPrompt = prompt.replace(new RegExp(PAGE_COUNT_VAR.replace(/[{}]/g, '\\$&'), 'g'), PAGE_COUNT_VALUE)

  const systemPrompt = '你是一个专业的小红书内容创作助手，擅长生成吸引人的图文大纲。'
  const result = await callDeepSeekAPI(finalPrompt, systemPrompt)
  
  // 解析全局视觉指南
  let visualGuide: VisualStyleGuide | undefined = undefined
  const visualGuideMatch = result.text.match(/【全局视觉指南】([\s\S]*?)(?=<page>|\[封面\]|$)/i)
  if (visualGuideMatch && visualGuideMatch[1]) {
    const guideText = visualGuideMatch[1].trim()
    
    // 解析配色方案
    const primaryColorMatch = guideText.match(/主色调[：:\-]\s*([^\n，,]+)/)
    const secondaryColorMatch = guideText.match(/辅助色[：:\-]\s*([^\n]+)/)
    const primaryColor = primaryColorMatch ? primaryColorMatch[1].trim() : '柔和的色调'
    let secondaryColors: string[] = []
    if (secondaryColorMatch) {
      secondaryColors = secondaryColorMatch[1].split(/[，,、]/).map(c => c.trim()).filter(c => c)
    }
    
    // 解析字体风格
    const typographyMatch = guideText.match(/字体风格[：:\-]\s*([^\n]+)/)
    const typographyStyle = typographyMatch ? typographyMatch[1].trim() : '现代无衬线字体，清晰易读'
    
    // 解析布局风格
    const layoutMatch = guideText.match(/布局风格[：:\-]\s*([^\n]+)/)
    const layoutStyle = layoutMatch ? layoutMatch[1].trim() : '简洁布局，充足留白'
    
    // 解析装饰元素
    const decorativeMatch = guideText.match(/装饰元素[：:\-]\s*([^\n]+)/)
    const decorativeElements = decorativeMatch ? decorativeMatch[1].trim() : '极简线条，几何图形'
    
    // 解析整体美学
    const aestheticMatch = guideText.match(/整体美学[：:\-]\s*([^\n]+)/)
    const overallAesthetic = aestheticMatch ? aestheticMatch[1].trim() : '清新、简约、专业'
    
    visualGuide = {
      colorPalette: {
        primary: primaryColor,
        secondary: secondaryColors.length > 0 ? secondaryColors : ['浅灰色', '米白色']
      },
      typographyStyle,
      layoutStyle,
      decorativeElements,
      overallAesthetic
    }
    
    if (import.meta.env.DEV) {
      logger.debug('解析到的全局视觉指南:', visualGuide)
    }
  }
  
  // 解析大纲为页面数组
  let pages: Array<Page> = []
  
  // 移除全局视觉指南部分，只保留页面内容
  let outlineText = result.text
  if (visualGuideMatch) {
    outlineText = outlineText.replace(/【全局视觉指南】[\s\S]*?(?=<page>|\[封面\])/i, '').trim()
  }
  
  let pageTexts: string[] = []
  // 优先按 <page> 分割
  if (outlineText.includes('<page>')) {
    pageTexts = outlineText.split(/<page>/gi).map(s => s.trim()).filter(s => s)
  } else if (outlineText.includes('---')) {
    // 如果没有 <page> 标签，尝试按 --- 分割 (向后兼容)
    pageTexts = outlineText.split(/---/gi).map(s => s.trim()).filter(s => s)
  } else {
    // 如果都没有，按 [封面] [内容] [总结] 分割
    const sections = outlineText.split(/(?=\[(?:封面|内容|总结)\])/g)
    pageTexts = sections.map(s => s.trim()).filter(s => s)
  }
  
  let index = 0
  
  for (const pageText of pageTexts) {
    if (!pageText) continue
    
    let pageContent = pageText
    let pageType: Page['type'] = 'content'
    
    // 解析页面类型（支持：[封面]、[内容]、[总结] 标记）
    const typeMatch = pageContent.match(/^\[(\S+)\]/)
    if (typeMatch) {
      const typeCn = typeMatch[1]
      const typeMapping: Record<string, Page['type']> = {
        '封面': 'cover',
        '内容': 'content',
        '总结': 'summary'
      }
      pageType = typeMapping[typeCn] || 'content'
      // 移除类型标记行
      pageContent = pageContent.replace(/^\[(\S+)\]\s*\n?/, '')
    } else {
      // 兼容旧格式：type: cover
      const typeMatchOld = pageContent.match(/type:\s*(\w+)/i)
      if (typeMatchOld) {
        pageType = typeMatchOld[1] as Page['type']
        pageContent = pageContent.replace(/type:\s*\w+\s*\n?/i, '')
      }
    }
    
    // 提取视觉元数据（如果存在）
    let visualMetadata: Page['visualMetadata'] | undefined = undefined
    const visualMetadataMatch = pageContent.match(/【视觉元数据】([\s\S]*?)(?=\n\n|$)/i)
    if (visualMetadataMatch && visualMetadataMatch[1]) {
      const metadataText = visualMetadataMatch[1]
      
      // 解析主色调
      const primaryColorMatch = metadataText.match(/主色调[：:\-]\s*([^\n，,]+)/)
      const primaryColor = primaryColorMatch ? primaryColorMatch[1].trim() : undefined
      
      // 解析辅助色调
      const secondaryColorMatch = metadataText.match(/辅助色调[：:\-]\s*([^\n]+)/)
      let secondaryColors: string[] | undefined = undefined
      if (secondaryColorMatch) {
        secondaryColors = secondaryColorMatch[1].split(/[，,、]/).map(c => c.trim()).filter(c => c)
      }
      
      // 解析视觉重点
      const visualFocusMatch = metadataText.match(/视觉重点[：:\-]\s*([^\n]+)/)
      const visualFocus = visualFocusMatch ? visualFocusMatch[1].trim() : undefined
      
      // 解析布局模式
      const layoutPatternMatch = metadataText.match(/布局模式[：:\-]\s*([^\n]+)/)
      const layoutPattern = layoutPatternMatch ? layoutPatternMatch[1].trim() : undefined
      
      // 解析装饰风格
      const decorativeStyleMatch = metadataText.match(/装饰风格[：:\-]\s*([^\n]+)/)
      const decorativeStyle = decorativeStyleMatch ? decorativeStyleMatch[1].trim() : undefined
      
      visualMetadata = {
        primaryColor,
        secondaryColors,
        visualFocus,
        layoutPattern,
        decorativeStyle
      }
      
      // 从内容中移除视觉元数据部分
      pageContent = pageContent.replace(/【视觉元数据】[\s\S]*?(?=\n\n|$)/i, '').trim()
      
      if (import.meta.env.DEV) {
        logger.debug(`页面 ${index + 1} 提取视觉元数据:`, visualMetadata)
      }
    }
    
    // 提取内容（移除content:前缀如果存在）
    pageContent = pageContent.replace(/^content:\s*/i, '').trim()
    
    // 移除可能的 <page> 标签残留
    pageContent = pageContent.replace(/<\/?page>/gi, '').trim()
    
    // 提取配图建议（如果存在，支持多种格式）
    let imagePrompt: string | undefined = undefined
    let promptMatch = pageContent.match(/(?:配图建议|图片建议|建议配图)[：:\s]+\s*(.+?)(?=\n\n|\n$|$)/is)
    
    if (promptMatch && promptMatch[1]) {
      imagePrompt = promptMatch[1].trim()
      // 从内容中移除配图建议行，避免在内容中重复显示
      pageContent = pageContent.replace(/(?:配图建议|图片建议|建议配图)[：:\s]+.+?(?=\n\n|\n$|$)/is, '').trim()
    }
    
    if (import.meta.env.DEV) {
      logger.debug(`页面 ${index + 1} 提取配图建议:`, imagePrompt)
    }
    
    pages.push({
      index: index++,
      type: pageType,
      content: pageContent,
      imagePrompt: imagePrompt,
      visualMetadata: visualMetadata
    })
  }
  
  // 如果没有解析到页面，创建一个默认页面
  if (pages.length === 0) {
    pages.push({
      index: 0,
      type: 'content',
      content: result.text,
      imagePrompt: style && styleName
        ? `根据主题 "${topic}" 生成一张内容图片，符合「${styleName}」风格要求`
        : `根据主题 "${topic}" 生成一张内容图片`
    })
  }
  
  // 保证一定存在且只有一个封面页，且封面在第一页
  // 首先，找出所有封面页
  const coverPages = pages.filter(p => p.type === 'cover')
  
  // 移除所有封面页
  const nonCoverPages = pages.filter(p => p.type !== 'cover')
  
  // 确定要使用的封面页（优先使用第一个封面页，否则创建一个新的）
  let coverPage: Page
  if (coverPages.length > 0) {
    coverPage = coverPages[0]
  } else {
    coverPage = {
      index: 0,
      type: 'cover',
      content: `${topic}\n\n开始你的精彩内容之旅`,
      imagePrompt: style && styleName 
        ? `根据主题 "${topic}" 生成一张吸引人的封面图片，符合「${styleName}」风格要求`
        : `根据主题 "${topic}" 生成一张吸引人的封面图片`
    }
  }
  
  // 重新构建页面数组：封面页 + 非封面页
  pages = [coverPage, ...nonCoverPages]
  
  // 根据目标页面数量调整页面数量（严格等于目标值）
  if (targetPageCount !== undefined && targetPageCount > 0) {
    console.log('=== 页面数量调整前 ===')
    console.log('targetPageCount:', targetPageCount)
    console.log('current pages count:', pages.length)
    console.log('pages:', pages.map(p => ({ index: p.index, type: p.type })))
    
    // 直接按照目标数量重构页面数组
    const adjustedPages: Page[] = []
    
    // 特殊处理：目标数量为1时，只保留一个封面页
    if (targetPageCount === 1) {
      console.log('=== 头图模式特殊处理 ===')
      // 优先选择封面页
      const coverPage = pages.find(p => p.type === 'cover')
      if (coverPage) {
        adjustedPages.push(coverPage)
        console.log('保留封面页:', { index: coverPage.index, type: coverPage.type })
      } else {
        // 如果没有封面页，选择第一页
        adjustedPages.push(pages[0])
        console.log('没有封面页，选择第一页:', { index: pages[0].index, type: pages[0].type })
        // 将第一页的类型改为封面
        adjustedPages[0].type = 'cover'
      }
    } else {
      // 正常情况：保留封面页（如果有），然后保留前面的内容页
      // 1. 找出封面页
      const coverPage = pages.find(p => p.type === 'cover')
      if (coverPage) {
        adjustedPages.push(coverPage)
        console.log('保留封面页:', { index: coverPage.index, type: coverPage.type })
      }
      
      // 2. 计算需要的内容页数量
      const neededContentPages = targetPageCount - adjustedPages.length
      console.log('需要的内容页数量:', neededContentPages)
      
      // 3. 找出所有非封面页
      const nonCoverPages = pages.filter(p => p.type !== 'cover')
      console.log('非封面页数量:', nonCoverPages.length)
      
      // 4. 保留前面的内容页
      if (neededContentPages > 0) {
        const contentPagesToKeep = nonCoverPages.slice(0, neededContentPages)
        adjustedPages.push(...contentPagesToKeep)
        console.log('保留的内容页:', contentPagesToKeep.map(p => ({ index: p.index, type: p.type })))
      }
      
      // 5. 如果页面数量仍然不足，补充内容页
      while (adjustedPages.length < targetPageCount) {
        const newIndex = adjustedPages.length
        const newPage: Page = {
          index: newIndex,
          type: 'content',
          content: `第${newIndex + 1}页：深入探讨${topic}的相关内容，提供更多有价值的信息和见解。`,
          imagePrompt: style && styleName
            ? `根据页面内容和主题 "${topic}" 生成一张内容图片，符合「${styleName}」风格要求`
            : `根据页面内容和主题 "${topic}" 生成一张内容图片`
        }
        adjustedPages.push(newPage)
        console.log('补充内容页:', { index: newPage.index, type: newPage.type })
      }
    }
    
    // 更新页面数组
    pages = adjustedPages
    
    // 重新索引所有页面
    pages.forEach((page, idx) => {
      page.index = idx
    })
    
    console.log('=== 页面数量调整后 ===')
    console.log('adjusted pages count:', pages.length)
    console.log('adjusted pages:', pages.map(p => ({ index: p.index, type: p.type })))
  } else {
    // 如果没有指定目标数量，使用原来的逻辑：确保至少有 5 页内容页（不含封面和总结）
    while (pages.filter(p => p.type === 'content').length < 5) {
      const newIndex = pages.length
      pages.push({
        index: newIndex,
        type: 'content',
        content: `第${newIndex}页：深入探讨${topic}的相关内容，提供更多有价值的信息和见解。`,
        imagePrompt: style && styleName
          ? `根据页面内容和主题 "${topic}" 生成一张内容图片，符合「${styleName}」风格要求`
          : `根据页面内容和主题 "${topic}" 生成一张内容图片`
      })
    }
  }
  
  // 内容兜底：如果某些页内容为空，用主题生成默认文案，避免出现空白卡片
  pages.forEach((p) => {
    if (!p.content || !p.content.trim()) {
      if (p.type === 'cover') {
        p.content = `${topic}\n\n开始你的精彩内容之旅`
      } else if (p.type === 'summary') {
        // 使用更自然的表达，避免AI化
        p.content = `围绕主题「${topic}」的关键要点回顾，用生活化的方式帮助读者记住重点。`
      } else {
        p.content = `围绕主题「${topic}」补充一页有价值的内容，提供具体案例、技巧或注意事项。`
      }
    }
  })
  
  // 配图建议兜底：如果某些页没有配图建议，为其生成默认建议，避免编辑页下方为空
  // 生成风格相关的提示词（如果用户选择了风格）
  let styleHint = ''
  if (style && styleName) {
    styleHint = `，并符合「${styleName}」风格要求`
  }
  
  pages.forEach((p) => {
    if (!p.imagePrompt || !p.imagePrompt.trim()) {
      if (p.type === 'cover') {
        p.imagePrompt = `生成一张与主题「${topic}」相关的吸睛封面配图，突出标题和整体氛围${styleHint}。`
      } else if (p.type === 'summary') {
        p.imagePrompt = `生成一张与主题「${topic}」相关的配图，用清晰的信息图或要点列表的方式呈现关键信息${styleHint}。`
      } else {
        p.imagePrompt = `根据本页内容生成一张小红书风格的配图，突出关键信息和视觉对比效果${styleHint}。`
      }
    }
  })
  
  // 重新索引，保证 index 连续且与顺序一致
  pages.forEach((p, idx) => { p.index = idx })
  
  return {
    outline: result.text,
    pages: pages,
    visualGuide: visualGuide
  }
}

