"use server";
import prisma from "@/lib/db";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { Prisma } from "@prisma/client";

export async function registerUser(user: Prisma.UserCreateInput) {
  const prismaUser = await prisma.user.create({
    data: {
      ...user,
    },
  });
  if ("error" in prismaUser) {
    return errorResponse("An error occurred while creating the user", ApiErrorCode.OPERATION_FAILED);
  }
  return successResponse("User created successfully", prismaUser);
}

export async function isEmailUnique(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  return user === null;
}

export async function signInUser(email: string, password: string) {
  return await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({ include: { BankAccount: true } });

  return successResponse("Users found", users);
}

export async function regenerateApiKey(userId: string) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      apiKey: Math.random().toString(36).substring(2),
    },
  });

  return successResponse("API key regenerated", user);
}

export async function regenerateAvatarConfig(userId: string, avatarConfig: string) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      avatarConfig: avatarConfig,
    },
  });
  if ("error" in user) {
    return errorResponse("An error occurred while regenerating the avatar config", ApiErrorCode.OPERATION_FAILED);
  }

  return successResponse("Avatar config regenerated", user);
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function getUserByApiKey(apiKey: string) {
  const user = await prisma.user.findFirst({
    where: {
      apiKey: apiKey,
    },
  });

  return user;
}
