import { useState, useCallback } from 'react';
import type ImageApiService from '../core/api/imageApi';
import { fileToBase64, getMimeType, extractBase64FromMarkdown } from '../core/utils/imageUtils';
import type { GeneratedImage, ImageGenerationParams } from '../types';

/**
 * useImageGenerator Hook的配置选项
 */
export interface UseImageGeneratorOptions {
  /** API服务实例 */
  apiService: ImageApiService;
  /** 生成成功时的回调函数 */
  onSuccess?: (images: GeneratedImage[]) => void;
  /** 生成失败时的回调函数 */
  onError?: (error: Error) => void;
  /** 单个图片生成失败时的回调函数 */
  onItemError?: (error: Error, index: number) => void;
}

/**
 * useImageGenerator Hook的返回值
 */
export interface UseImageGeneratorReturn {
  /** 生成图片的函数 */
  generate: (params: ImageGenerationParams) => Promise<void>;
  /** 是否正在生成中 */
  isGenerating: boolean;
  /** 已生成的图片列表 */
  generatedImages: GeneratedImage[];
  /** 清空已生成图片列表 */
  clearImages: () => void;
  /** 移除指定图片 */
  removeImage: (imageId: string) => void;
}

/**
 * 图片生成Hook
 * 
 * 提供图片生成的核心功能，包括批量生成、状态管理等
 * 
 * @param options Hook配置选项
 * @returns Hook返回值，包含生成函数和状态
 * 
 * @example
 * ```typescript
 * const { generate, isGenerating, generatedImages } = useImageGenerator({
 *   apiService: imageApi,
 *   onSuccess: (images) => console.log('生成成功', images),
 *   onError: (error) => console.error('生成失败', error),
 * });
 * 
 * await generate({
 *   referenceImage: file,
 *   prompt: '生成装修效果图',
 *   batchCount: 2,
 * });
 * ```
 */
export const useImageGenerator = (
  options: UseImageGeneratorOptions
): UseImageGeneratorReturn => {
  const { apiService, onSuccess, onError, onItemError } = options;
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  /**
   * 生成图片
   */
  const generate = useCallback(
    async (params: ImageGenerationParams) => {
      const { referenceImage, prompt, batchCount = 1 } = params;

      setIsGenerating(true);
      const successCount = { count: 0 };
      const newImages: GeneratedImage[] = [];
      const errors: Array<{ index: number; error: Error }> = [];

      try {
        // 将图片转换为base64
        const base64Data = await fileToBase64(referenceImage);
        const mimeType = getMimeType(referenceImage);

        // 创建批量生成任务
        const promises = Array.from({ length: batchCount }, async (_, index) => {
          try {
            // 调用API生成图片
            const response = await apiService.generateImage({
              contents: [
                {
                  parts: [
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: base64Data,
                      },
                    },
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            });

            // 检查响应状态
            if (response.status !== 0) {
              throw new Error(response.msg || '生成失败');
            }

            // 提取markdown中的图片数据
            const markdownText = response.candidates[0]?.content?.parts[0]?.text;
            if (!markdownText) {
              throw new Error('未能获取生成的效果图');
            }

            const imageUrl = extractBase64FromMarkdown(markdownText);
            if (!imageUrl) {
              throw new Error('无法解析生成的效果图');
            }

            // 创建生成的图片对象
            const newImage: GeneratedImage = {
              id: `${Date.now()}-${index}`,
              url: imageUrl,
              prompt,
              timestamp: Date.now(),
            };

            newImages.push(newImage);
            successCount.count++;
          } catch (error) {
            const err = error instanceof Error ? error : new Error('未知错误');
            errors.push({ index, error: err });
            onItemError?.(err, index);
          }
        });

        // 等待所有任务完成
        await Promise.all(promises);

        // 更新状态
        if (newImages.length > 0) {
          setGeneratedImages((prev) => [...newImages, ...prev]);
          onSuccess?.(newImages);
        }

        // 如果有错误且没有成功生成的图片，触发错误回调
        if (errors.length > 0 && newImages.length === 0) {
          const firstError = errors[0].error;
          onError?.(firstError);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('生成失败');
        onError?.(err);
      } finally {
        setIsGenerating(false);
      }
    },
    [apiService, onSuccess, onError, onItemError]
  );

  /**
   * 清空已生成的图片列表
   */
  const clearImages = useCallback(() => {
    setGeneratedImages([]);
  }, []);

  /**
   * 移除指定图片
   */
  const removeImage = useCallback((imageId: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  return {
    generate,
    isGenerating,
    generatedImages,
    clearImages,
    removeImage,
  };
};

