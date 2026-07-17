import { vi } from 'vitest'

// jsdom lacks a few browser APIs that Vuetify (and our theme module) rely on.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

// Vuetify overlays touch visualViewport in some code paths.
if (!window.visualViewport) {
  // @ts-expect-error minimal stub
  window.visualViewport = { width: 1024, height: 768, addEventListener() {}, removeEventListener() {} }
}
