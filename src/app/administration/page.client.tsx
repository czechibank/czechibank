"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import featuresService from "@/domain/features-domain/features-service";
import { FeatureType } from "@/domain/features-domain/features.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { flatMap, isEmpty, isEqual, omitBy, uniq } from "lodash";
import { RotateCcw, Settings } from "lucide-react";
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
    <div className="pb-12">
      {/* Page header */}
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border-3 border-black bg-[#FF6B35] px-4 py-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Settings className="h-4 w-4" />
          Admin Panel
        </div>
        <h1 className="text-4xl font-black tracking-tight">
          <span className="relative inline-block">
            <span className="relative z-10">Administration</span>
            <span className="absolute -bottom-1 left-0 h-3 w-full bg-[#FF6B35]" />
          </span>
        </h1>
      </div>

      {/* Features card */}
      <div className="rounded-2xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-900">
        <div className="h-3 rounded-t-xl border-b-3 border-black bg-[#FF6B35]" />
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-[#FF6B35]">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black">Features</h2>
          </div>

          {visibleFeatures.length > 0 ? (
            <div className="space-y-6">
              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {featuresCategories.map((category: string) => (
                  <button
                    type="button"
                    onClick={() => selectCategory(category)}
                    key={category}
                    className={`rounded-full border-2 border-black px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedCategories.has(category)
                        ? "bg-[#FF6B35] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800"
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
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border-2 border-black p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="font-bold">{feature.name}</FormLabel>
                            <FormDescription>{feature.description}</FormDescription>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {feature.category.map((cat) => (
                                <span
                                  key={cat}
                                  className="rounded-full border border-black bg-zinc-100 px-2 py-0.5 text-xs font-bold dark:bg-zinc-800"
                                >
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetToDefault}
                    className="border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset defaults
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No features available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
