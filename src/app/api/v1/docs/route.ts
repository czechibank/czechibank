import { swaggerSpec } from "@/lib/swagger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const headersList = await headers();
  const accept = headersList.get("accept") || "";

  // If accessed from a browser, redirect to the UI page
  if (accept.includes("text/html")) {
    // Construct the redirect URL using headers to handle proxies/load balancers correctly
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || request.url;
    const protocol = headersList.get("x-forwarded-proto") || "https";
    const redirectUrl = new URL("/api/v1/docs/page", `${protocol}://${host}`);
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
