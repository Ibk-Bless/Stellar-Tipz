import { z } from 'zod';

/**
 * Zod validation schemas for auth endpoints.
 */

export const challengeSchema = z.object({
  stellarAddress: z.string().min(1, 'Stellar address is required'),
});

export const verifySchema = z.object({
  stellarAddress: z.string().min(1, 'Stellar address is required'),
  signature: z.string().min(1, 'Signature is required'),
  challenge: z.string().min(1, 'Challenge is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type ChallengeInput = z.infer<typeof challengeSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
