import { checkUserAuthOrThrowError } from "@/app/api/v1/server-actions";
import { missionService } from "@/domain/mission-domain/mission-service";
import { NextRequest, NextResponse } from "next/server";
import { extractHeaders, extractPayload, ValidationContext } from "./mission-validator";

/**
 * Mission middleware context for tracking mission checks
 */
export interface MissionMiddlewareContext {
  userId?: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  missionResults: Array<{
    missionId: string;
    success: boolean;
    message: string;
    rewards?: any[];
    superTokensAwarded?: number;
    badgesAwarded?: string[];
  }>;
}

/**
 * Mission middleware options
 */
export interface MissionMiddlewareOptions {
  enabled?: boolean;
  logResults?: boolean;
  includeInResponse?: boolean;
}

/**
 * Default middleware options
 */
const defaultOptions: MissionMiddlewareOptions = {
  enabled: true,
  logResults: true,
  includeInResponse: false,
};

/**
 * Extract user ID from API key authentication
 */
async function extractUserId(request: NextRequest): Promise<string | undefined> {
  try {
    // Use the existing authentication system
    const user = await checkUserAuthOrThrowError(request);
    if ("error" in user) {
      return undefined;
    }
    return user.id;
  } catch (error) {
    console.error("Error extracting user ID:", error);
    return undefined;
  }
}

/**
 * Check missions for a specific API endpoint
 */
export async function checkMissions(
  request: NextRequest,
  response: NextResponse,
  options: MissionMiddlewareOptions = {},
  requestBody?: any,
): Promise<MissionMiddlewareContext> {
  const opts = { ...defaultOptions, ...options };

  if (!opts.enabled) {
    return {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      timestamp: new Date(),
      missionResults: [],
    };
  }

  const context: MissionMiddlewareContext = {
    endpoint: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date(),
    missionResults: [],
  };

  try {
    // Extract user ID
    context.userId = await extractUserId(request);

    if (!context.userId) {
      // No user authenticated, skip mission checking
      return context;
    }

    // Get missions for this endpoint
    const missions = await missionService.getMissionsForEndpoint(context.endpoint, context.method);

    if (missions.length === 0) {
      return context;
    }

    // Use provided request body or extract from request
    const payload = requestBody || (await extractPayload(request));
    const headers = extractHeaders(request);

    // Check each mission
    for (const mission of missions) {
      try {
        const validationContext: ValidationContext = {
          payload,
          headers,
          endpoint: context.endpoint,
          method: context.method,
          userId: context.userId,
          timestamp: context.timestamp,
        };

        const result = await missionService.checkMissionCompletion(context.userId, mission.id, validationContext);

        context.missionResults.push({
          missionId: mission.id,
          success: result.success,
          message: result.message,
          rewards: result.data?.rewards,
          superTokensAwarded: result.data?.superTokensAwarded,
          badgesAwarded: result.data?.badgesAwarded,
        });

        // Log mission results if enabled
        if (opts.logResults) {
          if (result.success) {
            console.log(`🎯 Mission completed: ${mission.name}`, {
              userId: context.userId,
              missionId: mission.id,
              rewards: result.data?.rewards?.length || 0,
              superTokens: result.data?.superTokensAwarded || 0,
              badges: result.data?.badgesAwarded?.length || 0,
            });
          } else {
            console.log(`❌ Mission failed: ${mission.name}`, {
              userId: context.userId,
              missionId: mission.id,
              reason: result.message,
            });
          }
        }
      } catch (error) {
        console.error(`Error checking mission ${mission.id}:`, error);
        context.missionResults.push({
          missionId: mission.id,
          success: false,
          message: "Error checking mission",
        });
      }
    }
  } catch (error) {
    console.error("Error in mission middleware:", error);
  }

  return context;
}

/**
 * Mission middleware wrapper for Next.js API routes
 * This follows Next.js patterns for middleware integration
 */
export function withMissionMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: MissionMiddlewareOptions = {},
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Execute the original handler first
    const response = await handler(request);

    // Only check missions for successful responses (2xx status codes)
    if (response.status >= 200 && response.status < 300) {
      // Check missions after the request is processed
      const missionContext = await checkMissions(request, response, options);

      // Optionally include mission results in response headers
      if (options.includeInResponse && missionContext.missionResults.length > 0) {
        const completedMissions = missionContext.missionResults.filter((r) => r.success);
        if (completedMissions.length > 0) {
          response.headers.set("X-Missions-Completed", completedMissions.length.toString());
          response.headers.set("X-Missions-Total", missionContext.missionResults.length.toString());
        }
      }
    }

    return response;
  };
}

/**
 * Mission middleware for use in API routes
 * This follows Next.js patterns for middleware integration
 */
export async function missionMiddleware(
  request: NextRequest,
  options: MissionMiddlewareOptions = {},
): Promise<MissionMiddlewareContext> {
  return await checkMissions(request, new NextResponse(), options);
}

/**
 * Higher-order function to wrap API route handlers with mission checking
 * This follows Next.js patterns for middleware integration
 */
export function withMissionChecking<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: MissionMiddlewareOptions = {},
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // Extract request body before it gets consumed by the handler
    let requestBody: any = null;
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        requestBody = await request.clone().json();
      }
    } catch (error) {
      console.warn("Failed to extract request body for mission checking:", error);
    }

    // Execute the original handler first
    const response = await handler(request, ...args);

    // Only check missions for successful responses (2xx status codes)
    if (response.status >= 200 && response.status < 300) {
      try {
        // Check missions after the request is processed
        const missionContext = await checkMissions(request, response, options, requestBody);

        // Add mission results to response headers
        if (missionContext.missionResults.length > 0) {
          const completedMissions = missionContext.missionResults.filter((r) => r.success);
          if (completedMissions.length > 0) {
            response.headers.set("X-Missions-Completed", completedMissions.length.toString());
            response.headers.set("X-Missions-Total", missionContext.missionResults.length.toString());
          }
        }
      } catch (error) {
        // Don't let mission checking errors affect the main response
        console.error("Error in mission checking:", error);
      }
    }

    return response;
  };
}

/**
 * Helper function to check if any missions were completed
 */
export function hasCompletedMissions(context: MissionMiddlewareContext): boolean {
  return context.missionResults.some((result) => result.success);
}

/**
 * Helper function to get completed missions
 */
export function getCompletedMissions(context: MissionMiddlewareContext) {
  return context.missionResults.filter((result) => result.success);
}

/**
 * Helper function to get total rewards from completed missions
 */
export function getTotalRewards(context: MissionMiddlewareContext) {
  const completedMissions = getCompletedMissions(context);
  return {
    totalSuperTokens: completedMissions.reduce((sum, mission) => sum + (mission.superTokensAwarded || 0), 0),
    totalBadges: completedMissions.reduce(
      (badges, mission) => [...badges, ...(mission.badgesAwarded || [])],
      [] as string[],
    ),
    totalRewards: completedMissions.reduce((sum, mission) => sum + (mission.rewards?.length || 0), 0),
  };
}
