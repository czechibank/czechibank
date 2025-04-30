import { describe, expect, it } from "vitest";
import { ApiTransactionCreateSchema } from "../../src/domain/transaction-domain/transation-schema";

// Helper for schema parsing
function safeParse(schema: any, data: any) {
  const result = schema.safeParse(data);
  return result;
}

describe("ApiTransactionCreateSchema", () => {
  describe("valid cases", () => {
    it("accepts amount as a number", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: 1.5,
        toBankNumber: "555555555555/5555",
      });
      if (!result.success) {
        // Log error for debugging
        // eslint-disable-next-line no-console
        console.error("Error for amount as a number:", result.error);
      }
      expect(result.success).toBe(true);
    });

    it("accepts amount as a valid string number", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: "2.3",
        toBankNumber: "555555555555/5555",
      });
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error("Error for amount as a valid string number:", result.error);
      }
      expect(result.success).toBe(true);
    });

    it("accepts amount as a valid scientific notation string", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: "1e3",
        toBankNumber: "555555555555/5555",
      });
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.error("Error for amount as a valid scientific notation string:", result.error);
      }
      expect(result.success).toBe(true);
    });
  });

  describe("invalid cases", () => {
    it("rejects amount as an invalid string with letters", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: "1mama123",
        toBankNumber: "555555555555/5555",
      });
      expect(result.success).toBe(false);
    });

    it("rejects amount as an empty string", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: "",
        toBankNumber: "555555555555/5555",
      });
      expect(result.success).toBe(false);
    });

    it("rejects amount as zero", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: 0,
        toBankNumber: "555555555555/5555",
      });
      expect(result.success).toBe(false);
    });

    it("rejects amount as negative", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: -1,
        toBankNumber: "555555555555/5555",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing amount", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        toBankNumber: "555555555555/5555",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing toBankNumber", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: 1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid toBankNumber format", () => {
      const result = safeParse(ApiTransactionCreateSchema, {
        amount: 1,
        toBankNumber: "555555555555/1234",
      });
      expect(result.success).toBe(false);
    });
  });
});
