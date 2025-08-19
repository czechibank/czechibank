import { z } from "zod";

const envSchema = z.object({
  DISCORD_WEBHOOK_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional(),
  ),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("Invalid environment variables:", env.error);
  process.exit(1);
}

export default env.data;
