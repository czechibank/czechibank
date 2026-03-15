import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Shown after automatic sign-out (session expired / inactivity or different user signed in in another tab).
 * Full-page so no stale UI or requests can persist; user must sign in again.
 */
export default async function LoggedOutPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string | string[] }>;
}) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const isInactivity = reason === "inactivity";

  return (
    <div className="mx-auto max-w-md space-y-6 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isInactivity ? "You were logged out due to inactivity" : "You have been signed out"}
      </h1>
      <p className="text-muted-foreground">
        {isInactivity ? "Please sign in again to continue." : "Please sign in again."}
      </p>
      <Button asChild>
        <Link href="/signin">Sign in</Link>
      </Button>
    </div>
  );
}
