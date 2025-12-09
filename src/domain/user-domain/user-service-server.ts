import { Role } from "@/lib/permissions";
import { ApiErrorCode, ErrorResponse, errorResponse, SuccessResponse, successResponse } from "@/lib/response";
import { auth } from "../../../auth";
import * as userRepository from "./user-repository";
import { CreateUserSchemaType } from "./user-schema";

import { UserWithBankAccounts } from "@/components/transactions/transfer";
import { UserWithRole } from "better-auth/plugins";

/**
 * Server-side service layer for user domain. Uses better-auth server API.
 */
const userServiceServer = {
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
  async createUser(user: CreateUserSchemaType, role: Role): Promise<{ user: UserWithRole }> {
    return await auth.api.createUser({
      body: {
        email: user.email,
        password: user.password,
        name: user.name,
        role: role,
      },
    });
  },

  /**
   * Get all users from the DB with their bank accounts.
   * @returns The users with their bank accounts
   */
  async getAllUsersWithBankAccounts(): Promise<SuccessResponse<UserWithBankAccounts[]> | ErrorResponse> {
    try {
      const result = await userRepository.getAllUsersWithBankAccounts();
      return successResponse("Users found", result);
    } catch (error) {
      return errorResponse("Error fetching users", ApiErrorCode.OPERATION_FAILED);
    }
  },
};

export default userServiceServer;
