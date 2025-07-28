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
        url: "https://github.com/your-repo/czechibank",
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
            id: { type: "string", example: "bFNcCQmAYJ2u4fODHT09QgLB7vkeSfhv", description: "Unique user identifier" },
            name: { type: "string", example: "John Doe", description: "User's full name" },
            email: { type: "string", example: "user@example.com", description: "User's email address" },
            emailVerified: { type: "boolean", example: false, description: "Whether the user's email is verified" },
            image: { type: ["string", "null"], example: null, description: "URL to user's profile image or null" },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-07-21T12:27:03.625Z",
              description: "When the user was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-07-21T12:27:03.625Z",
              description: "When the user was last updated",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              example: "user",
              description: "User's role (user or admin)",
            },
            banned: {
              type: ["boolean", "null"],
              example: null,
              description: "Whether the user is banned (null if not set)",
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
          },
          required: ["id", "name", "email", "emailVerified", "createdAt", "updatedAt", "role"],
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
            toBankNumber: { type: "string", example: "987654321/5555", description: "Recipient's bank account number" },
          },
          required: ["amount", "toBankNumber"],
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
                        example: "Amount must be positive",
                        description: "Detailed error message",
                      },
                    },
                  },
                  description: "Additional error details when available",
                },
              },
            },
          },
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
    ],
  },
  apis: ["./src/app/api/v1/**/*.ts", "./src/app/api/v1/**/*.tsx"],
};

export const swaggerSpec = swaggerJsdoc(options);
