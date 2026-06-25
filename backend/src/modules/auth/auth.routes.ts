import { Router } from 'express';
import {
  challengeController,
  verifyController,
  meController,
  refreshController,
  logoutController,
} from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';

/**
 * Auth module router.
 * Mounted at /api/v1/auth in app.ts
 */
export const authRouter = Router();

// POST /auth/challenge - Create authentication challenge
authRouter.post('/challenge', challengeController);

// POST /auth/verify - Verify signed challenge and get tokens
authRouter.post('/verify', verifyController);

// GET /auth/me - Get current user info (requires auth)
authRouter.get('/me', authMiddleware, meController);

// POST /auth/refresh - Refresh access token
authRouter.post('/refresh', refreshController);

// POST /auth/logout - Revoke refresh token
authRouter.post('/logout', logoutController);
