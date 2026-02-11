"use client";
import { ApiKeyCard } from "@/components/profile/apikey-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/user/avatar";
import userServiceClient from "@/domain/user-domain/user-service-client";
import { authClient } from "@/lib/auth-client";
import { useSessionWithRefresh } from "@/lib/useSessionWithRefresh";
import { generateRandomAvatarConfig } from "@/lib/utils";
import { Apikey } from "@prisma/client";
import { KeyIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateApiKey from "../../components/profile/create-api-key";

export default function ProfileClientPage({
  user,
  apiKeys,
}: {
  user: typeof authClient.$Infer.Session.user;
  apiKeys: Omit<Apikey, "key">[];
}) {
  const { data: session, isPending, error } = useSessionWithRefresh();
  const router = useRouter();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  const handleGenerateAvatar = async () => {
    setIsUpdatingAvatar(true);
    const avatarConfig = generateRandomAvatarConfig();

    await userServiceClient.updateUser(
      { image: JSON.stringify(avatarConfig) },
      {
        onSuccess: () => {
          toast({
            description: "Avatar updated successfully!",
            duration: 2000,
          });
          router.refresh();
          setIsUpdatingAvatar(false);
        },
        onError: (error) => {
          console.error("Failed to update avatar:", error);
          toast({
            description: "Failed to update avatar",
            variant: "destructive",
          });
          setIsUpdatingAvatar(false);
        },
      },
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page header */}
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#B794F6] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <UserIcon className="h-4 w-4" />
          Profile
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          Your{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Profile</span>
            <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#B794F6]" />
          </span>
        </h1>
      </div>

      {/* Personal Information Section - Pink accent */}
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#ff4c91]" />
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#ff4c91]">
              <UserIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black">Personal Information</h2>
          </div>

          <div className="flex items-start space-x-4">
            <UserAvatar image={user.image || null} size={10} />
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-bold text-muted-foreground">Name</Label>
                <p className="text-lg font-black" data-testid="userName">
                  {user.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-bold text-muted-foreground">Email</Label>
                <p className="text-lg font-black">{user.email}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAvatar}
                disabled={isUpdatingAvatar}
                className="border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {isUpdatingAvatar ? "Generating..." : "Generate New Avatar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Section - Yellow accent */}
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#FFE566]" />
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#FFE566]">
              <KeyIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black">API Keys</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Manage your API keys for accessing the Czechibank API</p>
              <CreateApiKey />
            </div>

            {apiKeys.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-black bg-zinc-50 py-8 text-center dark:bg-zinc-800">
                <KeyIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-muted-foreground">No API keys found. Create your first API key to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((apiKey) => (
                    <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Settings Section - Purple accent */}
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#B794F6]" />
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#B794F6]">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black">Account Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-muted-foreground">Account Created</Label>
              <p className="text-sm font-bold">{user.createdAt?.toLocaleDateString() || "Unknown"}</p>
            </div>
            <div>
              <Label className="text-sm font-bold text-muted-foreground">Last Updated</Label>
              <p className="text-sm font-bold">{user.updatedAt?.toLocaleDateString() || "Unknown"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
