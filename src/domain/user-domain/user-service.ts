import { toast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { generateRandomAvatarConfig } from "@/lib/utils";
import { auth } from "../../../auth";
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
    const avatarConfig = JSON.stringify(generateRandomAvatarConfig());
    // Use better-auth admin API to create user with role 'user'
    const { data, error } = await authClient.signUp.email({
      name: user.name,
      email: user.email,
      password: user.password,
      image: avatarConfig,
      fetchOptions: {
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

    if (error) {
      if (error.code === "email_exists") {
        return errorResponse("Email already exists", ApiErrorCode.EMAIL_ALREADY_EXISTS);
      }
      return errorResponse(error.message ?? "Unknown error", ApiErrorCode.OPERATION_FAILED);
    }

    if (isAPI) {
      console.log("[user-service] creating api key");
      const apiKey = await authClient.apiKey.create({
        name: "default-api-key",
        expiresIn: 3600 * 24 * 60,
      });
      if (apiKey.error) {
        return errorResponse(apiKey.error.message ?? "Unknown error", ApiErrorCode.OPERATION_FAILED);
      }
      console.log("[user-service] api key created", apiKey);
      return successResponse("User created successfully", {
        success: true,
        user: { ...data, apiKey: apiKey.data.key },
      });
    }
    // Optionally sign in the user after registration
    return successResponse("User created successfully", { success: true, user: { ...data } });
  },

  /**
   * Gets a user by ID using better-auth admin API.
   */
  async getUserById(userId: string) {
    console.log("[user-service] getUserById", userId);
    const result = await authClient.admin.listUsers({
      query: {
        filterField: "id",
        filterOperator: "eq",
        filterValue: userId,
        limit: 1,
      },
    });
    console.log("[user-service] getUserById", result);
    if (!result || !Array.isArray((result as any).users) || (result as any).users.length === 0) {
      return errorResponse("User not found", ApiErrorCode.NOT_FOUND);
    }
    return successResponse("User found", { success: true, user: (result as any).users[0] });
  },

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
    const user = await auth.api.signInEmail({ body: { email, password } });
    console.log(user);

    return successResponse("User signed in", user);
  },

  /**
   * Regenerates a user's avatar config using the repository (custom logic).
   */
  async regenerateAvatarConfig(userId: string) {
    const avatarConfig = generateRandomAvatarConfig();

    return userRepository.regenerateAvatarConfig(userId, JSON.stringify(avatarConfig));
  },

  /**
   * Get all users from the DB with their bank accounts.
   */
  async getAllUsers() {
    try {
      const result = await userRepository.getAllUsers();
      return successResponse("Users found", result);
    } catch (error) {
      return errorResponse("Error fetching users", ApiErrorCode.OPERATION_FAILED);
    }
  },
};

export default userService;
