Add tests for [BEHAVIOR / BUG].

Inspect existing test patterns and implementation first. Identify the behavior contract. Prefer focused tests that fail before the fix and pass after it. Cover the main path and meaningful edge cases without asserting implementation details unnecessarily.

Do not weaken existing tests, mock away the behavior under test, or change production code unless required and approved. Run the narrow test target and report exact results.
