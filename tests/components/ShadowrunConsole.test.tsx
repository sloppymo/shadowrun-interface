import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ShadowrunConsole from '@components/ShadowrunConsole';
import type { Theme } from '@components/types';
import { ShadowrunWebSocket } from '@utils/api';

// Mock EventSource
class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    // Simulate connection
    setTimeout(() => {
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 0);
  }
}

// Mock global EventSource
vi.stubGlobal('EventSource', MockEventSource);

// Remove WebSocket mocks since we're using EventSource
vi.mock('@utils/api', () => ({
  ShadowrunWebSocket: vi.fn()
}));

// Mock useUser hook
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: { id: 'test-user', firstName: 'Test' },
    isSignedIn: true
  })
}));

// Default theme for testing
const defaultTheme: Theme = {
  name: 'Test Theme',
  background: 'bg-black',
  text: 'text-white',
  secondaryText: 'text-gray-400',
  accent: 'bg-blue-600',
  prompt: 'text-green-500',
  input: 'bg-gray-800',
  inputText: 'text-white',
  secondaryBackground: 'bg-gray-900'
};

describe('ShadowrunConsole Component', () => {
  let mockEventSource: MockEventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSource = new MockEventSource('http://localhost:5000/events');
  });

  it('renders console interface', async () => {
    render(<ShadowrunConsole theme={defaultTheme} />);
    
    // Wait for connection to be established
    await waitFor(() => {
      expect(screen.getByText(/connected to the matrix/i)).toBeInTheDocument();
    });
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });

  it('handles message submission', async () => {
    render(<ShadowrunConsole theme={defaultTheme} />);
    
    // Wait for connection
    await waitFor(() => {
      expect(screen.getByText(/connected to the matrix/i)).toBeInTheDocument();
    });
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message{enter}');

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('handles connection errors', async () => {
    render(<ShadowrunConsole theme={defaultTheme} />);
    
    // Simulate connection error
    if (mockEventSource.onerror) {
      mockEventSource.onerror(new Event('error'));
    }

    expect(await screen.findByText(/lost connection to the matrix/i)).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Command input');
      expect(screen.getByRole('button', { name: /settings/i })).toHaveAttribute('aria-label', 'Open settings');
      expect(screen.getByRole('button', { name: /send/i })).toHaveAttribute('aria-label', 'Send command');
    });

    it('announces results to screen readers', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate successful roll response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'roll_result',
            result: {
              rolls: [4, 5, 6, 1],
              total: 16,
              glitch: false,
              critical_glitch: false
            }
          })
        }));
      }

      expect(await screen.findByRole('status')).toHaveTextContent(/rolled 16/i);
    });
  });

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate API error
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'error',
            message: 'Failed to process roll'
          })
        }));
      }

      expect(await screen.findByText(/failed to process roll/i)).toBeInTheDocument();
    });

    it('handles malformed API responses gracefully', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate malformed response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: 'invalid json'
        }));
      }

      expect(await screen.findByText(/error processing response/i)).toBeInTheDocument();
    });
  });

  describe('Glitch Detection', () => {
    it('displays glitch warnings', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate glitch response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'roll_result',
            result: {
              rolls: [1, 1, 5, 6],
              total: 13,
              glitch: true,
              critical_glitch: false
            }
          })
        }));
      }

      expect(await screen.findByText(/glitch!/i)).toBeInTheDocument();
    });

    it('displays critical glitch warnings', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate critical glitch response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'roll_result',
            result: {
              rolls: [1, 1, 1, 1],
              total: 4,
              glitch: true,
              critical_glitch: true
            }
          })
        }));
      }

      expect(await screen.findByText(/critical glitch!/i)).toBeInTheDocument();
    });
  });

  describe('Rapid Clicking Prevention', () => {
    it('prevents multiple simultaneous rolls', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      // First roll
      await userEvent.type(input, 'roll 4d6');
      await userEvent.click(sendButton);

      // Try to roll again immediately
      await userEvent.clear(input);
      await userEvent.type(input, 'roll 4d6');
      await userEvent.click(sendButton);

      // Should only see one roll request
      expect(screen.getAllByText(/roll 4d6/i)).toHaveLength(1);
    });
  });

  describe('Command Injection Prevention', () => {
    it('prevents command injection attempts', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6; rm -rf /{enter}');

      // Should sanitize the command
      expect(screen.getByText(/roll 4d6/i)).toBeInTheDocument();
      expect(screen.queryByText(/rm -rf/i)).not.toBeInTheDocument();
    });
  });

  describe('Roll Handling', () => {
    it('processes roll results correctly', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      // Wait for connection
      await waitFor(() => {
        expect(screen.getByText(/connected to the matrix/i)).toBeInTheDocument();
      });
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate roll response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'roll_result',
            result: {
              rolls: [4, 5, 6, 1],
              total: 16,
              glitch: false,
              critical_glitch: false
            }
          })
        }));
      }

      expect(await screen.findByText(/rolled 16/i)).toBeInTheDocument();
      expect(screen.getByText(/4, 5, 6, 1/i)).toBeInTheDocument();
    });

    it('handles glitch results', async () => {
      render(<ShadowrunConsole theme={defaultTheme} />);
      
      // Wait for connection
      await waitFor(() => {
        expect(screen.getByText(/connected to the matrix/i)).toBeInTheDocument();
      });
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'roll 4d6{enter}');

      // Simulate glitch response
      if (mockEventSource.onmessage) {
        mockEventSource.onmessage(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'roll_result',
            result: {
              rolls: [1, 1, 5, 6],
              total: 13,
              glitch: true,
              critical_glitch: false
            }
          })
        }));
      }

      expect(await screen.findByText(/rolled 13/i)).toBeInTheDocument();
      expect(screen.getByText(/glitch/i)).toBeInTheDocument();
    });
  });
}); 