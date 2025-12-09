import { ResponseSuccessErrorType } from "@/domain/shared-domain-types";
import { authClient } from "@/lib/auth-client";
import { User } from "@prisma/client";

import { CreateUserSchemaType, UserBaseSchemaType } from "./user-schema";

/**
 * Client-side service layer for user domain. Uses better-auth client for authentication operations.
 */
const userServiceClient = {
  /**
   * Signs in a user using better-auth.
   * @param user - The user to sign in.
   * @param onSuccess - The function to call when the user is signed in.
   * @param onError - The function to call when the user is not signed in.
   */
  async signIn(user: UserBaseSchemaType, { onSuccess, onError }: ResponseSuccessErrorType) {
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
  async signUp(user: CreateUserSchemaType, { onSuccess, onError }: ResponseSuccessErrorType) {
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
};

export default userServiceClient;
