Verify the implementation of [CHANGE / FEATURE] against its acceptance criteria.

Inspect the diff and repository scripts. Create a checklist mapping each criterion to evidence. Run the narrowest relevant tests first, then typecheck/lint/build/integration checks as warranted. Inspect exit codes and failures.

Also check:
- Error and edge-case behavior.
- Authorization and data boundaries.
- Regression risk.
- Migration/configuration impact.
- Accessibility/performance where relevant.

Do not silently fix unrelated failures. Report PASS / FAIL / NOT RUN for each check, exact commands, evidence, remaining risks and whether the change is ready for review. Do not claim complete verification if any critical check is missing.
