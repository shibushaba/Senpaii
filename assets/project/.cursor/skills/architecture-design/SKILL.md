---
name: architecture-design
description: Design a proportionate architecture for a feature or system.
---


# Architecture Design

## Procedure
1. Inspect the current repository and architecture before proposing a design.
2. Establish constraints: users, workload, latency, availability, security, budget, team skills and deployment environment.
3. Define component responsibilities and boundaries.
4. Trace data/control flow and trust boundaries.
5. Specify API, event and persistence contracts.
6. Consider consistency, transactions, concurrency, idempotency and failure recovery.
7. Address authentication, authorization, tenant isolation and sensitive data.
8. Address logging, metrics, tracing, alerts and operational ownership.
9. Compare alternatives only where trade-offs are material.
10. Plan implementation sequence, tests, migration and rollback.

## Guardrails
Prefer the simplest design that meets real requirements. Avoid adding services, queues, caches or abstractions without a demonstrated need. Do not treat a technology profile as a mandate.

## Deliverable
Architecture decision summary, component/data-flow diagram if useful, interfaces, trade-offs, risks, phased plan and decisions requiring approval.
