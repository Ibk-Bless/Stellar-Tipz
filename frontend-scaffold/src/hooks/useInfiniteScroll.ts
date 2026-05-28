import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string; // Intersection observer root margin
  enabled?: boolean; // Whether infinite scroll is enabled
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  setItems: (items: T[]) => void;
  observerRef: React.RefObject<HTMLDivElement>;
}

interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export function useInfiniteScroll<T>(
  fetchFunction: (cursor?: string) => Promise<PaginatedResponse<T>>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const {
    threshold = 200,
    rootMargin = '0px',
    enabled = true,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [initialLoad, setInitialLoad] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!enabled || isLoadingRef.current || !hasMore) return;

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction(cursor);
      
      setItems(prev => cursor ? [...prev, ...response.items] : response.items);
      setHasMore(response.hasMore);
      setCursor(response.nextCursor);
      
      if (!initialLoad) {
        setInitialLoad(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Infinite scroll load error:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchFunction, cursor, hasMore, enabled, initialLoad]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setHasMore(true);
    setError(null);
    setCursor(undefined);
    setInitialLoad(false);
    isLoadingRef.current = false;
  }, []);

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!enabled || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && initialLoad) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, enabled, rootMargin, initialLoad]);

  // Scroll-based loading (fallback for intersection observer)
  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (
        scrollHeight - scrollTop - clientHeight < threshold &&
        hasMore &&
        !loading &&
        initialLoad
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, hasMore, loading, threshold, enabled, initialLoad]);

  // Load initial data
  useEffect(() => {
    if (enabled && !initialLoad && items.length === 0 && !loading) {
      loadMore();
    }
  }, [enabled, initialLoad, items.length, loading, loadMore]);

  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    setItems,
    observerRef,
  };
}

// Utility hook for virtual scrolling (for large datasets)
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
  };
}