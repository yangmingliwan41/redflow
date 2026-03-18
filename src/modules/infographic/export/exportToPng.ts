import * as htmlToImage from 'html-to-image'

type ExportOptions = {
  pixelRatio?: number
  backgroundColor?: string
  filename?: string
  /**
   * 额外等待的字体名（用于强制触发加载）
   * 例如：['Noto Sans SC']
   */
  ensureFonts?: string[]
}

async function waitForFonts(fontFamilies: string[]) {
  if (!('fonts' in document)) return

  const unique = Array.from(new Set(fontFamilies)).filter(Boolean)
  for (const family of unique) {
    try {
      // 触发字体加载（使用一段包含常见中文/符号的测试串）
      await (document as any).fonts.load(`16px "${family}"`, '中文测试￥¥（）【】—…')
    } catch {
      // ignore
    }
  }

  try {
    await (document as any).fonts.ready
  } catch {
    // ignore
  }
}

async function inlineImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[]
  const original = new Map<HTMLImageElement, string>()

  const toDataUrl = async (url: string) => {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' })
    if (!res.ok) throw new Error(`fetch image failed: ${res.status}`)
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('read blob failed'))
      reader.readAsDataURL(blob)
    })
  }

  await Promise.all(
    imgs.map(async (img) => {
      const src = img.currentSrc || img.src
      if (!src) return
      if (src.startsWith('data:')) return
      original.set(img, img.src)
      try {
        const dataUrl = await toDataUrl(src)
        img.src = dataUrl
      } catch {
        // 如果无法内联（CORS/网络），保持原样，让 html-to-image 自己处理或失败时提示
      }
    })
  )

  return () => {
    for (const [img, src] of original.entries()) {
      img.src = src
    }
  }
}

export async function exportElementToPng(el: HTMLElement, options: ExportOptions = {}) {
  const pixelRatio = options.pixelRatio ?? 2
  const backgroundColor = options.backgroundColor

  // 尽量避免导出时字体回退造成缺字/乱码
  await waitForFonts(['Noto Sans SC', ...(options.ensureFonts ?? [])])

  // 处理跨域图片：尽可能转 dataURL
  const restoreImages = await inlineImages(el)
  try {
    const rect = el.getBoundingClientRect()
    const dataUrl = await htmlToImage.toPng(el, {
      cacheBust: true,
      pixelRatio,
      backgroundColor,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      filter: (node) => {
        if (!(node instanceof HTMLElement)) return true
        return node.dataset.exportIgnore !== 'true'
      }
    })
    return dataUrl
  } finally {
    restoreImages()
  }
}

