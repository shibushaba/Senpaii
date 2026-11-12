---
name: release-readiness
description: Prepare a safe, evidence-based release assessment.
---


# Release Readiness

## Procedure
1. Confirm release scope, target environment and release owner.
2. Inspect diff, CI, build, tests, configuration and dependency changes.
3. Validate migration order, compatibility, backfill, backups and rollback/forward-fix.
4. Check authentication, authorization, secrets and data privacy.
5. Check health checks, logs, metrics, alerts and operational runbooks.
6. Check queues, cron jobs, webhooks, external API quotas and retry behavior.
7. Define staged rollout, feature flags and stop/rollback conditions.
8. Prepare release notes and support communication.
9. Produce go/no-go with blockers and evidence.

## Guardrails
Do not deploy, push, publish, alter production data or change production settings without explicit authorization.

## Deliverable
Go/no-go, checklist status, exact verification evidence, blockers, warnings, rollback plan and approval required.
