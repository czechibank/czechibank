"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import featuresService from "@/domain/features-domain/features-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { isEmpty, isEqual, omitBy } from "lodash";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z, { ZodBoolean, ZodDefault } from "zod";

export default function AdministrationClientPage({ user, features }: { user: User; features: FeatureType[] }) {
  type FeaturesFlagsValues = { [p: string]: boolean };
  features = features.sort((a: FeatureType, b: FeatureType): number => (a.name < b.name ? -1 : 1));

  // generate the form default values based on the feature flags
  const featuresFormDefaultValues: FeaturesFlagsValues = Object.fromEntries(
    features.map((value: FeatureType): [string, boolean] => [value.key, value.toggle]),
  );
  const [lastSavedFeaturesFlags, setLastSavedFeaturesFlags] = useState<FeaturesFlagsValues>(featuresFormDefaultValues);

  // generate the form schema based on the feature flags
  const featuresFormSchema = z.object(
    Object.fromEntries(
      features.map((value: FeatureType): [string, ZodDefault<ZodBoolean>] => [
        value.key,
        z.boolean().default(value.toggle),
      ]),
    ),
  );

  const featuresForm = useForm({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: featuresFormDefaultValues,
  });

  async function onSubmit(data: FeaturesFlagsValues): Promise<void> {
    const updatedFeatures = omitBy(data, (v: boolean, k: string): boolean => isEqual(v, lastSavedFeaturesFlags[k]));
    if (isEmpty(updatedFeatures)) {
      toast({
        title: "No changes detected",
        description: "You have not changed any feature flags.",
      });
      return;
    }

    // change in the database
    const newFeatures: FeatureType[] = features.map((feature: FeatureType): FeatureType => {
      return {
        ...feature,
        toggle: data[feature.key],
      };
    });
    await featuresService.server.updateFeatures(newFeatures);

    // update form values
    setLastSavedFeaturesFlags(data);

    // notify user
    toast({
      title: "Form submitted",
      description: (
        <>
          {Object.entries(updatedFeatures).map(([key, value]) => (
            <div key={key}>
              {features.find((feat) => feat.key === key)?.name}: {value.toString()}
            </div>
          ))}
        </>
      ),
    });
  }

  async function resetToDefault(): Promise<void> {
    // reset form values
    const newFeaturesFormDefaultValues = Object.fromEntries(
      features.map((value: FeatureType): [string, boolean] => [value.key, value.defaultToggle]),
    );
    featuresForm.reset(newFeaturesFormDefaultValues);
    setLastSavedFeaturesFlags(newFeaturesFormDefaultValues);

    // reset in database
    const newFeatures: FeatureType[] = features.map((feature: FeatureType): FeatureType => {
      return {
        ...feature,
        toggle: feature.defaultToggle,
      };
    });
    await featuresService.server.updateFeatures(newFeatures);

    // notify user
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
            {features.map((feature: FeatureType) => (
              <FormField
                control={featuresForm.control}
                name={feature.key}
                key={feature.key}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{feature.name}</FormLabel>
                      <FormDescription>{feature.description}</FormDescription>
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
