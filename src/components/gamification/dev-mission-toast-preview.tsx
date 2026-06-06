"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { MissionDropCelebrationImg } from "./mission-drop-celebration";

/**
 * Local-only: fake “mission completed” toast (same layout as real bank-account / transfer drops).
 *
 * - Keep `ENABLE_DEV_MISSION_TOAST_PREVIEW` as `false` in any branch that can ship.
 * - To try it: set to `true`, open Profile → Missions & rewards, click the button.
 * - Or comment out the `<DevMissionToastPreview />` import + JSX in `page.client.tsx` entirely.
 */
export const ENABLE_DEV_MISSION_TOAST_PREVIEW = false;

export function DevMissionToastPreview() {
  if (!ENABLE_DEV_MISSION_TOAST_PREVIEW) return null;

  return (
    <div className="rounded-md border border-dashed border-amber-600/40 bg-amber-500/5 p-3 dark:border-amber-400/30">
      <p className="mb-2 text-xs text-muted-foreground">
        Dev only — previews mission-completion toast (random celebration GIF). Not for production.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-amber-600/50 text-amber-900 dark:text-amber-100"
        onClick={() =>
          toast({
            title: "Mission completed! (dev preview)",
            description: (
              <div className="space-y-2">
                <MissionDropCelebrationImg />
                <p className="whitespace-pre-line text-sm font-medium text-amber-700 dark:text-amber-300">
                  Mission rewards{"\n"}· Dev test mission (+10 Super Tokens)
                </p>
              </div>
            ),
          })
        }
      >
        Preview mission toast
      </Button>
    </div>
  );
}
