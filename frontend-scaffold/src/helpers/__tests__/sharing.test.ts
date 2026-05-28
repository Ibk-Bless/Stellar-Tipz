import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateShareURL,
  copyToClipboard,
  nativeShare,
  isNativeShareSupported,
  createTipShareData,
  createAchievementShareData,
  createProfileShareData,
} from '../sharing';

// Mock navigator
const mockNavigator = {
  clipboard: {
    writeText: vi.fn(),
  },
  share: vi.fn(),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

// Mock document.execCommand for fallback clipboard
Object.defineProperty(document, 'execCommand', {
  value: vi.fn(),
  writable: true,
});

describe('sharing helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateShareURL', () => {
    it('generates Twitter share URL for tip', () => {
      const url = generateShareURL('twitter', 'tip', { amount: 10, to: 'alice' });
      
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('alice');
      expect(url).toContain('10');
    });

    it('generates Facebook share URL', () => {
      const url = generateShareURL('facebook', 'profile', { username: 'bob' });
      
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain('tipz.app/@bob');
    });

    it('generates LinkedIn share URL', () => {
      const url = generateShareURL('linkedin', 'achievement', { 
        achievement: 'First Tip', 
        username: 'charlie' 
      });
      
      expect(url).toContain('linkedin.com/sharing');
      expect(url).toContain('First%20Tip');
    });

    it('generates Reddit share URL', () => {
      const url = generateShareURL('reddit', 'tip', { amount: 5, to: 'dave' });
      
      expect(url).toContain('reddit.com/submit');
      expect(url).toContain('dave');
    });

    it('throws error for unsupported platform', () => {
      expect(() => {
        generateShareURL('invalid' as any, 'tip', {});
      }).toThrow('Unsupported platform: invalid');
    });
  });

  describe('copyToClipboard', () => {
    it('uses clipboard API when available', async () => {
      mockNavigator.clipboard.writeText.mockResolvedValue(undefined);
      Object.defineProperty(window, 'isSecureContext', { value: true });
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(mockNavigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('falls back to execCommand when clipboard API unavailable', async () => {
      // Mock clipboard API as unavailable
      const originalClipboard = mockNavigator.clipboard;
      delete (mockNavigator as any).clipboard;
      
      // Mock DOM methods
      const mockTextArea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
      };
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockTextArea as any);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockTextArea as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockTextArea as any);
      const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(true);
      expect(createElementSpy).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('test text');
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
      
      // Restore
      mockNavigator.clipboard = originalClipboard;
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      execCommandSpy.mockRestore();
    });

    it('handles clipboard API errors', async () => {
      mockNavigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'));
      
      const result = await copyToClipboard('test text');
      
      expect(result).toBe(false);
    });
  });

  describe('nativeShare', () => {
    it('uses Web Share API when available', async () => {
      mockNavigator.share.mockResolvedValue(undefined);
      
      const result = await nativeShare('tip', { amount: 10, to: 'alice' });
      
      expect(result).toBe(true);
      expect(mockNavigator.share).toHaveBeenCalledWith({
        title: 'Stellar Tipz',
        text: expect.stringContaining('alice'),
        url: 'https://tipz.app/@alice',
      });
    });

    it('returns false when Web Share API unavailable', async () => {
      const originalShare = mockNavigator.share;
      delete (mockNavigator as any).share;
      
      const result = await nativeShare('tip', { amount: 10, to: 'alice' });
      
      expect(result).toBe(false);
      
      // Restore
      mockNavigator.share = originalShare;
    });

    it('handles Web Share API errors', async () => {
      mockNavigator.share.mockRejectedValue(new Error('User cancelled'));
      
      const result = await nativeShare('tip', { amount: 10, to: 'alice' });
      
      expect(result).toBe(false);
    });
  });

  describe('isNativeShareSupported', () => {
    it('returns true when Web Share API is available', () => {
      expect(isNativeShareSupported()).toBe(true);
    });

    it('returns false when Web Share API is unavailable', () => {
      const originalShare = mockNavigator.share;
      delete (mockNavigator as any).share;
      
      expect(isNativeShareSupported()).toBe(false);
      
      // Restore
      mockNavigator.share = originalShare;
    });
  });

  describe('share data creators', () => {
    it('creates tip share data for sender', () => {
      const data = createTipShareData(10, 'alice', 'Great work!', true);
      
      expect(data).toEqual({
        amount: 10,
        to: 'alice',
        message: 'Great work!',
        username: 'alice',
      });
    });

    it('creates tip share data for receiver', () => {
      const data = createTipShareData(5, 'bob', undefined, false);
      
      expect(data).toEqual({
        amount: 5,
        from: 'bob',
        message: undefined,
        username: 'bob',
      });
    });

    it('creates achievement share data', () => {
      const data = createAchievementShareData('First Tip', 'charlie');
      
      expect(data).toEqual({
        achievement: 'First Tip',
        username: 'charlie',
      });
    });

    it('creates profile share data', () => {
      const data = createProfileShareData('dave');
      
      expect(data).toEqual({
        username: 'dave',
      });
    });
  });
});