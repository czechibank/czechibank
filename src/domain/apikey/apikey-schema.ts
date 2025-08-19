import { z } from "zod";

export const CreateApiKeySchema = z.object({
  name: z.string().min(1),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export type CreateApiKeySchema = z.infer<typeof CreateApiKeySchema>;
