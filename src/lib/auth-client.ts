import { adminClient, apiKeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, user } from "./permissions";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // The base URL of your auth server
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
