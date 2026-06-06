"use client";

import { useMemo } from "react";

/**
 * Celebration GIFs for mission / drop rewards (plain `<img>` — no `next/image`).
 *
 * 0. [Awesome Well Done — VeeFriends](https://giphy.com/gifs/VeeFriends-great-veefriends-job-S6wdJ27DLVfh9mA9dE)
 * 1. [Well done / good job (red panda)](https://giphy.com/gifs/good-job-well-done-nice-utAO8tteQGG2zGh9ic)
 * 2. [Reaction](https://giphy.com/gifs/reaction-rT6bAA9A7A1Ne)
 * 3. [Thumbs up / great job](https://giphy.com/gifs/thumbs-up-xHMIDAy1qkzNS)
 * 4. [Spinning thumbs up](https://giphy.com/gifs/3XFwB5TrJ5L6rXqXEj)
 */
export const MISSION_DROP_CELEBRATION_GIFS = [
  "https://media.giphy.com/media/S6wdJ27DLVfh9mA9dE/giphy.gif",
  "https://media.giphy.com/media/utAO8tteQGG2zGh9ic/giphy.gif",
  "https://media.giphy.com/media/rT6bAA9A7A1Ne/giphy.gif",
  "https://media.giphy.com/media/xHMIDAy1qkzNS/giphy.gif",
  "https://media.giphy.com/media/3XFwB5TrJ5L6rXqXEj/giphy.gif",
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
