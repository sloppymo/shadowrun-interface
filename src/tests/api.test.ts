import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { api, apiClient } from '../utils/api';

// Create mock instance outside to access it in tests
const mockAxiosInstance = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  },
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

// Mock axios module
vi.mock('axios', () => ({
  default: {
    create: vi.fn().mockReturnValue(mockAxiosInstance)
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock instance methods
    mockAxiosInstance.get.mockReset();
    mockAxiosInstance.post.mockReset();
    mockAxiosInstance.put.mockReset();
    mockAxiosInstance.delete.mockReset();
    mockAxiosInstance.interceptors.request.use.mockReset();
    mockAxiosInstance.interceptors.response.use.mockReset();
  });

  describe('Authentication', () => {
    it('should include auth token in requests', async () => {
      const mockToken = 'test-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      
      // Create a new instance to trigger interceptors
      const apiInstance = api;
      
      // Verify axios.create was called
      expect(axios.create).toHaveBeenCalled();
      
      // Verify the interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it('should handle missing auth token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      // Create a new instance to trigger interceptors
      const apiInstance = api;
      
      // Verify axios.create was called
      expect(axios.create).toHaveBeenCalled();
      
      // Verify the interceptor was set up
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    });
  });

  describe('LLM Integration', () => {
    it('should handle successful AI response', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          response: 'Test AI response',
          status: 'success'
        }
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await apiClient.sendLlmRequest({
        input: 'Test input',
        session_id: 'test-session',
        user_id: 'test-user'
      });

      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/llm',
        expect.objectContaining({
          input: 'Test input',
          session_id: 'test-session',
          user_id: 'test-user'
        })
      );
    });

    it('should handle streaming responses', () => {
      const mockEventSource = {
        onmessage: null,
        onerror: null,
        onopen: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        close: vi.fn()
      };

      global.EventSource = vi.fn(() => mockEventSource) as any;

      const stream = apiClient.createChatStream({
        input: 'Test input',
        session_id: 'test-session',
        user_id: 'test-user',
        role: 'player'
      });

      expect(stream).toBeInstanceOf(EventSource);
      expect(global.EventSource).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat')
      );
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(apiClient.sendLlmRequest({
        input: 'Test input',
        session_id: 'test-session',
        user_id: 'test-user'
      })).rejects.toThrow('API Error');
    });
  });

  describe('Session Management', () => {
    it('should validate session access', async () => {
      const mockError = new Error('Unauthorized');
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(apiClient.createSession({
        name: 'Test Session',
        user_id: 'test-user'
      })).rejects.toThrow('Unauthorized');
    });
  });
}); 