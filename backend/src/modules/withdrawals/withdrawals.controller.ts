import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BadRequestError } from "@/common/errors/AppError.js";
import {
  requestWithdrawal,
  getWithdrawalById,
  listWithdrawals,
} from "./withdrawals.service.js";
import { createWithdrawalSchema, withdrawalIdSchema } from "./withdrawals.schema.js";
import type { AuthPayload } from "@/modules/auth/auth.types.js";

/**
 * POST /withdrawals
 * Creates a withdrawal request for the authenticated user.
 */
export async function createWithdrawalController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req.auth as AuthPayload;
    const input = createWithdrawalSchema.parse(req.body);
    const withdrawal = await requestWithdrawal(auth.userId, input);
    res.status(201).json(withdrawal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid withdrawal request", error.issues));
    } else {
      next(error);
    }
  }
}

/**
 * GET /withdrawals/:id
 * Gets a single withdrawal owned by the authenticated user.
 */
export async function getWithdrawalController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req.auth as AuthPayload;
    const { id } = withdrawalIdSchema.parse(req.params);
    const withdrawal = await getWithdrawalById(id, auth.userId);
    res.json(withdrawal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new BadRequestError("Invalid withdrawal ID", error.issues));
    } else {
      next(error);
    }
  }
}

/**
 * GET /withdrawals
 * Lists all withdrawals for the authenticated user.
 */
export async function listWithdrawalsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = req.auth as AuthPayload;
    const withdrawals = await listWithdrawals(auth.userId);
    res.json(withdrawals);
  } catch (error) {
    next(error);
  }
}
