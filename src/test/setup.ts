import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Chrome APIs
global.chrome = {
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
  },
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
} as any;

// Mock Audio API
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  volume: 0.35,
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation((_callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));
