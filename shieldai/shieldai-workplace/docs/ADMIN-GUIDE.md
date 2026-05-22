# ShieldAI Workplace — Admin Guide

## Overview
ShieldAI Workplace monitors AI bot interactions in Microsoft Teams and Slack, scanning messages for PII exposure, harmful content, and prompt injection attacks.

## Architecture
```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Teams Bot   │────▶│  Express Server  │────▶│ ShieldAI API │
│  (botbuilder)│     │  (Unified Core)  │     │  (ML Engine)  │
└─────────────┘     │                  │     └──────────────┘
                    │  ┌────────────┐  │
┌─────────────┐     │  │ PII Scanner│  │     ┌──────────────┐
│  Slack App   │────▶│  │ (Local)    │  │────▶│  PostgreSQL  │
│  (@slack/bolt)│    │  └────────────┘  │     └──────────────┘
└─────────────┘     │  ┌────────────┐  │
                    │  │  Policy     │  │
                    │  │  Engine     │  │
                    │  └────────────┘  │
                    └──────────────────┘
```

## Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/stats` | GET | Scan statistics |
| `/admin/scan-logs` | GET | Paginated audit logs |
| `/admin/pii-report` | GET | PII detections summary |
| `/admin/compliance` | GET | DPDP compliance status |
| `/admin/policies` | GET/PUT | Read or update policy YAML |
| `/admin/bots` | GET/POST | Manage bot configurations |
| `/health` | GET | Service health check |

## Policy Configuration
Policies are YAML files in the `policies/` directory:
- `default.yaml` — Standard protection
- `strict.yaml` — Regulated industries
- `bfsi.yaml` — Banking/Financial services (RBI compliant)

## DPDP Compliance
- User IDs are hashed (SHA-256) before logging
- PII values are masked in all logs
- Data processed within India
- Configurable retention periods
- Downloadable audit reports

## Monitoring
- Health check: `GET /health`
- Logs: Structured JSON via pino logger
- Metrics: Scan volume, block rate, latency (via admin API)
