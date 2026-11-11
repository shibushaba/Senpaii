Capture acceptance feedback so a missed behavior becomes a regression check instead of a surprise.

1. Record the scenario, the role of the person who tried it, the expected behavior, and the actual behavior.
2. Mark the result `pass` or `fail`. Quote the user's words where they matter, and strip personal data.
3. For a failure, name the smallest regression test or manual check that should exist before the next release.
4. Write `.cdk/uat/UAT-YYYYMMDD-NNN.md` from `.cdk/templates/uat.md`.
5. If the failure reveals a reusable product or engineering gap, also file a proposed lesson. Keep it proposed until the fix is verified.
6. If the same scenario already exists, add the new result to that record instead of creating a near-duplicate.
7. Do not change production data, and do not claim the scenario passed unless someone observed it.
8. Close with the UAT id, the pass/fail, and the test that still needs to be written.
