/**
 * 存储适配器工厂
 * 根据配置选择不同的适配器实现
 */

import { StorageAdapter } from './adapters/StorageAdapter'
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter'

export type StorageAdapterType = 'localStorage' | 'indexedDB' | 'api'

let currentAdapter: StorageAdapter | null = null

/**
 * 创建存储适配器
 */
export function createStorageAdapter(type: StorageAdapterType = 'localStorage'): StorageAdapter {
  switch (type) {
    case 'localStorage':
      return new LocalStorageAdapter()
    case 'indexedDB':
      // 未来实现
      throw new Error('IndexedDB adapter not implemented yet')
    case 'api':
      // 未来实现
      throw new Error('API adapter not implemented yet')
    default:
      return new LocalStorageAdapter()
  }
}

/**
 * 获取当前存储适配器实例（单例模式）
 */
export function getStorageAdapter(): StorageAdapter {
  if (!currentAdapter) {
    currentAdapter = createStorageAdapter('localStorage')
  }
  return currentAdapter
}

/**
 * 设置存储适配器
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter
}


