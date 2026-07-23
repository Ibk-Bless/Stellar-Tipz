import { z } from "zod";

/**
 * Zod validation schemas for the credit module endpoints.
 */

/** Path param: a user ID. */
export const userIdParamSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

/** Query params for credit score recompute trigger (issue #919). */
export const recomputeQuerySchema = z.object({
  xHandle: z.string().min(1).optional(),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RecomputeQuery = z.infer<typeof recomputeQuerySchema>;
