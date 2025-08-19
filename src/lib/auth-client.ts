import { adminClient, apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, user } from "./permissions";

export const authClient = createAuthClient({
  session: {
    expiresIn: 60 * 15, // 15 minutes
    updateAge: 60 * 15, // 15 minutes (every 15 minutes the session expiration is updated)
  },
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    apiKeyClient(),
  ],
});

export const { signUp, signIn, signOut, useSession } = authClient;
