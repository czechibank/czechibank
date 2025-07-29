import { MissionCondition } from "@/lib/mission-validator";

export interface Mission {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "active" | "inactive" | "expired";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  conditions: MissionCondition;
  timeWindow?: {
    startHour?: number;
    endHour?: number;
    daysOfWeek?: number[];
  };
  createdAt: Date;
  updatedAt: Date;
  rewards?: MissionReward[];
  achievements?: UserMissionAchievement[];
}

export interface MissionReward {
  id: string;
  missionId: string;
  rewardId: string;
  mission?: Mission;
  reward?: Reward;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  superTokens: number;
  badgeName?: string;
  badgeIcon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  missions?: MissionReward[];
  userRewards?: UserReward[];
}

export interface UserMissionAchievement {
  id: string;
  userId: string;
  missionId: string;
  completedAt: Date;
  payload?: any;
  user?: User;
  mission?: Mission;
}

// Prisma result type for achievements with mission data
export interface UserMissionAchievementWithMission {
  id: string;
  userId: string;
  missionId: string;
  completedAt: Date;
  payload?: any;
  mission: {
    id: string;
    name: string;
    description: string;
    type: string;
    status: string; // Prisma returns this as string
    endpoint: string;
    method: string; // Prisma returns this as string
    conditions: any; // Prisma returns this as JsonValue
    timeWindow: any; // Prisma returns this as JsonValue
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  awardedAt: Date;
  user?: User;
  reward?: Reward;
}

export interface User {
  id: string;
  name: string;
  email: string;
  superTokens: number;
  missionAchievements?: UserMissionAchievement[];
  userRewards?: UserReward[];
}

// Mission creation/update types
export interface CreateMissionRequest {
  name: string;
  description: string;
  type: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  conditions: MissionCondition;
  timeWindow?: {
    startHour?: number;
    endHour?: number;
    daysOfWeek?: number[];
  };
  rewardIds: string[];
}

export interface UpdateMissionRequest {
  name?: string;
  description?: string;
  type?: string;
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  conditions?: MissionCondition;
  timeWindow?: {
    startHour?: number;
    endHour?: number;
    daysOfWeek?: number[];
  };
  status?: "active" | "inactive" | "expired";
  rewardIds?: string[];
}

// Mission condition types
export interface PayloadValidationCondition extends MissionCondition {
  type: "payload_validation";
  requiredFields?: string[];
  exactValues?: Record<string, any>;
  regexPatterns?: Record<string, string>;
}

export interface RateLimitCondition extends MissionCondition {
  type: "rate_limit";
  expectRateLimit: boolean;
}

export interface ExactValuesCondition extends MissionCondition {
  type: "exact_values";
  exactValues: Record<string, any>;
}

export interface RegexPatternsCondition extends MissionCondition {
  type: "regex_patterns";
  regexPatterns: Record<string, string>;
}

export interface MissingFieldsCondition extends MissionCondition {
  type: "missing_fields";
  missingFields: string[];
}

export interface TimeWindowCondition extends MissionCondition {
  type: "time_window";
  timeWindow: {
    startHour?: number;
    endHour?: number;
    daysOfWeek?: number[];
  };
}

export interface TransactionCountCondition extends MissionCondition {
  type: "transaction_count";
  transactionCount: number;
}

// Mission response types
export interface MissionResponse {
  success: boolean;
  message: string;
  data?: {
    mission?: Mission;
    missions?: Mission[];
    achievement?: UserMissionAchievement;
    achievements?: UserMissionAchievement[];
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MissionCompletionResponse {
  success: boolean;
  message: string;
  data?: {
    missionId: string;
    completed: boolean;
    rewards?: Reward[];
    superTokensAwarded?: number;
    badgesAwarded?: string[];
  };
}

// Mission statistics types
export interface MissionStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  completionRate: number;
  totalRewards: number;
  totalSuperTokens: number;
}

export interface UserMissionStats {
  userId: string;
  totalAchievements: number;
  totalSuperTokens: number;
  badges: string[];
  recentAchievements: UserMissionAchievementWithMission[];
}
