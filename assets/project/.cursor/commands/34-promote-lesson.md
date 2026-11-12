Assess whether a verified lesson is safe to reuse outside this project. This command prepares a proposal. It does not publish one.

1. The lesson must already live in `.cdk/lessons/verified/` with `status: verified`. A proposed lesson is not eligible. Do not verify it in this step.
2. Read `.cdk/config.yaml`. Confirm `promotion.requires_explicit_approval` is true and do not flip `global_knowledge.enabled`.
3. Check source evidence, scope, and whether the advice is actually reusable or just a local path, schema, or product rule.
4. Redact repository names, hostnames, customer identifiers, tokens, and production payloads. If a credential would remain, stop and say the lesson cannot be promoted.
5. Search existing proposals in `.cdk/promotion-queue/` and, if global knowledge is already enabled, `.cdk/global-mirror/INDEX.md` for a duplicate or a contradiction.
6. When the user asks to propose it, write `.cdk/promotion-queue/<lesson-id>.md` with the sanitized text, the evidence, the limitations, and the exact command `cdk-kit promote <path-to-verified-lesson> --dry-run`.
7. Tell the user that nothing is global until they run `cdk-kit promote <path> --yes` themselves. Do not run that command unless they explicitly ask you to execute it.
8. Do not modify rules, skills, or the global library from this command.
