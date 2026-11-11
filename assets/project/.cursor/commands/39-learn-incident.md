Record an incident as evidence, not as blame.

1. Establish the impact, the start and end of the user-visible window, and the systems involved. If a time is unknown, say so.
2. Build a timeline from deploys, logs, alerts, and reports. Separate facts, hypotheses, and unknowns.
3. Describe containment and recovery, and whether recovery was actually checked.
4. Redact customer identifiers, tokens, payloads, and internal hostnames that are not needed to understand the fault.
5. Write `.cdk/incidents/INC-YYYYMMDD-NNN.md` from `.cdk/templates/incident.md`.
6. Add a proposed lesson for the prevention that evidence supports. Follow-ups must be observable: a test, an alarm, a checklist item. Do not file a vague "be more careful".
7. Use `.cdk/quality-gates/incident.md` as the checklist and report which items are met.
8. Do not make production changes as part of writing the record. Do not promote the lesson in this step.
