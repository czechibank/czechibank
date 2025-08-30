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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CustomSession from "../../../types/session-betterAuth";
import { ShimmerOverlay } from "../ui/shimmer-overlay";
interface CreateBankAccountDialogProps {
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onCreated?: (newBankAccount: any) => void;
}

const createBankAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  currency: z.enum(["CZECHITOKEN"]),
});

type FormData = z.infer<typeof createBankAccountSchema>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof (error as any).message === "string") {
    return (error as any).message;
  }
  return String(error) || "Unknown error";
}

export function CreateDialog({ session, onCreated }: CreateBankAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      name: "",
      currency: "CZECHITOKEN",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await bankAccountService.createBankAccount({
        userId: session.userId,
        currency: data.currency,
        name: data.name,
      });

      //simulate loading delay
      // await new Promise((res) => setTimeout(res, 1000));

      if (response.success) {
        toast({
          title: "Bank Account Created",
          description: `Account "${data.name}" created successfully!`,
        });
        form.reset();
        setOpen(false);
        onCreated?.(response.data);
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
