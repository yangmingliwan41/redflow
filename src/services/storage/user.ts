/**
 * 用户存储服务
 */

import { v4 as uuidv4 } from 'uuid'
import { User, UserRole } from '../../types'
import { STORAGE_KEYS } from '../../config/constants'
import { logger } from '../../composables/useLogger'

/**
 * 注册新用户
 */
export function registerUser(username: string, email: string): User {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
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
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  logger.debug('用户注册成功:', newUser.id)
  return newUser
}

/**
 * 登录用户
 */
export function loginUser(email: string): User {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
  const users: User[] = usersStr ? JSON.parse(usersStr) : []
  
  const user = users.find(u => u.email === email)
  if (!user) {
    throw new Error('User not found')
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  logger.debug('用户登录成功:', user.id)
  return user
}

/**
 * 登出用户
 */
export function logoutUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  logger.debug('用户已登出')
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return userStr ? JSON.parse(userStr) : null
}

/**
 * 更新用户 Token 使用量
 */
export function updateUserTokenUsage(userId: string, additionalTokens: number): void {
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS)
  const users: User[] = usersStr ? JSON.parse(usersStr) : []
  
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex >= 0) {
    users[userIndex].totalTokenUsage = (users[userIndex].totalTokenUsage || 0) + additionalTokens
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
    
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      currentUser.totalTokenUsage = users[userIndex].totalTokenUsage
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser))
    }
    
    logger.debug('用户 Token 使用量已更新:', { userId, additionalTokens })
  }
}





