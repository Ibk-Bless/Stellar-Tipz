import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './auth.service.js';
import { UnauthorizedError } from '../../common/errors/AppError.js';
import type { AuthPayload } from './auth.types.js';

declare module 'express' {
  interface Request {
    auth?: AuthPayload;
  }
}

/**
 * Middleware to verify JWT access token and attach auth payload to request.
 * Extracts token from Authorization header: "Bearer <token>"
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch (error) {
    next(error);
  }
}
