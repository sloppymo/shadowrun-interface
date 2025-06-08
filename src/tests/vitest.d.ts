/// <reference types="vitest" />

declare namespace vi {
  const fn: typeof import('vitest').vi.fn;
  const clearAllMocks: typeof import('vitest').vi.clearAllMocks;
  const useFakeTimers: typeof import('vitest').vi.useFakeTimers;
  const useRealTimers: typeof import('vitest').vi.useRealTimers;
  const advanceTimersByTimeAsync: typeof import('vitest').vi.advanceTimersByTimeAsync;
  const stubGlobal: typeof import('vitest').vi.stubGlobal;
  const Mock: typeof import('vitest').vi.Mock;
} 