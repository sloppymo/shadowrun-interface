import axios, { AxiosInstance } from 'axios';

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

export interface LlmResponse {
  response: string;
  status: 'success' | 'error';
  error?: string;
}

// Create axios instance with base configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor for auth
  instance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const sessionToken = localStorage.getItem('shadowrun-session-token');
        if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        if (typeof window !== 'undefined') {
          localStorage.removeItem('shadowrun-session-token');
          window.location.href = '/';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export the API instance
export const api = createApiInstance();

// API Methods
export const apiClient = {
  // Session Management
  createSession: async (data: { name: string; user_id: string }) => {
    const response = await api.post<ApiResponse>('/api/session', data);
    return response.data;
  },

  joinSession: async (sessionId: string, data: { user_id: string; role: string }) => {
    const response = await api.post<ApiResponse>(`/api/session/${sessionId}/join`, data);
    return response.data;
  },

  // LLM Integration
  sendLlmRequest: async (data: { input: string; session_id: string; user_id: string }) => {
    const response = await api.post<ApiResponse<LlmResponse>>('/api/llm', data);
    return response.data;
  },

  createChatStream: (data: { input: string; session_id: string; user_id: string; role: string }) => {
    return new EventSource(`/api/chat?${new URLSearchParams(data).toString()}`);
  },

  // Image Generation
  generateImage: async (sessionId: string, data: { description: string; style?: string }) => {
    const response = await api.post<ApiResponse>(`/api/session/${sessionId}/generate-image`, data);
    return response.data;
  }
}; 