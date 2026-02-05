import { z } from "zod";

// const envSchema = z.object({
//   DISCORD_WEBHOOK_URL: z.string().url().optional(),
// });
const envSchema = z.object({
  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  HOST: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional().or(z.literal("")),
  ENV: z.enum(["development", "CI", "PROD"]).optional(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error);
  process.exit(1);
}

export default env.data;
