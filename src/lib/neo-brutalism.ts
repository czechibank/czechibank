// Neo-brutalism design system constants
// Shared across the entire app to avoid duplication

export const nbColors = {
  pink: "#ff4c91",
  yellow: "#FFE566",
  blue: "#6EC1E4",
  orange: "#FF6B35",
  green: "#7ED957",
  purple: "#B794F6",
  white: "#FFFFFF",
  red: "#f87171",
} as const;

// Ordered palette for index-based color picking (e.g. cards)
export const nbPalette = [
  nbColors.pink,
  nbColors.yellow,
  nbColors.blue,
  nbColors.orange,
  nbColors.green,
  nbColors.purple,
] as const;
