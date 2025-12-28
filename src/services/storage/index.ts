/**
 * 存储服务统一导出
 */

// 导出适配器相关
export * from './adapters/StorageAdapter'
export * from './adapters/LocalStorageAdapter'
export * from './factory'

// 导出原有服务（保持向后兼容）
export * from './user'
export * from './history'

// 导出存储适配器实例（推荐使用）
import { getStorageAdapter } from './factory'
export const storage = getStorageAdapter()





