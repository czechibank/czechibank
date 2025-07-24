"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import { Apikey } from "@prisma/client";
import { CopyIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateApiKey() {
  const router = useRouter();
  const [isCreating, setInCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(newApiKey!);
      toast({
        description: "API key copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        description: "Failed to copy API key",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (data: FormData) => {
    setInCreating(true);
    setNewApiKey(null);

    const name = data.get("name") as string;
    const expiresIn = parseInt(data.get("expiresIn") as string);

    if (!name.trim()) {
      toast({
        description: "Please provide a name for the API key",
        variant: "destructive",
      });
      setInCreating(false);
      return;
    }

    authClient.apiKey.create(
      {
        name: name.trim(),
        expiresIn: expiresIn ? expiresIn * 60 * 60 * 24 : undefined,
      },
      {
        onSuccess: (context) => {
          const apiKey = context.data as Apikey;
          setNewApiKey(apiKey.key);
          toast({
            title: "API key created",
            description: "Your new API key has been created successfully",
          });
          router.refresh();
          setInCreating(false);
        },
        onError: (error) => {
          console.error(error);
          toast({
            description: "Failed to create API key",
            variant: "destructive",
          });
          setInCreating(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Create API Key</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Czechibank API. Make sure to copy it immediately as it won't be shown
            again.
          </DialogDescription>
        </DialogHeader>

        {!newApiKey ? (
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">API Key Name</Label>
              <Input id="name" name="name" placeholder="e.g., Production API Key" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresIn">Expires In (days, optional)</Label>
              <Input
                id="expiresIn"
                type="number"
                name="expiresIn"
                placeholder="Leave empty for no expiration"
                min="1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your New API Key</Label>
              <div className="flex items-center space-x-2">
                <Input value={newApiKey} readOnly className="font-mono text-sm" />
                <Button size="sm" onClick={handleCopyClick} className="flex-shrink-0">
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Make sure to copy this API key now. You won't be able to see it again!
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setNewApiKey(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
