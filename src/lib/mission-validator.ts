export interface MissionCondition {
  type: string;
  requiredFields?: string[];
  exactValues?: Record<string, any>;
  regexPatterns?: Record<string, string>;
  missingFields?: string[];
  expectRateLimit?: boolean;
  expectError?: boolean;
  transactionCount?: number;
  timeWindow?: {
    startHour?: number;
    endHour?: number;
    daysOfWeek?: number[];
  };
}

export interface ValidationContext {
  payload: any;
  headers: Record<string, string>;
  endpoint: string;
  method: string;
  userId: string;
  timestamp: Date;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  details?: any;
}

/**
 * Main validation function for mission conditions
 */
export const validateMissionPayload = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  try {
    switch (condition.type) {
      case "payload_validation":
        return validatePayloadFields(condition, context);

      case "rate_limit":
        return validateRateLimit(condition, context);

      case "exact_values":
        return validateExactValues(condition, context);

      case "regex_patterns":
        return validateRegexPatterns(condition, context);

      case "missing_fields":
        return validateMissingFields(condition, context);

      case "time_window":
        return validateTimeWindow(condition, context);

      case "transaction_count":
        return validateTransactionCount(condition, context);

      default:
        return {
          isValid: false,
          reason: `Unknown condition type: ${condition.type}`,
        };
    }
  } catch (error) {
    return {
      isValid: false,
      reason: `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
};

/**
 * Validate required fields exist in payload
 */
const validatePayloadFields = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  if (!condition.requiredFields) {
    return { isValid: true };
  }

  for (const field of condition.requiredFields) {
    if (!(field in context.payload)) {
      return {
        isValid: false,
        reason: `Missing required field: ${field}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate exact value matches
 */
const validateExactValues = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  if (!condition.exactValues) {
    return { isValid: true };
  }

  for (const [field, expectedValue] of Object.entries(condition.exactValues)) {
    const actualValue = context.payload[field];

    if (actualValue !== expectedValue) {
      return {
        isValid: false,
        reason: `Field ${field} value mismatch. Expected: ${expectedValue}, Got: ${actualValue}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate regex patterns
 */
const validateRegexPatterns = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  if (!condition.regexPatterns) {
    return { isValid: true };
  }

  for (const [field, pattern] of Object.entries(condition.regexPatterns)) {
    const value = context.payload[field];

    if (typeof value !== "string") {
      return {
        isValid: false,
        reason: `Field ${field} is not a string, cannot apply regex pattern`,
      };
    }

    try {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return {
          isValid: false,
          reason: `Field ${field} does not match pattern: ${pattern}`,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        reason: `Invalid regex pattern for field ${field}: ${pattern}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate missing fields (for error testing)
 */
const validateMissingFields = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  if (!condition.missingFields) {
    return { isValid: true };
  }

  for (const field of condition.missingFields) {
    if (field in context.payload) {
      return {
        isValid: false,
        reason: `Field ${field} should be missing but was present`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate rate limit scenarios
 */
const validateRateLimit = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  // This would typically be checked against the response
  // For now, we'll return true if expectRateLimit is set
  // The actual rate limit check would be done in the API response handler

  if (condition.expectRateLimit) {
    return { isValid: true };
  }

  return { isValid: false, reason: "Rate limit condition not met" };
};

/**
 * Validate time window conditions
 */
const validateTimeWindow = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  if (!condition.timeWindow) {
    return { isValid: true };
  }

  const now = context.timestamp;
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60; // Decimal hours in UTC
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

  // Check day of week
  if (condition.timeWindow.daysOfWeek && !condition.timeWindow.daysOfWeek.includes(dayOfWeek)) {
    return {
      isValid: false,
      reason: `Current day (${dayOfWeek}) not in allowed days: ${condition.timeWindow.daysOfWeek.join(", ")}`,
    };
  }

  // Check hour range
  if (condition.timeWindow.startHour !== undefined && condition.timeWindow.endHour !== undefined) {
    if (hour < condition.timeWindow.startHour || hour > condition.timeWindow.endHour) {
      return {
        isValid: false,
        reason: `Current hour (${hour}) not in allowed range: ${condition.timeWindow.startHour}-${condition.timeWindow.endHour}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate transaction count conditions
 */
const validateTransactionCount = (condition: MissionCondition, context: ValidationContext): ValidationResult => {
  // This would typically be checked against the user's transaction count
  // For now, we'll return true if the condition is set
  // The actual count check would be done in the service layer

  if (condition.transactionCount !== undefined) {
    return { isValid: true };
  }

  return { isValid: false, reason: "Transaction count condition not met" };
};

/**
 * Helper function to extract payload from request
 */
export const extractPayload = async (request: Request): Promise<any> => {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await request.clone().json();
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.clone().formData();
      const result: any = {};
      for (const [key, value] of formData.entries()) {
        result[key] = value;
      }
      return result;
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.clone().text();
      const result: any = {};
      const params = new URLSearchParams(text);
      for (const [key, value] of params.entries()) {
        result[key] = value;
      }
      return result;
    }

    return {};
  } catch (error) {
    console.warn("Failed to extract payload:", error);
    return {};
  }
};

/**
 * Helper function to extract headers from request
 */
export const extractHeaders = (request: Request): Record<string, string> => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
};
