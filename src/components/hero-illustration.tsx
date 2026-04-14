"use client";

import { nbColors } from "@/lib/neo-brutalism";
import { motion } from "framer-motion";
import { BadgeCheck, Code2, FileJson, Gift, LucideIcon, Terminal, TestTube, Wallet } from "lucide-react";

// ============================================
// CONFIGURATION - Edit these to customize!
// ============================================

// Color palette (re-exported from shared constants)
export { nbColors as heroColors } from "@/lib/neo-brutalism";
const heroColors = nbColors;

type ColorKey = keyof typeof heroColors;

// ============================================
// ELEMENT TYPES
// ============================================

type Position = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

type Size = "xs" | "sm" | "md" | "lg";

interface BaseElement {
  id: string;
  position: Position;
  rotate?: number;
  delay?: number;
  zIndex?: number;
}

// Card with icon (larger element)
export interface CardElement extends BaseElement {
  type: "card";
  icon: LucideIcon;
  label: string;
  color: ColorKey;
}

// Simple text badge (HTTP methods, status codes, etc.)
export interface BadgeElement extends BaseElement {
  type: "badge";
  label: string;
  color?: ColorKey;
  size?: Size;
}

// Pill with optional emoji
export interface PillElement extends BaseElement {
  type: "pill";
  label: string;
  emoji?: string;
  color?: ColorKey;
}

// Just an emoji
export interface EmojiElement extends BaseElement {
  type: "emoji";
  emoji: string;
  size?: Size;
}

// Star doodle
export interface StarDoodleElement extends BaseElement {
  type: "star";
  color: string; // Tailwind color class like "text-yellow-400"
  size?: Size;
}

// Heart doodle
export interface HeartDoodleElement extends BaseElement {
  type: "heart";
  color: string;
  size?: Size;
}

// Spark doodle
export interface SparkDoodleElement extends BaseElement {
  type: "spark";
  color: string;
  size?: Size;
}

// Colored dot
export interface DotElement extends BaseElement {
  type: "dot";
  color: string; // Tailwind bg class like "bg-yellow-400"
  size?: Size;
}

export type HeroElement =
  | CardElement
  | BadgeElement
  | PillElement
  | EmojiElement
  | StarDoodleElement
  | HeartDoodleElement
  | SparkDoodleElement
  | DotElement;

// ============================================
// HERO ELEMENTS DATA - Easy to edit!
// ============================================

export const heroElements: HeroElement[] = [
  // === CARDS (larger elements with icons) ===
  {
    id: "api-ready",
    type: "card",
    icon: Terminal,
    label: "API Ready!",
    color: "yellow",
    position: { left: "10px", top: "20px" },
    rotate: 8,
    delay: 0.3,
  },
  {
    id: "100-free",
    type: "card",
    icon: Gift,
    label: "100% Free",
    color: "pink",
    position: { left: "22%", top: "15px" },
    rotate: -4,
    delay: 0.35,
  },
  {
    id: "test-mode",
    type: "card",
    icon: TestTube,
    label: "Test Mode",
    color: "green",
    position: { right: "14px", top: "15px" },
    rotate: -6,
    delay: 0.45,
  },
  {
    id: "swagger",
    type: "card",
    icon: FileJson,
    label: "Swagger",
    color: "purple",
    position: { right: "15%", top: "22%" },
    rotate: 5,
    delay: 0.6,
  },
  {
    id: "learn-api",
    type: "card",
    icon: Code2,
    label: "Learn API",
    color: "blue",
    position: { left: "2%", bottom: "38%" },
    rotate: 0,
    delay: 0.8,
  },
  {
    id: "0-fees",
    type: "card",
    icon: Wallet,
    label: "0 Fees",
    color: "orange",
    position: { left: "18%", bottom: "8%" },
    rotate: -3,
    delay: 1,
  },

  // === BADGES (small text labels) ===
  {
    id: "rest",
    type: "badge",
    label: "REST",
    position: { left: "32%", top: "15%" },
    rotate: 6,
    delay: 0.55,
  },
  {
    id: "200-ok",
    type: "badge",
    label: "200 OK",
    color: "green",
    position: { left: "18%", top: "35%" },
    rotate: -5,
    delay: 0.7,
  },
  {
    id: "post",
    type: "badge",
    label: "POST",
    color: "green",
    position: { left: "35%", top: "30%" },
    rotate: 8,
    delay: 0.75,
  },
  {
    id: "get",
    type: "badge",
    label: "GET",
    color: "blue",
    position: { left: "22%", bottom: "45%" },
    rotate: -8,
    delay: 0.85,
  },
  {
    id: "json",
    type: "badge",
    label: "{JSON}",
    color: "yellow",
    position: { left: "60%", top: "40%" },
    rotate: 4,
    delay: 0.9,
  },
  {
    id: "http",
    type: "badge",
    label: "HTTP",
    position: { left: "52%", top: "20%" },
    rotate: -6,
    delay: 0.52,
    size: "xs",
  },
  {
    id: "v1",
    type: "badge",
    label: "v1",
    color: "purple",
    position: { left: "62%", top: "2%" },
    rotate: 10,
    delay: 0.42,
    size: "xs",
  },
  {
    id: "auth",
    type: "badge",
    label: "Auth",
    position: { right: "5%", top: "38%" },
    rotate: -4,
    delay: 0.68,
    size: "xs",
  },
  {
    id: "delete",
    type: "badge",
    label: "DELETE",
    color: "red",
    position: { left: "50%", top: "35%" },
    rotate: 5,
    delay: 0.82,
    size: "xs",
  },
  {
    id: "put",
    type: "badge",
    label: "PUT",
    color: "orange",
    position: { left: "65%", top: "18%" },
    rotate: -7,
    delay: 0.58,
    size: "xs",
  },
  {
    id: "users",
    type: "badge",
    label: "/users",
    color: "blue",
    position: { left: "42%", top: "42%" },
    rotate: 3,
    delay: 0.87,
    size: "xs",
  },
  {
    id: "patch",
    type: "badge",
    label: "PATCH",
    color: "purple",
    position: { left: "48%", bottom: "35%" },
    rotate: -5,
    delay: 0.97,
    size: "xs",
  },
  {
    id: "accounts",
    type: "badge",
    label: "/accounts",
    color: "purple",
    position: { left: "12%", top: "42%" },
    rotate: 6,
    delay: 0.76,
    size: "xs",
  },
  {
    id: "201",
    type: "badge",
    label: "201",
    color: "green",
    position: { left: "45%", top: "18%" },
    rotate: -3,
    delay: 0.62,
    size: "xs",
  },
  {
    id: "iban",
    type: "badge",
    label: "IBAN",
    color: "blue",
    position: { left: "62%", bottom: "15%" },
    rotate: 8,
    delay: 1.08,
    size: "xs",
  },

  // === PILLS (rounded with optional emoji) ===
  {
    id: "fun",
    type: "pill",
    label: "Fun!",
    emoji: "🚀",
    color: "pink",
    position: { left: "42%", top: "20px" },
    delay: 0.4,
  },
  {
    id: "czechitas",
    type: "pill",
    label: "Czechitas",
    color: "white",
    position: { left: "8%", top: "18%" },
    delay: 0.5,
  },
  {
    id: "learn",
    type: "pill",
    label: "Learn",
    emoji: "📚",
    color: "blue",
    position: { left: "10px", top: "32%" },
    delay: 0.65,
  },
  {
    id: "easy",
    type: "pill",
    label: "Easy!",
    emoji: "✨",
    color: "yellow",
    position: { left: "5%", bottom: "18%" },
    delay: 0.95,
  },
  {
    id: "success",
    type: "pill",
    label: "Success!",
    emoji: "🎉",
    color: "white",
    position: { left: "38%", bottom: "2%" },
    delay: 1.05,
    rotate: 10,
  },
  {
    id: "safe",
    type: "pill",
    label: "Safe",
    emoji: "🔒",
    color: "green",
    position: { left: "28%", top: "40%" },
    delay: 0.72,
  },
  {
    id: "token",
    type: "pill",
    label: "Token",
    emoji: "🔑",
    color: "blue",
    position: { left: "22%", bottom: "29%" },
    delay: 0.92,
    rotate: 10,
  },
  {
    id: "sandbox",
    type: "pill",
    label: "Sandbox",
    color: "orange",
    position: { left: "50%", bottom: "22%" },
    delay: 1.02,
  },
  {
    id: "try-it",
    type: "pill",
    label: "Try it!",
    color: "pink",
    position: { left: "58%", top: "28%" },
    delay: 0.78,
  },
  {
    id: "fast",
    type: "pill",
    label: "Fast!",
    emoji: "⚡",
    color: "orange",
    position: { left: "10%", bottom: "28%" },
    delay: 0.88,
    rotate: 10,
  },
  {
    id: "api",
    type: "pill",
    label: "API",
    color: "white",
    position: { left: "75%", top: "8%" },
    delay: 0.48,
  },

  // === EMOJIS ===
  {
    id: "emoji-money",
    type: "emoji",
    emoji: "💰",
    position: { left: "55%", top: "8%" },
    delay: 1.1,
    size: "md",
  },
  {
    id: "emoji-card",
    type: "emoji",
    emoji: "💳",
    position: { left: "70%", top: "3%" },
    delay: 1.12,
    size: "sm",
  },
  {
    id: "emoji-bank",
    type: "emoji",
    emoji: "🏦",
    position: { left: "5%", top: "50%" },
    delay: 1.14,
    size: "sm",
  },
  {
    id: "emoji-bolt",
    type: "emoji",
    emoji: "⚡",
    position: { left: "35%", bottom: "30%" },
    delay: 1.16,
    size: "lg",
  },
  {
    id: "emoji-fire",
    type: "emoji",
    emoji: "🔥",
    position: { left: "48%", bottom: "12%" },
    delay: 1.18,
    size: "xs",
  },
  {
    id: "emoji-check",
    type: "emoji",
    emoji: "✅",
    position: { left: "48%", top: "22%" },
    delay: 1.2,
    size: "xs",
  },
  {
    id: "emoji-target",
    type: "emoji",
    emoji: "🎯",
    position: { left: "68%", top: "30%" },
    delay: 1.22,
    size: "xs",
  },
  {
    id: "emoji-bulb",
    type: "emoji",
    emoji: "💡",
    position: { left: "38%", top: "8%" },
    delay: 1.24,
    size: "xs",
  },
  {
    id: "emoji-game",
    type: "emoji",
    emoji: "🎮",
    position: { left: "25%", top: "52%" },
    delay: 1.26,
    size: "xs",
  },
  {
    id: "emoji-dev",
    type: "emoji",
    emoji: "👩‍💻",
    position: { left: "65%", bottom: "38%" },
    delay: 1.28,
    size: "xs",
  },
  {
    id: "emoji-star",
    type: "emoji",
    emoji: "🌟",
    position: { left: "78%", top: "22%" },
    delay: 1.3,
    size: "xs",
  },
  {
    id: "emoji-rocket",
    type: "emoji",
    emoji: "🚀",
    position: { left: "25%", bottom: "5%" },
    delay: 1.32,
    size: "xs",
  },
  {
    id: "emoji-cash",
    type: "emoji",
    emoji: "💸",
    position: { left: "32%", top: "48%" },
    delay: 1.34,
    size: "sm",
  },
  {
    id: "emoji-signal",
    type: "emoji",
    emoji: "📡",
    position: { left: "72%", top: "42%" },
    delay: 1.36,
    size: "xs",
  },

  // === STAR DOODLES ===
  {
    id: "star-1",
    type: "star",
    color: "text-purple-400",
    position: { left: "12%", top: "8%" },
    delay: 0.8,
    size: "sm",
  },
  {
    id: "star-2",
    type: "star",
    color: "text-yellow-400",
    position: { left: "50%", top: "15%" },
    delay: 0.85,
    size: "xs",
  },
  {
    id: "star-3",
    type: "star",
    color: "text-orange-400",
    position: { left: "28%", top: "25%" },
    delay: 0.9,
    size: "xs",
  },
  {
    id: "star-4",
    type: "star",
    color: "text-green-400",
    position: { left: "12%", bottom: "35%" },
    delay: 0.95,
    size: "xs",
  },
  {
    id: "star-5",
    type: "star",
    color: "text-blue-400",
    position: { left: "35%", bottom: "25%" },
    delay: 1,
    size: "xs",
  },
  {
    id: "star-6",
    type: "star",
    color: "text-pink-400",
    position: { left: "55%", bottom: "5%" },
    delay: 1.05,
    size: "xs",
  },

  // === HEART DOODLES ===
  {
    id: "heart-1",
    type: "heart",
    color: "text-pink-500",
    position: { left: "42%", top: "28%" },
    delay: 0.88,
    size: "xs",
  },
  {
    id: "heart-2",
    type: "heart",
    color: "text-red-400",
    position: { left: "25%", bottom: "22%" },
    delay: 0.92,
    size: "xs",
  },
  {
    id: "heart-3",
    type: "heart",
    color: "text-pink-400",
    position: { left: "60%", top: "18%" },
    delay: 0.96,
    size: "xs",
  },

  // === SPARK DOODLES ===
  {
    id: "spark-1",
    type: "spark",
    color: "text-yellow-500",
    position: { left: "22%", top: "42%" },
    delay: 0.9,
    size: "sm",
  },
  {
    id: "spark-2",
    type: "spark",
    color: "text-blue-400",
    position: { left: "58%", top: "5%" },
    delay: 0.94,
    size: "sm",
  },
  {
    id: "spark-3",
    type: "spark",
    color: "text-purple-400",
    position: { left: "42%", bottom: "15%" },
    delay: 0.98,
    size: "xs",
  },

  // === DOTS ===
  {
    id: "dot-1",
    type: "dot",
    color: "bg-yellow-400",
    position: { left: "65%", top: "12%" },
    delay: 1.1,
    size: "sm",
  },
  {
    id: "dot-2",
    type: "dot",
    color: "bg-pink-400",
    position: { left: "8%", top: "28%" },
    delay: 1.12,
    size: "sm",
  },
  {
    id: "dot-3",
    type: "dot",
    color: "bg-green-400",
    position: { left: "30%", top: "5%" },
    delay: 1.14,
    size: "xs",
  },
  {
    id: "dot-4",
    type: "dot",
    color: "bg-blue-400",
    position: { left: "45%", bottom: "32%" },
    delay: 1.16,
    size: "sm",
  },
  {
    id: "dot-5",
    type: "dot",
    color: "bg-orange-400",
    position: { left: "32%", bottom: "8%" },
    delay: 1.18,
    size: "xs",
  },
  {
    id: "dot-6",
    type: "dot",
    color: "bg-purple-400",
    position: { left: "15%", top: "55%" },
    delay: 1.2,
    size: "xs",
  },
];

// ============================================
// SVG DOODLE COMPONENTS
// ============================================

function StarDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

function HeartDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function SparkDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" />
    </svg>
  );
}

// ============================================
// ELEMENT RENDERERS
// ============================================

const sizeMap = {
  xs: { text: "text-[7px]", icon: "h-3 w-3", emoji: "text-xs", doodle: "h-2.5 w-2.5", dot: "h-1.5 w-1.5" },
  sm: { text: "text-[8px]", icon: "h-3.5 w-3.5", emoji: "text-sm", doodle: "h-3 w-3", dot: "h-2 w-2" },
  md: { text: "text-[9px]", icon: "h-4 w-4", emoji: "text-base", doodle: "h-4 w-4", dot: "h-2.5 w-2.5" },
  lg: { text: "text-[10px]", icon: "h-5 w-5", emoji: "text-lg", doodle: "h-5 w-5", dot: "h-3 w-3" },
};

function getPositionStyle(position: Position): React.CSSProperties {
  return {
    top: position.top,
    bottom: position.bottom,
    left: position.left,
    right: position.right,
  };
}

function RenderCard({ element }: { element: CardElement }) {
  const Icon = element.icon;
  const floatDuration = 3 + (element.delay || 0) * 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, rotate: element.rotate || 0 }}
      animate={{
        opacity: 1,
        y: [0, -8, 0],
        rotate: [(element.rotate || 0) - 1, (element.rotate || 0) + 1, (element.rotate || 0) - 1],
      }}
      transition={{
        opacity: { duration: 0.4, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <div
        className="rounded-xl border-3 border-black p-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor: heroColors[element.color] }}
      >
        <Icon className="h-4 w-4" />
        <p className="mt-0.5 text-[9px] font-bold">{element.label}</p>
      </div>
    </motion.div>
  );
}

function RenderBadge({ element }: { element: BadgeElement }) {
  const size = element.size || "sm";
  const bgColor = element.color ? heroColors[element.color] : "#FFFFFF";
  const floatDuration = 3.5 + (element.delay || 0) * 1.8;

  return (
    <motion.div
      initial={{ opacity: 0, rotate: element.rotate || 0 }}
      animate={{
        opacity: 1,
        y: [0, -6, 0],
        rotate: [(element.rotate || 0) - 0.5, (element.rotate || 0) + 0.5, (element.rotate || 0) - 0.5],
      }}
      transition={{
        opacity: { duration: 0.3, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <div
        className="rounded border-2 border-black px-1.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor: bgColor }}
      >
        <p className={`${sizeMap[size].text} font-black text-black`}>{element.label}</p>
      </div>
    </motion.div>
  );
}

function RenderPill({ element }: { element: PillElement }) {
  const bgColor = element.color ? heroColors[element.color] : "#FFFFFF";
  const hasCzechitasIcon = element.id === "czechitas";
  const floatDuration = 4 + (element.delay || 0) * 1.5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: element.rotate || 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -7, 0],
        rotate: [(element.rotate || 0) - 1, (element.rotate || 0) + 1, (element.rotate || 0) - 1],
      }}
      transition={{
        opacity: { duration: 0.3, delay: element.delay || 0 },
        scale: { duration: 0.3, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <div
        className="flex items-center gap-1 rounded-full border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor: bgColor }}
      >
        {hasCzechitasIcon && <BadgeCheck className="h-3 w-3 text-pink-500" />}
        {element.emoji && <span className="text-[10px]">{element.emoji}</span>}
        <span className="text-[9px] font-bold text-black">{element.label}</span>
      </div>
    </motion.div>
  );
}

function RenderEmoji({ element }: { element: EmojiElement }) {
  const size = element.size || "sm";
  const floatDuration = 4.5 + (element.delay || 0) * 1.3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -5, 0],
        rotate: [-3, 3, -3],
      }}
      transition={{
        opacity: { duration: 0.3, delay: element.delay || 0 },
        scale: { duration: 0.3, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <span className={sizeMap[size].emoji}>{element.emoji}</span>
    </motion.div>
  );
}

function RenderStarDoodle({ element }: { element: StarDoodleElement }) {
  const size = element.size || "sm";
  const floatDuration = 5 + (element.delay || 0) * 1.2;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        y: [0, -4, 0],
        rotate: [0, 360],
      }}
      transition={{
        scale: { duration: 0.3, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration * 2,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "linear",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <StarDoodle className={`${sizeMap[size].doodle} ${element.color}`} />
    </motion.div>
  );
}

function RenderHeartDoodle({ element }: { element: HeartDoodleElement }) {
  const size = element.size || "sm";
  const floatDuration = 4.2 + (element.delay || 0) * 1.4;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: [1, 1.1, 1],
        y: [0, -6, 0],
        rotate: [-5, 5, -5],
      }}
      transition={{
        scale: { duration: 0.3, delay: element.delay || 0 },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <HeartDoodle className={`${sizeMap[size].doodle} ${element.color}`} />
    </motion.div>
  );
}

function RenderSparkDoodle({ element }: { element: SparkDoodleElement }) {
  const size = element.size || "sm";
  const floatDuration = 3.8 + (element.delay || 0) * 1.6;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: [1, 1.15, 1],
        y: [0, -5, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        scale: {
          duration: 0.3,
          delay: element.delay || 0,
        },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: floatDuration * 1.5,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "linear",
        },
      }}
      className="absolute"
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    >
      <SparkDoodle className={`${sizeMap[size].doodle} ${element.color}`} />
    </motion.div>
  );
}

function RenderDot({ element }: { element: DotElement }) {
  const size = element.size || "sm";
  const floatDuration = 4.5 + (element.delay || 0) * 1.1;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: [1, 1.2, 1],
        y: [0, -4, 0],
      }}
      transition={{
        scale: {
          duration: 0.2,
          delay: element.delay || 0,
        },
        y: {
          duration: floatDuration,
          delay: element.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={`absolute rounded-full border-2 border-black ${element.color} ${sizeMap[size].dot}`}
      style={{ ...getPositionStyle(element.position), zIndex: element.zIndex }}
    />
  );
}

// ============================================
// MAIN RENDER FUNCTION
// ============================================

function renderElement(element: HeroElement) {
  switch (element.type) {
    case "card":
      return <RenderCard key={element.id} element={element} />;
    case "badge":
      return <RenderBadge key={element.id} element={element} />;
    case "pill":
      return <RenderPill key={element.id} element={element} />;
    case "emoji":
      return <RenderEmoji key={element.id} element={element} />;
    case "star":
      return <RenderStarDoodle key={element.id} element={element} />;
    case "heart":
      return <RenderHeartDoodle key={element.id} element={element} />;
    case "spark":
      return <RenderSparkDoodle key={element.id} element={element} />;
    case "dot":
      return <RenderDot key={element.id} element={element} />;
    default:
      return null;
  }
}

// ============================================
// LAPTOP CODE EDITOR COMPONENT
// ============================================

function LaptopCodeEditor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
        rotate: [-2, -1, -2],
      }}
      transition={{
        opacity: { duration: 0.6, delay: 0.2 },
        y: {
          duration: 5,
          delay: 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: 5,
          delay: 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      style={{ zIndex: 10 }}
      className="absolute bottom-[15%] right-[5%] md:bottom-[12%] md:right-[8%]"
    >
      <div className="relative">
        <div className="h-36 w-56 rounded-t-xl border-4 border-black bg-zinc-900 p-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:h-40 md:w-64">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-blue-400">POST</span>
              <span className="text-[9px] text-green-400">/transactions/create</span>
            </div>
            <div className="text-[9px] text-purple-400">{"{"}</div>
            <div className="pl-2 text-[9px]">
              <span className="text-yellow-300">amount</span>
              <span className="text-white">: </span>
              <span className="text-orange-400">100</span>
              <span className="text-white">,</span>
            </div>
            <div className="pl-2 text-[9px]">
              <span className="text-yellow-300">fromBankNumber</span>
              <span className="text-white">,</span>
            </div>
            <div className="pl-2 text-[9px]">
              <span className="text-yellow-300">toBankNumber</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-purple-400">{"}"}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-[9px] text-white"
              >
                |
              </motion.span>
            </div>
          </div>
        </div>
        <div className="h-2.5 w-56 rounded-b-lg border-4 border-t-0 border-black bg-zinc-300 md:w-64" />
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

interface HeroIllustrationProps {
  /** Custom elements to render (defaults to heroElements) */
  elements?: HeroElement[];
  /** Whether to show the laptop code editor */
  showLaptop?: boolean;
  /** Additional class names */
  className?: string;
}

export function HeroIllustration({
  elements = heroElements,
  showLaptop = true,
  className = "",
}: HeroIllustrationProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {elements.map(renderElement)}
      {showLaptop && <LaptopCodeEditor />}
    </div>
  );
}

// Export individual renderers for custom use
export {
  HeartDoodle,
  LaptopCodeEditor,
  RenderBadge,
  RenderCard,
  RenderDot,
  RenderEmoji,
  RenderHeartDoodle,
  RenderPill,
  RenderSparkDoodle,
  RenderStarDoodle,
  SparkDoodle,
  StarDoodle,
};
