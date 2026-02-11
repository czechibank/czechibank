"use client";

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
import { useToast } from "@/components/ui/use-toast";
import { RenameBankAccountSchema } from "@/domain/bankAccount-domain/ba-schema";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomSession from "../../../types/session-betterAuth";

interface RenameBankAccountDialogProps {
  bankAccountId: string;
  currentName: string;
  session: Pick<CustomSession, "token" | "userId">;
  onRenamed?: () => void;
}

type FormData = z.infer<typeof RenameBankAccountSchema>;

export function RenameDialog({ bankAccountId, currentName, session, onRenamed }: RenameBankAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: { name: currentName },
  });
  const nameValue = form.watch("name");

  function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
    return String(error) || "Unknown error";
  }

  async function onSubmit(data: FormData) {
    try {
      const response = await bankAccountService.renameBankAccount(bankAccountId, session.userId, data.name);

      if (response.success && !("error" in response)) {
        toast({
          title: "Bank Account Renamed",
          description: `Account renamed to "${data.name}" successfully!`,
        });
        setOpen(false);
        onRenamed?.();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to rename account",
          description: getErrorMessage(response.message),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to rename account",
        description: getErrorMessage(error),
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="xs" className="flex items-center ">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="rounded-2xl border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Rename Bank Account</DialogTitle>
          <DialogDescription>Enter a new name for your bank account.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2" onClick={(e) => e.preventDefault()}>
            <Label htmlFor="name" className="font-bold">
              Account Name
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter new account name"
              aria-invalid={!!form.formState.errors.name}
              className="rounded-lg border-2 border-black"
            />
            {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="border-2 border-black font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!nameValue?.trim()}
              onClick={(e) => e.stopPropagation()}
              className="border-3 border-black bg-[#ff4c91] font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#e6447f] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
