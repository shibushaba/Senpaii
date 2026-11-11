Record a technical decision while the alternatives and the reason are still explicit.

1. State the decision in one sentence, the context that forced it, and the date.
2. List the alternatives that were actually considered. For each, record why it lost. Do not invent options nobody discussed.
3. Record consequences, follow-up work, and what would cause the decision to be revisited.
4. Link the files, lessons, or experiments that justify it.
5. Write `.cdk/decisions/DEC-YYYYMMDD-NNN.md` from `.cdk/templates/decision.md`. Set `status: accepted` only when the user accepted it; otherwise use `status: proposed`.
6. Do not copy the decision into a rule or a skill. If it should become a standing project convention, say so and wait.
7. Do not store credentials, customer data, or unreleased security details.
8. Finish with the decision id and the one alternative most likely to be retried later, so a future session does not silently reverse it.
