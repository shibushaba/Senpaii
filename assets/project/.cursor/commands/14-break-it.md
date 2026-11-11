Test [FEATURE] like a skeptical real user and an integration tester.

Inspect the feature and existing tests. Build a risk-based test matrix covering relevant cases:
- Empty, malformed, boundary and very large inputs.
- Unauthorized, wrong-owner and cross-tenant access.
- Slow, failed or interrupted network/dependencies.
- Double submit, retries, duplicate webhooks and concurrent updates.
- Refresh, back navigation, partial completion and stale state.
- Time zones, locale, encoding and unusual characters where relevant.
- Mobile, accessibility and browser differences where relevant.

Run only safe tests in an appropriate environment. Never use production data or destructive production operations. Report expected vs actual results, severity, reproduction and regression tests. Ask before fixing failures outside the approved scope.
