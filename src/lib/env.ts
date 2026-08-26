import { z } from "zod";

// const envSchema = z.object({
//   DISCORD_WEBHOOK_URL: z.string().url().optional(),
// });
const envSchema = z.object({
  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  // Coolify fills COOLIFY_FQDN only at runtime, so the build sees an empty HOST.
  HOST: z
    .string()
    .min(1)
    .catch(() => process.env.COOLIFY_FQDN || "localhost:3000"),
  // Login shells export ENV=/etc/profile; treat anything unknown as unset.
  ENV: z.enum(["development", "CI", "PROD"]).optional().catch(undefined),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error);
  process.exit(1);
}

export default env.data;
