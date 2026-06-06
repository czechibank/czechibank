import { rewardTypeLabel } from "@/domain/drops-domain/drops-format";
import dropsService from "@/domain/drops-domain/drops-service";
import userService from "@/domain/user-domain/user-service";
import { Award, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export async function GamificationHeader() {
  const session = await userService.server.getSession(await headers());
  if (!session?.user?.id) {
    return null;
  }

  const { superTokens, displayTitle, completed } = await dropsService.getGamificationSummary(session.user.id);

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent px-3 py-2 text-sm dark:border-amber-400/25">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/profile#gamification"
          className="flex min-w-0 flex-1 flex-col gap-0.5 font-medium text-amber-900 dark:text-amber-100 sm:flex-row sm:items-center sm:gap-2"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <span>
              <span className="tabular-nums">{superTokens}</span> Super Tokens
            </span>
          </span>
          {displayTitle ? <span className="truncate text-xs font-normal opacity-90">{displayTitle}</span> : null}
        </Link>
        {completed.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {completed.length} mission{completed.length === 1 ? "" : "s"} completed
          </span>
        ) : null}
      </div>
      {completed.length > 0 ? (
        <div className="flex max-h-16 flex-wrap gap-1.5 overflow-y-auto">
          {completed.slice(0, 8).map((c) => (
            <span
              key={`${c.slug}-${c.completedAt}`}
              className="inline-flex items-center gap-1 rounded-full border border-amber-600/40 bg-amber-500/15 px-2 py-0.5 text-xs text-amber-950 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-50"
              title={`${c.name} · ${new Date(c.completedAt).toLocaleString()}`}
            >
              <Award className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              <span className="max-w-[140px] truncate">{c.name}</span>
              <span className="hidden text-[10px] opacity-70 sm:inline">({rewardTypeLabel(c.rewardType)})</span>
            </span>
          ))}
          {completed.length > 8 ? (
            <span className="self-center text-xs text-muted-foreground">+{completed.length - 8} more</span>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Complete API missions to earn tokens and badges — see Drops in the API docs.
        </p>
      )}
    </div>
  );
}
