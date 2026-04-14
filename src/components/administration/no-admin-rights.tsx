import { ShieldX } from "lucide-react";

export default function NoAdminRights() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="max-w-sm rounded-2xl border-3 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-3 border-black bg-red-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-black">Access Denied</h1>
        <p className="mb-4 text-muted-foreground">You do not have the necessary permissions to access this page.</p>
        <p className="text-sm text-muted-foreground">
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}
