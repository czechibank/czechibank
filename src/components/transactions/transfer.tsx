"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  amountSchemaToCheckFeature,
  showGifInTransactionsFeature,
} from "@/domain/features-domain/features-application-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import { sendMoneyToBankNumberAction } from "@/domain/transaction-domain/transaction-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { UserAvatar } from "../user/avatar";

function Spinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>;
}

export type UserWithBankAccounts = Prisma.UserGetPayload<{
  include: {
    bankAccounts: true;
  };
}>;

export function TransactionTransfer({
  userId,
  bankAccountNumber,
  balance,
  allUsers,
  features,
}: {
  userId: string;
  allUsers: UserWithBankAccounts[];
  balance: number;
  bankAccountNumber: string;
  features: FeatureType[];
}) {
  console.log(userId, bankAccountNumber, balance);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const users = allUsers
    .filter((user) => user.id !== userId)
    .sort((a, b) => {
      if (a.name.includes("Pejsek a Kočicka") && !b.name.includes("Pejsek a Kočicka")) return -1;
      if (!a.name.includes("Pejsek a Kočicka") && b.name.includes("Pejsek a Kočicka")) return 1;

      return a.name.localeCompare(b.name);
    });

  const transferScheme = z.object({
    toBankNumber: z.string(),
    amount: amountSchemaToCheckFeature(features, balance),
    // .refine((value) => {
    //   // const decimalPart = value.toString().split('.')[1];
    //   // return decimalPart === undefined || decimalPart.length === 1;
    // },
    //   {
    //     message: "Only one decimal is allowed",
    //     path: ["amount"],
    // })
  });

  const form = useForm<z.infer<typeof transferScheme>>({
    resolver: zodResolver(transferScheme),
    defaultValues: {
      amount: 0,
      toBankNumber: "",
    },
  });

  const action: () => void = form.handleSubmit(async (data) => {
    setIsLoading(true);
    try {
      const response = await sendMoneyToBankNumberAction({
        amount: data.amount,
        currency: "CZECHITOKEN",
        fromBankNumber: bankAccountNumber,
        toBankNumber: data.toBankNumber,
        userId: userId,
        applicationType: "web",
      });

      if (response.success) {
        if (showGifInTransactionsFeature(features)) {
          toast({
            title: "💸 Transaction created!",
            description: (
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGw2OXB2cmMydW1kb3k5cnpub2x4bm02bmhzZm9lb3E3ZTRxdnhwNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HFkA6omUyjVYqw8/giphy.gif" />
            ),
          });
        } else {
          toast({
            title: "💸 Transaction created!",
          });
        }
      } else {
        toast({
          title: "💸 Transaction failed!",
          description: response.error.message,
        });
      }
    } catch (error) {
      toast({
        title: "💸 Transaction failed!",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      form.resetField("amount");
      form.resetField("toBankNumber");
      setIsLoading(false);
    }
  });
  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form action={action} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="toBankNumber"
            render={({ field }) => (
              <FormItem className="gap-4">
                <FormLabel>Receiver</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} {...field}>
                    <SelectTrigger className="p-6">
                      <SelectValue placeholder="Select a receiver for your money">
                        {field.value
                          ? (() => {
                              const selectedAccount = users
                                .flatMap((user) => user.bankAccounts)
                                .find((account) => account.number === field.value);
                              const selectedUser = selectedAccount
                                ? users.find((user) =>
                                    user.bankAccounts.some((account) => account.number === selectedAccount.number),
                                  )
                                : null;

                              return selectedUser && selectedAccount ? (
                                <div className="flex w-full items-center gap-3">
                                  <UserAvatar size={8} image={selectedUser.image ?? null} />
                                  <div className="flex flex-col">
                                    <span className="truncate text-left font-semibold">{selectedUser.name}</span>
                                    <span className="text-left font-mono text-sm text-muted-foreground/70">
                                      {selectedAccount.number}
                                    </span>
                                  </div>
                                </div>
                              ) : null;
                            })()
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((user) =>
                          user.bankAccounts.map((bankAccount) => (
                            <SelectItem key={bankAccount.number} value={bankAccount.number}>
                              <div className="flex w-full items-center gap-4">
                                <UserAvatar size={8} image={user.image ?? null} />
                                <div className="flex min-w-0 flex-1 flex-col">
                                  <span className="truncate font-semibold">{user.name}</span>
                                  <span className="font-mono text-sm text-muted-foreground/70">
                                    {bankAccount.number}
                                  </span>
                                </div>
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
                  <Input type="number" placeholder="Amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Transfer"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
