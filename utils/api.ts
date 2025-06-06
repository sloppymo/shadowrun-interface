import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const sessionToken = localStorage.getItem('shadowrun-session-token');
    if (sessionToken) {
      config.headers.Authorization = `Bearer ${sessionToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Types
export interface SessionInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  gameState: 'waiting' | 'active' | 'paused';
  isGM: boolean;
}

export interface CommandResponse {
  success: boolean;
  output: string;
  data?: any;
  broadcast?: boolean;
}

export interface DiceRoll {
  dice: string;
  results: number[];
  total: number;
  hits?: number;
  glitches?: number;
  criticalGlitch?: boolean;
}

// Session Management
export const sessionAPI = {
  async createSession(name: string, maxPlayers: number = 6): Promise<SessionInfo> {
    const response = await api.post('/sessions', { name, maxPlayers });
    return response.data;
  },

  async joinSession(sessionId: string, password?: string): Promise<SessionInfo> {
    const response = await api.post(`/sessions/${sessionId}/join`, { password });
    return response.data;
  },

  async leaveSession(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/leave`);
  },

  async getActiveSessions(): Promise<SessionInfo[]> {
    const response = await api.get('/sessions');
    return response.data;
  },

  async getSessionInfo(sessionId: string): Promise<SessionInfo> {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  }
};

// Command Processing
export const commandAPI = {
  async executeCommand(sessionId: string, command: string): Promise<CommandResponse> {
    const response = await api.post(`/sessions/${sessionId}/command`, { command });
    return response.data;
  },

  async rollDice(sessionId: string, notation: string): Promise<DiceRoll> {
    const response = await api.post(`/sessions/${sessionId}/roll`, { notation });
    return response.data;
  }
};

// WebSocket connection for real-time updates
export class ShadowrunWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private onMessageCallback?: (data: any) => void;
  private onConnectionCallback?: (connected: boolean) => void;

  connect(sessionId: string, onMessage: (data: any) => void, onConnection?: (connected: boolean) => void) {
    this.sessionId = sessionId;
    this.onMessageCallback = onMessage;
    this.onConnectionCallback = onConnection;

    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/${sessionId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnectionCallback?.(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessageCallback?.(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.onConnectionCallback?.(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onConnectionCallback?.(false);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.sessionId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.sessionId && this.onMessageCallback) {
          this.connect(this.sessionId, this.onMessageCallback, this.onConnectionCallback);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.onMessageCallback = undefined;
    this.onConnectionCallback = undefined;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default api;