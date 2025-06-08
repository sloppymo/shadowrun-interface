/**
 * Tests for WebSocket reconnection logic
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShadowrunWebSocket } from '@utils/api';

describe('WebSocket Reconnection', () => {
  let ws: ShadowrunWebSocket;
  const mockSessionId = 'test-session';
  const mockOnMessage = vi.fn();
  const mockOnConnection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

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

    ws = new ShadowrunWebSocket();
    ws.connect(mockSessionId, mockOnMessage, mockOnConnection);
  });

  afterEach(() => {
    vi.useRealTimers();
    ws.disconnect();
  });

  it('establishes initial connection', async () => {
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(true);
    expect(mockOnConnection).toHaveBeenCalledWith(true);
  });

  it('handles disconnection and reconnection', async () => {
    // Wait for initial connection
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(true);

    // Simulate disconnection
    (ws as any).ws.close();
    await vi.advanceTimersByTimeAsync(50);
    expect(ws.isConnected()).toBe(false);
    expect(mockOnConnection).toHaveBeenCalledWith(false);

    // Wait for reconnection attempt
    await vi.advanceTimersByTimeAsync(1000);
    // Wait for the new WebSocket to connect
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(true);
    expect(mockOnConnection).toHaveBeenCalledWith(true);
  });

  it('stops reconnection attempts after max retries', async () => {
    // Wait for initial connection
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(true);

    // Simulate multiple disconnections
    for (let i = 0; i < 5; i++) {
      (ws as any).ws.close();
      // Wait for reconnection attempt
      await vi.advanceTimersByTimeAsync(1000 * (i + 1));
      // Wait for connection attempt to fail
      await vi.advanceTimersByTimeAsync(100);
    }

    // One final disconnection that should not trigger a reconnect
    (ws as any).ws.close();
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(false);
    expect(mockOnConnection).toHaveBeenCalledWith(false);
  });

  it('sends and receives messages', async () => {
    // Wait for initial connection
    await vi.advanceTimersByTimeAsync(100);
    expect(ws.isConnected()).toBe(true);

    // Send message
    const testMessage = { type: 'test', data: 'test message' };
    ws.send(testMessage);
    await vi.advanceTimersByTimeAsync(50);

    expect(mockOnMessage).toHaveBeenCalledWith(
      expect.objectContaining(testMessage)
    );
  });
}); 