# ShieldAI Architecture

This document describes the system architecture, data flow, and design decisions behind ShieldAI.

---

## System Overview

ShieldAI is a multi-service application designed to detect prompt injection attacks in real-time. It consists of four main components:

1. **API Server** (Node.js + Express + TypeScript) — Core detection logic, REST endpoints, auth, rate limiting
2. **ML Sidecar** (Python + FastAPI) — Machine learning inference (classification + embeddings)
3. **PostgreSQL** — Persistent storage for customers, API keys, scan logs, rule versions
4. **Redis** — Caching (auth tokens), rate limiting (sliding window), and session state

---

## Request Flow

```
Client Request
       │
       ▼
┌──────────────┐
│  Middleware   │
│  Pipeline    │
│              │
│ 1. requestId │ ← Generate unique request ID
│ 2. auth      │ ← Validate Bearer token (Redis cache → DB fallback)
│ 3. rateLimit │ ← Sliding window check (Redis sorted sets)
│ 4. logging   │ ← Log request metadata (never raw input)
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│         Detection Pipeline            │
│                                       │
│  Step 1: Preprocessing (sync)         │
│  ├─ Unicode NFKC normalization        │
│  ├─ Confusable → Latin mapping        │
│  ├─ Encoding detection & decoding     │
│  ├─ Invisible character stripping     │
│  ├─ Whitespace normalization          │
│  └─ Leetspeak deobfuscation           │
│                                       │
│  Steps 2–5: Parallel Execution        │
│  ┌──────────────────────────────────┐ │
│  │ 2. Rule Engine                   │ │
│  │    200+ regex patterns, 8 cats   │ │
│  │    + structural pattern flags    │ │
│  ├──────────────────────────────────┤ │
│  │ 3. ML Classifier (HTTP → sidecar)│ │
│  │    DeBERTa 3-class prediction    │ │
│  │    + circuit breaker protection  │ │
│  ├──────────────────────────────────┤ │
│  │ 4. Entropy Analyzer             │ │
│  │    Shannon entropy + segments   │ │
│  │    Binary/hex/base64 detection  │ │
│  ├──────────────────────────────────┤ │
│  │ 5. Semantic Similarity          │ │
│  │    Cosine sim vs 100+ known     │ │
│  │    injection patterns via embed │ │
│  └──────────────────────────────────┘ │
│                                       │
│  Step 6: Score Fusion                 │
│  ├─ Rule veto (score > 0.9 → force)  │
│  ├─ Weighted average:                 │
│  │   Rules 15% | ML 50%              │
│  │   Entropy 15% | Semantic 20%      │
│  ├─ Null signal weight redistribution │
│  └─ Verdict: pass / flag / block      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────┐
│  Response + Logging   │
│  ├─ Return verdict    │
│  └─ Async DB log      │
│    (fire and forget)  │
└───────────────────────┘
```

---

## Component Details

### API Server (`api/`)

**Technology**: Node.js 20, TypeScript (strict mode), Express.js

**Key Design Decisions:**
- **TypeScript strict mode** — Catches type errors at compile time
- **Zod validation** — Runtime type checking for all external inputs
- **Pino logging** — Structured JSON logs for production observability
- **express-async-errors** — Automatic async error propagation without try/catch
- **Fire-and-forget DB writes** — Scan logs are written asynchronously to avoid latency impact

**Directory Structure:**
```
api/src/
├── config/          # Environment validation, Redis client, Logger
├── middleware/       # Auth, rate limiting, error handling, request logging
├── routes/v1/       # REST endpoint handlers
├── services/        # Core detection pipeline logic
├── types/           # TypeScript interfaces
└── utils/           # Crypto, encoding, leetspeak, unicode helpers
```

### ML Sidecar (`ml-service/`)

**Technology**: Python 3.11, FastAPI, Transformers, Sentence-Transformers

**Endpoints:**
- `POST /classify` — Text classification (SAFE / AMBIGUOUS / INJECTION)
- `POST /embed` — Text embedding (384-dimensional vectors)
- `GET /health` — Service health and model status
- `GET /metrics` — Prometheus metrics

**Design Decisions:**
- **Separate service** — Isolates Python/ML dependencies from Node.js
- **Circuit breaker** — API client protects against ML service failures
- **Heuristic fallback** — MVP uses pattern-based classification; production uses fine-tuned DeBERTa
- **Batched embeddings** — Processes multiple texts in a single request for efficiency

### Database (`PostgreSQL 16`)

**Schema (4 tables):**

| Table | Purpose |
|-------|---------|
| `Customer` | Customer accounts with email, tier, active status |
| `ApiKey` | API keys (hash stored, not plaintext) with tier and usage tracking |
| `ScanLog` | Scan results with all signal scores, indexed for efficient querying |
| `RuleVersion` | Versioned rule definitions for audit trail |

**Indexing Strategy:**
- `ScanLog(customerId, createdAt)` — Customer-scoped time queries
- `ScanLog(verdict, createdAt)` — Verdict filtering
- `ScanLog(createdAt)` — Time-range queries
- `ApiKey(keyHash)` — Fast key lookup (unique)

### Redis 7

**Usage:**
- **Auth cache** — Caches API key → customer mapping (configurable TTL)
- **Rate limiting** — Sliding window via sorted sets per customer
- **Reconnection** — Automatic reconnect with exponential backoff

---

## Security Architecture

### API Key Management
- Keys generated with `sk-shield-` prefix + 40 hex characters (crypto.randomBytes)
- Only SHA-256 hash stored in database; plaintext never persisted
- Key prefix stored for identification without revealing full key
- Keys can be revoked (soft delete via `isActive` flag)

### Rate Limiting
- Sliding window algorithm using Redis sorted sets
- Per-minute and per-day limits based on customer tier
- **Fails open** if Redis is unavailable (availability over security in this case)
- Rate limit headers included in all responses

### Input Handling
- Raw input is **never logged** (only hashed)
- Input validated via Zod schema before processing
- Maximum input length enforced (50,000 characters)
- Request IDs generated for traceability

---

## Graceful Degradation

The system is designed to continue operating even when components fail:

| Component | Failure Mode | Behavior |
|-----------|-------------|----------|
| ML Sidecar | Down / timeout | Skip ML score, redistribute weight to other signals |
| Semantic Similarity | Embed fails | Skip semantic score, redistribute weight |
| Redis | Connection lost | Rate limiting disabled (fail open), auth falls through to DB |
| Database | Write fails | Scan log write skipped (fire and forget), detection still works |
| Rule Engine | Parse error | Gracefully skip malformed rules, log warning |

---

## Performance Targets

| Metric | Target | Achieved By |
|--------|--------|-------------|
| P50 latency | < 100ms | Parallel signal computation |
| P99 latency | < 200ms | Circuit breaker on ML, timeouts |
| Throughput | 1000+ req/s | Stateless API, Redis caching |
| Availability | 99.9% | Graceful degradation, health checks |
| Memory (API) | < 512 MB | Efficient regex caching, streaming |
| Memory (ML) | < 2 GB | Model loading, batch inference |

---

## Future Architecture (Phase 2+)

- **Message queue** (BullMQ / RabbitMQ) for async batch processing
- **Webhook delivery** for real-time alerts
- **Multi-tenant isolation** with row-level security
- **Model fine-tuning pipeline** with customer-specific training data
- **Edge deployment** with ONNX Runtime for reduced latency
- **A/B testing framework** for rule and model evaluation
