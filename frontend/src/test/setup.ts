import '@testing-library/jest-dom';
import { afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Ensure React is available globally
globalThis.React = React;

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
