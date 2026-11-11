# Senpaii — CDK Global CLI

A global command-line distribution for the Cursor Development Kit (CDK).

## Status

Early development. The first milestone is a safe, cross-platform CLI that can initialize CDK in any project without overwriting existing IDE configuration.

## Planned command

```powershell
cdk-kit init
```

## Design principles

- Install the engine once; initialize individual projects on demand.
- Keep project memory isolated per repository.
- Preview and track managed files before writing them.
- Never overwrite user-owned files silently.
- Require explicit human approval for global knowledge promotion.
- Do not commit, push, deploy, or modify application code automatically.

## Development

The CLI will use Node.js and TypeScript. See the architecture and implementation documents as they are added.
