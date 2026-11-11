# n8n / Workflow Automation Profile

Use only when the repository or task involves n8n or workflow automation.

## Engineering
- Map trigger, nodes, branches, credentials, data contracts and external side effects.
- Define idempotency and duplicate-event behavior.
- Validate webhook authenticity and payload shape.
- Handle retries, timeouts, rate limits and partial failures.
- Avoid logging secrets or unnecessary personal data.
- Separate test and production credentials/environments.
- Add error workflows, alerting and replay/recovery strategy where appropriate.
- Consider execution concurrency, queue mode, retention and workflow versioning.
- Protect against loops, runaway retries and accidental bulk sends.
- Obtain approval before activating workflows that message customers, charge money, mutate production records or trigger external side effects.

## Verification
Use test credentials and controlled payloads. Verify both success and failure branches before activation.
