import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInfiniteScroll } from '../useInfiniteScroll';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('useInfiniteScroll', () => {
  const mockData = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
  
  const createMockFetchFunction = (pageSize = 20) => {
    return vi.fn(async (cursor?: string) => {
      const offset = cursor ? parseInt(cursor) : 0;
      const items = mockData.slice(offset, offset + pageSize);
      return {
        items,
        hasMore: offset + pageSize < mockData.length,
        nextCursor: offset + pageSize < mockData.length ? (offset + pageSize).toString() : undefined,
      };
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads initial batch on mount', async () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    await waitFor(() => {
      expect(result.current.items).toHaveLength(20);
    });

    expect(result.current.hasMore).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(fetchFunction).toHaveBeenCalledWith(undefined);
  });

  it('loads more items when loadMore is called', async () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.items).toHaveLength(20);
    });

    // Load more
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(40);
    });

    expect(fetchFunction).toHaveBeenCalledTimes(2);
    expect(fetchFunction).toHaveBeenLastCalledWith('20');
  });

  it('handles end of list correctly', async () => {
    const fetchFunction = createMockFetchFunction(100); // Load all items at once
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    await waitFor(() => {
      expect(result.current.items).toHaveLength(100);
    });

    expect(result.current.hasMore).toBe(false);
  });

  it('handles errors gracefully', async () => {
    const fetchFunction = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });

  it('resets state when reset is called', async () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.items).toHaveLength(20);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('can be disabled', async () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => 
      useInfiniteScroll(fetchFunction, { enabled: false })
    );

    // Should not load initially when disabled
    expect(result.current.items).toHaveLength(0);
    expect(fetchFunction).not.toHaveBeenCalled();

    // Should not load when loadMore is called
    act(() => {
      result.current.loadMore();
    });

    expect(fetchFunction).not.toHaveBeenCalled();
  });

  it('prevents duplicate loading', async () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.items).toHaveLength(20);
    });

    // Try to load multiple times quickly
    act(() => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(40);
    });

    // Should only have been called twice (initial + one loadMore)
    expect(fetchFunction).toHaveBeenCalledTimes(2);
  });

  it('does not load more when hasMore is false', async () => {
    const fetchFunction = createMockFetchFunction(100); // Load all at once
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    const initialCallCount = fetchFunction.mock.calls.length;

    // Try to load more when hasMore is false
    act(() => {
      result.current.loadMore();
    });

    // Should not make additional calls
    expect(fetchFunction).toHaveBeenCalledTimes(initialCallCount);
  });

  it('sets items correctly', () => {
    const fetchFunction = createMockFetchFunction();
    const { result } = renderHook(() => useInfiniteScroll(fetchFunction));

    const newItems = [{ id: 999, name: 'New Item' }];

    act(() => {
      result.current.setItems(newItems);
    });

    expect(result.current.items).toEqual(newItems);
  });
});