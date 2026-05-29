import { describe, expect, it } from 'vitest';

import {
  getAvatarSizes,
  getAvatarSrcSet,
  normalizeAvatarSrc,
} from '../avatarImage';

describe('avatar image helpers', () => {
  it('normalizes IPFS protocol URLs to a gateway URL', () => {
    expect(normalizeAvatarSrc('ipfs://bafybeigdyrzt/avatar.png')).toBe(
      'https://ipfs.io/ipfs/bafybeigdyrzt/avatar.png',
    );
  });

  it('keeps regular HTTPS URLs unchanged', () => {
    expect(normalizeAvatarSrc('https://example.com/avatar.png')).toBe(
      'https://example.com/avatar.png',
    );
  });

  it('builds a responsive optimizer srcset for IPFS avatars', () => {
    const srcSet = getAvatarSrcSet('ipfs://bafybeigdyrzt/avatar.png', 'md');

    expect(srcSet).toContain('https://images.weserv.nl/');
    expect(srcSet).toContain('w=48');
    expect(srcSet).toContain('w=96');
    expect(srcSet).toContain('48w');
    expect(srcSet).toContain('96w');
  });

  it('does not proxy data URLs through the optimizer', () => {
    expect(getAvatarSrcSet('data:image/png;base64,abc', 'md')).toBeUndefined();
  });

  it('returns a stable sizes value for each avatar size', () => {
    expect(getAvatarSizes('xl')).toBe('96px');
  });
});
