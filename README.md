# Senpaii — CDK Global CLI

**CDK Global CLI** is the global installer and project manager for the Cursor Development Kit. Install it once, then initialize the complete CDK toolkit from the terminal of any supported project.

> Current release candidate: v0.2.0. Cursor is the first IDE adapter.

## Requirements

- Node.js 20 or newer
- npm
- Git

## Install globally from GitHub

After the release is merged to `main`:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

To test the current v0.2.0 branch before release:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git#feat/cdk-global-cli-v0.1.0
```

## Use CDK in any project

Open a terminal at the project's root:

```powershell
cdk-kit init --dry-run
cdk-kit init
cdk-kit doctor
cdk-kit status
cdk-kit profiles
```

The first command previews planned changes. The second asks before writing. Use `cdk-kit init --yes` only when you have reviewed the plan and want non-interactive application.

## Available terminal commands

| Command | Purpose |
| --- | --- |
| `cdk-kit init` | Preview and initialize the complete CDK toolkit |
| `cdk-kit doctor` | Check Node version, IDE integration and toolkit catalogs |
| `cdk-kit status` | Show installed version, managed files and detected profile matches |
| `cdk-kit profiles` | List all six technology profiles and evidence-based project matches |
| `cdk-kit update` | Safely reconcile CDK-managed files |
| `cdk-kit learn` | Show the IDE learning commands |
| `cdk-kit uninstall` | Remove unchanged CDK-managed files only |

## Included toolkit

- 8 original engineering rules, plus the learning-boundaries rule.
- 30 original engineering slash commands, plus CDK learning/profile/quality-gate commands.
- 13 original Agent Skills, plus CDK learning/profile/quality-gate skills.
- 6 technology profiles stored in `.cdk/profiles/`.
- 8 quality gates stored in `.cdk/quality-gates/`.
- Operating, architecture, customization, safety and Cursor compatibility docs in `.cdk/docs/`.
- Project-scoped CDK Learning Engine memory with global promotion disabled by default.

Technology profiles are reference material. The CLI reports potential matches from project manifests and configuration; Cursor should read only the matching profile after confirming the stack from source. Profiles do not override repository conventions.

## Safety model

- Existing files not recorded in the CDK manifest are treated as user-owned and are skipped.
- On update, a CDK-managed file is replaced only if its current SHA-256 matches the last installed version.
- Locally modified files are preserved and reported.
- Uninstall removes only unchanged CDK-managed files.
- Project memory remains inside that project's `.cdk/` directory.
- Global knowledge is disabled by default. Promotion requires explicit human approval.
- The CLI does not modify application source code, install project dependencies, commit, push or deploy.

The manifest is stored at `.cdk/cli-manifest.json`.

## Development

```powershell
npm install
npm run typecheck
npm test
```

See [Architecture](docs/ARCHITECTURE.md), [Installation](docs/INSTALLATION.md), and [Security](docs/SECURITY.md).

## Roadmap

1. v0.2.0 — complete original CDK v1.0 toolkit and learning integration.
2. v0.3.0 — richer framework-specific activation and profile diagnostics.
3. Later — additional IDE adapters and approved global knowledge distribution.
