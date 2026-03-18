import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser, loginUser, getCurrentUser, logoutUser, updateUserTokenUsage } from '../user'
import { UserRole } from '../../../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('user storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('registerUser', () => {
    it('should register a new user', () => {
      const user = registerUser('testuser', 'test@example.com')
      
      expect(user.username).toBe('testuser')
      expect(user.email).toBe('test@example.com')
      expect(user.role).toBe(UserRole.ADMIN) // First user is admin
      expect(user.id).toBeDefined()
    })

    it('should throw error for duplicate email', () => {
      registerUser('user1', 'test@example.com')
      
      expect(() => {
        registerUser('user2', 'test@example.com')
      }).toThrow('Email already exists')
    })

    it('should set USER role for subsequent users', () => {
      registerUser('admin', 'admin@example.com')
      const user = registerUser('user', 'user@example.com')
      
      expect(user.role).toBe(UserRole.USER)
    })
  })

  describe('loginUser', () => {
    it('should login existing user', () => {
      const registered = registerUser('testuser', 'test@example.com')
      logoutUser()
      
      const loggedIn = loginUser('test@example.com')
      
      expect(loggedIn.id).toBe(registered.id)
      expect(getCurrentUser()?.id).toBe(registered.id)
    })

    it('should throw error for non-existent user', () => {
      expect(() => {
        loginUser('nonexistent@example.com')
      }).toThrow('User not found')
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      expect(getCurrentUser()).toBeNull()
    })

    it('should return current user after login', () => {
      registerUser('testuser', 'test@example.com')
      loginUser('test@example.com')
      
      expect(getCurrentUser()).not.toBeNull()
      expect(getCurrentUser()?.email).toBe('test@example.com')
    })
  })

  describe('updateUserTokenUsage', () => {
    it('should update token usage', () => {
      const user = registerUser('testuser', 'test@example.com')
      
      updateUserTokenUsage(user.id, 100)
      
      const updated = getCurrentUser()
      expect(updated?.totalTokenUsage).toBe(100)
      
      updateUserTokenUsage(user.id, 50)
      const updated2 = getCurrentUser()
      expect(updated2?.totalTokenUsage).toBe(150)
    })
  })
})





