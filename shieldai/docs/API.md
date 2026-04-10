# ShieldAI API Reference

Base URL: `http://localhost:3000` (development) or your production domain.

All endpoints require authentication via Bearer token unless noted otherwise.

---

## Authentication

Include your API key in the `Authorization` header:

```
Authorization: Bearer sk-shield-<your-key>
```

---

## Endpoints

### POST /v1/detect

Analyze a text input for prompt injection attacks.

**Request Body:**

```json
{
  "input": "string (required, 1-50000 chars)",
  "metadata": {
    "source": "string (optional)",
    "session_id": "string (optional)",
    "user_id": "string (optional)"
  }
}
```

**Response 200:**

```json
{
  "request_id": "req_abc123def456",
  "verdict": "pass | flag | block",
  "risk_score": 0.94,
  "explanation": "Human-readable explanation of the verdict.",
  "signals": {
    "rule_score": 0.88,
    "ml_score": 0.96,
    "entropy_score": 0.12,
    "semantic_score": 0.82
  },
  "matched_rules": ["DI001", "DI003"],
  "processing_time_ms": 47
}
```

**Verdicts:**

| Verdict | Risk Score Range | Meaning |
|---------|-----------------|---------|
| `pass` | 0.0 – 0.49 | Input appears safe |
| `flag` | 0.50 – 0.79 | Suspicious, review recommended |
| `block` | 0.80 – 1.00 | High-confidence injection, block recommended |

**Error Responses:**

- `400` — Invalid request body (missing or empty input)
- `401` — Missing or invalid API key
- `429` — Rate limit exceeded
- `500` — Internal server error

---

### GET /v1/health

Health check endpoint. **No authentication required.**

**Response 200:**

```json
{
  "status": "healthy | degraded | unhealthy",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": "ok | error",
    "redis": "ok | error",
    "ml_service": "ok | error"
  }
}
```

---

### GET /v1/api-keys

List all API keys for the authenticated customer.

**Response 200:**

```json
{
  "keys": [
    {
      "id": "uuid",
      "prefix": "sk-shield-ab12",
      "name": "Production Key",
      "tier": "free",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "last_used_at": "2024-01-15T12:30:00.000Z"
    }
  ]
}
```

---

### POST /v1/api-keys

Create a new API key.

**Request Body:**

```json
{
  "name": "string (required, 1-100 chars)"
}
```

**Response 201:**

```json
{
  "id": "uuid",
  "key": "sk-shield-<full-key>",
  "prefix": "sk-shield-ab12",
  "name": "My New Key",
  "tier": "free",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

> **⚠️ Important:** The full API key is only returned once at creation time. Store it securely.

---

### DELETE /v1/api-keys/:id

Revoke (deactivate) an API key.

**Response 200:**

```json
{
  "message": "API key revoked successfully"
}
```

**Error Responses:**

- `404` — API key not found or doesn't belong to customer

---

### GET /v1/logs

Query scan logs with filtering and pagination.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 50 | Results per page (max 100) |
| `verdict` | string | — | Filter by verdict: `pass`, `flag`, `block` |
| `start_date` | ISO 8601 | — | Filter logs after this date |
| `end_date` | ISO 8601 | — | Filter logs before this date |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "input_hash": "sha256-hash",
      "verdict": "block",
      "risk_score": 0.94,
      "rule_score": 0.88,
      "ml_score": 0.96,
      "entropy_score": 0.12,
      "semantic_score": 0.82,
      "matched_rules": ["DI001", "DI003"],
      "processing_time_ms": 47,
      "created_at": "2024-01-15T12:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "total_pages": 25
  }
}
```

---

### GET /v1/stats

Get aggregate detection statistics.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `24h` | Time period: `1h`, `24h`, `7d`, `30d` |

**Response 200:**

```json
{
  "total_scans": 15234,
  "verdicts": {
    "pass": 12000,
    "flag": 2500,
    "block": 734
  },
  "avg_risk_score": 0.23,
  "avg_processing_time_ms": 42,
  "period": "24h"
}
```

---

### POST /v1/rules/reload

Hot-reload rules from YAML files without restarting the server.

**Response 200:**

```json
{
  "message": "Rules reloaded successfully",
  "rule_count": 201,
  "categories": 8
}
```

---

## Rate Limits

| Tier | Per Minute | Per Day |
|------|-----------|---------|
| Free | 100 | 1,000 |
| Starter | 500 | 10,000 |
| Growth | 1,000 | Unlimited |
| Enterprise | Custom | Custom |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

When rate limited, you receive a `429 Too Many Requests` response with a `Retry-After` header.

---

## Error Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "request_id": "req_abc123"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## OpenAPI / Swagger

Interactive API documentation is available at:

- **Swagger UI**: `GET /docs`
- **OpenAPI JSON**: `GET /openapi.json`
