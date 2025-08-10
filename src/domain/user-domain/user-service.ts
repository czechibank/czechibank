import { authClient } from "@/lib/auth-client";
import { Role } from "@/lib/permissions";
import { ApiErrorCode, ErrorResponse, errorResponse, SuccessResponse, successResponse } from "@/lib/response";
import { User } from "@prisma/client";
import { auth } from "../../../auth";
import * as userRepository from "./user-repository";
import type { CreateUserSchema } from "./user-schema";

import { ResponseSuccessErrorType } from "@/domain/shared-domain-types";
import { UserWithRole } from "better-auth/plugins";

/**
 * Service layer for user domain. Orchestrates between better-auth, repositories, and other services.
 */
const userService = {
  client: {
    /**
     * Signs in a user using better-auth.
     * @param user - The user to sign in.
     * @param onSuccess - The function to call when the user is signed in.
     * @param onError - The function to call when the user is not signed in.
     */
    async signIn(
      user: { email: string; password: string },
      { onSuccess, onError }: ResponseSuccessErrorType,
    ): Promise<void> {
      await authClient.signIn.email(
        { email: user.email, password: user.password },
        {
          onSuccess,
          onError,
        },
      );
    },

    /**
     * Sign up a user using better-auth.
     * @param user - The user to sign up.
     * @param onSuccess - The function to call when the user is signed up.
     * @param onError - The function to call when the user is not signed up.
     */
    async signUp(
      user: { email: string; password: string; name: string; image: string },
      { onSuccess, onError }: ResponseSuccessErrorType,
    ): Promise<void> {
      await authClient.signUp.email(
        {
          email: user.email,
          password: user.password,
          name: user.name,
          image: user.image,
        },
        { onSuccess, onError },
      );
    },

    /**
     * Update a user on the client side
     * TODO: @vojtech-cerveny - add more fields to update
     * @param user - The user to update
     * @param onSuccess - The function to call when the user is updated
     * @param onError - The function to call when the user is not updated
     */
    async updateUser(user: Pick<User, "image">, { onSuccess, onError }: ResponseSuccessErrorType): Promise<void> {
      await authClient.updateUser({ image: user.image }, { onSuccess, onError });
    },

    async signOut({ onSuccess, onError }: ResponseSuccessErrorType): Promise<void> {
      await authClient.signOut({
        fetchOptions: {
          onSuccess,
          onError,
        },
      });
    },
  },

  server: {
    /**
     * Get the session from the headers on the server side
     * @param headers - The headers to get the session from
     * @returns The session
     */
    async getSession(headers: Headers) {
      return await auth.api.getSession({
        headers,
      });
    },

    /**
     * Create a user on the server side
     * @param user - The user to create
     * @param role - The role of the user
     * @returns The user
     */
    async createUser(user: CreateUserSchema, role: Role): Promise<{ user: UserWithRole }> {
      return await auth.api.createUser({
        body: {
          email: user.email,
          password: user.password,
          name: user.name,
          role: "admin" as Role,
        },
      });
    },

    /**
     * Get all users from the DB with their bank accounts.
     * @returns The users with their bank accounts
     */
    async getAllUsers(): Promise<SuccessResponse<any> | ErrorResponse> {
      try {
        const result = await userRepository.getAllUsers();
        return successResponse("Users found", result);
      } catch (error) {
        return errorResponse("Error fetching users", ApiErrorCode.OPERATION_FAILED);
      }
    },
  },
};

export default userService;
