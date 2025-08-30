export function Shimmer({ width = "100%", height = "1rem", className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{ width, height }}
    >
      <div className="animate-shimmer absolute left-0 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
}
