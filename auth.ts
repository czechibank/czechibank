import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import prisma from "@/lib/db";
import { ac, admin, user } from "@/lib/permissions";
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
  plugins: [
    apiKey({
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60 * 1, // 1 minute - good for testing rate limit in dev
        maxRequests: 20, // 20 requests per minute
      },
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
        before: async (user) => {
          // Modify user data before creation
          return { data: { ...user, customField: "value" } };
        },
        after: async (user) => {
          console.log("[auth] user created", user);
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
