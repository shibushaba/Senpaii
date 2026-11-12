# Architecture

## 1. Architecture goals

CDK must be reusable across repositories without imposing a single language, framework, architecture, or delivery process. It should provide strong defaults while allowing each repository to declare its own source of truth.

## 2. Layers and responsibilities

| Layer | Location | Responsibility | Loading model |
|---|---|---|---|
| Core rules | `.cursor/rules/` | Persistent behavior and guardrails | Always / relevant paths |
| Commands | `.cursor/commands/` | Explicit user-triggered procedures | On invocation |
| Skills | `.cursor/skills/` | Multi-step specialist workflows | On relevance or invocation |
| Profiles | `.cdk/profiles/` | Stack-specific conventions | Read only profiles marked matched in `.cdk/activation.yaml` |
| Quality gates | `.cdk/quality-gates/` | Verification criteria | Use gates marked active for the detected stack |
| Docs | `.cdk/docs/` | Human operating manual | On demand |
| Project memory | `.cdk/` | Lessons, decisions, workflows, incidents | Project-scoped; global reuse requires promotion |

## 3. Rules strategy

Rules are deliberately short and composable. Only `00-core-contract.mdc` is always applied. Other rules are attached to relevant file patterns or invoked manually. Avoid duplicating repository-specific instructions already expressed in code, config, linters, tests, or existing documentation.

## 4. Commands strategy

Commands are explicit workflows for common tasks. They should:
- State the task and expected output.
- Ask one concise clarification question only when blocked by missing information.
- Inspect before editing.
- Respect the requested scope.
- Include a verification step.
- Report changed files, checks run, and known limitations.

Commands do not automatically grant permission for risky actions.

## 5. Skills strategy

Skills contain detailed procedures, not generic personality instructions. Each skill has:
- YAML frontmatter with a stable name and useful description.
- When-to-use guidance.
- Inputs and prerequisites.
- A step-by-step process.
- Safety constraints.
- Verification criteria.
- A structured completion report.

## 6. Project-specific configuration

The target repository remains authoritative for:
- Runtime and framework versions.
- Architecture and module boundaries.
- Naming and formatting conventions.
- Build, lint, typecheck and test commands.
- Database schema and migration practices.
- Deployment topology and environment names.

CDK must discover these facts; it must not assume them from the included profiles.

## 7. Conflict resolution

When instructions conflict, use this order:
1. Explicit user instruction for the current task, unless unsafe or impossible.
2. Repository-specific documented conventions and verified implementation.
3. Applicable project rules and `AGENTS.md`.
4. CDK universal defaults.
5. General model preference.

If the conflict affects correctness or safety, explain it and ask rather than silently choosing.

## 8. Workflow scaling

- Tiny change: inspect the target, edit narrowly, run the smallest relevant check.
- Normal feature: clarify acceptance criteria, plan, implement, test, review.
- High-risk change: design review, explicit approval, staged implementation, migration/rollback plan, security review, expanded verification.
