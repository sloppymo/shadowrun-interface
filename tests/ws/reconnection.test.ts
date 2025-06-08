/**
 * Tests for WebSocket reconnection logic
 */
import { WebSocketConnectionManager } from '@/utils/websocket';
import WS from 'jest-websocket-mock';

// Mock timers for reconnection tests
jest.useFakeTimers();

describe('WebSocket Reconnection', () => {
  let server: WS;
  let wsManager: WebSocketConnectionManager;
  const mockUrl = 'ws://localhost:5000';
  const mockToken = 'test-jwt-token';

  beforeEach(async () => {
    server = new WS(mockUrl);
    wsManager = new WebSocketConnectionManager(mockUrl, mockToken);
  });

  afterEach(() => {
    WS.clean();
    wsManager.disconnect();
    jest.clearAllTimers();
  });

  describe('Connection Lifecycle', () => {
    it('should connect with authentication', async () => {
      wsManager.connect();
      
      await server.connected;
      
      // Should send auth message
      await expect(server).toReceiveMessage(
        JSON.stringify({ type: 'auth', token: mockToken })
      );
      
      // Send auth success
      server.send(JSON.stringify({ 
        type: 'auth_success',
        user_id: 'test_user',
        session_id: 'test_session'
      }));
      
      expect(wsManager.isConnected()).toBe(true);
    });

    it('should handle connection failure', async () => {
      const onError = jest.fn();
      wsManager.on('error', onError);
      
      // Close server before connecting
      server.close();
      
      wsManager.connect();
      
      await expect(onError).toHaveBeenCalled();
      expect(wsManager.isConnected()).toBe(false);
    });
  });

  describe('Automatic Reconnection', () => {
    it('should reconnect after unexpected disconnect', async () => {
      const onReconnect = jest.fn();
      wsManager.on('reconnecting', onReconnect);
      
      // Initial connection
      wsManager.connect();
      await server.connected;
      
      // Simulate unexpected disconnect
      server.close({ code: 1006, reason: 'Connection lost' });
      
      // Should attempt reconnection
      expect(onReconnect).toHaveBeenCalled();
      
      // Fast forward past reconnection delay
      jest.advanceTimersByTime(2000);
      
      // New server instance for reconnection
      const newServer = new WS(mockUrl);
      await newServer.connected;
      
      expect(wsManager.reconnectAttempts).toBeGreaterThan(0);
    });

    it('should use exponential backoff for reconnection', async () => {
      const reconnectDelays: number[] = [];
      
      wsManager.on('reconnecting', (delay) => {
        reconnectDelays.push(delay);
      });
      
      // Initial connection
      wsManager.connect();
      await server.connected;
      
      // Simulate multiple disconnects
      for (let i = 0; i < 3; i++) {
        server.close();
        jest.advanceTimersByTime(1000 * Math.pow(2, i));
        
        // New server for each reconnection attempt
        server = new WS(mockUrl);
        await server.connected;
      }
      
      // Verify exponential backoff
      expect(reconnectDelays[0]).toBeLessThan(reconnectDelays[1]);
      expect(reconnectDelays[1]).toBeLessThan(reconnectDelays[2]);
    });

    it('should stop reconnecting after max attempts', async () => {
      const onMaxReconnect = jest.fn();
      wsManager.on('max_reconnect_reached', onMaxReconnect);
      
      // Set max attempts to 3
      wsManager.setMaxReconnectAttempts(3);
      
      wsManager.connect();
      await server.connected;
      
      // Simulate multiple failures
      for (let i = 0; i < 4; i++) {
        server.close();
        jest.advanceTimersByTime(5000);
      }
      
      expect(onMaxReconnect).toHaveBeenCalled();
      expect(wsManager.reconnectAttempts).toBe(3);
    });
  });

  describe('Message Queuing During Reconnection', () => {
    it('should queue messages during disconnection', async () => {
      wsManager.connect();
      await server.connected;
      
      // Disconnect
      server.close();
      
      // Try to send messages while disconnected
      wsManager.send({ type: 'message1', data: 'test1' });
      wsManager.send({ type: 'message2', data: 'test2' });
      
      // Messages should be queued
      expect(wsManager.getQueueSize()).toBe(2);
      
      // Reconnect
      jest.advanceTimersByTime(2000);
      const newServer = new WS(mockUrl);
      await newServer.connected;
      
      // Send auth success
      newServer.send(JSON.stringify({ type: 'auth_success' }));
      
      // Queued messages should be sent
      await expect(newServer).toReceiveMessage(
        JSON.stringify({ type: 'message1', data: 'test1' })
      );
      await expect(newServer).toReceiveMessage(
        JSON.stringify({ type: 'message2', data: 'test2' })
      );
    });

    it('should limit message queue size', async () => {
      wsManager.setMaxQueueSize(5);
      wsManager.connect();
      await server.connected;
      
      // Disconnect
      server.close();
      
      // Try to queue more than limit
      for (let i = 0; i < 10; i++) {
        wsManager.send({ type: 'message', id: i });
      }
      
      // Should only keep last 5 messages
      expect(wsManager.getQueueSize()).toBe(5);
    });
  });

  describe('Heartbeat/Ping-Pong', () => {
    it('should send periodic pings', async () => {
      wsManager.enableHeartbeat(5000); // 5 second interval
      wsManager.connect();
      await server.connected;
      
      // Send auth success
      server.send(JSON.stringify({ type: 'auth_success' }));
      
      // Fast forward to trigger ping
      jest.advanceTimersByTime(5000);
      
      await expect(server).toReceiveMessage(
        JSON.stringify({ type: 'ping' })
      );
      
      // Respond with pong
      server.send(JSON.stringify({ type: 'pong' }));
      
      // Fast forward again
      jest.advanceTimersByTime(5000);
      
      // Should receive another ping
      await expect(server).toReceiveMessage(
        JSON.stringify({ type: 'ping' })
      );
    });

    it('should reconnect if pong not received', async () => {
      const onTimeout = jest.fn();
      wsManager.on('ping_timeout', onTimeout);
      wsManager.enableHeartbeat(5000, 3000); // 3 second timeout
      
      wsManager.connect();
      await server.connected;
      
      // Send auth success
      server.send(JSON.stringify({ type: 'auth_success' }));
      
      // Trigger ping
      jest.advanceTimersByTime(5000);
      
      await expect(server).toReceiveMessage(
        JSON.stringify({ type: 'ping' })
      );
      
      // Don't send pong, wait for timeout
      jest.advanceTimersByTime(3000);
      
      expect(onTimeout).toHaveBeenCalled();
      expect(wsManager.isConnected()).toBe(false);
    });
  });

  describe('Connection State Management', () => {
    it('should track connection state accurately', async () => {
      const states: string[] = [];
      
      wsManager.on('state_change', (state) => {
        states.push(state);
      });
      
      // Connect
      wsManager.connect();
      expect(states).toContain('connecting');
      
      await server.connected;
      server.send(JSON.stringify({ type: 'auth_success' }));
      expect(states).toContain('connected');
      
      // Disconnect
      server.close();
      expect(states).toContain('disconnected');
      
      // Reconnecting
      jest.advanceTimersByTime(1000);
      expect(states).toContain('reconnecting');
    });

    it('should handle concurrent connection attempts', async () => {
      // Multiple connect calls
      wsManager.connect();
      wsManager.connect();
      wsManager.connect();
      
      // Should only create one connection
      const connections = await server.connected;
      expect(connections).toBeDefined();
      
      // Verify only one auth message sent
      let messageCount = 0;
      server.on('message', () => messageCount++);
      
      jest.advanceTimersByTime(100);
      expect(messageCount).toBe(1);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed messages gracefully', async () => {
      const onError = jest.fn();
      wsManager.on('error', onError);
      
      wsManager.connect();
      await server.connected;
      
      // Send malformed JSON
      server.send('{ invalid json');
      
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'parse_error'
        })
      );
      
      // Connection should remain open
      expect(wsManager.isConnected()).toBe(true);
    });

    it('should handle authentication failure', async () => {
      const onAuthError = jest.fn();
      wsManager.on('auth_error', onAuthError);
      
      wsManager.connect();
      await server.connected;
      
      // Send auth failure
      server.send(JSON.stringify({ 
        type: 'auth_error',
        error: 'Invalid token'
      }));
      
      expect(onAuthError).toHaveBeenCalled();
      expect(wsManager.isConnected()).toBe(false);
      
      // Should not attempt reconnection for auth failures
      jest.advanceTimersByTime(10000);
      expect(wsManager.reconnectAttempts).toBe(0);
    });
  });

  describe('Clean Shutdown', () => {
    it('should clean up resources on disconnect', async () => {
      wsManager.connect();
      await server.connected;
      
      // Add event listeners
      const messageHandler = jest.fn();
      wsManager.on('message', messageHandler);
      
      // Send a message to verify handler works
      server.send(JSON.stringify({ type: 'test' }));
      expect(messageHandler).toHaveBeenCalled();
      
      // Disconnect
      wsManager.disconnect();
      
      // Clear all handlers and timers
      jest.clearAllTimers();
      messageHandler.mockClear();
      
      // Should not receive new messages
      if (server.server.clients.size > 0) {
        server.send(JSON.stringify({ type: 'test2' }));
      }
      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should cancel reconnection on manual disconnect', async () => {
      wsManager.connect();
      await server.connected;
      
      // Force disconnect
      server.close();
      
      // Should be attempting reconnection
      expect(wsManager.isReconnecting()).toBe(true);
      
      // Manual disconnect
      wsManager.disconnect();
      
      // Should cancel reconnection
      expect(wsManager.isReconnecting()).toBe(false);
      
      // Advance timers - should not reconnect
      jest.advanceTimersByTime(10000);
      expect(wsManager.reconnectAttempts).toBe(0);
    });
  });
}); 