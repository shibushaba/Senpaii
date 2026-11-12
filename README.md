# Senpaii — CDK Global CLI

**CDK Global CLI** installs the Cursor Development Kit into a project: rules, slash commands, skills, stack profiles, quality gates, and a project-local learning memory in `.cdk/`.

Current release: **0.3.2**. Cursor is the first IDE adapter. The toolkit is markdown and YAML. There is no vector database and the CLI does not make network calls.

## Requirements

- Node.js 20 or newer
- npm
- Git, when installing from a Git URL

## Install globally

From the default branch after this release is merged:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

From a clone you are working on:

```powershell
npm install --global .
```

`prepare` compiles `src/` to `dist/cli.js`. That compiled file is the `cdk-kit` executable.

## Use CDK in a project

```powershell
cdk-kit init --dry-run
cdk-kit init
cdk-kit doctor
cdk-kit status
cdk-kit profiles
```

`init` prints the plan and asks before writing. `cdk-kit init --yes` applies the plan without a prompt. `cdk-kit update` reconciles managed files the same way.

## Terminal commands

| Command | Purpose |
| --- | --- |
| `cdk-kit init` | Preview and install the toolkit |
| `cdk-kit doctor` | Check Node, the manifest, profiles, and gates |
| `cdk-kit status` | Show version, managed files, matched profiles, and active gates |
| `cdk-kit profiles` | List six profiles and the gates this stack activates |
| `cdk-kit update` | Reconcile CDK-managed files with this CLI version |
| `cdk-kit learn` | List Cursor learning commands and the terminal knowledge commands |
| `cdk-kit knowledge --query "terms"` | Search this project's `.cdk/` memory |
| `cdk-kit knowledge --query "terms" --global` | Also search the user-level library |
| `cdk-kit promote <verified-lesson> --dry-run` | Preview a sanitized global copy |
| `cdk-kit promote <verified-lesson> --yes` | Approve that copy into the local global library |
| `cdk-kit sync` | Rebuild the local index; refresh `.cdk/global-mirror/` only when the project opts in |
| `cdk-kit retract GLB-YYYYMMDD-001 --yes` | Move one approved global lesson into the local archive |
| `cdk-kit uninstall` | Remove unchanged CDK-managed files |

## What gets installed

- 8 engineering rules (`00-core-contract` through `07-release-and-operations`) plus `08-learning-boundaries` and `09-proactive-learning`.
- 30 engineering slash commands (`01-grill` through `30-verify`).
- Learning commands `00-cdk-init` and `31-learn` through `40-learning-report`.
- 13 engineering skills plus `cdk-learning`.
- 6 technology profiles in `.cdk/profiles/`.
- 8 quality gates in `.cdk/quality-gates/`.
- Operating docs in `.cdk/docs/`.
- Project memory directories, templates, and schemas in `.cdk/`.
- `.cdk/activation.yaml`, generated from the repository. It records which profiles matched and which gates are active.

Profiles and gates are reference material. The agent should read matched profiles and active gates, then confirm the stack from source. They do not override the repository.

`09-proactive-learning` tells Cursor to search `.cdk/` before non-trivial work and to propose a lesson after a fix, a failed attempt, a review, or a release. Proposed lessons stay proposed until a person verifies them.

## Global knowledge

The global library lives on the machine, at `$CDK_HOME` or `~/.cdk-kit` when `CDK_HOME` is unset. It is not inside the project and it is not shared over the network.

- Project memory in `.cdk/` is visible only to that project.
- `global_knowledge.enabled` defaults to `false`.
- `cdk-kit promote --yes` is the approval that copies one verified lesson into the library. A dry run writes nothing. Lessons that look like credentials are refused. A duplicate title is refused unless `--allow-duplicate` is passed.
- `cdk-kit sync` writes `.cdk/global-mirror/INDEX.md` only after the project sets `global_knowledge.enabled: true`.
- Editing `config.yaml` to enable that flag makes the file locally modified, so a later `cdk-kit update` will keep the edit.

## Safety model

- Files that are not in the CDK manifest are user-owned and are never overwritten.
- On update, a managed file is replaced only when its SHA-256 still matches the last installed version.
- Locally modified files are preserved and reported.
- Uninstall removes only unchanged managed files, plus a generated global-mirror index.
- The CLI does not modify application source, install project dependencies, commit, push, or deploy.

The manifest is `.cdk/cli-manifest.json`.

## Development

```powershell
npm install
npm run typecheck
npm test
```

See [Architecture](docs/ARCHITECTURE.md), [Installation](docs/INSTALLATION.md), [Security](docs/SECURITY.md), and [Changelog](CHANGELOG.md).
