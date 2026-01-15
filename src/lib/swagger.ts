import swaggerJsdoc from "swagger-jsdoc";
import { MIN_PASSWORD_LENGTH } from "../constants";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Czechibank API Documentation",
      version: "1.0.0",
      description: `API documentation for Czechibank - a learning application for Czechitas course.
      
This API demonstrates RESTful principles and common banking operations:
- User management (registration, authentication)
- Bank account operations (create, view)
- Transaction handling (create, list, view details)

All responses follow a consistent format:
\`\`\`json
{
  "success": true,
  "message": "Operation description",
  "data": { /* Operation-specific data */ }
}
\`\`\``,
      contact: {
        name: "API Support",
        url: "https://github.com/czechibank/czechibank",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local Development Server",
      },
      {
        url: "https://czechibank.ostrava.digital/api/v1",
        description: "Production Server",
      },
      {
        url: "https://ostrava.czechibank.ostrava.digital/api/v1",
        description: "OSTRAVA!!! Production Server",
      },
      {
        url: "https://praha.czechibank.ostrava.digital/api/v1",
        description: "Praha Production Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "Enter your API key",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "bYmjHnHasQisW4g6L2IPxwLHBQYwHsLU", description: "Unique user identifier" },
            name: { type: "string", example: "Jana Nováková", description: "User's full name" },
            email: { type: "string", example: "jana@example.com", description: "User's email address" },
            emailVerified: { type: "boolean", example: false, description: "Whether the user's email is verified" },
            image: { type: ["string", "null"], example: null, description: "URL to user's profile image or null" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-10T22:53:50.315Z",
              description: "When the user was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2026-01-10T22:53:50.315Z",
              description: "When the user was last updated",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
              description: "User's role (user or admin)",
            },
            banned: {
              type: "boolean",
              example: false,
              description: "Whether the user is banned",
            },
            banReason: {
              type: ["string", "null"],
              example: null,
              description: "Reason for ban if banned, otherwise null",
            },
            banExpires: {
              type: ["string", "null"],
              format: "date-time",
              example: null,
              description: "Ban expiration date if banned, otherwise null",
            },
            apiKey: {
              type: ["string", "null"],
              example: "YUNKOBkSooRIXDgSSwYZgjPcAhTzqfIcGLvvFiODAmfdgfyrxQPuCRGsaDEYulQi",
              description: "API key created for the user (only included in user creation response, null otherwise)",
            },
          },
          required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt", "role", "banned"],
        },
        UserCreate: {
          type: "object",
          properties: {
            name: { type: "string", example: "Jana Nováková", description: "User's full name" },
            email: { type: "string", example: "jana@example.com", description: "User's email address" },
            password: {
              type: "string",
              format: "password",
              example: "securepassword123",
              description: `User's password (min ${MIN_PASSWORD_LENGTH} characters)`,
            },
          },
          required: ["name", "email", "password"],
        },
        BankAccount: {
          type: "object",
          properties: {
            id: { type: "string", example: "acc_123", description: "Unique account identifier" },
            number: {
              type: "string",
              example: "123456789/5555",
              description: "Bank account number in format number/code",
            },
            balance: { type: "number", example: 1000.5, description: "Current balance" },
            currency: {
              type: "string",
              enum: ["CZECHITOKEN"],
              description: "Account currency (currently only CZECHITOKEN supported)",
            },
            name: { type: "string", example: "Main Account", description: "Account name" },
            userId: { type: "string", example: "usr_123", description: "Owner's user ID" },
          },
          required: ["id", "number", "balance", "currency", "userId"],
        },
        BankAccountCreate: {
          type: "object",
          properties: {
            currency: {
              type: "string",
              enum: ["CZECHITOKEN"],
              example: "CZECHITOKEN",
              description: "Account currency",
            },
          },
          required: ["currency"],
        },
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", example: "txn_123", description: "Unique transaction identifier" },
            amount: { type: "number", example: 100.5, description: "Transaction amount" },
            currency: { type: "string", enum: ["CZECHITOKEN"], description: "Transaction currency" },
            createdAt: { type: "string", format: "date-time", description: "When the transaction was created" },
            from: {
              type: "object",
              properties: {
                id: { type: "string", example: "acc_123", description: "Sender's account ID" },
                number: { type: "string", example: "123456789/5555", description: "Sender's account number" },
                user: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Jana Nováková", description: "Sender's name" },
                  },
                },
              },
            },
            to: {
              type: "object",
              properties: {
                id: { type: "string", example: "acc_456", description: "Recipient's account ID" },
                number: { type: "string", example: "987654321/5555", description: "Recipient's account number" },
                user: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Petr Novák", description: "Recipient's name" },
                  },
                },
              },
            },
          },
          required: ["id", "amount", "currency", "createdAt", "from", "to"],
        },
        TransactionCreate: {
          type: "object",
          properties: {
            amount: { type: "number", example: 100.5, minimum: 0.01, description: "Amount to send (must be positive)" },
            fromBankNumber: {
              type: "string",
              example: "1111222233334444/5555",
              description: "Sender's bank account number",
            },
            toBankNumber: {
              type: "string",
              example: "1111222233334444/5555",
              description: "Recipient's bank account number",
            },
          },
          required: ["amount", "fromBankNumber", "toBankNumber"],
        },
        ApiKey: {
          type: "object",
          properties: {
            id: { type: "string", example: "ak_123", description: "Unique API key identifier" },
            name: {
              type: ["string", "null"],
              example: "My API Key",
              description: "Human-readable name for the API key",
            },
            start: { type: ["string", "null"], example: "czb_", description: "Prefix of the API key" },
            prefix: { type: ["string", "null"], example: "czb_", description: "Prefix of the API key" },
            key: {
              type: "string",
              example: "czb_1234567890abcdef",
              description: "The actual (hashed) API key (only shown on creation)",
            },
            userId: { type: "string", example: "usr_123", description: "ID of the user who owns this API key" },
            refillInterval: {
              type: ["integer", "null"],
              example: 3600,
              description: "Rate limit refill interval in seconds",
            },
            refillAmount: {
              type: ["integer", "null"],
              example: 100,
              description: "Number of requests to refill per interval",
            },
            lastRefillAt: {
              type: ["string", "null"],
              format: "date-time",
              description: "When the rate limit was last refilled",
            },
            enabled: { type: ["boolean", "null"], example: true, description: "Whether the API key is enabled" },
            rateLimitEnabled: {
              type: ["boolean", "null"],
              example: true,
              description: "Whether rate limiting is enabled",
            },
            rateLimitTimeWindow: {
              type: ["integer", "null"],
              example: 3600,
              description: "Rate limit time window in seconds",
            },
            rateLimitMax: { type: ["integer", "null"], example: 100, description: "Maximum requests per time window" },
            requestCount: {
              type: ["integer", "null"],
              example: 45,
              description: "Current number of requests in the time window",
            },
            remaining: {
              type: ["integer", "null"],
              example: 55,
              description: "Remaining requests in the current time window",
            },
            lastRequest: {
              type: ["string", "null"],
              format: "date-time",
              description: "When the API key was last used",
            },
            expiresAt: { type: ["string", "null"], format: "date-time", description: "When the API key expires" },
            createdAt: { type: "string", format: "date-time", description: "When the API key was created" },
            updatedAt: { type: "string", format: "date-time", description: "When the API key was last updated" },
            permissions: {
              type: ["string", "null"],
              example: "read,write",
              description: "Comma-separated list of permissions",
            },
            metadata: { type: ["string", "null"], example: "{}", description: "Additional metadata as JSON string" },
          },
          required: ["id", "key", "userId", "createdAt", "updatedAt"],
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully" },
            data: { type: "object", description: "Operation-specific data" },
            meta: {
              type: "object",
              properties: {
                timestamp: { type: "string", format: "date-time", description: "Response timestamp" },
                requestId: { type: "string", description: "Unique request identifier for tracing" },
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer", description: "Current page number" },
                    limit: { type: "integer", description: "Items per page" },
                    total: { type: "integer", description: "Total number of items" },
                    totalPages: { type: "integer", description: "Total number of pages" },
                  },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Operation failed" },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                  description: "Error code for programmatic handling",
                },
                message: { type: "string", example: "Invalid input data", description: "Human-readable error message" },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      code: { type: "string", example: "INVALID_FIELD", description: "Specific error code" },
                      field: { type: "string", example: "amount", description: "Field that caused the error" },
                      message: {
                        type: "string",
                        example:
                          "Generic error message - details are not here, they are in the code 🤗 Use your imagination and creativity to figure out what went wrong! 🤩 And have fun!",
                        description: "More detailed error message",
                      },
                    },
                  },
                  description: "Additional error details when available",
                },
              },
            },
            meta: {
              type: "object",
              additionalProperties: false,
              properties: {
                timestamp: {
                  type: "string",
                  format: "date-time",
                  example: "2026-01-10T22:53:51.562Z",
                  description: "Response timestamp",
                },
              },
              required: ["timestamp"],
            },
          },
          required: ["success", "message", "error"],
        },
      },
    },
    security: [{ ApiKeyAuth: [] }],
    tags: [
      {
        name: "About",
        description: "API information and status",
      },
      {
        name: "Users",
        description: "User management operations",
      },
      {
        name: "Bank Accounts",
        description: "Bank account operations",
      },
      {
        name: "Transactions",
        description: "Money transfer operations",
      },
      {
        name: "API Keys",
        description: "API key management operations",
      },
    ],
  },
  apis: ["./src/app/api/v1/**/*.ts", "./src/app/api/v1/**/*.tsx"],
};

export const swaggerSpec = swaggerJsdoc(options);
