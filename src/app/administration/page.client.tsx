"use client";

import { AllFeaturesType, FeatureType } from "@/app/administration/features.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { isEqual, omitBy } from "lodash";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z, { ZodBoolean, ZodDefault } from "zod";

export default function AdministrationClientPage({ user }: { user: User }) {
  type FeaturesFlagsValues = { [p: string]: boolean };

  const featureFlags: AllFeaturesType = {
    SEND_MONEY_WITHOUT_ACCOUNT_BALANCE: {
      key: "SEND_MONEY_WITHOUT_ACCOUNT_BALANCE",
      name: "Allow sending with insufficient balance",
      description: "User can send money even when the account balance is insufficient.",
      toggle: false,
      category: ["BUG", "BANK_ACCOUNT"],
      lastChangedBy: "adminUser1",
      lastChangedAt: "2025-08-09T10:00:00Z",
    },
    GIFS_IN_TRANSACTIONS: {
      key: "GIFS_IN_TRANSACTIONS",
      name: "GIFs in transactions",
      description: "Enable sending GIFs along with money transfers.",
      toggle: true,
      category: ["FEATURE", "UI"],
      lastChangedBy: "adminUser2",
      lastChangedAt: "2025-08-08T14:32:00Z",
    },
    BUG_INCORRECT_BALANCE_DISPLAY: {
      key: "BUG_INCORRECT_BALANCE_DISPLAY",
      name: "Incorrect balance display",
      description: "Show an incorrect account balance (simulate calculation bug).",
      toggle: false,
      category: ["BUG", "UI", "BANK_ACCOUNT"],
      lastChangedBy: "adminUser1",
      lastChangedAt: "2025-08-07T09:15:00Z",
    },
  };

  // generate the form default values based on the feature flags
  const featuresDefaultValues: FeaturesFlagsValues = Object.fromEntries(
    Object.entries(featureFlags).map(([key, value]: [string, FeatureType]): [string, boolean] => [key, value.toggle]),
  );
  const [lastSavedFeaturesFlags, setLastSavedFeaturesFlags] = useState<FeaturesFlagsValues>(featuresDefaultValues);

  // generate the form schema based on the feature flags
  const featuresFormSchema = z.object(
    Object.fromEntries(
      Object.entries(featureFlags).map(([key, value]: [string, FeatureType]): [string, ZodDefault<ZodBoolean>] => [
        key,
        z.boolean().default(value.toggle),
      ]),
    ),
  );

  const featuresForm = useForm({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: featuresDefaultValues,
  });

  function onSubmit(data: FeaturesFlagsValues) {
    const updatedFeatures = omitBy(data, (v, k) => isEqual(v, lastSavedFeaturesFlags[k]));
    toast({
      title: "Form submitted",
      description: Object.entries(updatedFeatures).map(([key, value]) => `${featureFlags[key].name}: ${value} \n`),
    });
    setLastSavedFeaturesFlags(data);
  }

  function resetToDefault() {
    featuresForm.reset(featuresDefaultValues);
    toast({
      title: "Reset to defaults",
      description: "Feature flags have been reset to their default values.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <SettingsIcon className="h-5 w-5" />
          <span>Features</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...featuresForm}>
          <form onSubmit={featuresForm.handleSubmit(onSubmit)} className="space-y-4">
            {Object.entries(featureFlags).map(([key, value]: [string, FeatureType]) => (
              <FormField
                control={featuresForm.control}
                name={key}
                key={key}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{value.name}</FormLabel>
                      <FormDescription>{value.description}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Submit</Button>
            <Button className="mx-4" type="button" variant={"outline"} onClick={resetToDefault}>
              Reset defaults
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
