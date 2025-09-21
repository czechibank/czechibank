import { useTheme } from "next-themes";

interface ShimmerOverlayProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function ShimmerOverlay({
  width = "100%",
  height = "100%",
  borderRadius = "0.5rem",
  className = "",
}: ShimmerOverlayProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  console.log("datk mode:", isDarkMode);

  //  adapt colors to theme
  const overlayColor = isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
  const shimmerColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.4)";

  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: overlayColor,
        backdropFilter: "blur(1px)",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: shimmerColor,
        }}
      >
        <div
          className="animate-shimmer absolute left-0 top-0 h-full w-full"
          style={{
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)",
          }}
        />
      </div>
    </div>
  );
}
