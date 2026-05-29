import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics';

/**
 * Hook to automatically track page views on route/navigation changes.
 * Returns the analytics service object for custom event tracking.
 */
export function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return analytics;
}
