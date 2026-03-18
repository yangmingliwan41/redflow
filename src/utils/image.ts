/**
 * 图片处理工具函数
 */

// 从 @hongliu/image-generator 模块导入工具函数（直接从子模块导入，避免加载 React Hook）
import {
  fileToBase64 as moduleFileToBase64,
  validateImage as moduleValidateImage,
  validateImageSize as moduleValidateImageSize,
  validateImageType as moduleValidateImageType,
  getMimeType as moduleGetMimeType,
  downloadImage as moduleDownloadImage,
  extractBase64FromMarkdown as moduleExtractBase64FromMarkdown
} from '@hongliu/image-generator/src/core/utils/imageUtils'

/**
 * 压缩图片
 */
export function compressImage(
  source: string | File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (src: string) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height
        
        if (w > maxWidth) {
          h = (h * maxWidth) / w
          w = maxWidth
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context unavailable'))
          return
        }
        
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Image load failed during compression'))
      img.src = src
    }

    if (source instanceof File) {
      const reader = new FileReader()
      reader.onload = (e) => processImage(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(source)
    } else {
      processImage(source)
    }
  })
}

/**
 * 将 File 转换为 base64（返回完整 data URL，保持向后兼容）
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 将 File 转换为纯 base64 字符串（不包含 data: 前缀）
 * 使用模块提供的函数
 */
export async function fileToBase64String(file: File): Promise<string> {
  return await moduleFileToBase64(file)
}

/**
 * 验证图片文件（使用模块提供的函数）
 * @param file 要验证的文件
 * @param maxSizeMB 最大文件大小（MB），默认20MB
 */
export function validateImage(
  file: File,
  maxSizeMB: number = 20
): { valid: boolean; error?: string } {
  return moduleValidateImage(file, maxSizeMB)
}

/**
 * 验证图片文件大小
 */
export function validateImageSize(file: File, maxSizeMB: number = 20): boolean {
  return moduleValidateImageSize(file, maxSizeMB)
}

/**
 * 验证图片文件类型
 */
export function validateImageType(file: File): boolean {
  return moduleValidateImageType(file)
}

/**
 * 获取文件的 MIME 类型
 */
export function getMimeType(file: File): 'image/png' | 'image/jpeg' | 'image/webp' {
  return moduleGetMimeType(file)
}

/**
 * 下载图片到本地
 */
export function downloadImage(dataUrl: string, filename: string): void {
  return moduleDownloadImage(dataUrl, filename)
}

/**
 * 从 Markdown 格式的文本中提取 Base64 图片数据
 */
export function extractBase64FromMarkdown(markdown: string): string | null {
  return moduleExtractBase64FromMarkdown(markdown)
}

/**
 * 将 File 转换为 GenerativePart 格式（用于 Google GenAI API）
 */
export async function fileToGenerativePart(
  file: File
): Promise<{ mimeType: string; data: string }> {
  const base64 = await fileToBase64(file)
  // 移除 data:image/...;base64, 前缀
  const data = base64.split(',')[1] || base64
  return {
    mimeType: file.type || 'image/jpeg',
    data
  }
}





