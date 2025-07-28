"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendMoneyToBankNumberAction } from "@/domain/transaction-domain/transaction-action";
import { AmountWithBalanceSchema, BankNumberSchema } from "@/domain/transaction-domain/transaction-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { UserAvatar } from "../user/avatar";

type UserWithBankAccounts = Prisma.UserGetPayload<{
  include: {
    bankAccounts: true;
  };
}>;

export function TransactionTranfer({
  userId,
  bankAccountNumber,
  balance,
  allUsers,
}: {
  userId: string;
  allUsers: UserWithBankAccounts[];
  balance: number;
  bankAccountNumber: string;
}) {
  const { toast } = useToast();
  const users = allUsers
    .filter((user) => user.id !== userId)
    .sort((a, b) => {
      if (a.name.includes("Pejsek a Kočicka") && !b.name.includes("Pejsek a Kočicka")) return -1;
      if (!a.name.includes("Pejsek a Kočicka") && b.name.includes("Pejsek a Kočicka")) return 1;

      return a.name.localeCompare(b.name);
    });

  const transferScheme = z.object({
    toBankNumber: BankNumberSchema,
    amount: AmountWithBalanceSchema(balance),
  });

  type TransferFormValues = {
    toBankNumber: string;
    amount: string;
  };

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferScheme),
    defaultValues: {
      amount: "1",
      toBankNumber: "",
    },
    mode: "onChange",
  });

  const action = form.handleSubmit(async (data) => {
    const response = await sendMoneyToBankNumberAction({
      amount: Number(data.amount),
      currency: "CZECHITOKEN",
      fromBankNumber: bankAccountNumber,
      toBankNumber: data.toBankNumber,
      userId: userId,
      applicationType: "web",
    });

    if (response.success) {
      toast({
        title: "💸 Transaction created!",
        description: (
          <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGw2OXB2cmMydW1kb3k5cnpub2x4bm02bmhzZm9lb3E3ZTRxdnhwNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HFkA6omUyjVYqw8/giphy.gif" />
        ),
      });
    } else {
      const errorMessage = response.error.details!.map((detail) => detail.message).join(", ");
      toast({
        title: "💸 Transaction failed!",
        description: errorMessage,
      });
    }

    form.resetField("amount");
    form.resetField("toBankNumber");
  });
  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form onSubmit={action} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="toBankNumber"
            render={({ field }) => (
              <FormItem className="gap-4">
                <FormLabel>Receiver</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} {...field}>
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select an receiver your money" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((user) =>
                          user.bankAccounts.map((bankAccount) => (
                            <SelectItem key={bankAccount.number} value={bankAccount.number} className="flex w-full">
                              <div className="flex w-full flex-row items-center justify-between">
                                <div className="flex w-[300px] flex-row items-center gap-4 pl-8 font-semibold ">
                                  <UserAvatar size={8} image={user.image ?? null} />
                                  <span className="truncate">{user.name}</span>
                                </div>
                                <span className="font-mono">{bankAccount.number}</span>
                              </div>
                            </SelectItem>
                          )),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>Send her/him some love!</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="gap-4">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    onChange={(e) => {
                      // Replace comma with dot for normalization
                      field.onChange(e.target.value.replace(/,/g, "."));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Transferring..." : "Transfer"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
