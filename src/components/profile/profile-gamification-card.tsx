import { DevMissionToastPreview } from "@/components/gamification/dev-mission-toast-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { rewardTypeLabel } from "@/domain/drops-domain/drops-format";
import type { GamificationCompletion } from "@/domain/drops-domain/drops-service";
import { Award, Sparkles } from "lucide-react";

export type ProfileGamificationCardProps = {
  gamification: { superTokens: number; displayTitle: string | null; completed: GamificationCompletion[] };
};

export function ProfileGamificationCard({ gamification }: ProfileGamificationCardProps) {
  return (
    <Card
      id="gamification"
      className="scroll-mt-4 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent dark:border-amber-400/20"
    >
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <span>Missions & rewards</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Super Tokens</Label>
          <p className="text-4xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
            {gamification.superTokens}
          </p>
          {gamification.displayTitle ? (
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{gamification.displayTitle}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Earned by completing timed API drop missions (same rules as the REST API).
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Achievements</Label>
          {gamification.completed.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No missions completed yet. Try creating an account named &quot;Emergency Fund&quot; or sending transfers
              from the app.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {gamification.completed.map((c) => (
                <li
                  key={`${c.slug}-${c.completedAt}`}
                  className="flex items-start gap-3 rounded-lg border border-amber-600/30 bg-amber-500/10 p-3 dark:border-amber-400/25 dark:bg-amber-400/10"
                >
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight text-amber-950 dark:text-amber-50">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{rewardTypeLabel(c.rewardType)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(c.completedAt).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DevMissionToastPreview />
      </CardContent>
    </Card>
  );
}
