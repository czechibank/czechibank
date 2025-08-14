import { z } from "zod";

export const CreateApiKeySchema = z.object({
  name: z.string().min(1),
  expiresInDays: z.number().optional(),
});

export type CreateApiKeySchema = z.infer<typeof CreateApiKeySchema>;
