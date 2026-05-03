import { type AppError, operationFailed } from "@/lib/errors";
import { Role } from "@/lib/permissions";
import { type ErrorResponse, type SuccessResponse } from "@/lib/response";
import { toServiceResponse } from "@/lib/result-helpers";
import { auth } from "../../../auth";
import * as userRepository from "./user-repository";
import { CreateUserSchemaType } from "./user-schema";

import { UserWithBankAccounts } from "@/components/transactions/transfer";
import { UserWithRole } from "better-auth/plugins";
import { ResultAsync } from "neverthrow";

const userServiceServer = {
  async getSession(headers: Headers) {
    return await auth.api.getSession({
      headers,
    });
  },

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

  // --- Result-based method ---

  getAllUsersWithBankAccountsResult(): ResultAsync<UserWithBankAccounts[], AppError> {
    return ResultAsync.fromPromise(userRepository.getAllUsersWithBankAccounts(), () =>
      operationFailed("Error fetching users"),
    );
  },

  // --- Legacy wrapper ---

  async getAllUsersWithBankAccounts(): Promise<SuccessResponse<UserWithBankAccounts[]> | ErrorResponse> {
    return toServiceResponse(this.getAllUsersWithBankAccountsResult(), "Users found");
  },
};

export default userServiceServer;
