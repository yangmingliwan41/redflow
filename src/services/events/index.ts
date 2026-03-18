/**
 * 事件系统统一导出
 */

export { EventEmitter } from './EventEmitter'
export { Events } from './events'

// 创建全局事件总线实例
import { EventEmitter } from './EventEmitter'
export const eventBus = new EventEmitter()


