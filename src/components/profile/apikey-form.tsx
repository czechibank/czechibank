"use client";

import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import { Apikey } from "@prisma/client";
import { CalendarIcon, EyeIcon, EyeOffIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";

export function ApiKeyForm({ apiKey }: { apiKey: Apikey }) {
  const { toast } = useToast();
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    authClient.apiKey.delete(
      {
        keyId: apiKey.id,
      },
      {
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
      },
    );
  };

  const isExpired = apiKey.expiresAt && new Date() > apiKey.expiresAt;
  const expiresSoon =
    apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt.getTime() - 7 * 24 * 60 * 60 * 1000) && !isExpired;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{apiKey.name ?? "API Key (without name)"}</h3>
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
              {expiresSoon && !isExpired && (
                <Badge variant="secondary" className="text-xs">
                  Expires Soon
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-muted-foreground">API Key (start of the key):</Label>
                <div className="flex items-center space-x-2">
                  <code className="rounded bg-muted px-6 py-1 font-mono text-sm">
                    {showKey ? apiKey.start : "•".repeat(6)}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => setShowKey(!showKey)} className="h-6 w-6 p-0">
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

          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="ml-4">
            {isDeleting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-b border-white"></div>
            ) : (
              <TrashIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
