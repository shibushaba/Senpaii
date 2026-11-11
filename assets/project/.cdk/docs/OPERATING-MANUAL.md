# Operating Manual

## Starting a new project

1. `/01-grill` — interview the user about the idea, one question at a time.
2. `/04-mvp` — identify the smallest useful release and explicit non-goals.
3. `/16-architecture` — propose system boundaries, data flow, technology choices and trade-offs.
4. `/03-plan` — create a file-by-file implementation plan with acceptance criteria.
5. Obtain user approval before substantial code generation.
6. Implement one coherent step at a time.
7. `/30-verify` after each meaningful milestone.
8. `/13-security` and `/15-senior-review` before launch.

## Opening an unfamiliar repository

1. `/02-read-first`
2. Use the `project-discovery` skill when the repository map is still unclear.
3. `/16-architecture` if system boundaries are unclear.
4. Record confirmed conventions in the repository's own documentation only after user approval or when clearly requested.

## Implementing a feature

1. State the observed current behavior and requested behavior.
2. Define acceptance criteria and edge cases.
3. Identify affected files, interfaces, data and dependencies.
4. Plan the smallest safe implementation.
5. Implement only the approved scope.
6. Run targeted tests, then broader checks proportional to risk.
7. Inspect the final diff for accidental changes.
8. Report results and unresolved risks.

## Debugging

1. Reproduce the failure or identify the exact failing path.
2. Capture the full error, logs, environment and expected behavior.
3. Trace the data/control flow.
4. Form a ranked list of hypotheses.
5. Test the most likely hypothesis with the smallest diagnostic.
6. Fix the root cause, not merely the visible symptom.
7. Add a regression test where practical.
8. Remove temporary diagnostics and verify again.

## Before merging or releasing

- `/30-verify`
- `/13-security`
- `/14-break-it`
- `/15-senior-review`
- `/27-release-check`
- Review `git diff`, migrations, configuration and rollback plan.
- Obtain explicit user approval for commit, push, deployment or production data changes.

## Completion report format

Every substantial task should end with:
- **Outcome:** completed / partially completed / blocked.
- **Summary:** what changed and why.
- **Files:** files changed and purpose.
- **Verification:** exact checks run and their outcomes.
- **Not verified:** checks not run and why.
- **Risks:** known issues, assumptions and follow-up work.
- **Manual actions:** anything the user must do.

## Learning during the work

Before a non-trivial change, search this project's `.cdk/` memory and any approved global lessons the project has enabled. If a verified lesson suggests a safer approach, say so before editing and cite its id. Proposed lessons are advisory.

After a fix, a failed attempt, a review, or a release, capture what happened:

- `/35-learn-error` for a failure, including attempts that did not work.
- `/36-learn-workflow` for a procedure that worked.
- `/37-learn-decision` for a choice among alternatives.
- `/38-learn-uat` for acceptance results.
- `/39-learn-incident` for an outage or production fault.
- `/40-learning-report` to summarize the session.

New lessons stay `proposed`. Verification is a separate review (`/33-review-lessons`). Global reuse happens only after `cdk-kit promote --yes`.
