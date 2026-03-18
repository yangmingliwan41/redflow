import { v4 as uuidv4 } from 'uuid'
import { User, UserRole, GeneratedResult } from '../types'

const USERS_KEY = 'redflow_users'
const CURRENT_USER_KEY = 'redflow_current_user'
const HISTORY_KEY_PREFIX = 'redflow_history_'

const compressImage = (source: string | File, maxWidth = 800, quality = 0.7): Promise<string> => {
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

export const registerUser = (username: string, email: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY)
  const users: User[] = usersStr ? JSON.parse(usersStr) : []

  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists')
  }

  const role = users.length === 0 ? UserRole.ADMIN : UserRole.USER

  const newUser: User = {
    id: uuidv4(),
    username,
    email,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    totalTokenUsage: 0
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return newUser
}

export const loginUser = (email: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY)
  const users: User[] = usersStr ? JSON.parse(usersStr) : []
  
  const user = users.find(u => u.email === email)
  if (!user) {
    throw new Error('User not found')
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export const updateUserTokenUsage = (userId: string, additionalTokens: number) => {
  const usersStr = localStorage.getItem(USERS_KEY)
  const users: User[] = usersStr ? JSON.parse(usersStr) : []
  
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex >= 0) {
    users[userIndex].totalTokenUsage = (users[userIndex].totalTokenUsage || 0) + additionalTokens
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      currentUser.totalTokenUsage = users[userIndex].totalTokenUsage
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser))
    }
  }
}

export const saveHistoryItem = async (userId: string, result: GeneratedResult) => {
  try {
    console.log('=== saveHistoryItem 开始 ===')
    console.log('用户ID:', userId)
    console.log('记录ID:', result.id)
    console.log('模式:', result.mode)
    console.log('完整结果对象:', result)
    
    if (!userId) {
      console.error('❌ 用户ID为空，无法保存历史记录')
      return
    }
    
    const key = `${HISTORY_KEY_PREFIX}${userId}`
    console.log('localStorage key:', key)
    
    const historyStr = localStorage.getItem(key)
    let history: GeneratedResult[] = historyStr ? JSON.parse(historyStr) : []
    console.log('当前历史记录数量:', history.length)

    // 对于文本生成图文模式，图片数据在 pages 中，不需要压缩 originalImageUrl
    let storedOriginalImage = result.originalImageUrl
    if (result.mode === 'IMAGE_TO_IMAGE' && (result.originalImageFile || result.originalImageUrl)) {
      try {
        console.log('压缩原始图片...')
        storedOriginalImage = await compressImage(result.originalImageFile || result.originalImageUrl)
        console.log('原始图片压缩完成')
      } catch (e) {
        console.warn("Original image compression failed", e)
        storedOriginalImage = result.originalImageUrl // 使用原始URL
      }
    } else if (result.mode === 'TEXT_TO_IMAGE') {
      // 文本生成图文模式，使用第一张生成的图片作为封面
      if (result.pages && result.pages.length > 0 && result.pages[0]?.imageUrl) {
        storedOriginalImage = result.pages[0].imageUrl
        console.log('使用第一页图片作为封面:', storedOriginalImage.substring(0, 50) + '...')
      }
    }

    let storedGeneratedImage = result.generatedImageUrl
    if (result.mode === 'IMAGE_TO_IMAGE' && result.generatedImageUrl) {
      try {
        console.log('压缩生成图片...')
        storedGeneratedImage = await compressImage(result.generatedImageUrl)
        console.log('生成图片压缩完成')
      } catch (e) {
        console.warn("Generated image compression failed", e)
        storedGeneratedImage = result.generatedImageUrl // 使用原始URL
      }
    } else if (result.mode === 'TEXT_TO_IMAGE') {
      // 文本生成图文模式，使用第一张生成的图片
      if (result.pages && result.pages.length > 0 && result.pages[0]?.imageUrl) {
        storedGeneratedImage = result.pages[0].imageUrl
      }
    }

    const itemToSave: GeneratedResult = {
      ...result,
      userId,
      originalImageFile: undefined,
      originalImageUrl: storedOriginalImage,
      generatedImageUrl: storedGeneratedImage,
      createdAt: Date.now(),
    }

    const existingIndex = history.findIndex(h => h.id === result.id)
    if (existingIndex >= 0) {
      console.log('更新已有历史记录:', existingIndex)
      history[existingIndex] = itemToSave
    } else {
      console.log('添加新历史记录')
      history.unshift(itemToSave)
    }

    const trySetItem = (items: GeneratedResult[]) => {
      try {
        console.log('准备保存历史记录到localStorage，数量:', items.length)
        const jsonStr = JSON.stringify(items)
        console.log('JSON字符串长度:', jsonStr.length)
        localStorage.setItem(key, jsonStr)
        
        // 验证保存是否成功
        const verifyStr = localStorage.getItem(key)
        if (verifyStr) {
          const verifyData = JSON.parse(verifyStr)
          console.log('✅ 历史记录保存成功！验证通过，当前记录数:', verifyData.length)
        } else {
          console.error('❌ 历史记录保存失败：验证时未找到数据')
        }
      } catch (e: any) {
        console.error('❌ 保存历史记录时出错:', e)
        if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
          if (items.length > 1) {
            console.warn("Storage quota exceeded. Removing oldest item.")
            const reducedItems = items.slice(0, items.length - 1)
            trySetItem(reducedItems)
          } else {
            console.error("Storage full, cannot save even one item.")
          }
        } else {
          throw e
        }
      }
    }

    trySetItem(history.slice(0, 20))
  } catch (error) {
    console.error("Failed to save history:", error)
  }
}

export const getUserHistory = (userId: string): GeneratedResult[] => {
  try {
    const key = `${HISTORY_KEY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    if (!historyStr) {
      console.log(`用户 ${userId} 没有历史记录`)
      return []
    }
    const history = JSON.parse(historyStr)
    console.log(`加载用户 ${userId} 的历史记录，共 ${history.length} 条`)
    return history
  } catch (error) {
    console.error('加载历史记录失败:', error)
    return []
  }
}

/**
 * 删除历史记录
 */
export const deleteHistoryItem = (userId: string, itemId: string): boolean => {
  try {
    const key = `${HISTORY_KEY_PREFIX}${userId}`
    const historyStr = localStorage.getItem(key)
    if (!historyStr) return false
    
    const history: GeneratedResult[] = JSON.parse(historyStr)
    const filtered = history.filter(item => item.id !== itemId)
    
    if (filtered.length === history.length) {
      return false // 没有找到要删除的项
    }
    
    localStorage.setItem(key, JSON.stringify(filtered))
    console.log('历史记录已删除:', itemId)
    return true
  } catch (e) {
    console.error('删除历史记录失败:', e)
    return false
  }
}

