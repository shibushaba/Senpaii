---
name: api-integration
description: Build robust APIs, webhooks and third-party integrations.
---


# API and Integration Engineering

## Procedure
1. Inspect existing route, schema, auth, error and versioning conventions.
2. Define contract: method, path, payload, response, status codes and validation.
3. Enforce server-side authentication and resource-level authorization.
4. Consider pagination, filtering, rate limits, idempotency and compatibility.
5. For outbound calls, use timeouts, bounded retries/backoff and explicit error mapping.
6. Retry only when safe; use idempotency keys or deduplication for side effects.
7. For webhooks, validate signatures, timestamps/replay protection and duplicate delivery.
8. Keep credentials server-side and redact sensitive logs.
9. Add contract/integration tests with controlled external dependencies.
10. Document quotas, failure modes and degraded behavior.

## Deliverable
Contract, implementation summary, security considerations, tests and operational notes.
