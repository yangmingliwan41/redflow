import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callGoogleGenAIAPI } from '../google'
import { useApi } from '../../../composables/useApi'
import { STORAGE_KEYS, API_CONFIG } from '../../../config/constants'

// Mock dependencies
vi.mock('../../../composables/useApi')
vi.mock('../../../composables/useLogger')
vi.mock('../../../composables/useError')

describe('callGoogleGenAIAPI - Image Data Extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock useApi
    vi.mocked(useApi).mockReturnValue({
      getApiKey: vi.fn((key: string) => {
        if (key === STORAGE_KEYS.GOOGLE_API_KEY) return 'test-api-key'
        if (key === STORAGE_KEYS.GOOGLE_API_ENDPOINT) return 'https://api.test.com/v1/chat/completions'
        if (key === STORAGE_KEYS.GOOGLE_MODEL) return 'test-model'
        return null
      })
    } as any)
    
    // Mock fetch
    global.fetch = vi.fn()
  })

  it('should extract image from data URL in message.content (string)', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toBeDefined()
    expect(result.imageData).toContain('data:image/png;base64,')
  })

  it('should extract image from image_url in array content', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: [
            { type: 'text', text: 'Some text' },
            { type: 'image_url', image_url: { url: 'https://example.com/image.png' } }
          ]
        }
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toBe('https://example.com/image.png')
  })

  it('should extract image from markdown link in text', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Here is the image: ![alt](https://example.com/image.png)'
        }
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toBe('https://example.com/image.png')
  })

  it('should extract base64 image from text content', async () => {
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    const mockResponse = {
      choices: [{
        message: {
          content: `Some text before ${base64Data} some text after`
        }
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toBe(base64Data)
  })

  it('should extract image from data.image field', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Some text'
        }
      }],
      image: 'https://example.com/image.png',
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toBe('https://example.com/image.png')
  })

  it('should extract image from data.data[0].b64_json (OpenAI format)', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Some text'
        }
      }],
      data: [{
        b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const result = await callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })

    expect(result.imageData).toContain('data:image/png;base64,')
    expect(result.imageData).toContain('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
  })

  it('should throw error when image not found but responseFormat is image', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Some text without image'
        }
      }],
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    await expect(
      callGoogleGenAIAPI('test prompt', [], { responseFormat: 'image' })
    ).rejects.toThrow()
  })
})





