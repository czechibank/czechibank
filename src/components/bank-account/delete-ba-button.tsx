"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import bankAccountService from "@/domain/bankAccount-domain/ba-service";
import { BankAccount } from "@prisma/client";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import CustomSession from "../../../types/session-betterAuth";
interface DeleteBankAccountButtonProps {
  bankAccount: BankAccount;
  session: Pick<CustomSession, "token" | "userId" | "name">;
  onDeleted?: () => void;
}

function Spinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>;
}

export function DeleteBankAccountButton({ bankAccount, session, onDeleted }: DeleteBankAccountButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    setIsLoading(true);
    try {
      const response = await bankAccountService.deleteBankAccount(bankAccount, session.userId);

      if (response.success) {
        toast({
          title: "Bank account deleted",
          description: response.message,
        });
        //simulate delay for spinner to show
        // await new Promise((res) => setTimeout(res, 1000));
        onDeleted?.();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete",
          description: response.message || "Unknown error",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      // keep shimmer visible until after UI updates
      setTimeout(() => setIsLoading(false), 1000);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      disabled={isLoading}
      className="ml-2"
    >
      {isLoading ? <Spinner /> : <TrashIcon className="h-4 w-4" />}
    </Button>
  );
}
