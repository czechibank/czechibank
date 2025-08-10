import { z } from "zod";

export const FeatureSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string(),
  toggle: z.boolean().default(false),
  defaultToggle: z.boolean().default(false),
  category: z.array(z.string()),
  lastChangedBy: z.string().optional(),
  lastChangedAt: z.string().optional(),
});
export type FeatureType = z.infer<typeof FeatureSchema>;
