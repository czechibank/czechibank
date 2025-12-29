// Helper function to generate deterministic random numbers
export function seededRandom(seed: number, offset: number = 0) {
  // Use a more stable random number generation
  const x = Math.sin(seed + offset) * 10000;
  const result = x - Math.floor(x);

  // Add logging for seed 4 to debug the issue
  if (seed === 4) {
    console.log(`[${new Date().toISOString()}] Debugging seed 4 with offset ${offset}...`);
    console.log(`[${new Date().toISOString()}] seed 4 calculation:`, { x, result });
  }

  return result;
}
