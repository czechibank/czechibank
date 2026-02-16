import { describe, expect, it } from "vitest";

describe("Transactions API", () => {
  describe("GET /api/v1/transactions", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions");
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 401 when invalid API key is provided", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions", {
        headers: {
          "X-API-Key": "invalid-token",
        },
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return transactions with valid API key", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions", {
        headers: {
          "X-API-Key": "33", // Vojta's account with 100 transactions
        },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.transactions)).toBe(true);
      expect(data.meta.pagination).toBeDefined();
    });

    describe("Pagination", () => {
      it("should return first page with default limit (10)", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.transactions).toHaveLength(10);
        expect(data.meta.pagination).toEqual(
          expect.objectContaining({
            page: 1,
            limit: 10,
          }),
        );
      });

      it("should return second page with 10 items", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions?page=2", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.transactions).toHaveLength(10);
        expect(data.meta.pagination).toEqual(
          expect.objectContaining({
            page: 2,
            limit: 10,
          }),
        );
      });

      it("should return 400 for invalid pagination parameters", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions?page=0&limit=0", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.details[0].message).toBe("Page and limit must be positive numbers");
      });

      it("should return empty array for page beyond total pages", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions?page=921", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.data.transactions).toHaveLength(0);
        expect(data.meta.pagination).toEqual(
          expect.objectContaining({
            page: 921,
            limit: 10,
          }),
        );
      });
    });

    describe("Sorting", () => {
      it("should sort by createdAt in descending order by default", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        const transactions = data.data.transactions;
        const firstDate = new Date(transactions[0].createdAt);
        const lastDate = new Date(transactions[transactions.length - 1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThan(lastDate.getTime());
      });

      it("should sort by amount in ascending order", async () => {
        const response = await fetch("http://localhost:3000/api/v1/transactions?sortBy=amount&sortOrder=asc", {
          headers: {
            "X-API-Key": "33",
          },
        });
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        const transactions = data.data.transactions;
        expect(transactions[0].amount).toBeLessThan(transactions[transactions.length - 1].amount);
      });
    });
  });

  describe("GET /api/v1/transactions/[id]", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/123");
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 404 for non-existent transaction", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/non-existent-id", {
        headers: {
          "X-API-Key": "33",
        },
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Transaction not found");
    });

    it("should return transaction details for valid ID", async () => {
      // First get a list of transactions to get a valid ID
      const listResponse = await fetch("http://localhost:3000/api/v1/transactions", {
        headers: {
          "X-API-Key": "33",
        },
      });
      const listData = await listResponse.json();
      const transactionId = listData.data.transactions[0].id;

      // Then get the details for that transaction
      const response = await fetch(`http://localhost:3000/api/v1/transactions/${transactionId}`, {
        headers: {
          "X-API-Key": "33",
        },
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.transaction.id).toBe(transactionId);
    });
  });

  describe("POST /api/v1/transactions/create", () => {
    it("should return 401 when no API key is provided", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 100,
          toBankNumber: "1234567890/1234",
        }),
      });
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({}),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.details[0].message).toBe("Required");
    });

    it("should return 400 for invalid amount", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: -1,
          toBankNumber: "000000000001/5555",
        }),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.details[0].message).toBe("Amount should be positive, this incident was reported. Nice day!");
    });

    it("should return 404 for non-existent recipient bank account", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: 100,
          toBankNumber: "123456789012/5555", // Exactly 17 characters
        }),
      });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Bank account not found");
    });

    it("should return 400 for amount greater than Number.MAX_SAFE_INTEGER", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: Number.MAX_SAFE_INTEGER + 1,
          toBankNumber: "000000000002/5555",
        }),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.details[0].message).toMatch(
        /Amount must be less than or equal to 9007199254740991 due security reasons./,
      );
    });

    it("should return 400 for scientific notation 1e3", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: 1e3,
          toBankNumber: "000000000002/5555",
          fromBankNumber: "000000000055/5555",
        }),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Amount must be a standard decimal number, scientific notation is not allowed");
    });

    it("should return 400 for scientific notation 1.5E-2", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: 1.5e-2,
          toBankNumber: "000000000002/5555",
          fromBankNumber: "000000000055/5555",
        }),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Amount must be a standard decimal number, scientific notation is not allowed");
    });

    it("should return 400 for scientific notation 5e2", async () => {
      const response = await fetch("http://localhost:3000/api/v1/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": "55",
        },
        body: JSON.stringify({
          amount: 5e2,
          toBankNumber: "000000000002/5555",
          fromBankNumber: "000000000055/5555",
        }),
      });
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Amount must be a standard decimal number, scientific notation is not allowed");
    });
  });
});
