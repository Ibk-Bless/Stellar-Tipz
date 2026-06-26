import { prisma } from "../../db/prisma.js";
import { logger } from "../../common/utils/logger.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../../common/errors/AppError.js";
import type {
  ProfileResponse,
  UpdateProfileRequest,
} from "./profiles.types.js";

/**
 * Gets a profile by user ID.
 */
export async function getProfileById(userId: string): Promise<ProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      stellarAddress: true,
      username: true,
      displayName: true,
      bio: true,
      imageUrl: true,
      avatarCid: true,
      xHandle: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Profile not found");
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Gets a profile by username.
 */
export async function getProfileByUsername(
  username: string,
): Promise<ProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      stellarAddress: true,
      username: true,
      displayName: true,
      bio: true,
      imageUrl: true,
      avatarCid: true,
      xHandle: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Profile not found");
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Gets a profile by Stellar address.
 */
export async function getProfileByAddress(
  stellarAddress: string,
): Promise<ProfileResponse> {
  const user = await prisma.user.findUnique({
    where: { stellarAddress },
    select: {
      id: true,
      stellarAddress: true,
      username: true,
      displayName: true,
      bio: true,
      imageUrl: true,
      avatarCid: true,
      xHandle: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError("Profile not found");
  }

  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

/**
 * Updates the authenticated user's profile.
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileRequest,
): Promise<ProfileResponse> {
  // Check if username is already taken
  if (data.username) {
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictError("Username already taken");
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        stellarAddress: true,
        username: true,
        displayName: true,
        bio: true,
        imageUrl: true,
        avatarCid: true,
        xHandle: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info({ userId }, "Profile updated successfully");

    return {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  } catch (error) {
    logger.error({ userId, error }, "Failed to update profile");
    throw new BadRequestError("Failed to update profile");
  }
}

/**
 * Lists all profiles with pagination.
 */
export async function listProfiles(
  page = 1,
  limit = 20,
): Promise<{
  profiles: ProfileResponse[];
  total: number;
  page: number;
  limit: number;
}> {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        stellarAddress: true,
        username: true,
        displayName: true,
        bio: true,
        imageUrl: true,
        avatarCid: true,
        xHandle: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    profiles: users.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
    total,
    page,
    limit,
  };
}
