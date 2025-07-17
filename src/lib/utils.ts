import { loreleiNeutral } from "@dicebear/collection";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomAvatarConfig() {
  const options = {
    ...loreleiNeutral.schema.properties,
  };

  function getRandomValues(options: any) {
    const result: { [key: string]: any } = {};

    for (const key in options) {
      const defaultValues = options[key].default;
      const randomIndex = Math.floor(Math.random() * defaultValues.length);
      result[key] = [defaultValues[randomIndex]];
    }

    return result;
  }

  function generateLightColorHex() {
    const red = Math.floor(Math.random() * 128 + 128).toString(16);
    const green = Math.floor(Math.random() * 128 + 128).toString(16);
    const blue = Math.floor(Math.random() * 128 + 128).toString(16);

    return `${red.padStart(2, "0")}${green.padStart(2, "0")}${blue.padStart(2, "0")}`;
  }

  const color = generateLightColorHex();
  console.log(getRandomValues(options));
  return { ...getRandomValues(options), backgroundColor: [color] };
}
