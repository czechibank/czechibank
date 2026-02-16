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
import { AlertTriangle, CopyIcon, PlusIcon } from "lucide-react";
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
        <Button
          size="sm"
          className="border-3 border-black bg-[#FFE566] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#f0d85e] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Create New API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access the Czechibank API. Make sure to copy it immediately as it won&apos;t be
            shown again.
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
                    <FormLabel className="font-bold">API Key Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Production API Key"
                        {...field}
                        className="rounded-lg border-2 border-black"
                      />
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
                    <FormLabel className="font-bold">Expires In (days, optional)</FormLabel>
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
                        className="rounded-lg border-2 border-black"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-2 border-black font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="border-3 border-black bg-[#FFE566] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#f0d85e] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                >
                  {isCreating ? "Creating..." : "Create API Key"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Your New API Key</Label>
              <div className="flex items-center space-x-2">
                <Input value={newApiKey} readOnly className="rounded-lg border-2 border-black font-mono text-sm" />
                <Button
                  size="sm"
                  onClick={handleCopyClick}
                  className="flex-shrink-0 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border-3 border-black bg-[#FFE566] p-4 text-black">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-bold">
                Make sure to copy this API key now. You won&apos;t be able to see it again!
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setNewApiKey(null);
                }}
                className="border-3 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
