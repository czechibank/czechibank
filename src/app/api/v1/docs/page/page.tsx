"use client";

import "@stoplight/elements/styles.min.css";
import { useTheme } from "next-themes";

import { API } from "@stoplight/elements";

export default function ApiDocs() {
  const apiDocsUrl = typeof window !== "undefined" ? `${window.location.origin}/api/v1/docs` : "/api/v1/docs";
  const { resolvedTheme } = useTheme();

  return (
    <div className="stoplight-elements-wrapper h-full w-full" data-theme={resolvedTheme === "dark" ? "dark" : "light"}>
      <API apiDescriptionUrl={apiDocsUrl} router="hash" layout="sidebar" tryItCredentialsPolicy="include" />
    </div>
  );
}
