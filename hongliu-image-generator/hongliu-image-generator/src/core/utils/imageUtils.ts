/**
 * 图片处理工具函数
 */

/**
 * 将File对象转换为Base64字符串
 * 
 * @param file 要转换的文件对象
 * @returns Promise<string> Base64编码的字符串（不包含data:前缀）
 * 
 * @example
 * ```typescript
 * const base64 = await fileToBase64(file);
 * // 返回: "iVBORw0KGgoAAAANSUhEUgAA..."
 * ```
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // 移除 "data:image/xxx;base64," 前缀
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 获取文件的MIME类型
 * 
 * @param file 文件对象
 * @returns 支持的MIME类型
 * 
 * @example
 * ```typescript
 * const mimeType = getMimeType(file);
 * // 返回: 'image/jpeg' | 'image/png' | 'image/webp'
 * ```
 */
export const getMimeType = (file: File): 'image/png' | 'image/jpeg' | 'image/webp' => {
  const type = file.type.toLowerCase();
  if (type === 'image/png') return 'image/png';
  if (type === 'image/jpeg' || type === 'image/jpg') return 'image/jpeg';
  if (type === 'image/webp') return 'image/webp';
  // 默认返回jpeg
  return 'image/jpeg';
};

/**
 * 从Markdown格式的文本中提取Base64图片数据
 * 
 * @param markdown Markdown格式的文本，包含图片链接
 * @returns Base64图片数据URL，如果未找到则返回null
 * 
 * @example
 * ```typescript
 * const markdown = '![image](data:image/png;base64,iVBORw0KGgo...)';
 * const imageUrl = extractBase64FromMarkdown(markdown);
 * // 返回: "data:image/png;base64,iVBORw0KGgo..."
 * ```
 */
export const extractBase64FromMarkdown = (markdown: string): string | null => {
  // 匹配格式: ![image](data:image/xxx;base64,xxxxx)
  const regex = /!\[image\]\(data:image\/[^;]+;base64,([^)]+)\)/;
  const match = markdown.match(regex);
  return match ? `data:image/png;base64,${match[1]}` : null;
};

/**
 * 下载图片到本地
 * 
 * @param dataUrl 图片的Data URL（base64格式）
 * @param filename 下载的文件名
 * 
 * @example
 * ```typescript
 * downloadImage('data:image/png;base64,...', '效果图.png');
 * ```
 */
export const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  // 临时添加到DOM，触发下载后移除
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 验证图片文件大小
 * 
 * @param file 要验证的文件对象
 * @param maxSizeMB 最大文件大小（MB），默认20MB
 * @returns 如果文件大小在限制内返回true，否则返回false
 * 
 * @example
 * ```typescript
 * if (validateImageSize(file, 10)) {
 *   // 文件小于10MB
 * }
 * ```
 */
export const validateImageSize = (file: File, maxSizeMB: number = 20): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
};

/**
 * 验证图片文件类型
 * 
 * @param file 要验证的文件对象
 * @returns 如果文件类型支持返回true，否则返回false
 * 
 * @example
 * ```typescript
 * if (validateImageType(file)) {
 *   // 文件类型支持
 * }
 * ```
 */
export const validateImageType = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  return validTypes.includes(file.type.toLowerCase());
};

/**
 * 验证图片文件（同时检查类型和大小）
 * 
 * @param file 要验证的文件对象
 * @param maxSizeMB 最大文件大小（MB），默认20MB
 * @returns 验证结果对象，包含是否有效和错误消息
 * 
 * @example
 * ```typescript
 * const result = validateImage(file, 10);
 * if (!result.valid) {
 *   console.error(result.error);
 * }
 * ```
 */
export const validateImage = (
  file: File,
  maxSizeMB: number = 20
): { valid: boolean; error?: string } => {
  if (!validateImageType(file)) {
    return {
      valid: false,
      error: '请上传 PNG、JPEG 或 WEBP 格式的图片',
    };
  }

  if (!validateImageSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `图片大小不能超过 ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

