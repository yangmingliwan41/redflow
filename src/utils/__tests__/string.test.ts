import { describe, it, expect } from 'vitest'
import { cleanAsciiString, truncate, generateId } from '../string'

describe('string utils', () => {
  describe('cleanAsciiString', () => {
    it('should remove non-ASCII characters', () => {
      const input = 'test\u00A0key\u200B123'
      const result = cleanAsciiString(input)
      expect(result).toBe('testkey123')
    })

    it('should remove Bearer prefix', () => {
      const input = 'Bearer test-key-123'
      const result = cleanAsciiString(input)
      expect(result).toBe('test-key-123')
    })

    it('should trim whitespace', () => {
      const input = '  test-key  '
      const result = cleanAsciiString(input)
      expect(result).toBe('test-key')
    })

    it('should handle empty string', () => {
      expect(cleanAsciiString('')).toBe('')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      const input = 'a'.repeat(100)
      const result = truncate(input, 50)
      expect(result.length).toBe(53) // 50 + '...'
      expect(result).toContain('...')
    })

    it('should not truncate short strings', () => {
      const input = 'short'
      const result = truncate(input, 50)
      expect(result).toBe('short')
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId('test')
      const id2 = generateId('test')
      expect(id1).not.toBe(id2)
      expect(id1).toContain('test')
    })
  })
})





