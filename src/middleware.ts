import { NextResponse, type NextRequest } from "next/server";
import { getApiEndpointName, trackApiCall } from "./lib/plausible";

export async function middleware(request: NextRequest) {
  // Log request details for debugging
  // console.log("=== Request Debug ===");
  // console.log("Request URL:", request.url);
  // console.log("Request Method:", request.method);
  // console.log("Origin:", request.headers.get("origin"));
  // console.log("Authorization:", request.headers.get("authorization"));
  // console.log("All Headers:", Object.fromEntries(request.headers.entries()));
  // console.log("=== End Request Debug ===");

  const method = request.method;
  const path = request.nextUrl.pathname;
  const cleanPath = getApiEndpointName(path);

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  // Add CORS headers to all responses
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");

  // Track API calls only on the server
  if (path.startsWith("/api") && typeof window === "undefined") {
    // Since we can't await the response in middleware, track the request without status
    // Individual API routes should handle detailed tracking with status and duration
    try {
      const userAgent = request.headers.get("user-agent");
      if (userAgent?.includes("Uptime-Kuma")) {
        return response;
      }
      // Fire and forget - don't await to avoid delaying the response
      await trackApiCall(cleanPath, method, 200, undefined, userAgent || undefined);
    } catch (error) {
      // Don't let tracking errors affect the application
      console.error("Error tracking API call:", error);
    }
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/api/:path*", "/api/v1/:path*", "/api/((?!auth|_next).*)"],
};
