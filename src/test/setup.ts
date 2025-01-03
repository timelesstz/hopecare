import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { Window } from 'happy-dom';

expect.extend(matchers);

// Create a new window instance from happy-dom
const window = new Window({
  url: 'http://localhost',
  width: 1024,
  height: 768,
});

// Add required mocks to window
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Set up global object
Object.defineProperty(globalThis, 'window', {
  value: window,
  writable: true,
});

Object.defineProperty(globalThis, 'document', {
  value: window.document,
  writable: true,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});