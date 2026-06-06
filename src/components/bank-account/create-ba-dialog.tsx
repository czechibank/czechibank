"use client";

import { MissionDropCelebrationImg } from "@/components/gamification/mission-drop-celebration";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CreateBankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import { createBankAccountWithDropsAction } from "@/domain/bankAccount-domain/bank-account-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomSession from "../../../types/session-betterAuth";
import { ShimmerOverlay } from "../ui/shimmer-overlay";
interface CreateBankAccountDialogProps {
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onCreated?: (newBankAccount: any) => void;
}

type FormData = z.infer<typeof CreateBankAccountSchema>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }
  return String(error) || "Unknown error";
}

export function CreateDialog({ session, onCreated }: CreateBankAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(CreateBankAccountSchema),
    defaultValues: {
      name: "",
      currency: "CZECHITOKEN",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await createBankAccountWithDropsAction({
        userId: session.userId,
        currency: data.currency,
        name: data.name,
      });

      if (response.success) {
        const dropLines =
          "drops" in response && response.drops.length > 0
            ? response.drops
                .map((d) => `· ${d.name}${d.rewardAmount != null ? ` (+${d.rewardAmount} Super Tokens)` : ""}`)
                .join("\n")
            : null;
        toast({
          title: "Bank Account Created",
          description: (
            <div className="space-y-2">
              <p>{`Account "${response.data.name}" created successfully!`}</p>
              {dropLines ? (
                <>
                  <MissionDropCelebrationImg />
                  <p className="whitespace-pre-line text-sm font-medium text-amber-700 dark:text-amber-300">
                    Mission rewards{"\n"}
                    {dropLines}
                  </p>
                </>
              ) : null}
            </div>
          ),
        });
        form.reset();
        setOpen(false);
        onCreated?.(response.data);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create account",
          description: getErrorMessage(response.message),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: getErrorMessage(error),
      });
    } finally {
      // keep shimmer visible until after UI updates
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create new
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Bank Account</DialogTitle>
          <DialogDescription>Please fill out the form below to create a new bank account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter account name"
              aria-invalid={!!form.formState.errors.name}
            />
            {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              defaultValue={form.getValues("currency")}
              onValueChange={(val) => form.setValue("currency", val as "CZECHITOKEN")}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CZECHITOKEN">CZECHITOKEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Create
            </Button>
          </DialogFooter>
        </form>
        {isLoading && <ShimmerOverlay width="100%" height="100%" borderRadius="0.5rem" />}
      </DialogContent>
    </Dialog>
  );
}
