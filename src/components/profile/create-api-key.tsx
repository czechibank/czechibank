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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { CreateApiKeySchema } from "@/domain/apikey/apikey-schema";
import apikeyServiceClient from "@/domain/apikey/apikey-service-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Apikey } from "@prisma/client";
import { CopyIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CreateApiKey() {
  const router = useRouter();
  const [isCreating, setInCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Setup react-hook-form with zod validation
  const form = useForm<z.infer<typeof CreateApiKeySchema>>({
    resolver: zodResolver(CreateApiKeySchema),
    defaultValues: {
      name: "",
      expiresInDays: undefined,
    },
  });

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

  // New submit handler using react-hook-form
  const onSubmit = async (data: z.infer<typeof CreateApiKeySchema>) => {
    setInCreating(true);
    setNewApiKey(null);
    await apikeyServiceClient.createApiKey(
      {
        name: data.name,
        expiresInDays: data.expiresInDays,
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
          toast({
            description: `Failed to create API key due to an error: ${error?.error?.message}`,
            variant: "destructive",
            title: "Error",
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production API Key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires In (days, optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Leave empty for no expiration"
                        min="1"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </div>
            </form>
          </Form>
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
