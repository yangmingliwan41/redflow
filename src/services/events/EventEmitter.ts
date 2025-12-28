/**
 * 事件发射器实现
 * 支持发布-订阅模式，实现模块间解耦通信
 */

type EventHandler = (data: any) => void | Promise<void>

export class EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map()

  /**
   * 订阅事件
   */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  /**
   * 取消订阅事件
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.handlers.delete(event)
      }
    }
  }

  /**
   * 触发事件（支持异步处理）
   */
  async emit(event: string, data?: any): Promise<void> {
    const handlers = this.handlers.get(event)
    if (handlers && handlers.size > 0) {
      const promises = Array.from(handlers).map(handler => {
        try {
          return Promise.resolve(handler(data))
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
          return Promise.resolve()
        }
      })
      await Promise.all(promises)
    }
  }

  /**
   * 一次性订阅事件
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler = async (data: any) => {
      await handler(data)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event)
    } else {
      this.handlers.clear()
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.handlers.get(event)?.size || 0
  }
}


