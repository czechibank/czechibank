/** Returns true when Prisma reports a P2002 unique violation for all listed fields. */
export function isPrismaUniqueOnFields(error: unknown, fields: string[]): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  if (!Array.isArray(target) || !target.every((x) => typeof x === "string")) return false;
  return fields.every((f) => (target as string[]).includes(f));
}
