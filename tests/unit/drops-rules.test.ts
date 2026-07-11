import { evaluateRule, type EvalContext } from "@/domain/drops-domain/drops-rules";
import { describe, expect, it } from "vitest";

const ctx = (requestBody: Record<string, unknown>, resultData: Record<string, unknown> = {}): EvalContext => ({
  requestBody,
  resultData,
});

describe("evaluateRule — amount", () => {
  it("matches equals and gte comparators", () => {
    expect(evaluateRule({ kind: "amount", equals: 222 }, ctx({ amount: 222 }))).toBe(true);
    expect(evaluateRule({ kind: "amount", equals: 222 }, ctx({ amount: 221 }))).toBe(false);
    expect(evaluateRule({ kind: "amount", gte: 100 }, ctx({ amount: 150 }))).toBe(true);
    expect(evaluateRule({ kind: "amount", gte: 100 }, ctx({ amount: 99 }))).toBe(false);
  });

  it("parses numeric strings", () => {
    expect(evaluateRule({ kind: "amount", equals: 222 }, ctx({ amount: "222" }))).toBe(true);
  });

  it("treats blank string amounts as absent (Number('') is 0, not NaN)", () => {
    expect(evaluateRule({ kind: "amount", gte: 0 }, ctx({ amount: "" }))).toBe(false);
    expect(evaluateRule({ kind: "amount", gte: 0 }, ctx({ amount: "   " }))).toBe(false);
    expect(evaluateRule({ kind: "amount", equals: 0 }, ctx({ amount: "" }))).toBe(false);
  });

  it("does not match when amount is missing or malformed", () => {
    expect(evaluateRule({ kind: "amount", gte: 1 }, ctx({}))).toBe(false);
    expect(evaluateRule({ kind: "amount", gte: 1 }, ctx({ amount: "abc" }))).toBe(false);
  });
});

describe("evaluateRule — bank_account_name", () => {
  const nameRule = (op: string, values: string[], caseSensitive?: boolean) => ({
    kind: "bank_account_name",
    op,
    values,
    ...(caseSensitive !== undefined ? { caseSensitive } : {}),
  });

  it("matches eq case-insensitively by default", () => {
    expect(evaluateRule(nameRule("eq", ["Emergency Fund"]), ctx({}, { name: "emergency fund" }))).toBe(true);
  });

  it("respects caseSensitive for eq", () => {
    expect(evaluateRule(nameRule("eq", ["Emergency Fund"], true), ctx({}, { name: "emergency fund" }))).toBe(false);
    expect(evaluateRule(nameRule("eq", ["Emergency Fund"], true), ctx({}, { name: "Emergency Fund" }))).toBe(true);
  });

  it("does not corrupt regex escape sequences when case-insensitive", () => {
    // Lowercasing the pattern would turn \D (non-digit) into \d (digit) and
    // this would stop matching.
    expect(evaluateRule(nameRule("regex", ["^\\D+$"], false), ctx({}, { name: "Savings" }))).toBe(true);
    expect(evaluateRule(nameRule("regex", ["^\\D+$"], false), ctx({}, { name: "12345" }))).toBe(false);
  });

  it("applies the i flag for case-insensitive regex", () => {
    expect(evaluateRule(nameRule("regex", ["^emergency"], false), ctx({}, { name: "EMERGENCY FUND" }))).toBe(true);
    expect(evaluateRule(nameRule("regex", ["^emergency"], true), ctx({}, { name: "EMERGENCY FUND" }))).toBe(false);
  });

  it("returns false for invalid patterns instead of throwing", () => {
    expect(evaluateRule(nameRule("regex", ["("]), ctx({}, { name: "anything" }))).toBe(false);
  });

  it("falls back to the request body name when result data has none", () => {
    expect(evaluateRule(nameRule("eq", ["Vault"]), ctx({ name: "Vault" }))).toBe(true);
  });
});

describe("evaluateRule — combinators", () => {
  it("all requires every child to match", () => {
    const rule = {
      kind: "all",
      of: [
        { kind: "amount", gte: 100 },
        { kind: "amount", equals: 150 },
      ],
    };
    expect(evaluateRule(rule, ctx({ amount: 150 }))).toBe(true);
    expect(evaluateRule(rule, ctx({ amount: 200 }))).toBe(false);
  });

  it("any requires at least one child to match", () => {
    const rule = {
      kind: "any",
      of: [
        { kind: "amount", equals: 1 },
        { kind: "amount", equals: 2 },
      ],
    };
    expect(evaluateRule(rule, ctx({ amount: 2 }))).toBe(true);
    expect(evaluateRule(rule, ctx({ amount: 3 }))).toBe(false);
  });

  it("rejects unknown rule kinds and malformed rules", () => {
    expect(evaluateRule({ kind: "unknown" }, ctx({ amount: 1 }))).toBe(false);
    expect(evaluateRule(null, ctx({}))).toBe(false);
    expect(evaluateRule("amount", ctx({}))).toBe(false);
  });
});
