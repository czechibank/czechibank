/** Plain boolean admin check for branching (not a Result gate). */
export function isAdmin(user: { role?: string | null }): boolean {
  return user.role === "admin";
}
