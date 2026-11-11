---
name: systematic-debugging
description: Diagnose failures through evidence and hypothesis testing.
---


# Systematic Debugging

## Procedure
1. Capture exact expected and observed behavior, reproduction, environment and full error.
2. Reproduce safely or state why reproduction is unavailable.
3. Trace the failing path from entry point to first incorrect state.
4. Inspect logs, stack traces, relevant code, recent diffs and tests.
5. Form multiple hypotheses and rank by evidence and test cost.
6. Design the smallest diagnostic that distinguishes hypotheses.
7. Change one causal variable at a time.
8. Fix root cause and add a regression test where practical.
9. Remove temporary logs and instrumentation.
10. Re-run targeted and relevant broader checks.

## Guardrails
Do not shotgun-edit, suppress errors, weaken tests or repeat failed fixes without new evidence. Redact secrets and personal data from logs.

## Deliverable
Reproduction, evidence, root cause or remaining hypotheses, fix, regression coverage, checks and unresolved uncertainty.
