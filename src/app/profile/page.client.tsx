"use client";
import { ApiKeyCard } from "@/components/profile/apikey-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/user/avatar";
import userService from "@/domain/user-domain/user-service";
import { authClient, useSession } from "@/lib/auth-client";
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
  const { data: session, isPending, error } = useSession();
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

    await userService.client.updateUser(
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
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <UserIcon className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Profile</h1>
      </div>

      {/* Personal Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserIcon className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-4">
            <UserAvatar image={user.image || null} size={10} />
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>

              <Button variant="outline" size="sm" onClick={handleGenerateAvatar} disabled={isUpdatingAvatar}>
                {isUpdatingAvatar ? "Generating..." : "Generate New Avatar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <KeyIcon className="h-5 w-5" />
            <span>API Keys</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Manage your API keys for accessing the Czechibank API</p>
            <CreateApiKey />
          </div>

          {apiKeys.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <KeyIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No API keys found. Create your first API key to get started.</p>
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
        </CardContent>
      </Card>

      {/* Account Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Account Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <p className="text-sm">{user.createdAt?.toLocaleDateString() || "Unknown"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="text-sm">{user.updatedAt?.toLocaleDateString() || "Unknown"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
