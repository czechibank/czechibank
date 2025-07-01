# Czechibank API Documentation

Welcome to the Czechibank API documentation! This guide will help you understand how to use our API effectively.

## Getting Started

The Czechibank API is a RESTful API that allows you to:

- Create and manage user accounts
- Create and view bank accounts
- Make transactions between accounts

### Base URL

- Local development: `http://localhost:3000/api/v1`
- Production: `https://czechibank.ostrava.digital/api/v1`

### Authentication

All API endpoints (except user creation) require authentication using an API key:

```bash
curl -H "X-API-Key: your_api_key" https://localhost:3000/v1/user
```

## Common Patterns

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Operation-specific data
  },
  "meta": {
    "timestamp": "2024-03-20T12:34:56Z",
    "requestId": "req_123",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### Error Handling

Errors follow a consistent format:

```json
{
  "success": false,
  "message": "Operation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "code": "INVALID_FIELD",
        "field": "amount",
        "message": "Amount must be positive"
      }
    ]
  }
}
```

## Common Use Cases

### 1. User Registration and Authentication

1. Create a new user:

```bash
curl -X POST http://localhost:3000/api/v1/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jana Nováková",
    "email": "jana@example.com",
    "password": "securepassword123"
  }'
```

2. Get user profile (requires authentication):

```bash
curl http://localhost:3000/api/v1/user \
  -H "X-API-Key: your_api_key"
```

### 2. Bank Account Management

1. Create a new bank account:

```bash
curl -X POST http://localhost:3000/api/v1/bank-account/create \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "CZECHITOKEN"
  }'
```

2. List all bank accounts:

```bash
curl http://localhost:3000/api/v1/bank-account/get-all \
  -H "X-API-Key: your_api_key"
```

### 3. Transaction Operations

1. Create a new transaction:

```bash
curl -X POST http://localhost:3000/api/v1/transactions/create \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50,
    "toBankNumber": "987654321/5555"
  }'
```

2. List transactions with sorting and pagination:

```bash
curl "http://localhost:3000/api/v1/transactions?page=1&limit=10&sortBy=createdAt&sortOrder=desc" \
  -H "X-API-Key: your_api_key"
```

3. Get transaction details:

```bash
curl http://localhost:3000/api/v1/transactions/txn_123 \
  -H "X-API-Key: your_api_key"
```

## Best Practices

1. **Error Handling**

   - Always check the `success` field in responses
   - Handle HTTP status codes appropriately
   - Check error details for field-specific validation errors

2. **Pagination**

   - Use pagination for listing endpoints to manage response size
   - Default page size is 10 items
   - Maximum page size is 100 items

3. **Rate Limiting**

   - Implement exponential backoff for retries
   - Cache frequently accessed data
   - Respect rate limits when implemented

4. **Security**
   - Never share your API key
   - Use HTTPS in production
   - Validate input data before sending

## API Versioning

The API uses URL versioning (v1). Breaking changes will be introduced in new versions while maintaining backward compatibility in the current version.

## Interactive Documentation

Visit `/api/v1/docs` for interactive Swagger documentation where you can:

- Explore available endpoints
- Test API calls directly
- View request/response schemas
- Read detailed descriptions

## Need Help?

- Check the [GitHub repository](https://github.com/your-repo/czechibank) for updates
- Open an issue for bug reports
- Contact support for assistance
