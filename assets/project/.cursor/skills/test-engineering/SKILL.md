---
name: test-engineering
description: Design and implement meaningful automated tests.
---


# Test Engineering

## Procedure
1. Inspect test framework, fixtures, factories, conventions and CI commands.
2. Translate acceptance criteria into observable behavior.
3. Choose appropriate layers: unit, integration, contract, E2E, security or performance.
4. Cover success, invalid input, boundaries, permissions, failure, retry and concurrency where relevant.
5. Prefer deterministic tests; control clocks, randomness and external dependencies.
6. Test public behavior and contracts rather than private implementation details.
7. Avoid excessive mocking that removes the behavior being tested.
8. Run the smallest target, then related suite.
9. Diagnose failures; do not weaken assertions just to pass.
10. Check that regression tests fail for the original defect when feasible.

## Deliverable
Coverage map, test files, exact commands/results, gaps and recommended CI additions.
