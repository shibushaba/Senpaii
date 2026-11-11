# Senpaii — CDK Global CLI

**CDK Global CLI** is the global installer and project manager for the Cursor Development Kit. Install the CLI once, then initialize CDK from the terminal of any supported project.

> Current status: early v0.1.0 implementation. Cursor is the first IDE adapter. Project framework detection is informational in this version; stack-specific profiles are not automatically installed yet.

## Requirements

- Node.js 20 or newer
- npm
- Git

## Install globally from GitHub

After the release is merged to `main`:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

To test the current development branch before release:

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
```

The first command previews planned changes. The second asks before writing. Use `cdk-kit init --yes` only when you have reviewed the plan and want non-interactive application.

## Available commands

| Command | Purpose |
| --- | --- |
| `cdk-kit init` | Preview and initialize CDK assets in the current project |
| `cdk-kit doctor` | Check Node version, IDE files and CDK manifest |
| `cdk-kit status` | Show the installed CDK version and detected project profile |
| `cdk-kit update` | Safely reconcile files managed by CDK |
| `cdk-kit learn` | Show the IDE learning commands |
| `cdk-kit uninstall` | Remove unchanged CDK-managed files only |

## Safety model

- Existing files not recorded in the CDK manifest are treated as user-owned and are skipped.
- On update, a CDK-managed file is replaced only if its current SHA-256 matches the last installed version.
- Locally modified files are preserved and reported.
- Uninstall removes only unchanged CDK-managed files.
- Project memory remains inside that project's `.cdk/` directory.
- Global knowledge is disabled by default. Promotion requires explicit human approval.
- The CLI does not modify application source code, install project dependencies, commit, push, or deploy.

The manifest is stored at `.cdk/cli-manifest.json`.

## Development

```powershell
npm install
npm run typecheck
npm test
```

See [Architecture](docs/ARCHITECTURE.md), [Installation](docs/INSTALLATION.md), and [Security](docs/SECURITY.md).

## Roadmap

1. v0.1.0 — safe global CLI and Cursor learning foundation.
2. v0.2.0 — package the complete existing CDK v1.0 rules, 30 commands, 13 skills, technology profiles and quality gates, then activate framework-specific adapters.
3. v0.3.0 — richer doctor diagnostics and safe global CLI self-update.
4. Later — additional IDE adapters and approved global knowledge distribution.
