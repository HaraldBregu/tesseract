import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnect(): void { /* Intentionally empty for mock */ }
  observe(): void { /* Intentionally empty for mock */ }
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve(): void { /* Intentionally empty for mock */ }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  disconnect(): void { /* Intentionally empty for mock */ }
  observe(): void { /* Intentionally empty for mock */ }
  unobserve(): void { /* Intentionally empty for mock */ }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Mock Electron IPC
const mockElectronAPI = {
  ipcRenderer: {
    send: jest.fn(),
    sendSync: jest.fn(),
    invoke: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  app: {
    getVersion: jest.fn().mockReturnValue('1.0.0'),
    getName: jest.fn().mockReturnValue('Criterion'),
  },
};

Object.defineProperty(globalThis, 'electron', {
  writable: true,
  value: mockElectronAPI,
});

Object.defineProperty(globalThis, 'api', {
  writable: true,
  value: {
    ...mockElectronAPI.ipcRenderer,
    openExternal: jest.fn(),
    getAppInfo: jest.fn().mockResolvedValue({ name: 'Criterion', version: '1.0.0' }),
  },
});

// Mock scrollTo
Element.prototype.scrollTo = jest.fn();
Element.prototype.scrollIntoView = jest.fn();

// Suppress console errors during tests (optional, uncomment if needed)
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args) => {
//     if (typeof args[0] === 'string' && args[0].includes('Warning:')) return;
//     originalError.call(console, ...args);
//   };
// });
// afterAll(() => {
//   console.error = originalError;
// });