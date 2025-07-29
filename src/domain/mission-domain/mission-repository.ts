import prisma from "@/lib/db";
import { ApiErrorCode, errorResponse, successResponse } from "@/lib/response";
import { CreateMissionRequest, UpdateMissionRequest } from "@/types/mission";
import { Prisma } from "@prisma/client";

export const missionRepository = {
  /**
   * Get missions for a specific endpoint and method
   */
  async getMissionsForEndpoint(endpoint: string, method: string) {
    try {
      const missions = await prisma.mission.findMany({
        where: {
          endpoint,
          method,
          status: "active",
        },
        include: {
          rewards: {
            include: {
              reward: true,
            },
          },
          achievements: {
            include: {
              user: true,
            },
          },
        },
      });

      return successResponse("Missions retrieved successfully", { missions });
    } catch (error) {
      console.error("Error getting missions for endpoint:", error);
      return errorResponse("Failed to get missions for endpoint", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get mission by ID
   */
  async getMissionById(id: string) {
    try {
      const mission = await prisma.mission.findUnique({
        where: { id },
        include: {
          rewards: {
            include: {
              reward: true,
            },
          },
          achievements: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!mission) {
        return errorResponse("Mission not found", ApiErrorCode.NOT_FOUND);
      }

      return successResponse("Mission retrieved successfully", { mission });
    } catch (error) {
      console.error("Error getting mission by ID:", error);
      return errorResponse("Failed to get mission", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get all active missions
   */
  async getActiveMissions() {
    try {
      const missions = await prisma.mission.findMany({
        where: {
          status: "active",
        },
        include: {
          rewards: {
            include: {
              reward: true,
            },
          },
          achievements: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return successResponse("Active missions retrieved successfully", { missions });
    } catch (error) {
      console.error("Error getting active missions:", error);
      return errorResponse("Failed to get active missions", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get all missions (admin only)
   */
  async getAllMissions(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [missions, total] = await Promise.all([
        prisma.mission.findMany({
          skip,
          take: limit,
          include: {
            rewards: {
              include: {
                reward: true,
              },
            },
            achievements: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.mission.count(),
      ]);

      return successResponse("Missions retrieved successfully", {
        missions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error getting all missions:", error);
      return errorResponse("Failed to get missions", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Create new mission
   */
  async createMission(data: CreateMissionRequest) {
    try {
      const mission = await prisma.mission.create({
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          endpoint: data.endpoint,
          method: data.method,
          conditions: data.conditions as unknown as Prisma.InputJsonValue,
          timeWindow: data.timeWindow as unknown as Prisma.InputJsonValue,
          rewards: {
            create: data.rewardIds.map((rewardId) => ({
              rewardId,
            })),
          },
        },
        include: {
          rewards: {
            include: {
              reward: true,
            },
          },
        },
      });

      return successResponse("Mission created successfully", { mission });
    } catch (error) {
      console.error("Error creating mission:", error);
      return errorResponse("Failed to create mission", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Update existing mission
   */
  async updateMission(id: string, data: UpdateMissionRequest) {
    try {
      // First check if mission exists
      const existingMission = await prisma.mission.findUnique({
        where: { id },
      });

      if (!existingMission) {
        return errorResponse("Mission not found", ApiErrorCode.NOT_FOUND);
      }

      // Update mission data
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.type) updateData.type = data.type;
      if (data.endpoint) updateData.endpoint = data.endpoint;
      if (data.method) updateData.method = data.method;
      if (data.conditions) updateData.conditions = data.conditions as unknown as Prisma.InputJsonValue;
      if (data.timeWindow) updateData.timeWindow = data.timeWindow as unknown as Prisma.InputJsonValue;
      if (data.status) updateData.status = data.status;

      const mission = await prisma.mission.update({
        where: { id },
        data: updateData,
        include: {
          rewards: {
            include: {
              reward: true,
            },
          },
        },
      });

      // Update rewards if provided
      if (data.rewardIds) {
        // Delete existing rewards
        await prisma.missionReward.deleteMany({
          where: { missionId: id },
        });

        // Create new rewards
        await prisma.missionReward.createMany({
          data: data.rewardIds.map((rewardId) => ({
            missionId: id,
            rewardId,
          })),
        });

        // Fetch updated mission with rewards
        const updatedMission = await prisma.mission.findUnique({
          where: { id },
          include: {
            rewards: {
              include: {
                reward: true,
              },
            },
          },
        });

        return successResponse("Mission updated successfully", { mission: updatedMission });
      }

      return successResponse("Mission updated successfully", { mission });
    } catch (error) {
      console.error("Error updating mission:", error);
      return errorResponse("Failed to update mission", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Delete mission
   */
  async deleteMission(id: string) {
    try {
      // Check if mission exists
      const existingMission = await prisma.mission.findUnique({
        where: { id },
      });

      if (!existingMission) {
        return errorResponse("Mission not found", ApiErrorCode.NOT_FOUND);
      }

      // Delete mission (cascade will handle related records)
      await prisma.mission.delete({
        where: { id },
      });

      return successResponse("Mission deleted successfully", {});
    } catch (error) {
      console.error("Error deleting mission:", error);
      return errorResponse("Failed to delete mission", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Check if user has completed a mission
   */
  async hasUserCompletedMission(userId: string, missionId: string) {
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
      console.error("Error checking mission completion:", error);
      return false;
    }
  },

  /**
   * Record mission completion
   */
  async recordMissionCompletion(userId: string, missionId: string, payload?: any) {
    try {
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
        },
      });

      return successResponse("Mission completion recorded", { achievement });
    } catch (error) {
      console.error("Error recording mission completion:", error);
      return errorResponse("Failed to record mission completion", ApiErrorCode.INTERNAL_ERROR);
    }
  },

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string) {
    try {
      const achievements = await prisma.userMissionAchievement.findMany({
        where: { userId },
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
      });

      return successResponse("User achievements retrieved successfully", { achievements });
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return errorResponse("Failed to get user achievements", ApiErrorCode.INTERNAL_ERROR);
    }
  },
};
