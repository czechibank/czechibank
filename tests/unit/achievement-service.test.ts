import { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { achievementService } from "../../src/domain/achievement-domain/achievement-service";

// Mock Prisma
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => ({
    userMissionAchievement: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    userReward: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  })),
}));

describe("Achievement Service", () => {
  const mockPrisma = new PrismaClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordAchievement", () => {
    it("should record a new achievement", async () => {
      const userId = "user-1";
      const missionId = "mission-1";
      const payload = { amount: 100 };

      const mockAchievement = {
        id: "achievement-1",
        userId,
        missionId,
        completedAt: new Date(),
        payload,
      };

      vi.mocked(mockPrisma.userMissionAchievement.create).mockResolvedValue(mockAchievement as any);

      const result = await achievementService.recordAchievement(userId, missionId, payload);
      expect(result).toEqual(mockAchievement);
      expect(mockPrisma.userMissionAchievement.create).toHaveBeenCalledWith({
        data: {
          userId,
          missionId,
          payload,
        },
      });
    });

    it("should handle duplicate achievement gracefully", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      // Mock that achievement already exists
      vi.mocked(mockPrisma.userMissionAchievement.findFirst).mockResolvedValue({
        id: "existing-achievement-1",
      } as any);

      const result = await achievementService.recordAchievement(userId, missionId);
      expect(result).toBeNull();
      expect(mockPrisma.userMissionAchievement.create).not.toHaveBeenCalled();
    });
  });

  describe("getUserAchievements", () => {
    it("should return paginated user achievements", async () => {
      const userId = "user-1";
      const page = 1;
      const limit = 10;

      const mockAchievements = [
        {
          id: "achievement-1",
          userId,
          missionId: "mission-1",
          completedAt: new Date(),
          mission: {
            id: "mission-1",
            name: "Test Mission",
            description: "Test Description",
          },
        },
      ];

      vi.mocked(mockPrisma.userMissionAchievement.findMany).mockResolvedValue(mockAchievements as any);
      vi.mocked(mockPrisma.userMissionAchievement.count).mockResolvedValue(1);

      const result = await achievementService.getUserAchievements(userId, page, limit);
      expect(result.achievements).toEqual(mockAchievements);
      expect(result.total).toBe(1);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });

    it("should handle empty achievements", async () => {
      const userId = "user-1";

      vi.mocked(mockPrisma.userMissionAchievement.findMany).mockResolvedValue([]);
      vi.mocked(mockPrisma.userMissionAchievement.count).mockResolvedValue(0);

      const result = await achievementService.getUserAchievements(userId);
      expect(result.achievements).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("hasAchievement", () => {
    it("should return true if user has achievement", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      vi.mocked(mockPrisma.userMissionAchievement.findFirst).mockResolvedValue({
        id: "achievement-1",
      } as any);

      const result = await achievementService.hasAchievement(userId, missionId);
      expect(result).toBe(true);
    });

    it("should return false if user does not have achievement", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      vi.mocked(mockPrisma.userMissionAchievement.findFirst).mockResolvedValue(null);

      const result = await achievementService.hasAchievement(userId, missionId);
      expect(result).toBe(false);
    });
  });

  describe("getAchievementStats", () => {
    it("should return global achievement statistics", async () => {
      const mockStats = {
        totalAchievements: 100,
        uniqueUsers: 50,
        averageAchievementsPerUser: 2.0,
        mostCompletedMission: "mission-1",
        mostCompletedMissionCount: 25,
      };

      vi.mocked(mockPrisma.userMissionAchievement.count).mockResolvedValue(100);
      vi.mocked(mockPrisma.user.count).mockResolvedValue(50);

      const result = await achievementService.getAchievementStats();
      expect(result).toBeDefined();
      expect(result.totalAchievements).toBe(100);
      expect(result.uniqueUsers).toBe(50);
    });
  });

  describe("getUserAchievementStats", () => {
    it("should return user achievement statistics", async () => {
      const userId = "user-1";

      const mockStats = {
        totalAchievements: 5,
        totalRewards: 3,
        superTokens: 500,
        recentAchievements: [
          {
            id: "achievement-1",
            missionId: "mission-1",
            completedAt: new Date(),
          },
        ],
      };

      vi.mocked(mockPrisma.userMissionAchievement.count).mockResolvedValue(5);
      vi.mocked(mockPrisma.userReward.count).mockResolvedValue(3);
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({ superTokens: 500 } as any);
      vi.mocked(mockPrisma.userMissionAchievement.findMany).mockResolvedValue([
        { id: "achievement-1", missionId: "mission-1", completedAt: new Date() },
      ] as any);

      const result = await achievementService.getUserAchievementStats(userId);
      expect(result).toBeDefined();
      expect(result?.totalAchievements).toBe(5);
      expect(result?.totalRewards).toBe(3);
      expect(result?.superTokens).toBe(500);
    });

    it("should return null if user not found", async () => {
      const userId = "user-1";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await achievementService.getUserAchievementStats(userId);
      expect(result).toBeNull();
    });
  });

  describe("getAchievementsByMission", () => {
    it("should return achievements for specific mission", async () => {
      const missionId = "mission-1";
      const page = 1;
      const limit = 10;

      const mockAchievements = [
        {
          id: "achievement-1",
          userId: "user-1",
          missionId,
          completedAt: new Date(),
          user: {
            id: "user-1",
            name: "Test User",
          },
        },
      ];

      vi.mocked(mockPrisma.userMissionAchievement.findMany).mockResolvedValue(mockAchievements as any);
      vi.mocked(mockPrisma.userMissionAchievement.count).mockResolvedValue(1);

      const result = await achievementService.getAchievementsByMission(missionId, page, limit);
      expect(result.achievements).toEqual(mockAchievements);
      expect(result.total).toBe(1);
    });
  });

  describe("getLeaderboard", () => {
    it("should return achievement leaderboard", async () => {
      const limit = 10;

      const mockLeaderboard = [
        {
          userId: "user-1",
          name: "Top User",
          achievementCount: 10,
          superTokens: 1000,
        },
        {
          userId: "user-2",
          name: "Second User",
          achievementCount: 8,
          superTokens: 800,
        },
      ];

      vi.mocked(mockPrisma.user.findMany).mockResolvedValue(mockLeaderboard as any);

      const result = await achievementService.getLeaderboard(limit);
      expect(result).toEqual(mockLeaderboard);
    });

    it("should return limited results", async () => {
      const limit = 5;

      const mockLeaderboard = [
        { userId: "user-1", name: "User 1", achievementCount: 10, superTokens: 1000 },
        { userId: "user-2", name: "User 2", achievementCount: 8, superTokens: 800 },
        { userId: "user-3", name: "User 3", achievementCount: 6, superTokens: 600 },
        { userId: "user-4", name: "User 4", achievementCount: 4, superTokens: 400 },
        { userId: "user-5", name: "User 5", achievementCount: 2, superTokens: 200 },
      ];

      vi.mocked(mockPrisma.user.findMany).mockResolvedValue(mockLeaderboard as any);

      const result = await achievementService.getLeaderboard(limit);
      expect(result).toHaveLength(5);
    });
  });

  describe("deleteAchievement", () => {
    it("should delete a specific achievement", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      vi.mocked(mockPrisma.userMissionAchievement.delete).mockResolvedValue({
        id: "deleted-achievement-1",
      } as any);

      const result = await achievementService.deleteAchievement(userId, missionId);
      expect(result).toBeDefined();
      expect(mockPrisma.userMissionAchievement.delete).toHaveBeenCalledWith({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
      });
    });

    it("should handle deletion of non-existent achievement", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      vi.mocked(mockPrisma.userMissionAchievement.delete).mockRejectedValue(new Error("Record not found"));

      await expect(achievementService.deleteAchievement(userId, missionId)).rejects.toThrow("Record not found");
    });
  });

  describe("error handling", () => {
    it("should handle database errors gracefully", async () => {
      const userId = "user-1";
      const missionId = "mission-1";

      vi.mocked(mockPrisma.userMissionAchievement.create).mockRejectedValue(new Error("Database error"));

      await expect(achievementService.recordAchievement(userId, missionId)).rejects.toThrow("Database error");
    });

    it("should handle null results from database", async () => {
      const userId = "user-1";

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      const result = await achievementService.getUserAchievementStats(userId);
      expect(result).toBeNull();
    });
  });
});
