import { describe, expect, it } from "vitest";
import { roundAmount } from "../../src/lib/utils";

describe("roundAmount", () => {
  it("should round to 3 decimal places correctly", () => {
    expect(roundAmount(0.11199999999999, 3)).toBe(0.112);
    expect(roundAmount(0.5555555, 3)).toBe(0.556);
    expect(roundAmount(1.005, 3)).toBe(1.005);
    expect(roundAmount(1.0049, 3)).toBe(1.005);
    expect(roundAmount(1.0044, 3)).toBe(1.004);
    expect(roundAmount(123.456789, 3)).toBe(123.457);
    expect(roundAmount(0.0004, 3)).toBe(0);
    expect(roundAmount(0.0005, 3)).toBe(0.001);
    expect(roundAmount(-0.11199999999999, 3)).toBe(-0.112);
  });

  it("should default to 3 decimals if not specified", () => {
    expect(roundAmount(0.12345)).toBe(0.123);
  });

  it("should handle zero and negative numbers", () => {
    expect(roundAmount(0, 3)).toBe(0);
    expect(roundAmount(-1.23456, 3)).toBe(-1.235);
  });
});
