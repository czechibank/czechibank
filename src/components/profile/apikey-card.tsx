"use client";

import { useToast } from "@/components/ui/use-toast";
import apikeyServiceClient from "@/domain/apikey/apikey-service-client";
import { Apikey } from "@prisma/client";
import { CalendarIcon, EyeIcon, EyeOffIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export function ApiKeyCard({ apiKey }: { apiKey: Omit<Apikey, "key"> }) {
  const { toast } = useToast();
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await apikeyServiceClient.deleteApiKey(apiKey.id, {
      onSuccess: () => {
        toast({
          description: `API key "${apiKey.name}" has been deleted.`,
          duration: 3000,
        });
        router.refresh();
      },
      onError: (error) => {
        console.error(error);
        toast({
          description: "Failed to delete API key",
          variant: "destructive",
        });
        setIsDeleting(false);
      },
    });
  };

  const isExpired = apiKey.expiresAt && new Date() > apiKey.expiresAt;
  const expiresSoon =
    apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000) && !isExpired;

  return (
    <div className="rounded-xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black">{apiKey.name ?? "API Key (without name)"}</h3>
            {isExpired && (
              <span className="rounded-full border-2 border-black bg-red-400 px-2 py-0.5 text-xs font-bold text-black">
                Expired
              </span>
            )}
            {expiresSoon && !isExpired && (
              <span className="rounded-full border-2 border-black bg-[#FFE566] px-2 py-0.5 text-xs font-bold text-black">
                Expires Soon
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-bold text-muted-foreground">API Key (start of the key):</Label>
              <div className="flex items-center space-x-2">
                <code className="rounded-lg border-2 border-black bg-zinc-100 px-6 py-1 font-mono text-sm dark:bg-zinc-800">
                  {showKey ? apiKey.start : "\u2022".repeat(6)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                  className="h-6 w-6 border-2 border-black p-0"
                >
                  {showKey ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>
                {apiKey.expiresAt
                  ? `Expires: ${apiKey.expiresAt.toLocaleDateString()} at ${apiKey.expiresAt.toLocaleTimeString()}`
                  : "Never expires"}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">Created: {apiKey.createdAt.toLocaleDateString()}</div>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          {isDeleting ? (
            <div className="h-3 w-3 animate-spin rounded-full border-b border-white"></div>
          ) : (
            <TrashIcon className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
