# Customization Guide

## 1. Keep universal and project-specific guidance separate

Universal rules belong in the kit. Project facts belong in the target repository, for example:
- `docs/architecture.md`
- `docs/development.md`
- `docs/api-contracts.md`
- `docs/database.md`
- `docs/runbooks/`

Do not put secrets, access tokens, private customer data or production credentials in instruction files.

## 2. Select technology profiles

Profiles are reference material. They are installed under `.cdk/profiles/` and are not active rules. `cdk-kit` writes `.cdk/activation.yaml` from repository evidence. Read matched profiles only, then confirm the stack from source before applying any guidance. Adapt a matched profile into a scoped `.mdc` rule only after that check.

## 3. Tune strictness

For a personal prototype, keep the same safety boundaries but use lighter planning and test requirements. For a production system, strengthen review, migrations, observability, authorization and release gates.

## 4. Add a project rule

Use a focused `.mdc` file with valid frontmatter:
```md
---
description: Apply the repository's backend conventions to server-side code.
globs: "backend/**/*.py"
alwaysApply: false
---
# Backend conventions
Follow the repository's existing patterns. Inspect representative files before editing.
```

## 5. Avoid rule overload

- Keep rules focused and actionable.
- Prefer repository examples over long copied style guides.
- Avoid repeating the same instruction in rules, commands and skills.
- Do not mark every rule as always-on.
- Review rules when the codebase changes.

## 6. Record project facts carefully

Ask the agent to distinguish confirmed facts from assumptions. Update documentation only after checking the relevant implementation and obtaining approval where the change affects team conventions.
