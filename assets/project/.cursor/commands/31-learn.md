Review the current task and save what a later session should not have to rediscover.

1. Read `.cdk/config.yaml`, `.cdk/activation.yaml`, and the templates in `.cdk/templates/`.
2. Summarize the session in plain language: what was attempted, what failed, what worked, and which checks actually ran.
3. Search existing `.cdk/` records and do not file a duplicate. If an existing proposed lesson covers the same point, add a short note to the experience instead.
4. Write one experience under `.cdk/experiences/` using the template. Separate observed evidence, hypotheses, and unknowns.
5. Write additional records only when they earn their place:
   - a proposed lesson, if a reusable recommendation is supported
   - a workflow, if a procedure succeeded
   - a decision, if alternatives were rejected for stated reasons
   - a UAT note or incident, if that is what the session was
6. Keep every new lesson at `status: proposed`. Do not verify it. Do not promote it. Do not enable global knowledge.
7. Skip the write when the only changes were typos or formatting, or when the record would need a secret or a customer payload. Say what you skipped.
8. Finish with the file paths, their ids, and the single most useful thing the next session should read before touching the same area.
