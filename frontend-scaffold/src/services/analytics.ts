import { logger } from './logger';

// Read Vite env variables safely without breaking in non-Vite environments
const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const PLAUSIBLE_DOMAIN = viteEnv.VITE_PLAUSIBLE_DOMAIN || '';
const ANALYTICS_ENDPOINT = viteEnv.VITE_ANALYTICS_ENDPOINT || '';

/**
 * Strips personal data (like wallet addresses, emails, IPs, user IDs) from event properties to ensure GDPR compliance.
 */
const stripPersonalData = (props?: Record<string, any>): Record<string, any> | undefined => {
  if (!props) return undefined;
  const cleanProps = { ...props };
  
  const piiKeys = [
    'walletAddress',
    'wallet_address',
    'publicKey',
    'address',
    'ip',
    'email',
    'userId',
    'user_id',
  ];
  
  for (const key of piiKeys) {
    delete cleanProps[key];
  }
  
  return cleanProps;
};

export const analytics = {
  /**
   * Tracks a page view event.
   * Cookie-free, respects Plausible/custom analytics endpoints.
   */
  trackPageView(path: string): void {
    logger.info('Analytics', `Page view tracked: ${path}`);
    
    if (!PLAUSIBLE_DOMAIN && !ANALYTICS_ENDPOINT) {
      return;
    }
    
    const endpoint = ANALYTICS_ENDPOINT || 'https://plausible.io/api/event';
    const domain = PLAUSIBLE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : `http://localhost${path}`;
    const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;

    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'pageview',
        url,
        domain,
        referrer,
        screen_width: screenWidth,
      }),
    }).catch(() => {
      // Catch network errors silently to ensure analytics never breaks app execution
    });
  },

  /**
   * Tracks a custom event.
   * Strips any personal data (walletAddress, IP, etc.) to ensure privacy.
   */
  trackEvent(name: string, props?: Record<string, any>): void {
    const cleanProps = stripPersonalData(props);
    logger.info('Analytics', `Event tracked: ${name}`, cleanProps);
    
    if (!PLAUSIBLE_DOMAIN && !ANALYTICS_ENDPOINT) {
      return;
    }
    
    const endpoint = ANALYTICS_ENDPOINT || 'https://plausible.io/api/event';
    const domain = PLAUSIBLE_DOMAIN || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    const url = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';

    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        url,
        domain,
        props: cleanProps,
      }),
    }).catch(() => {
      // Catch network errors silently to ensure analytics never breaks app execution
    });
  },
};
