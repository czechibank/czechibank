declare module "@stoplight/elements" {
  import type { FC } from "react";

  export interface APIProps {
    apiDescriptionUrl?: string;
    apiDescriptionDocument?: string | object;
    router?: "hash" | "memory" | "static";
    layout?: "sidebar" | "stacked" | "responsive";
    tryItCredentialsPolicy?: "omit" | "include" | "same-origin";
    [key: string]: unknown;
  }

  export const API: FC<APIProps>;
}
