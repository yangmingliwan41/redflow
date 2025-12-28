/**
 * 基础使用示例
 * 
 * 展示如何在React组件中使用图片生成模块
 */

import React, { useState } from 'react';
import {
  ImageApiService,
  useImageGenerator,
  buildPrompt,
  DEFAULT_STYLE_PRESETS,
  validateImage,
  downloadImage,
} from '../src';

// 初始化API服务
const imageApi = new ImageApiService({
  baseURL: 'https://api-integrations.appmiaoda.com/app-7ybw0mgoymtd/api-Xa6JZ58oPMEa',
  apiKey: import.meta.env.VITE_APP_ID,
  timeout: 300000,
});

function ImageGeneratorExample() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('none');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // 使用图片生成Hook
  const { generate, isGenerating, generatedImages, clearImages } = useImageGenerator({
    apiService: imageApi,
    onSuccess: (images) => {
      console.log('成功生成', images.length, '张图片');
    },
    onError: (error) => {
      console.error('生成失败:', error.message);
    },
    onItemError: (error, index) => {
      console.error(`第 ${index + 1} 张图片生成失败:`, error.message);
    },
  });

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证图片
    const result = validateImage(file, 20);
    if (!result.valid) {
      alert(result.error);
      return;
    }

    setReferenceImage(file);
  };

  // 处理生成
  const handleGenerate = async () => {
    if (!referenceImage) {
      alert('请先上传参考图片');
      return;
    }

    // 构建提示词
    const prompt = buildPrompt(
      '根据参考图片生成家居装修效果图',
      selectedStyle,
      customPrompt
    );

    // 生成图片
    await generate({
      referenceImage,
      prompt,
      batchCount: 1,
    });
  };

  // 处理下载
  const handleDownload = (imageUrl: string, imageId: string) => {
    downloadImage(imageUrl, `效果图-${imageId}.png`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>图片生成示例</h1>

      {/* 文件上传 */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          上传参考图片:
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
          />
        </label>
        {referenceImage && (
          <p>已选择: {referenceImage.name}</p>
        )}
      </div>

      {/* 风格选择 */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          选择风格:
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            {DEFAULT_STYLE_PRESETS.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* 自定义提示词 */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          自定义需求:
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="例如：增加绿植装饰，使用暖色调灯光..."
            rows={3}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </label>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !referenceImage}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
        }}
      >
        {isGenerating ? '生成中...' : '开始生成'}
      </button>

      {/* 清空按钮 */}
      {generatedImages.length > 0 && (
        <button
          onClick={clearImages}
          style={{ marginLeft: '10px', padding: '10px 20px' }}
        >
          清空结果
        </button>
      )}

      {/* 生成结果展示 */}
      {generatedImages.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>生成结果 ({generatedImages.length} 张)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {generatedImages.map((image) => (
              <div key={image.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
                <img
                  src={image.url}
                  alt="生成的图片"
                  style={{ width: '100%', height: 'auto' }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  {image.prompt}
                </p>
                <button
                  onClick={() => handleDownload(image.url, image.id)}
                  style={{ marginTop: '8px', padding: '5px 10px' }}
                >
                  下载
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGeneratorExample;

