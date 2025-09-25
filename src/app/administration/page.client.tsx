"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import featuresService from "@/domain/features-domain/features-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { flatMap, isEmpty, isEqual, omitBy, uniq } from "lodash";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z, { ZodBoolean, ZodDefault } from "zod";

type FeaturesFlagsValues = { [p: string]: boolean };

export default function AdministrationClientPage({ features }: { features: FeatureType[] }) {
  const allFeatures: FeatureType[] = features.sort((a: FeatureType, b: FeatureType): number =>
    a.name < b.name ? -1 : 1,
  );
  const [visibleFeatures, setVisibleFeatures] = useState<FeatureType[]>(allFeatures);

  const allFeaturesCategory = "ALL";
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set([allFeaturesCategory]));
  const featuresCategories: string[] = [allFeaturesCategory].concat(
    uniq(flatMap(allFeatures.map((feat: FeatureType) => feat.category))),
  );

  // generate the form default values based on the feature flags
  const featuresFormDefaultValues: FeaturesFlagsValues = Object.fromEntries(
    visibleFeatures.map((value: FeatureType): [string, boolean] => [value.key, value.toggle]),
  );
  const [lastSavedFeaturesFlags, setLastSavedFeaturesFlags] = useState<FeaturesFlagsValues>(featuresFormDefaultValues);

  // generate the form schema based on the feature flags
  const featuresFormSchema = z.object(
    Object.fromEntries(
      visibleFeatures.map((value: FeatureType): [string, ZodDefault<ZodBoolean>] => [
        value.key,
        z.boolean().default(value.toggle),
      ]),
    ),
  );

  const featuresForm = useForm({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: featuresFormDefaultValues,
  });

  /**
   * Select a category of features to display
   * - if "ALL" or no categories are selected, display all features
   * - if a specific category is selected, filter the features by that category
   * - if a category is deselected, remove it from the selected categories
   * @param category - the category to select or deselect
   */
  function selectCategory(category: string): void {
    // reset for 'ALL' category
    if (category === allFeaturesCategory) {
      setVisibleFeatures(allFeatures);
      setSelectedCategories(new Set([allFeaturesCategory]));
      return;
    }

    // select or deselect the category
    const newCategories: Set<string> = new Set(selectedCategories);
    if (selectedCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }

    // set 'ALL' with no other categories selected
    if (newCategories.size === 0) {
      newCategories.add(allFeaturesCategory);

      setSelectedCategories(newCategories);
      setVisibleFeatures(allFeatures);
    } else {
      // remove 'ALL' if some categories are selected
      newCategories.delete(allFeaturesCategory);

      // filter visible features based on selected categories
      const visibleFeatures = allFeatures.filter((feature: FeatureType): boolean => {
        return feature.category.find((cat) => newCategories.has(cat)) !== undefined;
      });

      setSelectedCategories(newCategories);
      setVisibleFeatures(visibleFeatures);
    }
  }

  /**
   * Submit the form changes
   * - do not submit without changes
   * - update the feature flags in the database and in the form
   * - notify the user about the changes
   * @param data - feature flags values
   */
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
    const newFeatures: FeatureType[] = allFeatures.map((feature: FeatureType): FeatureType => {
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
              {allFeatures.find((feat) => feat.key === key)?.name}: {value.toString()}
            </div>
          ))}
        </>
      ),
    });
  }

  /**
   * Reset the form to default
   * - reset the categories selection to "ALL"
   * - reset the feature flags in the database to their default values
   */
  async function resetToDefault(): Promise<void> {
    // reset form values
    const newFeaturesFormDefaultValues = Object.fromEntries(
      allFeatures.map((value: FeatureType): [string, boolean] => [value.key, value.defaultToggle]),
    );
    featuresForm.reset(newFeaturesFormDefaultValues);
    setLastSavedFeaturesFlags(newFeaturesFormDefaultValues);
    setSelectedCategories(new Set([allFeaturesCategory]));

    // reset in database
    const newFeatures: FeatureType[] = allFeatures.map((feature: FeatureType): FeatureType => {
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
        {visibleFeatures.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-1">
              {featuresCategories.map((category: string) => (
                <button
                  type="button"
                  onClick={() => selectCategory(category)}
                  key={category}
                  className={`rounded-full  px-2 py-1 text-xs ${
                    selectedCategories.has(category) ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <Form {...featuresForm}>
              <form onChange={featuresForm.handleSubmit(onSubmit)} className="space-y-4">
                {visibleFeatures.map((feature: FeatureType) => (
                  <FormField
                    control={featuresForm.control}
                    name={feature.key}
                    key={feature.key}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{feature.name}</FormLabel>
                          <FormDescription>{feature.description}</FormDescription>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {feature.category.map((cat) => (
                              <span key={cat} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="button" variant={"outline"} onClick={resetToDefault}>
                  Reset defaults
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <p className="text-sm text-gray-500">No features available.</p>
        )}
      </CardContent>
    </Card>
  );
}
