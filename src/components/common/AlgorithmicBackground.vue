<template>
  <div ref="containerRef" class="algorithmic-background" :class="{ 'interactive': interactive }" :style="{ opacity: opacity }">
    <!-- p5.js 会自动创建 canvas -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { AlgorithmMode } from '../../config/algorithmicThemes'

interface Props {
  /** 算法模式 */
  mode?: AlgorithmMode
  /** 是否启用交互（鼠标跟随） */
  interactive?: boolean
  /** 粒子数量 */
  particleCount?: number
  /** 动画速度 */
  speed?: number
  /** 颜色主题 */
  colorTheme?: 'red' | 'blue' | 'purple' | 'gradient'
  /** 是否自动播放动画 */
  animated?: boolean
  /** 噪声缩放（用于流场和噪声场） */
  noiseScale?: number
  /** 场强度（用于流场） */
  fieldStrength?: number
  /** 连接距离（用于粒子系统） */
  connectionDistance?: number
  /** 分形深度（用于分形系统） */
  fractalDepth?: number
  /** 透明度 */
  opacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'particleSystem',
  interactive: true,
  particleCount: 80,
  speed: 1,
  colorTheme: 'red',
  animated: true,
  noiseScale: 0.01,
  fieldStrength: 0.3,
  connectionDistance: 120,
  fractalDepth: 5,
  opacity: 0.6
})

const containerRef = ref<HTMLDivElement | null>(null)

let p5Instance: any = null
let isMounted = true
let resizeObserver: ResizeObserver | null = null

// 动态加载 p5.js
const loadP5 = async () => {
  if (typeof window !== 'undefined' && !(window as any).p5) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
}

// 获取颜色主题
const getThemeColors = () => {
  const themes = {
    red: {
      primary: '#FF2442',
      secondary: '#FF4D6A',
      accent: '#FF2442',
      bg: 'rgba(255, 36, 66, 0.03)'
    },
    blue: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.03)'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.03)'
    },
    gradient: {
      primary: '#FF2442',
      secondary: '#8B5CF6',
      accent: '#3B82F6',
      bg: 'rgba(255, 36, 66, 0.02)'
    }
  }
  return themes[props.colorTheme] || themes.red
}

onMounted(async () => {
  if (!containerRef.value) return
  
  isMounted = true

  await loadP5()

  if (!(window as any).p5) {
    console.warn('p5.js 加载失败')
    return
  }

  const p5 = (window as any).p5
  const colors = getThemeColors()

  // p5.js sketch
  const sketch = (p: any) => {
    const particles: any[] = []
    let mouseX = 0
    let mouseY = 0
    let flowField: any[] = []
    const fieldResolution = 20

    // 粒子类
    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      maxSize: number
      minSize: number
      opacity: number
      baseX: number
      baseY: number
      prevX: number
      prevY: number
      age: number
      maxAge: number
      // 轨道参数
      orbitCenterX: number
      orbitCenterY: number
      orbitRadiusX: number
      orbitRadiusY: number
      orbitAngle: number
      orbitSpeed: number
      orbitType: number  // 0: 椭圆, 1: 螺旋, 2: 利萨如曲线

      constructor() {
        this.baseX = p.random(p.width)
        this.baseY = p.random(p.height)
        this.x = this.baseX
        this.y = this.baseY
        this.prevX = this.x
        this.prevY = this.y
        this.vx = p.random(-0.5, 0.5) * props.speed
        this.vy = p.random(-0.5, 0.5) * props.speed
        this.maxSize = p.random(2, 4)
        this.minSize = this.maxSize * 0.3
        this.size = p.random(this.minSize, this.maxSize)
        this.opacity = p.random(0.1, 0.4)
        this.age = 0
        this.maxAge = p.random(200, 400)
        
        // 初始化轨道参数
        this.orbitCenterX = p.random(p.width * 0.2, p.width * 0.8)
        this.orbitCenterY = p.random(p.height * 0.2, p.height * 0.8)
        this.orbitRadiusX = p.random(80, 200)
        this.orbitRadiusY = p.random(60, 180)
        this.orbitAngle = p.random(0, p.TWO_PI)
        this.orbitSpeed = p.random(0.005, 0.015) * props.speed  // 降低速度：从0.01-0.03改为0.005-0.015
        this.orbitType = p.floor(p.random(3))  // 0, 1, 或 2
      }

      update() {
        this.prevX = this.x
        this.prevY = this.y
        
        if (props.mode === 'flowField') {
          this.updateFlowField(p)
        } else if (props.mode === 'noiseField') {
          this.updateNoiseField(p)
        } else {
          this.updateParticleSystem(p)
        }

        this.age++
        if (this.age > this.maxAge) {
          this.reset(p)
        }
      }

      updateFlowField(p: any) {
        // 更新轨道角度
        this.orbitAngle += this.orbitSpeed
        
        // 根据轨道类型计算位置
        let targetX: number, targetY: number
        
        if (this.orbitType === 0) {
          // 椭圆轨道
          targetX = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadiusX
          targetY = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadiusY
        } else if (this.orbitType === 1) {
          // 螺旋轨道
          const spiralRadius = this.orbitRadiusX * (1 + this.orbitAngle * 0.05)  // 降低螺旋增长速度：从0.1改为0.05
          targetX = this.orbitCenterX + Math.cos(this.orbitAngle) * spiralRadius
          targetY = this.orbitCenterY + Math.sin(this.orbitAngle) * spiralRadius
          // 重置螺旋以避免无限增长
          if (spiralRadius > Math.max(p.width, p.height) * 0.8) {
            this.orbitAngle = 0
            this.orbitCenterX = p.random(p.width * 0.2, p.width * 0.8)
            this.orbitCenterY = p.random(p.height * 0.2, p.height * 0.8)
          }
        } else {
          // 利萨如曲线（Lissajous curve）- 更复杂的优美曲线
          const freqX = 2
          const freqY = 3
          targetX = this.orbitCenterX + Math.cos(this.orbitAngle * freqX) * this.orbitRadiusX
          targetY = this.orbitCenterY + Math.sin(this.orbitAngle * freqY) * this.orbitRadiusY
        }
        
        // 平滑移动到目标位置（创建流畅的弧线）
        const lerpFactor = 0.05  // 进一步降低平滑度：从0.08改为0.05
        this.x = p.lerp(this.x, targetX, lerpFactor)
        this.y = p.lerp(this.y, targetY, lerpFactor)
        
        // 计算速度用于交互
        this.vx = targetX - this.x
        this.vy = targetY - this.y

        // 边界处理：环绕
        if (this.x < 0) { 
          this.x = p.width
          this.orbitCenterX = p.width - this.orbitRadiusX
        }
        if (this.x > p.width) { 
          this.x = 0
          this.orbitCenterX = this.orbitRadiusX
        }
        if (this.y < 0) { 
          this.y = p.height
          this.orbitCenterY = p.height - this.orbitRadiusY
        }
        if (this.y > p.height) { 
          this.y = 0
          this.orbitCenterY = this.orbitRadiusY
        }

        // 鼠标交互 - 轻微影响轨道中心
        if (props.interactive) {
          const dx = mouseX - this.orbitCenterX
          const dy = mouseY - this.orbitCenterY
          const distance = p.dist(mouseX, mouseY, this.orbitCenterX, this.orbitCenterY)
          const maxDistance = 200

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance * 0.3
            this.orbitCenterX += dx * force * 0.01
            this.orbitCenterY += dy * force * 0.01
          }
        }
      }

      updateNoiseField(p: any) {
        const time = p.millis() * 0.0003 * props.speed
        const noiseX = p.noise(this.x * props.noiseScale, time) * p.TWO_PI * 4
        const noiseY = p.noise(this.y * props.noiseScale, time + 1000) * p.TWO_PI * 4
        
        this.vx = Math.cos(noiseX) * props.speed
        this.vy = Math.sin(noiseY) * props.speed

        this.x += this.vx
        this.y += this.vy

        // 边界回弹
        if (this.x < 0 || this.x > p.width) this.vx *= -1
        if (this.y < 0 || this.y > p.height) this.vy *= -1
        this.x = p.constrain(this.x, 0, p.width)
        this.y = p.constrain(this.y, 0, p.height)
      }

      updateParticleSystem(p: any) {
        const time = p.millis() * 0.0003 * props.speed
        this.baseX += p.map(p.noise(this.baseX * 0.01, time), 0, 1, -0.3, 0.3) * props.speed
        this.baseY += p.map(p.noise(this.baseY * 0.01, time + 1000), 0, 1, -0.3, 0.3) * props.speed

        // 边界回弹
        if (this.baseX < 0) this.baseX = p.width
        if (this.baseX > p.width) this.baseX = 0
        if (this.baseY < 0) this.baseY = p.height
        if (this.baseY > p.height) this.baseY = 0

        // 鼠标交互
        if (props.interactive) {
          const dx = mouseX - this.x
          const dy = mouseY - this.y
          const distance = p.dist(mouseX, mouseY, this.x, this.y)
          const maxDistance = 150

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance
            this.baseX -= (dx / distance) * force * 2
            this.baseY -= (dy / distance) * force * 2
          }
        }

        // 平滑插值
        this.x = p.lerp(this.x, this.baseX, 0.05)
        this.y = p.lerp(this.y, this.baseY, 0.05)

        // 大小脉动
        const pulse = p.sin(p.millis() * 0.003 + this.baseX * 0.01) * 0.5 + 0.5
        this.size = p.map(pulse, 0, 1, this.minSize, this.maxSize)
      }

      reset(p: any) {
        this.baseX = p.random(p.width)
        this.baseY = p.random(p.height)
        this.x = this.baseX
        this.y = this.baseY
        this.prevX = this.x
        this.prevY = this.y
        this.age = 0
        this.maxAge = p.random(200, 400)
        
        // 重置轨道参数
        this.orbitCenterX = p.random(p.width * 0.2, p.width * 0.8)
        this.orbitCenterY = p.random(p.height * 0.2, p.height * 0.8)
        this.orbitRadiusX = p.random(80, 200)
        this.orbitRadiusY = p.random(60, 180)
        this.orbitAngle = p.random(0, p.TWO_PI)
        this.orbitSpeed = p.random(0.005, 0.015) * props.speed  // 降低速度：从0.01-0.03改为0.005-0.015
        this.orbitType = p.floor(p.random(3))
      }

      display(p: any) {
        p.push()
        
        // 根据主题选择颜色
        let fillColor
        if (props.colorTheme === 'gradient') {
          p.colorMode(p.HSB, 360, 100, 100, 255)
          const hue = p.map(this.x, 0, p.width, 0, 360)
          fillColor = p.color(hue % 360, 70, 90, this.opacity * 255)
          p.colorMode(p.RGB, 255, 255, 255, 255)
        } else {
          const primaryColor = p.color(colors.primary)
          const r = p.red(primaryColor)
          const g = p.green(primaryColor)
          const b = p.blue(primaryColor)
          fillColor = p.color(r, g, b, this.opacity * 255)
        }

        if (props.mode === 'flowField') {
          // 流场模式：绘制流畅的曲线轨迹
          p.stroke(fillColor)
          p.strokeWeight(1.5)
          p.noFill()
          
          // 使用曲线连接前后位置，创建更流畅的弧线
          const midX = (this.prevX + this.x) / 2
          const midY = (this.prevY + this.y) / 2
          
          // 计算控制点，使曲线更优美
          const dx = this.x - this.prevX
          const dy = this.y - this.prevY
          const perpX = -dy * 0.3
          const perpY = dx * 0.3
          
          const cp1X = this.prevX + dx * 0.3 + perpX
          const cp1Y = this.prevY + dy * 0.3 + perpY
          const cp2X = this.x - dx * 0.3 + perpX
          const cp2Y = this.y - dy * 0.3 + perpY
          
          // 使用贝塞尔曲线绘制流畅的弧线
          p.beginShape()
          p.vertex(this.prevX, this.prevY)
          p.bezierVertex(cp1X, cp1Y, cp2X, cp2Y, this.x, this.y)
          p.endShape()
        } else {
          // 其他模式：绘制粒子
          p.fill(fillColor)
          p.noStroke()
          p.circle(this.x, this.y, this.size)
        }
        
        p.pop()
      }
    }

    // 分形递归函数
    const drawFractal = (p: any, x: number, y: number, size: number, depth: number, angle: number) => {
      if (depth <= 0) return

      const primaryColor = p.color(colors.primary)
      const r = p.red(primaryColor)
      const g = p.green(primaryColor)
      const b = p.blue(primaryColor)
      const alpha = p.map(depth, 0, props.fractalDepth, 50, 200)
      
      p.push()
      p.translate(x, y)
      p.rotate(angle)
      
      if (props.colorTheme === 'gradient') {
        p.colorMode(p.HSB, 360, 100, 100, 255)
        const hue = p.map(depth, 0, props.fractalDepth, 0, 360)
        p.stroke(hue % 360, 70, 90, alpha)
        p.colorMode(p.RGB, 255, 255, 255, 255)
      } else {
        p.stroke(r, g, b, alpha)
      }
      
      p.strokeWeight(p.map(depth, 0, props.fractalDepth, 0.5, 2))
      p.noFill()
      
      // 绘制分形形状
      p.beginShape()
      for (let i = 0; i < 6; i++) {
        const angle = (p.TWO_PI / 6) * i
        const px = Math.cos(angle) * size
        const py = Math.sin(angle) * size
        p.vertex(px, py)
      }
      p.endShape(p.CLOSE)
      
      p.pop()

      // 递归
      if (depth > 1) {
        const newSize = size * 0.6
        const newAngle = angle + p.PI / 6
        const time = p.millis() * 0.001 * props.speed
        
        for (let i = 0; i < 3; i++) {
          const branchAngle = (p.TWO_PI / 3) * i + newAngle
          const branchX = x + Math.cos(branchAngle) * size * 0.5
          const branchY = y + Math.sin(branchAngle) * size * 0.5
          drawFractal(p, branchX, branchY, newSize, depth - 1, newAngle + time * 0.1)
        }
      }
    }

    // 初始化流场
    const initFlowField = (p: any) => {
      const cols = Math.floor(p.width / fieldResolution)
      const rows = Math.floor(p.height / fieldResolution)
      flowField = []
      
      const time = p.millis() * 0.0001
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const angle = p.noise(x * props.noiseScale, y * props.noiseScale, time) * p.TWO_PI * 4
          flowField.push(angle)
        }
      }
    }

    p.setup = () => {
      try {
        if (!isMounted) return
        
        const container = containerRef.value
        if (!container) return

        // 始终使用整个视口尺寸，确保 canvas 全屏覆盖，不受滚动影响
        const width = window.innerWidth
        const height = window.innerHeight

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/df193cad-ae2e-4546-8fb3-46364864265f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AlgorithmicBackground.vue:p.setup',
            message: 'Canvas setup - fullscreen dimensions',
            data: {
              canvasDrawSize: { width, height },
              windowSize: { width: window.innerWidth, height: window.innerHeight },
              scrollY: window.scrollY,
              documentHeight: document.documentElement.scrollHeight
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'A'
          })
        }).catch(() => {})
        // #endregion

        const canvas = p.createCanvas(width, height)
        canvas.parent(container)
        p.pixelDensity(1)
        
        // 强制设置 canvas 样式，确保全屏固定定位，不受滚动影响
        // 使用 nextTick 确保 DOM 已更新
        setTimeout(() => {
          const canvasEl = canvas.elt as HTMLCanvasElement
          if (canvasEl) {
            // 移除所有可能影响定位的样式
            canvasEl.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              z-index: 0 !important;
              display: block !important;
            `
          }
        }, 0)

        // #region agent log
        setTimeout(() => {
          const canvasEl = container.querySelector('canvas')
          if (canvasEl) {
            const canvasRect = canvasEl.getBoundingClientRect()
            const canvasStyle = window.getComputedStyle(canvasEl)
            fetch('http://127.0.0.1:7242/ingest/df193cad-ae2e-4546-8fb3-46364864265f', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'AlgorithmicBackground.vue:p.setup-after',
                message: 'Canvas created - actual dimensions',
                data: {
                  canvasDrawSize: { width: canvasEl.width, height: canvasEl.height },
                  canvasDisplaySize: { width: canvasRect.width, height: canvasRect.height },
                  canvasStyle: {
                    width: canvasStyle.width,
                    height: canvasStyle.height,
                    position: canvasStyle.position,
                    top: canvasStyle.top,
                    left: canvasStyle.left
                  },
                  sizeMismatch: {
                    width: Math.abs(canvasEl.width - canvasRect.width),
                    height: Math.abs(canvasEl.height - canvasRect.height)
                  }
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'A'
              })
            }).catch(() => {})
          }
        }, 100)
        // #endregion

        // 设置噪声种子
        p.noiseSeed(42)

        // 初始化流场（如果需要）
        if (props.mode === 'flowField') {
          initFlowField(p)
        }

        // 初始化粒子（分形模式不需要）
        if (props.mode !== 'fractal') {
          for (let i = 0; i < props.particleCount; i++) {
            particles.push(new Particle())
          }
        }
      } catch (error) {
        console.warn('p5 setup 出错:', error)
      }
    }

    p.draw = () => {
      try {
        if (!isMounted || !props.animated || !containerRef.value) {
          p.noLoop()
          return
        }

        // 半透明背景（创建拖尾效果）
        p.push()
        p.fill(255, 255, 255, 8)
        p.rect(0, 0, p.width, p.height)
        p.pop()

        if (props.mode === 'fractal') {
          // 分形模式
          p.push()
          p.translate(p.width / 2, p.height / 2)
          const time = p.millis() * 0.001 * props.speed
          drawFractal(p, 0, 0, Math.min(p.width, p.height) * 0.3, props.fractalDepth, time)
          p.pop()
        } else {
          // 更新流场（流场模式）
          if (props.mode === 'flowField') {
            initFlowField(p)
          }

          // 更新和绘制粒子
          particles.forEach(particle => {
            particle.update()
            particle.display(p)
          })

          // 绘制连接线（粒子系统和噪声场模式）
          if (props.mode === 'particleSystem' || props.mode === 'noiseField') {
            p.push()
            p.strokeWeight(0.5)
            const maxDist = props.connectionDistance
            const maxDistSq = maxDist * maxDist
            
            for (let i = 0; i < particles.length; i++) {
              for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x
                const dy = particles[i].y - particles[j].y
                const distSq = dx * dx + dy * dy

                if (distSq < maxDistSq) {
                  const distance = p.sqrt(distSq)
                  const opacity = p.map(distance, 0, maxDist, 0.2, 0)
                  let lineColor: any
                  
                  if (props.colorTheme === 'gradient') {
                    const t = i / particles.length
                    const color1 = p.color(colors.primary)
                    const color2 = p.color(colors.secondary)
                    lineColor = p.lerpColor(color1, color2, t)
                  } else {
                    lineColor = p.color(colors.primary)
                  }

                  p.stroke(
                    p.red(lineColor),
                    p.green(lineColor),
                    p.blue(lineColor),
                    opacity * 255
                  )
                  p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y)
                }
              }
            }
            p.pop()
          }
        }
      } catch (error) {
        p.noLoop()
      }
    }

    p.windowResized = () => {
      try {
        if (!isMounted) return
        
        const container = containerRef.value
        if (!container) return

        // 始终使用整个视口尺寸，确保 canvas 全屏覆盖，不受滚动影响
        const width = window.innerWidth
        const height = window.innerHeight
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/df193cad-ae2e-4546-8fb3-46364864265f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AlgorithmicBackground.vue:p.windowResized',
            message: 'Window resized - fullscreen canvas resize',
            data: {
              newCanvasSize: { width, height },
              windowSize: { width: window.innerWidth, height: window.innerHeight },
              scrollY: window.scrollY
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            runId: 'run1',
            hypothesisId: 'B'
          })
        }).catch(() => {})
        // #endregion
        
        p.resizeCanvas(width, height)
        
        // 强制设置 canvas 样式，确保全屏固定定位，不受滚动影响
        setTimeout(() => {
          const canvasEl = p.canvas?.elt as HTMLCanvasElement
          if (canvasEl) {
            // 移除所有可能影响定位的样式
            canvasEl.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
              z-index: 0 !important;
              display: block !important;
            `
          }
        }, 0)
        
        // #region agent log
        setTimeout(() => {
          const canvasEl = container.querySelector('canvas')
          if (canvasEl) {
            const canvasRect = canvasEl.getBoundingClientRect()
            fetch('http://127.0.0.1:7242/ingest/df193cad-ae2e-4546-8fb3-46364864265f', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'AlgorithmicBackground.vue:p.windowResized-after',
                message: 'Canvas resized - actual dimensions',
                data: {
                  canvasDrawSize: { width: canvasEl.width, height: canvasEl.height },
                  canvasDisplaySize: { width: canvasRect.width, height: canvasRect.height },
                  sizeMismatch: {
                    width: Math.abs(canvasEl.width - canvasRect.width),
                    height: Math.abs(canvasEl.height - canvasRect.height)
                  }
                },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                runId: 'run1',
                hypothesisId: 'B'
              })
            }).catch(() => {})
          }
        }, 100)
        // #endregion
        
        // 重新初始化流场
        if (props.mode === 'flowField') {
          initFlowField(p)
        }
      } catch (error) {
        // 忽略错误
      }
    }

    p.mouseMoved = () => {
      if (props.interactive) {
        mouseX = p.mouseX
        mouseY = p.mouseY
      }
    }

    p.touchMoved = () => {
      if (props.interactive) {
        mouseX = p.mouseX
        mouseY = p.mouseY
        return false
      }
    }
  }

  // 创建 p5 实例
  try {
    p5Instance = new p5(sketch)
  } catch (error) {
    console.error('创建 p5 实例失败:', error)
    p5Instance = null
  }
})

// 监听侧边栏状态变化，重新调整 canvas 尺寸
const handleSidebarToggle = () => {
  if (p5Instance && p5Instance.windowResized) {
    // 延迟执行，确保布局已经更新
    setTimeout(() => {
      try {
        p5Instance.windowResized()
      } catch (error) {
        console.warn('调整 canvas 尺寸时出错:', error)
      }
    }, 100)
  }
}

onMounted(() => {
  // 监听侧边栏切换事件
  window.addEventListener('sidebar-toggle', handleSidebarToggle)
  
  // 使用 ResizeObserver 监听容器尺寸变化
  if (containerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (p5Instance && p5Instance.windowResized) {
        try {
          p5Instance.windowResized()
        } catch (error) {
          console.warn('ResizeObserver 调整 canvas 尺寸时出错:', error)
        }
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  isMounted = false
  
  // 移除事件监听器
  window.removeEventListener('sidebar-toggle', handleSidebarToggle)
  
  // 清理 ResizeObserver
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
    resizeObserver.disconnect()
    resizeObserver = null
  }
  
  if (p5Instance) {
    try {
      if (p5Instance.noLoop) {
        p5Instance.noLoop()
      }
      setTimeout(() => {
        if (p5Instance && p5Instance.remove) {
          p5Instance.remove()
        }
      }, 0)
    } catch (error) {
      console.warn('清理 p5 实例时出错:', error)
    }
    p5Instance = null
  }
})

// 监听属性变化
watch(() => props.animated, (newVal) => {
  if (isMounted && p5Instance && containerRef.value) {
    try {
      if (p5Instance.isLooping !== undefined) {
        if (newVal) {
          p5Instance.loop()
        } else {
          p5Instance.noLoop()
        }
      }
    } catch (error) {
      console.warn('切换动画状态时出错:', error)
    }
  }
})
</script>

<style scoped>
.algorithmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  transition: opacity 0.3s ease;
  border: none;
  outline: none;
  box-shadow: none;
  margin: 0;
  padding: 0;
}

.algorithmic-background.interactive {
  pointer-events: auto;
}

.algorithmic-background:hover {
  opacity: calc(var(--algorithmic-bg-opacity) * 0.4) !important;
}

.algorithmic-background canvas {
  display: block !important;
  width: 100vw !important;
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  object-fit: fill !important;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 0 !important;
}

@media (max-width: 768px) {
  .algorithmic-background {
    opacity: calc(var(--algorithmic-bg-opacity) * 0.2) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .algorithmic-background {
    opacity: calc(var(--algorithmic-bg-opacity) * 0.15) !important;
  }
}
</style>
