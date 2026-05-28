interface ShareData {
  amount?: number;
  to?: string;
  from?: string;
  message?: string;
  achievement?: string;
  username?: string;
}

type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'reddit';
type ShareType = 'tip' | 'achievement' | 'profile';

const BASE_URL = 'https://tipz.app';

/**
 * Generate share URL for different platforms
 */
export function generateShareURL(
  platform: SharePlatform,
  type: ShareType,
  data: ShareData
): string {
  const text = generateShareText(type, data);
  const url = generateShareLink(type, data);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    
    case 'reddit':
      return `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Generate share text based on type and data
 */
export function generateShareText(type: ShareType, data: ShareData): string {
  switch (type) {
    case 'tip':
      if (data.amount && data.to) {
        return `Just sent ${data.amount} XLM to @${data.to} on Stellar Tipz! 💫 Supporting creators on the blockchain. #StellarTipz #Crypto`;
      }
      if (data.amount && data.from) {
        return `Received ${data.amount} XLM from a supporter on Stellar Tipz! 💫 Thank you for the support! #StellarTipz #Crypto`;
      }
      return 'Check out Stellar Tipz - the decentralized tipping platform! 💫 #StellarTipz';

    case 'achievement':
      if (data.achievement && data.username) {
        return `🏆 Just unlocked "${data.achievement}" on Stellar Tipz! Building my creator reputation on the blockchain. #StellarTipz #Achievement`;
      }
      return '🏆 Just unlocked a new achievement on Stellar Tipz! #StellarTipz #Achievement';

    case 'profile':
      if (data.username) {
        return `Check out my creator profile on Stellar Tipz! Support me with instant XLM tips. #StellarTipz #Creator`;
      }
      return 'Join me on Stellar Tipz - the future of creator support! #StellarTipz';

    default:
      return 'Check out Stellar Tipz - decentralized tipping on Stellar! 💫 #StellarTipz';
  }
}

/**
 * Generate share text based on type and data
 */
function generateShareText(type: ShareType, data: ShareData): string {
  switch (type) {
    case 'tip':
      if (data.amount && data.to) {
        return `Just sent ${data.amount} XLM to @${data.to} on Stellar Tipz! 💫 Supporting creators on the blockchain. #StellarTipz #Crypto`;
      }
      if (data.amount && data.from) {
        return `Received ${data.amount} XLM from a supporter on Stellar Tipz! 💫 Thank you for the support! #StellarTipz #Crypto`;
      }
      return 'Check out Stellar Tipz - the decentralized tipping platform! 💫 #StellarTipz';

    case 'achievement':
      if (data.achievement && data.username) {
        return `🏆 Just unlocked "${data.achievement}" on Stellar Tipz! Building my creator reputation on the blockchain. #StellarTipz #Achievement`;
      }
      return '🏆 Just unlocked a new achievement on Stellar Tipz! #StellarTipz #Achievement';

    case 'profile':
      if (data.username) {
        return `Check out my creator profile on Stellar Tipz! Support me with instant XLM tips. #StellarTipz #Creator`;
      }
      return 'Join me on Stellar Tipz - the future of creator support! #StellarTipz';

    default:
      return 'Check out Stellar Tipz - decentralized tipping on Stellar! 💫 #StellarTipz';
  }
}

/**
 * Generate share link based on type and data
 */
export function generateShareLink(type: ShareType, data: ShareData): string {
  switch (type) {
    case 'tip':
    case 'profile':
      if (data.username) {
        return `${BASE_URL}/@${data.username}`;
      }
      return BASE_URL;

    case 'achievement':
      if (data.username) {
        return `${BASE_URL}/@${data.username}`;
      }
      return BASE_URL;

    default:
      return BASE_URL;
  }
}

/**
 * Generate share link based on type and data
 */
function generateShareLink(type: ShareType, data: ShareData): string {
  switch (type) {
    case 'tip':
    case 'profile':
      if (data.username) {
        return `${BASE_URL}/@${data.username}`;
      }
      return BASE_URL;

    case 'achievement':
      if (data.username) {
        return `${BASE_URL}/@${data.username}`;
      }
      return BASE_URL;

    default:
      return BASE_URL;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Use Web Share API if available (mobile native sharing)
 */
export async function nativeShare(
  type: ShareType,
  data: ShareData
): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    const text = generateShareText(type, data);
    const url = generateShareLink(type, data);
    
    await navigator.share({
      title: 'Stellar Tipz',
      text,
      url,
    });
    
    return true;
  } catch (err) {
    // User cancelled or error occurred
    console.error('Native share failed:', err);
    return false;
  }
}

/**
 * Generate OG image URL for shared links
 */
export function generateOGImageURL(type: ShareType, data: ShareData): string {
  const params = new URLSearchParams();
  
  params.set('type', type);
  
  if (data.username) params.set('username', data.username);
  if (data.amount) params.set('amount', data.amount.toString());
  if (data.achievement) params.set('achievement', data.achievement);
  
  return `${BASE_URL}/api/og?${params.toString()}`;
}

/**
 * Check if Web Share API is supported
 */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Get appropriate share platforms based on user agent
 */
export function getRecommendedPlatforms(): SharePlatform[] {
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile) {
    return ['twitter', 'facebook'];
  }
  
  return ['twitter', 'facebook', 'linkedin', 'reddit'];
}

/**
 * Generate share data for tip
 */
export function createTipShareData(
  amount: number,
  username: string,
  message?: string,
  isSender = false
): ShareData {
  return {
    amount,
    [isSender ? 'to' : 'from']: username,
    message,
    username,
  };
}

/**
 * Generate share data for achievement
 */
export function createAchievementShareData(
  achievement: string,
  username: string
): ShareData {
  return {
    achievement,
    username,
  };
}

/**
 * Generate share data for profile
 */
export function createProfileShareData(username: string): ShareData {
  return {
    username,
  };
}