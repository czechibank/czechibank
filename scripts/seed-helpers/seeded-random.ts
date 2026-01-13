/**
 * Generates a deterministic pseudo-random number between 0 and 1.
 *
 * Uses a mathematical function (sine) to generate consistent random numbers
 * based on a seed value. This ensures that the same seed and offset always
 * produce the same result, which is essential for reproducible seeding.
 *
 * @param seed - Base seed value for random number generation
 * @param offset - Optional offset to generate different values from the same seed
 * @returns A pseudo-random number between 0 (inclusive) and 1 (exclusive)
 *
 * @example
 * ```ts
 * const random1 = seededRandom(100, 0); // Always returns same value
 * const random2 = seededRandom(100, 1); // Different value, but also deterministic
 * ```
 */
export function seededRandom(seed: number, offset: number = 0) {
  // Use a more stable random number generation
  const x = Math.sin(seed + offset) * 10000;
  const result = x - Math.floor(x);

  return result;
}
