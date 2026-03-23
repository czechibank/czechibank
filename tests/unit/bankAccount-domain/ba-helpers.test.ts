import type { BankAccount } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAccount = Pick<BankAccount, "id" | "name" | "userId">;

/** Hoisted so the `vi.mock` factory can safely reference `mockAccounts`. */
const { mockAccounts } = vi.hoisted(() => ({
  mockAccounts: [] as MockAccount[],
}));

vi.mock("../../../src/domain/bankAccount-domain/ba-repository", () => ({
  findActiveBankAccountsByUser: (userId: string, startsWith?: string) => {
    const all = mockAccounts.filter((ba) => ba.userId === userId);
    if (!startsWith) return all;
    return all.filter((ba) => ba.name.startsWith(startsWith));
  },
}));

import { getUniqueBankAccountName } from "../../../src/domain/bankAccount-domain/ba-helpers";
import { splitBankAccountNameForDisplay } from "../../../src/lib/bank-account-name-display";

function setMockAccounts(...accounts: MockAccount[]) {
  mockAccounts.length = 0;
  mockAccounts.push(...accounts);
}

describe("getUniqueBankAccountName", () => {
  const userId = "user-1";

  beforeEach(() => {
    mockAccounts.length = 0;
  });

  it("returns base name when not used yet", async () => {
    const next = await getUniqueBankAccountName("AKA", userId);
    expect(next).toBe("AKA");
  });

  it("allows the same name when it belongs to a different user", async () => {
    setMockAccounts({ id: "other", userId: "user-2", name: "AKA" });
    const next = await getUniqueBankAccountName("AKA", userId);
    expect(next).toBe("AKA");
  });

  it("creates (01) when base name already exists once", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA" });
    const next = await getUniqueBankAccountName("AKA", userId);
    expect(next).toBe("AKA (01)");
  });

  it("increments two-digit suffix AKA (01) -> AKA (02)", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA" }, { id: "a2", userId, name: "AKA (01)" });
    const next = await getUniqueBankAccountName("AKA (01)", userId);
    expect(next).toBe("AKA (02)");
  });

  it("fills lowest free when colliding with base AKA: AKA, AKA (01), AKA (03) -> AKA (02)", async () => {
    setMockAccounts(
      { id: "a1", userId, name: "AKA" },
      { id: "a2", userId, name: "AKA (01)" },
      { id: "a3", userId, name: "AKA (03)" },
    );
    const next = await getUniqueBankAccountName("AKA", userId);
    expect(next).toBe("AKA (02)");
  });

  it("does not reserve AKA (1) as a system suffix when creating a duplicate of AKA", async () => {
    setMockAccounts(
      { id: "a1", userId, name: "AKA" },
      // "(1)" is user-entered text, not an app-generated suffix.
      { id: "a2", userId, name: "AKA (1)" },
    );
    const next = await getUniqueBankAccountName("AKA", userId);
    expect(next).toBe("AKA (01)");
  });

  it("treats AKA(1) as user name and appends (01)", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA(1)" });
    const next = await getUniqueBankAccountName("AKA(1)", userId);
    expect(next).toBe("AKA(1) (01)");
  });

  it("treats AKA (1) as user name and appends (01)", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA (1)" });
    const next = await getUniqueBankAccountName("AKA (1)", userId);
    expect(next).toBe("AKA (1) (01)");
  });

  it("increments AKA (10) -> AKA (11)", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA (10)" });
    const next = await getUniqueBankAccountName("AKA (10)", userId);
    expect(next).toBe("AKA (11)");
  });

  it("creates AKA (05) when AKA (10), AKA (04) exist and AKA (04) is used again", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA (10)" }, { id: "a2", userId, name: "AKA (04)" });
    const next = await getUniqueBankAccountName("AKA (04)", userId);
    expect(next).toBe("AKA (05)");
  });

  it("creates AKA (13) when AKA (10), AKA (11), AKA (12), AKA (09) exist and AKA (09) is used again", async () => {
    setMockAccounts(
      { id: "a1", userId, name: "AKA (10)" },
      { id: "a2", userId, name: "AKA (11)" },
      { id: "a3", userId, name: "AKA (12)" },
      { id: "a4", userId, name: "AKA (09)" },
    );
    const next = await getUniqueBankAccountName("AKA (09)", userId);
    expect(next).toBe("AKA (13)");
  });

  it("handles three-digit suffix AKA (123) -> AKA (124)", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA (123)" });
    const next = await getUniqueBankAccountName("AKA (123)", userId);
    expect(next).toBe("AKA (124)");
  });

  it("does not rename when there is no exact name collision (AKA (10) and new AKA (04) -> keep AKA (04))", async () => {
    setMockAccounts({ id: "a1", userId, name: "AKA (10)" });
    const next = await getUniqueBankAccountName("AKA (04)", userId);
    expect(next).toBe("AKA (04)");
  });

  it("ignores current account when renaming (no collision with own name)", async () => {
    setMockAccounts({ id: "self", userId, name: "AKA" });
    const next = await getUniqueBankAccountName("AKA", userId, "self");
    expect(next).toBe("AKA");
  });
});

describe("splitBankAccountNameForDisplay", () => {
  it("splits AKA (01) into base and grey suffix", () => {
    const { base, suffix } = splitBankAccountNameForDisplay("AKA (01)");
    expect(base).toBe("AKA");
    expect(suffix).toBe(" (01)");
  });

  it("does not split AKA(1) (no space)", () => {
    const { base, suffix } = splitBankAccountNameForDisplay("AKA(1)");
    expect(base).toBe("AKA(1)");
    expect(suffix).toBeNull();
  });

  it("does not split AKA (1) (single-digit not our suffix)", () => {
    const { base, suffix } = splitBankAccountNameForDisplay("AKA (1)");
    expect(base).toBe("AKA (1)");
    expect(suffix).toBeNull();
  });

  it("trims trailing space before splitting app suffix", () => {
    const { base, suffix } = splitBankAccountNameForDisplay("AKA (01) ");
    expect(base).toBe("AKA");
    expect(suffix).toBe(" (01)");
  });
});
