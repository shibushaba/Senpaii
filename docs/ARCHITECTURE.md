# CDK Global CLI Architecture

## Goals

- Install the CDK engine once per developer machine.
- Initialize compatible IDE assets into any project on demand.
- Keep each project's learning records isolated.
- Track every CLI-managed file to support safe updates and uninstall.
- Make human approval mandatory for changes to global knowledge.

## Runtime

The CLI is a Node.js 20+ TypeScript application distributed from this repository through npm's Git URL support. Its executable is `cdk-kit`.

## Components

- CLI layer: Commander commands and terminal interaction.
- Project detector: identifies framework markers without changing source files.
- Asset adapter: contains Cursor rules, commands, skills, and .cdk templates.
- Installer: computes a preview, detects conflicts, and applies only approved operations.
- Manifest: records hashes for files managed by this CLI.
- Learning layer: project-local templates and commands; global knowledge remains disabled by default.

## File ownership

The manifest is `.cdk/cli-manifest.json`. On first install, an existing untracked file is user-owned and is never overwritten. On update, a tracked file is updated only when its current SHA-256 still matches the last installed hash. Local modifications are preserved and reported.

## Deliberate non-goals for v0.1.0

- No autonomous observer or background telemetry.
- No cloud or vector database.
- No automatic global knowledge sync.
- No application source-code generation.
- No automatic commits, pushes, deployments, or package-manager changes in target projects.
- Cursor is the first adapter; other IDE adapters can follow.
