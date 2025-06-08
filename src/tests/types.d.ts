import type { Mock } from 'vitest';

declare global {
  namespace jest {
    type Mocked<T> = {
      [P in keyof T]: T[P] extends (...args: any[]) => any
        ? Mock<ReturnType<T[P]>, Parameters<T[P]>>
        : T[P];
    };
  }

  interface Window {
    localStorage: {
      getItem: Mock<string | null, [string]>;
      setItem: Mock<void, [string, string]>;
      removeItem: Mock<void, [string]>;
      clear: Mock<void, []>;
      length: number;
      key: Mock<string | null, [number]>;
    };
    EventSource: {
      new (url: string): EventSource;
    };
  }

  interface EventSource {
    onmessage: ((event: MessageEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onopen: ((event: Event) => void) | null;
    addEventListener: Mock<void, [string, EventListener]>;
    removeEventListener: Mock<void, [string, EventListener]>;
    close: Mock<void, []>;
  }
} 