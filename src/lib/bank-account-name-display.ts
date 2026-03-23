/** Matches the app-generated suffix at the end of a name, such as " (01)" or " (123)". */
export const APP_SUFFIX_REGEX = /\s\((\d{2,})\)$/;

/** Splits a stored account name into its base text and optional app-generated suffix. */
export function splitBankAccountNameForDisplay(name: string): { base: string; suffix: string | null } {
  const normalized = name.trim();
  const match = normalized.match(APP_SUFFIX_REGEX);
  if (!match) return { base: normalized, suffix: null };
  const suffix = match[0];
  const base = normalized.slice(0, -suffix.length);
  return { base, suffix };
}
