import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationContext } from "../../src/lib/mission-validator";
import { Mission } from "../../src/types/mission";

// Mock Prisma
const mockPrismaClient = {
  user: {
    update: vi.fn(),
    findUnique: vi.fn(),
    aggregate: vi.fn(),
  },
  userReward: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  mission: {
    count: vi.fn(),
  },
  userMissionAchievement: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrismaClient),
}));

// Mock mission repository
vi.mock("../../src/domain/mission-domain/mission-repository", () => ({
  missionRepository: {
    getMissionsForEndpoint: vi.fn(),
    getMissionById: vi.fn(),
    getActiveMissions: vi.fn(),
    hasUserCompletedMission: vi.fn(),
    recordMissionCompletion: vi.fn(),
    getUserAchievements: vi.fn(),
    getAllMissions: vi.fn(),
    createMission: vi.fn(),
    updateMission: vi.fn(),
    deleteMission: vi.fn(),
  },
}));

// Mock mission validator
vi.mock("../../src/lib/mission-validator", () => ({
  validateMissionPayload: vi.fn(),
}));

// Import after mocks
import { missionRepository } from "../../src/domain/mission-domain/mission-repository";
import { missionService } from "../../src/domain/mission-domain/mission-service";

describe("Mission Service", () => {
  const mockMissionRepository = vi.mocked(missionRepository);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all Prisma mocks
    mockPrismaClient.user.findUnique.mockResolvedValue(null);
    mockPrismaClient.userReward.findMany.mockResolvedValue([]);
    mockPrismaClient.mission.count.mockResolvedValue(0);
    mockPrismaClient.userMissionAchievement.count.mockResolvedValue(0);
    mockPrismaClient.userMissionAchievement.findMany.mockResolvedValue([]);
  });

  describe("getActiveMissions", () => {
    it("should return active missions", async () => {
      const mockMissions = [
        { id: "1", name: "Test Mission", status: "active" },
        { id: "2", name: "Another Mission", status: "active" },
      ];

      mockMissionRepository.getActiveMissions.mockResolvedValue({
        data: { missions: mockMissions },
      });

      const result = await missionService.getActiveMissions();
      expect(result).toEqual(mockMissions);
      expect(mockMissionRepository.getActiveMissions).toHaveBeenCalled();
    });
  });

  describe("getMissionsForEndpoint", () => {
    it("should return missions for specific endpoint", async () => {
      const mockMissions = [{ id: "1", name: "Transaction Mission", endpoint: "/api/v1/transactions/create" }];

      mockMissionRepository.getMissionsForEndpoint.mockResolvedValue({
        data: { missions: mockMissions },
      });

      const result = await missionService.getMissionsForEndpoint("/api/v1/transactions/create", "POST");
      expect(result).toEqual(mockMissions);
      expect(mockMissionRepository.getMissionsForEndpoint).toHaveBeenCalledWith("/api/v1/transactions/create", "POST");
    });
  });

  describe("checkMissionCompletion", () => {
    it("should return already completed if user already completed mission", async () => {
      const userId = "user-1";
      const missionId = "mission-1";
      const context: ValidationContext = {
        payload: { amount: 100 },
        headers: {},
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        userId,
        timestamp: new Date(),
      };

      mockMissionRepository.hasUserCompletedMission.mockResolvedValue(true);

      const result = await missionService.checkMissionCompletion(userId, missionId, context);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Mission already completed");
    });

    it("should return not completed if mission not found", async () => {
      const userId = "user-1";
      const missionId = "mission-1";
      const context: ValidationContext = {
        payload: { amount: 100 },
        headers: {},
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        userId,
        timestamp: new Date(),
      };

      mockMissionRepository.hasUserCompletedMission.mockResolvedValue(false);
      mockMissionRepository.getMissionById.mockResolvedValue({
        error: { message: "Mission not found" },
      });

      const result = await missionService.checkMissionCompletion(userId, missionId, context);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Mission not found");
    });

    it("should return not completed if validation fails", async () => {
      const userId = "user-1";
      const missionId = "mission-1";
      const mockMission: Mission = {
        id: missionId,
        name: "Test Mission",
        description: "Test Description",
        type: "payload_validation",
        status: "active",
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        conditions: { type: "payload_validation", requiredFields: ["amount"] },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const context: ValidationContext = {
        payload: {}, // Missing amount field
        headers: {},
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        userId,
        timestamp: new Date(),
      };

      mockMissionRepository.hasUserCompletedMission.mockResolvedValue(false);
      mockMissionRepository.getMissionById.mockResolvedValue({
        data: { mission: mockMission },
      });

      // Mock validator to return false
      const { validateMissionPayload } = await import("../../src/lib/mission-validator");
      vi.mocked(validateMissionPayload).mockReturnValue({
        isValid: false,
        reason: "Missing required field: amount",
      });

      const result = await missionService.checkMissionCompletion(userId, missionId, context);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Mission conditions not met: Missing required field: amount");
    });

    it("should complete mission and award rewards if validation passes", async () => {
      const userId = "user-1";
      const missionId = "mission-1";
      const mockMission: Mission = {
        id: missionId,
        name: "Test Mission",
        description: "Test Description",
        type: "payload_validation",
        status: "active",
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        conditions: { type: "payload_validation", requiredFields: ["amount"] },
        createdAt: new Date(),
        updatedAt: new Date(),
        rewards: [
          {
            id: "reward-1",
            missionId,
            rewardId: "reward-1",
            reward: {
              id: "reward-1",
              name: "Test Reward",
              description: "Test Reward Description",
              superTokens: 100,
              badgeName: "Test Badge",
              badgeIcon: "🏆",
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };

      const context: ValidationContext = {
        payload: { amount: 100 },
        headers: {},
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        userId,
        timestamp: new Date(),
      };

      mockMissionRepository.hasUserCompletedMission.mockResolvedValue(false);
      mockMissionRepository.getMissionById.mockResolvedValue({
        data: { mission: mockMission },
      });
      mockMissionRepository.recordMissionCompletion.mockResolvedValue({
        data: { achievement: { id: "achievement-1" } },
      });

      // Mock validator to return true
      const { validateMissionPayload } = await import("../../src/lib/mission-validator");
      vi.mocked(validateMissionPayload).mockReturnValue({
        isValid: true,
      });

      // Mock Prisma user update
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, superTokens: 100 } as any);
      mockPrismaClient.userReward.create.mockResolvedValue({ id: "user-reward-1" } as any);

      const result = await missionService.checkMissionCompletion(userId, missionId, context);
      expect(result.success).toBe(true);
      expect(result.message).toBe("Mission completed successfully!");
      expect(result.data?.completed).toBe(true);
      expect(result.data?.rewards).toHaveLength(1);
      expect(result.data?.rewards[0].name).toBe("Test Reward");
      expect(result.data?.superTokensAwarded).toBe(100);
    });
  });

  describe("getUserAchievements", () => {
    it("should return user achievements", async () => {
      const userId = "user-1";
      const mockAchievements = [{ id: "achievement-1", missionId: "mission-1", completedAt: new Date() }];

      mockMissionRepository.getUserAchievements.mockResolvedValue({
        data: { achievements: mockAchievements },
      });

      const result = await missionService.getUserAchievements(userId);
      expect(result).toEqual(mockAchievements);
      expect(mockMissionRepository.getUserAchievements).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUserRewards", () => {
    it("should return user rewards", async () => {
      const userId = "user-1";
      const mockRewards = [{ id: "reward-1", name: "Test Reward", superTokens: 100 }];

      mockPrismaClient.userReward.findMany.mockResolvedValue(mockRewards as any);

      const result = await missionService.getUserRewards(userId);
      expect(result).toEqual(mockRewards);
      expect(mockPrismaClient.userReward.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { reward: true },
        orderBy: { awardedAt: "desc" },
      });
    });
  });

  describe("getUserSuperTokens", () => {
    it("should return user super tokens", async () => {
      const userId = "user-1";
      const mockUser = { superTokens: 500 };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await missionService.getUserSuperTokens(userId);
      expect(result).toBe(500);
    });

    it("should return 0 if user not found", async () => {
      const userId = "user-1";

      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await missionService.getUserSuperTokens(userId);
      expect(result).toBe(0);
    });
  });

  describe("getMissionStats", () => {
    it("should return mission statistics", async () => {
      mockPrismaClient.mission.count.mockResolvedValue(10);
      mockPrismaClient.userMissionAchievement.count.mockResolvedValue(5);
      mockPrismaClient.userReward.count.mockResolvedValue(3);
      mockPrismaClient.user.aggregate.mockResolvedValue({
        _sum: { superTokens: 1000 },
      } as any);

      const result = await missionService.getMissionStats();
      expect(result).toBeDefined();
      expect(result.totalMissions).toBe(10);
      expect(result.activeMissions).toBe(10);
      expect(result.completedMissions).toBe(5);
    });
  });

  describe("getUserMissionStats", () => {
    it("should return user mission statistics", async () => {
      const userId = "user-1";

      mockPrismaClient.userMissionAchievement.findMany.mockResolvedValue([]);
      mockPrismaClient.userReward.findMany.mockResolvedValue([]);
      mockPrismaClient.user.findUnique.mockResolvedValue({ superTokens: 500 } as any);

      const result = await missionService.getUserMissionStats(userId);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.totalAchievements).toBe(0);
      expect(result.totalSuperTokens).toBe(500);
    });
  });

  describe("createMission", () => {
    it("should create a new mission", async () => {
      const missionData = {
        name: "New Mission",
        description: "New Description",
        type: "payload_validation",
        endpoint: "/api/v1/transactions/create",
        method: "POST",
        conditions: { type: "payload_validation" },
        rewardIds: ["reward-1"],
      };

      const mockMission = { id: "new-mission-1", ...missionData };
      mockMissionRepository.createMission.mockResolvedValue({
        data: { mission: mockMission },
      });

      const result = await missionService.createMission(missionData);
      expect(result).toEqual(mockMission);
      expect(mockMissionRepository.createMission).toHaveBeenCalledWith(missionData);
    });
  });

  describe("updateMission", () => {
    it("should update an existing mission", async () => {
      const missionId = "mission-1";
      const updateData = {
        name: "Updated Mission",
        description: "Updated Description",
      };

      const mockMission = { id: missionId, ...updateData };
      mockMissionRepository.updateMission.mockResolvedValue({
        data: { mission: mockMission },
      });

      const result = await missionService.updateMission(missionId, updateData);
      expect(result).toEqual(mockMission);
      expect(mockMissionRepository.updateMission).toHaveBeenCalledWith(missionId, updateData);
    });
  });

  describe("deleteMission", () => {
    it("should delete a mission", async () => {
      const missionId = "mission-1";
      mockMissionRepository.deleteMission.mockResolvedValue({ success: true });

      const result = await missionService.deleteMission(missionId);
      expect(result).toBe(true);
      expect(mockMissionRepository.deleteMission).toHaveBeenCalledWith(missionId);
    });
  });
});
