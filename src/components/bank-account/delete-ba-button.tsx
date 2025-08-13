"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deleteBankAccountAction } from "@/domain/bankAccount-domain/ba-actions";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

interface Session {
  token: string;
  userId: string;
  name: string;
}
interface DeleteBankAccountButtonProps {
  bankAccountId: string;
  session: Session;

  onDeleted?: () => void;
}

export function DeleteBankAccountButton({ bankAccountId, session, onDeleted }: DeleteBankAccountButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    setIsLoading(true);
    try {
      const response = await deleteBankAccountAction(bankAccountId, session);

      if ("data" in response && response.data) {
        toast({
          title: "Bank account deleted",
          description: "The bank account was successfully deleted.",
        });
        onDeleted?.();
      } else if ("error" in response) {
        toast({
          variant: "destructive",
          title: "Failed to delete",
          description: response.error.message || "Unknown error",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading} className="ml-2">
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
      ) : (
        <TrashIcon className="h-4 w-4" />
      )}
    </Button>
  );
}
