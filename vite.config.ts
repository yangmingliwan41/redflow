import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 读取package.json获取版本号
import { readFileSync } from 'fs'
import { resolve } from 'path'

const packageJson = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8')
)

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    // 确保正确处理本地包的依赖
    dedupe: ['axios']
  },
  optimizeDeps: {
    include: ['axios'],
    // 排除 React Hook，因为我们不使用它
    exclude: ['@hongliu/image-generator/src/hooks']
  },
  define: {
    // 注入版本号和构建时间到应用中
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:12398',
        changeOrigin: true
      }
    }
  }
})





