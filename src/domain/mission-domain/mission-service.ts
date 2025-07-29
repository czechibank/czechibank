import { validateMissionPayload, ValidationContext } from "@/lib/mission-validator";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { Mission, MissionCompletionResponse } from "@/types/mission";
import { PrismaClient } from "@prisma/client";
import { missionRepository } from "./mission-repository";

const prisma = new PrismaClient();

export const missionService = {
  /**
   * Get all active missions
   */
  async getActiveMissions() {
    const result = await missionRepository.getActiveMissions();
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return result.data.missions;
  },

  /**
   * Get missions for specific endpoint and method
   */
  async getMissionsForEndpoint(endpoint: string, method: string) {
    const result = await missionRepository.getMissionsForEndpoint(endpoint, method);
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return result.data.missions;
  },

  /**
   * Check if user completed a mission and award rewards
   */
  async checkMissionCompletion(
    userId: string,
    missionId: string,
    context: ValidationContext,
  ): Promise<MissionCompletionResponse> {
    try {
      // Check if user already completed this mission
      const hasCompleted = await missionRepository.hasUserCompletedMission(userId, missionId);
      if (hasCompleted) {
        return {
          success: false,
          message: "Mission already completed",
        };
      }

      // Get mission details
      const missionResult = await missionRepository.getMissionById(missionId);
      if ("error" in missionResult) {
        return {
          success: false,
          message: missionResult.error.message,
        };
      }

      const mission = missionResult.data.mission;

      // Validate mission conditions
      const validationResult = validateMissionPayload(mission.conditions as any, context);

      if (!validationResult.isValid) {
        return {
          success: false,
          message: `Mission conditions not met: ${validationResult.reason}`,
        };
      }

      // Record mission completion
      const achievementResult = await missionRepository.recordMissionCompletion(userId, missionId, context.payload);

      if ("error" in achievementResult) {
        return {
          success: false,
          message: achievementResult.error.message,
        };
      }

      // Award rewards
      const rewardResult = await this.awardMissionRewards(userId, mission as any);

      if ("error" in rewardResult) {
        return {
          success: false,
          message: rewardResult.error.message,
        };
      }

      return {
        success: true,
        message: "Mission completed successfully!",
        data: {
          missionId,
          completed: true,
          rewards: rewardResult.data.rewards || [],
          superTokensAwarded: rewardResult.data.superTokensAwarded || 0,
          badgesAwarded: rewardResult.data.badgesAwarded || [],
        },
      };
    } catch (error) {
      console.error("Error checking mission completion:", error);
      return {
        success: false,
        message: "Failed to check mission completion",
      };
    }
  },

  /**
   * Award rewards to user for completing a mission
   */
  async awardMissionRewards(userId: string, mission: Mission) {
    try {
      const awardedRewards = [];
      const badgesAwarded = [];
      let totalSuperTokens = 0;

      // Process each reward
      for (const missionReward of mission.rewards || []) {
        const reward = missionReward.reward;

        if (!reward) continue;

        if (reward.superTokens > 0) {
          // Award super tokens
          await prisma.user.update({
            where: { id: userId },
            data: {
              superTokens: {
                increment: reward.superTokens,
              },
            },
          });
          totalSuperTokens += reward.superTokens;
        }

        if (reward.badgeName) {
          // Award badge
          await prisma.userReward.create({
            data: {
              userId,
              rewardId: reward.id,
            },
          });
          badgesAwarded.push(reward.badgeName);
        }

        awardedRewards.push(reward);
      }

      return successResponse("Rewards awarded successfully", {
        rewards: awardedRewards,
        superTokensAwarded: totalSuperTokens,
        badgesAwarded,
      });
    } catch (error) {
      console.error("Error awarding mission rewards:", error);
      return errorResponse("Failed to award rewards", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    const result = await missionRepository.getUserAchievements(userId);
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return result.data.achievements;
  },

  /**
   * Get user's rewards
   */
  async getUserRewards(userId: string) {
    try {
      const userRewards = await prisma.userReward.findMany({
        where: { userId },
        include: {
          reward: true,
        },
        orderBy: {
          awardedAt: "desc",
        },
      });

      return userRewards;
    } catch (error) {
      console.error("Error getting user rewards:", error);
      throw new Error("Failed to get user rewards");
    }
  },

  /**
   * Get user's super tokens balance
   */
  async getUserSuperTokens(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { superTokens: true },
      });

      if (!user) {
        return 0;
      }

      return user.superTokens;
    } catch (error) {
      console.error("Error getting user super tokens:", error);
      throw new Error("Failed to get super tokens");
    }
  },

  /**
   * Get mission statistics
   */
  async getMissionStats() {
    try {
      const [totalMissions, activeMissions, totalAchievements, totalRewards, totalSuperTokens] = await Promise.all([
        prisma.mission.count(),
        prisma.mission.count({ where: { status: "active" } }),
        prisma.userMissionAchievement.count(),
        prisma.userReward.count(),
        prisma.user.aggregate({
          _sum: { superTokens: true },
        }),
      ]);

      const completionRate = totalMissions > 0 ? (totalAchievements / totalMissions) * 100 : 0;

      return {
        totalMissions,
        activeMissions,
        completedMissions: totalAchievements,
        completionRate: Math.round(completionRate * 100) / 100,
        totalRewards,
        totalSuperTokens: totalSuperTokens._sum.superTokens || 0,
      };
    } catch (error) {
      console.error("Error getting mission statistics:", error);
      throw new Error("Failed to get mission statistics");
    }
  },

  /**
   * Get user mission statistics
   */
  async getUserMissionStats(userId: string) {
    try {
      const [achievements, userRewards, user] = await Promise.all([
        prisma.userMissionAchievement.findMany({
          where: { userId },
          include: {
            mission: true,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 5,
        }),
        prisma.userReward.findMany({
          where: { userId },
          include: {
            reward: true,
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { superTokens: true },
        }),
      ]);

      const badges = userRewards.map((ur) => ur.reward.badgeName).filter(Boolean) as string[];

      return {
        userId,
        totalAchievements: achievements.length,
        totalSuperTokens: user?.superTokens || 0,
        badges,
        recentAchievements: achievements,
      };
    } catch (error) {
      console.error("Error getting user mission statistics:", error);
      throw new Error("Failed to get user mission statistics");
    }
  },

  /**
   * Create new mission (admin only)
   */
  async createMission(data: any) {
    const result = await missionRepository.createMission(data);
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return result.data.mission;
  },

  /**
   * Update mission (admin only)
   */
  async updateMission(id: string, data: any) {
    const result = await missionRepository.updateMission(id, data);
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return result.data.mission;
  },

  /**
   * Delete mission (admin only)
   */
  async deleteMission(id: string) {
    const result = await missionRepository.deleteMission(id);
    if ("error" in result) {
      throw new Error(result.error.message);
    }
    return true;
  },
};
