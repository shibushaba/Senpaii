---
name: feature-development
description: Implement a feature in small, approved and verifiable steps.
---


# Feature Development

## Procedure
1. Read acceptance criteria and inspect the repository.
2. Confirm scope, constraints, affected modules and current Git status.
3. Identify contracts, data model, authorization and integration impacts.
4. Write a concise implementation plan and wait for approval when substantial or risky.
5. Implement one coherent step at a time.
6. Follow local patterns; avoid unrelated refactors.
7. Add/update tests alongside behavior changes.
8. Run targeted checks after each step.
9. Inspect final diff for accidental changes, secrets, debug code and unrelated edits.
10. Update docs/config examples if behavior or setup changed.

## Guardrails
Ask before destructive changes, production operations, major dependency changes or security-sensitive behavior changes. Never claim unrun checks passed.

## Deliverable
Outcome, design summary, files changed, tests/checks and results, manual steps, known risks and next action.
