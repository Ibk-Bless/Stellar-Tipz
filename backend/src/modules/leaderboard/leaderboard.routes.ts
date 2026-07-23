import { Router } from "express";
import { getLeaderboardController } from "./leaderboard.controller.js";

/**
 * Leaderboard module router.
 * Mounted at /api/v1/leaderboard in app.ts
 *
 * Issue #933 – Leaderboard by credit score variant
 */
export const leaderboardRouter = Router();

/** Public endpoint – no auth required to view the leaderboard. */
leaderboardRouter.get("/", getLeaderboardController);
