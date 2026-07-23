import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
  getCreditScoreController,
  recomputeCreditScoreController,
} from "./credit.controller.js";

/**
 * Credit module router.
 * Mounted at /api/v1/credit in app.ts
 *
 * Issues #920 · #919 · #922
 */
export const creditRouter = Router();

/** Public – any authenticated user can view a credit score. */
creditRouter.get("/:userId", requireAuth, getCreditScoreController);

/** Internal – called by the X-metrics refresh job (issue #919). */
creditRouter.post("/:userId/recompute", requireAuth, recomputeCreditScoreController);
