import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import prisma from "@/lib/db";
import { ac, admin, user } from "@/lib/permissions";
import { RATE_LIMIT, SESSION } from "@/server-constants";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin as adminPlugin, apiKey } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: SESSION.EXPIRES_IN,
    updateAge: SESSION.UPDATE_AGE,
  },
  telemetry: { enabled: false },
  plugins: [
    apiKey({
      rateLimit: {
        enabled: true,
        timeWindow: RATE_LIMIT.TIME_WINDOW,
        maxRequests: RATE_LIMIT.MAX_REQUESTS,
      },
      // better-auth say that it can create security issue, that we returning session.
      // not sure how to handle this.. so far, this is OK. @vojtech-cerveny
      enableSessionForAPIKeys: true,
      disableKeyHashing: true,
    }),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log("[auth] user created", user.email);
          console.log("[auth] creating bank account");
          await bankAccountService.createBankAccount({
            userId: user.id,
            currency: "CZECHITOKEN",
            name: "My Bank Account",
          });
          console.log("[auth] bank account created");
        },
      },
    },
  },
});
