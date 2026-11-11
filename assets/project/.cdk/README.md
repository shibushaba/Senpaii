# CDK project memory

This directory is the learning record for this project only. Another repository cannot see it. The global library is a separate, opt-in store on the developer machine, and a lesson enters it only after `cdk-kit promote --yes`.

## Operating principles

- Capture is not verification.
- Before non-trivial work, read `activation.yaml` and search lessons, decisions, and workflows. Surface a verified lesson when it suggests a better approach.
- After a fix, a failed attempt, a review, or a release, file a proposed record when something reusable was learned.
- Proposed lessons are advisory and must not be presented as verified.
- A failed attempt is evidence of what did not work, not the recommended fix.
- Global promotion is never automatic and requires an explicit `cdk-kit promote --yes`.
- Do not store credentials, tokens, customer personal data, or production payloads.

## Directories

- `experiences/`: captured observations and errors
- `journal/`: dated session notes
- `lessons/proposed/`: unverified candidate lessons
- `lessons/verified/`: lessons validated with sufficient evidence
- `lessons/rejected/`: rejected lessons with rationale
- `decisions/`: architecture and engineering decisions
- `workflows/`: reusable project workflows
- `uat/`: UAT findings
- `incidents/`: incident records
- `promotion-queue/`: proposals waiting for a human to run `cdk-kit promote`
- `profiles/`: stack reference material; read the ones `activation.yaml` marks matched
- `quality-gates/`: checklists; use the ones `activation.yaml` marks active
- `docs/`: operating manual for the kit
- `global-mirror/`: local summaries written by `cdk-kit sync` only when global knowledge is enabled
- `templates/` and `schemas/`: shapes for new records

## Terminal commands

- `cdk-kit knowledge --query "..."` searches this project.
- `cdk-kit knowledge --query "..." --global` also searches the user-level library.
- `cdk-kit promote .cdk/lessons/verified/<file>.md --dry-run` previews a sanitized copy.
- `cdk-kit promote <file> --yes` approves that copy into the local global library.
- `cdk-kit sync` rebuilds the local index and, when enabled, the project mirror.
- `cdk-kit retract GLB-YYYYMMDD-NNN --yes` moves an approved global lesson into the archive.

Project records stay in this repository unless a human approves a sanitized promotion.
