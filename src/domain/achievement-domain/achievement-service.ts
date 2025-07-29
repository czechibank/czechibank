import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { UserMissionAchievementWithMission, UserMissionStats } from "@/types/mission";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const achievementService = {
  /**
   * Record a new achievement
   */
  async recordAchievement(userId: string, missionId: string, payload?: any) {
    try {
      // Check if achievement already exists
      const existingAchievement = await prisma.userMissionAchievement.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      if (existingAchievement) {
        return errorResponse("Achievement already exists", ApiErrorCode.OPERATION_FAILED);
      }

      // Create new achievement
      const achievement = await prisma.userMissionAchievement.create({
        data: {
          userId,
          missionId,
          payload,
        },
        include: {
          mission: {
            include: {
              rewards: {
                include: {
                  reward: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              superTokens: true,
            },
          },
        },
      });

      return successResponse("Achievement recorded successfully", { achievement });
    } catch (error) {
      console.error("Error recording achievement:", error);
      return errorResponse("Failed to record achievement", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [achievements, total] = await Promise.all([
        prisma.userMissionAchievement.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            mission: {
              include: {
                rewards: {
                  include: {
                    reward: true,
                  },
                },
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        }),
        prisma.userMissionAchievement.count({
          where: { userId },
        }),
      ]);

      return successResponse("User achievements retrieved successfully", {
        achievements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return errorResponse("Failed to get user achievements", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Check if user has a specific achievement
   */
  async hasAchievement(userId: string, missionId: string): Promise<boolean> {
    try {
      const achievement = await prisma.userMissionAchievement.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      return !!achievement;
    } catch (error) {
      console.error("Error checking achievement:", error);
      return false;
    }
  },

  /**
   * Get achievement statistics
   */
  async getAchievementStats() {
    try {
      const [totalAchievements, uniqueUsers, totalMissions, recentAchievements] = await Promise.all([
        prisma.userMissionAchievement.count(),
        prisma.userMissionAchievement.groupBy({
          by: ["userId"],
          _count: true,
        }),
        prisma.mission.count(),
        prisma.userMissionAchievement.findMany({
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            mission: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        }),
      ]);

      const uniqueUserCount = uniqueUsers.length;
      const averageAchievementsPerUser =
        uniqueUserCount > 0 ? Math.round((totalAchievements / uniqueUserCount) * 100) / 100 : 0;

      return successResponse("Achievement statistics retrieved successfully", {
        stats: {
          totalAchievements,
          uniqueUsers: uniqueUserCount,
          totalMissions,
          averageAchievementsPerUser,
          recentAchievements,
        },
      });
    } catch (error) {
      console.error("Error getting achievement statistics:", error);
      return errorResponse("Failed to get achievement statistics", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get user achievement statistics
   */
  async getUserAchievementStats(userId: string): Promise<UserMissionStats | null> {
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
        }) as Promise<UserMissionAchievementWithMission[]>,
        prisma.userReward.findMany({
          where: { userId },
          include: {
            reward: {
              select: {
                badgeName: true,
                badgeIcon: true,
              },
            },
          },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            superTokens: true,
          },
        }),
      ]);

      if (!user) {
        return null;
      }

      const badges = userRewards.map((ur) => ur.reward.badgeName).filter(Boolean) as string[];

      return {
        userId: user.id,
        totalAchievements: achievements.length,
        totalSuperTokens: user.superTokens,
        badges,
        recentAchievements: achievements,
      };
    } catch (error) {
      console.error("Error getting user achievement statistics:", error);
      return null;
    }
  },

  /**
   * Get achievements by mission
   */
  async getAchievementsByMission(missionId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [achievements, total] = await Promise.all([
        prisma.userMissionAchievement.findMany({
          where: { missionId },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            completedAt: "desc",
          },
        }),
        prisma.userMissionAchievement.count({
          where: { missionId },
        }),
      ]);

      return successResponse("Mission achievements retrieved successfully", {
        achievements,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting achievements by mission:", error);
      return errorResponse("Failed to get mission achievements", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get leaderboard (top users by achievements)
   */
  async getLeaderboard(limit: number = 10) {
    try {
      // Get users with their achievement counts
      const usersWithAchievements = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          superTokens: true,
          missionAchievements: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          superTokens: "desc",
        },
        take: limit,
      });

      // Sort by achievement count first, then by super tokens
      const leaderboard = usersWithAchievements
        .map((user) => ({
          userId: user.id,
          name: user.name,
          email: user.email,
          superTokens: user.superTokens,
          achievementCount: user.missionAchievements.length,
        }))
        .sort((a, b) => {
          // Sort by achievement count first (descending)
          if (a.achievementCount !== b.achievementCount) {
            return b.achievementCount - a.achievementCount;
          }
          // Then by super tokens (descending)
          return b.superTokens - a.superTokens;
        });

      return successResponse("Leaderboard retrieved successfully", {
        leaderboard,
      });
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return errorResponse("Failed to get leaderboard", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Delete achievement (admin only)
   */
  async deleteAchievement(userId: string, missionId: string) {
    try {
      const achievement = await prisma.userMissionAchievement.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      if (!achievement) {
        return errorResponse("Achievement not found", ApiErrorCode.NOT_FOUND);
      }

      await prisma.userMissionAchievement.delete({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });

      return successResponse("Achievement deleted successfully", {});
    } catch (error) {
      console.error("Error deleting achievement:", error);
      return errorResponse("Failed to delete achievement", ApiErrorCode.INTERNAL_ERROR);
    }
  },
};
