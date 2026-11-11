# CDK Global CLI Architecture

## Goals

- Install the CDK toolkit once per developer machine and copy it into any project on demand.
- Keep one source of truth for that toolkit: the loose files in `assets/project/`. The installer does not read compressed bundles.
- Compile `src/` to `dist/cli.js` and publish that file as `cdk-kit`, so the executable cannot drift from the TypeScript.
- Keep each project's learning records inside that project's `.cdk/` directory.
- Track every CLI-managed file by SHA-256 so updates and uninstall can tell a managed file from a local edit.
- Make human approval mandatory before a lesson leaves the project.

## Runtime

The CLI is a Node.js 20+ program. `npm install` runs `prepare`, which runs `tsc`. The package `bin` entry is `dist/cli.js`.

## Components

- CLI commands: init, update, doctor, status, profiles, learn, knowledge, promote, sync, retract, uninstall.
- Project detector: reads manifests and matches them to six profiles. A Python profile requires Django or FastAPI evidence. Any `requirements.txt` is not enough.
- Gate activation: universal gates always, plus gates implied by the matched profiles. The result is written to `.cdk/activation.yaml`.
- Installer: previews a plan, skips user-owned and locally modified files, and writes only approved changes.
- Manifest: `.cdk/cli-manifest.json`.
- Project memory: experiences, lessons, decisions, workflows, UAT notes, and incidents under `.cdk/`.
- Global library: `$CDK_HOME/knowledge` or `~/.cdk-kit/knowledge`. `promote --yes` copies one sanitized verified lesson there. `sync` rebuilds `index.json` and, only when the project opts in, `.cdk/global-mirror/INDEX.md`.

## File ownership

On first install, an existing untracked file is user-owned and is never overwritten. On update, a tracked file is replaced only when its current SHA-256 still matches the last installed hash. `activation.yaml` is generated. If the stack changes and the file was not edited, `cdk-kit update` refreshes it. A local edit is preserved.

Enabling `global_knowledge` edits `config.yaml`. That edit is preserved on update.

## What the CLI will not do

- No background watcher and no telemetry.
- No network calls, cloud sync, or vector database.
- No automatic verification and no automatic promotion.
- No application source generation.
- No commits, pushes, deployments, or package installs in the target project.
- Cursor is the first adapter. Other editors are not generated yet.

## How an agent is expected to learn

Rules `00-core-contract`, `08-learning-boundaries`, and `09-proactive-learning` are always applied. Before non-trivial work the agent searches this project's memory and mentions a verified lesson when one applies. After a fix, a failed attempt, a review, or a release it may write a **proposed** record. Verification is a separate review. Global reuse is `cdk-kit promote --yes`.
