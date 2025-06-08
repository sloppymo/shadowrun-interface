import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock window.EventSource
class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onopen: ((event: Event) => void) | null = null;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  close = vi.fn();
  constructor(url: string) {}
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

// Setup global mocks
Object.defineProperty(window, 'EventSource', {
  writable: true,
  value: MockEventSource,
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReset();
  localStorageMock.setItem.mockReset();
  localStorageMock.removeItem.mockReset();
  localStorageMock.clear.mockReset();
}); 