import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useReducedMotionPreference } from '../useReducedMotionPreference';

const STORAGE_KEY = 'tipz_settings';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

const createMatchMedia = (matches: boolean) =>
  vi.fn((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useReducedMotionPreference', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when there is no saved preference and system motion is allowed', () => {
    window.matchMedia = createMatchMedia(false);

    const { result } = renderHook(() => useReducedMotionPreference());

    expect(result.current).toBe(false);
  });

  it('returns true when there is no saved preference and system prefers reduced motion', () => {
    window.matchMedia = createMatchMedia(true);

    const { result } = renderHook(() => useReducedMotionPreference());

    expect(result.current).toBe(true);
  });

  it('returns true when the user explicitly selects always reduce motion', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ reduceMotion: 'always' }));
    window.matchMedia = createMatchMedia(false);

    const { result } = renderHook(() => useReducedMotionPreference());

    expect(result.current).toBe(true);
  });

  it('returns false when the user preference is auto and the system does not request reduced motion', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ reduceMotion: 'auto' }));
    window.matchMedia = createMatchMedia(false);

    const { result } = renderHook(() => useReducedMotionPreference());

    expect(result.current).toBe(false);
  });
});
