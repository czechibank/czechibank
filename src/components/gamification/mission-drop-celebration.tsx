"use client";

import { useMemo } from "react";

/**
 * Celebration GIFs for mission / drop rewards (plain `<img>` — no `next/image`).
 *
 * Self-hosted in `public/gamification/` so no user data leaks to Giphy and the
 * toasts keep working if the upstream URLs die. Originals:
 *
 * 1. [Awesome Well Done — VeeFriends](https://giphy.com/gifs/VeeFriends-great-veefriends-job-S6wdJ27DLVfh9mA9dE)
 * 2. [Well done / good job (red panda)](https://giphy.com/gifs/good-job-well-done-nice-utAO8tteQGG2zGh9ic)
 * 3. [Reaction](https://giphy.com/gifs/reaction-rT6bAA9A7A1Ne)
 * 4. [Thumbs up / great job](https://giphy.com/gifs/thumbs-up-xHMIDAy1qkzNS)
 * 5. [Spinning thumbs up](https://giphy.com/gifs/3XFwB5TrJ5L6rXqXEj)
 */
export const MISSION_DROP_CELEBRATION_GIFS = [
  "/gamification/celebration-1.gif",
  "/gamification/celebration-2.gif",
  "/gamification/celebration-3.gif",
  "/gamification/celebration-4.gif",
  "/gamification/celebration-5.gif",
] as const;

/** @deprecated Use `<MissionDropCelebrationImg />` (random). */
export const MISSION_DROP_CELEBRATION_GIF = MISSION_DROP_CELEBRATION_GIFS[0];

function pickRandomGifUrl(): string {
  const i = Math.floor(Math.random() * MISSION_DROP_CELEBRATION_GIFS.length);
  return MISSION_DROP_CELEBRATION_GIFS[i] ?? MISSION_DROP_CELEBRATION_GIFS[0];
}

/** One random GIF per mount (each toast = new mount → new pick). */
export function MissionDropCelebrationImg({ className }: { className?: string }) {
  const src = useMemo(pickRandomGifUrl, []);

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={
        className ?? "mx-auto max-h-24 w-full max-w-[200px] rounded-md object-contain sm:max-h-28 sm:max-w-[220px]"
      }
    />
  );
}
