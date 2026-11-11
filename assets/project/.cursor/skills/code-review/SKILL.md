---
name: code-review
description: Review code changes for correctness, security and maintainability.
---


# Code Review

## Procedure
1. Inspect branch, status and complete diff; preserve unrelated work.
2. Read surrounding code and relevant contracts/tests.
3. Prioritize correctness, security, data integrity and reliability.
4. Check edge cases, errors, concurrency, performance and compatibility.
5. Check test quality and missing regression cases.
6. Check maintainability, coupling and unnecessary complexity.
7. Identify accidental changes, debug artifacts and secrets.
8. Report actionable findings with file/line evidence.

## Finding format
Severity | Location | Problem | Impact | Recommended fix | Confidence

## Guardrails
Do not edit code during review unless explicitly asked. Do not report style preferences as defects. State review scope and limitations.
