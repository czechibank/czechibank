import {
  CreateDropMissionSchema,
  DropDefinitionSchema,
  UpdateDropMissionSchema,
} from "@/domain/drops-domain/drops-schema";
import { describe, expect, it } from "vitest";

const validDefinition = {
  version: 1,
  schedule: { kind: "always" },
  progressMode: { kind: "instant" },
  rule: { kind: "amount", equals: 222 },
};

const validMission = {
  slug: "test-mission",
  name: "Test Mission",
  description: "A mission for tests",
  triggerPath: "/api/v1/transactions/create",
  definition: validDefinition,
  rewardType: "SUPER_TOKENS",
  rewardPayload: { amount: 50 },
};

describe("CreateDropMissionSchema", () => {
  it("accepts a valid SUPER_TOKENS mission (seed shape)", () => {
    expect(CreateDropMissionSchema.safeParse(validMission).success).toBe(true);
  });

  it("accepts a valid DISPLAY_TITLE mission", () => {
    const result = CreateDropMissionSchema.safeParse({
      ...validMission,
      rewardType: "DISPLAY_TITLE",
      rewardPayload: { text: "Vault Master" },
    });
    expect(result.success).toBe(true);
  });

  it.each(["BADGE", "VAULT_BONUS", "LOTTERY_ENTRY"])("rejects unimplemented reward type %s", (rewardType) => {
    expect(CreateDropMissionSchema.safeParse({ ...validMission, rewardType }).success).toBe(false);
  });

  it.each([undefined, {}, { amount: 0 }, { amount: -5 }, { amount: "abc" }])(
    "rejects SUPER_TOKENS mission with payload %j",
    (rewardPayload) => {
      expect(CreateDropMissionSchema.safeParse({ ...validMission, rewardPayload }).success).toBe(false);
    },
  );

  it.each([undefined, {}, { text: "" }, { text: "   " }])(
    "rejects DISPLAY_TITLE mission with payload %j",
    (rewardPayload) => {
      const result = CreateDropMissionSchema.safeParse({
        ...validMission,
        rewardType: "DISPLAY_TITLE",
        rewardPayload,
      });
      expect(result.success).toBe(false);
    },
  );
});

describe("UpdateDropMissionSchema", () => {
  it("allows a partial update without reward fields", () => {
    expect(UpdateDropMissionSchema.safeParse({ name: "Renamed" }).success).toBe(true);
  });

  it("requires a matching payload when rewardType changes", () => {
    expect(UpdateDropMissionSchema.safeParse({ rewardType: "SUPER_TOKENS" }).success).toBe(false);
    expect(
      UpdateDropMissionSchema.safeParse({ rewardType: "SUPER_TOKENS", rewardPayload: { amount: 10 } }).success,
    ).toBe(true);
  });
});

describe("DropDefinitionSchema rules", () => {
  const definitionWithRule = (rule: unknown) => ({ ...validDefinition, rule });

  it("rejects an amount rule without comparators", () => {
    expect(DropDefinitionSchema.safeParse(definitionWithRule({ kind: "amount" })).success).toBe(false);
  });

  it("accepts amount rules with equals or gte", () => {
    expect(DropDefinitionSchema.safeParse(definitionWithRule({ kind: "amount", gte: 100 })).success).toBe(true);
  });

  it("rejects comparator-less amount rules nested in all/any", () => {
    const nested = { kind: "any", of: [{ kind: "amount" }] };
    expect(DropDefinitionSchema.safeParse(definitionWithRule(nested)).success).toBe(false);
  });

  it("rejects invalid regex patterns at creation time", () => {
    const rule = { kind: "bank_account_name", op: "regex", values: ["("] };
    expect(DropDefinitionSchema.safeParse(definitionWithRule(rule)).success).toBe(false);
  });

  it("rejects oversized regex patterns", () => {
    const rule = { kind: "bank_account_name", op: "regex", values: ["a".repeat(201)] };
    expect(DropDefinitionSchema.safeParse(definitionWithRule(rule)).success).toBe(false);
  });

  it("accepts valid regex patterns", () => {
    const rule = { kind: "bank_account_name", op: "regex", values: ["^Emergency.*$"] };
    expect(DropDefinitionSchema.safeParse(definitionWithRule(rule)).success).toBe(true);
  });
});
