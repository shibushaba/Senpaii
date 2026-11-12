---
name: security-review
description: Perform a scoped security assessment and propose remediations.
---


# Security Review

## Scope
A first-pass review, not a formal penetration test or certification.

## Procedure
1. Map assets, trust boundaries, users, roles and sensitive data.
2. Review authentication, session handling and server-side authorization.
3. Test object-level authorization and tenant isolation conceptually and through safe tests.
4. Inspect input validation, injection, output encoding and unsafe deserialization.
5. Review secrets, cryptography, dependency/configuration risks and logging.
6. Review file uploads, webhooks, redirects, CORS/CSRF and rate limits where relevant.
7. Consider abuse cases, resource exhaustion and business-logic flaws.
8. Rank findings by severity, likelihood and evidence.
9. Recommend minimal remediations and regression tests.
10. Reassess after fixes.

## Guardrails
Do not expose secret values. Do not run destructive tests or attack systems without authorization. Do not claim the application is secure based on this review.

## Deliverable
Scope, threat assumptions, findings with evidence/severity/impact/remediation, untested areas and recommended next steps.
