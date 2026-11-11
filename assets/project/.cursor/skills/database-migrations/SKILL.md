---
name: database-migrations
description: Review database design, query behavior and safe schema/data migrations.
---


# Database and Migration Engineering

## Procedure
1. Inspect schema, ORM, migration history, constraints and query patterns.
2. Identify data ownership, tenant boundaries and sensitive fields.
3. Evaluate keys, nullability, uniqueness, foreign keys, indexes and transaction needs.
4. Inspect query plans or representative access patterns where possible.
5. For migrations, evaluate table size, locks, downtime, backfill and deployment compatibility.
6. Prefer additive expand-and-contract changes for systems requiring rolling deploys.
7. Make backfills bounded, observable and restartable where appropriate.
8. Define validation, rollback or forward-fix and backup/restore strategy.
9. Add tests for constraints, repository behavior and migration correctness.
10. Never execute destructive or production migrations without explicit approval.

## Deliverable
Schema/query review, migration sequence, risks, operational plan, tests and approval points.
