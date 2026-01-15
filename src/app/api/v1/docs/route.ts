import env from "@/lib/env";
import { swaggerSpec } from "@/lib/swagger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const headersList = await headers();
  const accept = headersList.get("accept") || "";

  // If accessed from a browser, redirect to the UI page
  if (accept.includes("text/html")) {
    // Use trusted HOST environment variable to prevent open redirect vulnerabilities
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const redirectUrl = new URL("/api/v1/docs/page", `${protocol}://${env.HOST}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Otherwise return the OpenAPI spec as JSON
  return NextResponse.json(swaggerSpec, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
