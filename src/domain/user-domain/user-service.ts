import { toast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { generateRandomAvatarConfig } from "@/lib/utils";
import bankAccountService from "../bankAccount-domain/ba-service";
import * as userRepository from "./user-repository";
import { UserSchema } from "./user-schema";

/**
 * Service layer for user domain. Orchestrates between better-auth, repositories, and other services.
 */
const userService = {
  /**
   * Creates a user using better-auth and initializes a bank account.
   */
  async createUserFromEmail(userData: { email: string; name: string; password: string }, isAPI: boolean = false) {
    console.log(userData);
    const parsedUser = UserSchema.safeParse(userData);
    if (!parsedUser.success) {
      return errorResponse("Invalid user data", ApiErrorCode.VALIDATION_ERROR, parsedUser.error.errors);
    }
    const user = parsedUser.data;
    const avatarConfig = generateRandomAvatarConfig();
    // Use better-auth admin API to create user with role 'user'
    const { data, error } = await authClient.signUp.email({
      name: user.name,
      email: user.email,
      password: user.password,
      callbackURL: "/dashboard",
      fetchOptions: {
        onResponse: () => {
          console.log("onResponse");
        },
        onRequest: () => {
          console.log("onRequest");
        },
        onError: (ctx) => {
          toast({
            title: "Error",
            description: ctx.error.message,
            variant: "destructive",
          });
        },
        onSuccess: async () => {
          toast({
            title: "Success",
            description: "User created successfully",
            variant: "default",
          });
        },
      },
    });
    // If you want to store extra fields (sex, avatarConfig), update the user after registration here.

    if (error) {
      if (error.code === "email_exists") {
        return errorResponse("Email already exists", ApiErrorCode.EMAIL_ALREADY_EXISTS);
      }
      return errorResponse(error.message ?? "Unknown error", ApiErrorCode.OPERATION_FAILED);
    }
    await bankAccountService.createBankAccount({
      userId: data.user.id,
      currency: "CZECHITOKEN",
      name: "My Bank Account",
    });
    // Optionally sign in the user after registration
    // if (!isAPI) {
    //   await userService.signInUser(user.email, user.password);
    // }
    return successResponse("User created successfully", { success: true, user: data });
  },

  /**
   * Gets a user by ID using better-auth admin API.
   */
  // async getUserById(userId: string) {
  //   const result = await authClient.admin.listUsers({
  //     query: {
  //       filterField: "id",
  //       filterOperator: "eq",
  //       filterValue: userId,
  //       limit: 1,
  //     },
  //   });
  //   if (!result || !Array.isArray((result as any).users) || (result as any).users.length === 0) {
  //     return errorResponse("User not found", ApiErrorCode.NOT_FOUND);
  //   }
  //   return successResponse("User found", { success: true, user: (result as any).users[0] });
  // },

  /**
   * Gets a user by API key using the repository (custom logic).
   */
  async getUserByBearerToken(bearerToken: string) {
    const user = await userRepository.getUserByApiKey(bearerToken);
    if (!user) {
      return errorResponse("User not found", ApiErrorCode.NOT_FOUND);
    }
    return successResponse("User found", { success: true, user });
  },

  /**
   * Signs in a user using better-auth.
   */
  async signInUser(email: string, password: string) {
    const { data, error } = await authClient.signIn.email({ email, password });
    console.log(data, error);
    if (error?.code === "user_not_found") {
      return errorResponse("User not found", ApiErrorCode.NOT_FOUND);
    }
    if (error?.code === "invalid_credentials") {
      return errorResponse("Invalid password", ApiErrorCode.INVALID_PASSWORD);
    }
    return successResponse("User signed in", data);
  },

  /**
   * Regenerates a user's API key using the repository (custom logic).
   */
  async regenerateApiKey(userId: string) {
    return userRepository.regenerateApiKey(userId);
  },

  /**
   * Regenerates a user's avatar config using the repository (custom logic).
   */
  async regenerateAvatarConfig(userId: string) {
    const avatarConfig = generateRandomAvatarConfig();
    return userRepository.regenerateAvatarConfig(userId, JSON.stringify(avatarConfig));
  },

  /**
   * Gets all users using better-auth admin API.
   */
  // async getAllUsers() {
  //   const result = await authClient.admin.listUsers({ query: { limit: 100 } });
  //   if (!result || !Array.isArray((result as any).users)) {
  //     return errorResponse("No users found", ApiErrorCode.NOT_FOUND);
  //   }
  //   return successResponse("Users found", (result as any).users);
  // },
};

export default userService;
