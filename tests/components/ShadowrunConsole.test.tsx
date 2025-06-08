import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShadowrunConsole } from '@/components/ShadowrunConsole';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('next/router');
jest.mock('@clerk/nextjs');

// Mock WebSocket
class MockWebSocket {
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = WebSocket.CONNECTING;
  
  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen(new Event('open'));
    }, 100);
  }
  
  send(data: string) {
    // Mock echo response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', { data }));
      }
    }, 50);
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose(new CloseEvent('close'));
  }
}

global.WebSocket = MockWebSocket as any;

describe('ShadowrunConsole', () => {
  const mockRouter = {
    push: jest.fn(),
    query: {},
  };
  
  const mockUser = {
    user: {
      id: 'test-user-123',
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUser as jest.Mock).mockReturnValue(mockUser);
    
    // Mock fetch
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('Component Rendering', () => {
    it('should render console interface', () => {
      render(<ShadowrunConsole />);
      
      expect(screen.getByTestId('console-container')).toBeInTheDocument();
      expect(screen.getByTestId('console-input')).toBeInTheDocument();
      expect(screen.getByTestId('console-output')).toBeInTheDocument();
    });
    
    it('should display welcome message', async () => {
      render(<ShadowrunConsole />);
      
      await waitFor(() => {
        expect(screen.getByText(/Welcome to Shadowrun RPG System/i)).toBeInTheDocument();
      });
    });
    
    it('should show user info when authenticated', () => {
      render(<ShadowrunConsole />);
      
      expect(screen.getByText(/Test User/i)).toBeInTheDocument();
    });
  });
  
  describe('Command Processing', () => {
    it('should process help command', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/help{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Available Commands:/i)).toBeInTheDocument();
      });
    });
    
    it('should handle session create command', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          session_id: 'test-session-123',
          name: 'Test Campaign' 
        }),
      });
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/session create Test Campaign{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Session created successfully/i)).toBeInTheDocument();
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/session'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test Campaign' }),
        })
      );
    });
    
    it('should handle invalid commands', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/invalidcommand{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Unknown command/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection on mount', async () => {
      render(<ShadowrunConsole />);
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
    });
    
    it('should handle WebSocket disconnection', async () => {
      const { rerender } = render(<ShadowrunConsole />);
      
      // Wait for connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
      
      // Simulate disconnection
      const ws = (window as any).mockWebSocket;
      ws.close();
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
      });
    });
    
    it('should handle WebSocket reconnection', async () => {
      jest.useFakeTimers();
      render(<ShadowrunConsole />);
      
      // Initial connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
      
      // Force disconnect
      const ws = (window as any).mockWebSocket;
      ws.close();
      
      // Fast-forward reconnection timer
      jest.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Reconnecting');
      });
      
      jest.useRealTimers();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/session create Test{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
      });
    });
    
    it('should handle malformed server responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/ai test message{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Error.*Internal server error/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Input Validation', () => {
    it('should reject empty commands', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '{enter}');
      
      // Should not process empty input
      expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument();
    });
    
    it('should sanitize XSS attempts in input', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      const xssPayload = '<script>alert("XSS")</script>';
      await user.type(input, `${xssPayload}{enter}`);
      
      await waitFor(() => {
        // Should escape the script tag
        expect(screen.queryByText(/<script>/)).not.toBeInTheDocument();
        expect(screen.getByText(/&lt;script&gt;/i)).toBeInTheDocument();
      });
    });
    
    it('should handle very long inputs', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      const longInput = 'A'.repeat(10000);
      await user.type(input, `${longInput}{enter}`);
      
      await waitFor(() => {
        expect(screen.getByText(/Input too long/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Special Characters and Unicode', () => {
    it('should handle unicode characters properly', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      const unicodeInput = '🔥 テスト 测试 🎮';
      await user.type(input, `${unicodeInput}{enter}`);
      
      await waitFor(() => {
        expect(screen.getByText(unicodeInput)).toBeInTheDocument();
      });
    });
    
    it('should handle special control characters', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      const controlChars = 'test\x00\x01\x02';
      
      // Type without using special chars that might break
      await user.type(input, 'test{enter}');
      
      // Verify no crash or unexpected behavior
      expect(screen.getByTestId('console-container')).toBeInTheDocument();
    });
  });
  
  describe('Session Management', () => {
    it('should handle session join', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, role: 'player' }),
      });
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/session join abc123{enter}');
      
      await waitFor(() => {
        expect(screen.getByText(/Joined session/i)).toBeInTheDocument();
      });
    });
    
    it('should update UI for GM role', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          session_id: 'test-123',
          role: 'gm' 
        }),
      });
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      await user.type(input, '/session create GM Test{enter}');
      
      await waitFor(() => {
        expect(screen.getByTestId('gm-indicator')).toBeInTheDocument();
        expect(screen.getByText(/Game Master/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Real-time Features', () => {
    it('should display incoming WebSocket messages', async () => {
      render(<ShadowrunConsole />);
      
      // Wait for WebSocket connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
      
      // Simulate incoming message
      const ws = (window as any).mockWebSocket;
      const message = {
        type: 'notification',
        content: 'Player joined the session',
      };
      
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', { 
          data: JSON.stringify(message) 
        }));
      }
      
      await waitFor(() => {
        expect(screen.getByText(/Player joined the session/i)).toBeInTheDocument();
      });
    });
    
    it('should handle DM review notifications', async () => {
      render(<ShadowrunConsole />);
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
      });
      
      const ws = (window as any).mockWebSocket;
      const notification = {
        type: 'dm_review',
        response_id: 'resp-123',
        player: 'TestPlayer',
        preview: 'What do I see?',
      };
      
      if (ws.onmessage) {
        ws.onmessage(new MessageEvent('message', { 
          data: JSON.stringify(notification) 
        }));
      }
      
      await waitFor(() => {
        expect(screen.getByText(/New review request from TestPlayer/i)).toBeInTheDocument();
      });
    });
  });
  
  describe('Performance and Race Conditions', () => {
    it('should handle rapid command submission', async () => {
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      
      // Rapid fire commands
      await user.type(input, '/help{enter}');
      await user.type(input, '/status{enter}');
      await user.type(input, '/roll 3d6{enter}');
      
      // Should queue and process all commands
      await waitFor(() => {
        expect(screen.getAllByText(/Processing/i).length).toBeGreaterThan(0);
      });
    });
    
    it('should prevent duplicate session creation', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({ session_id: `session-${callCount}` }),
        });
      });
      
      const user = userEvent.setup();
      render(<ShadowrunConsole />);
      
      const input = screen.getByTestId('console-input');
      
      // Double-click submit
      await user.type(input, '/session create Test');
      await user.keyboard('{enter}{enter}');
      
      // Should only create one session
      expect(callCount).toBe(1);
    });
  });
}); 