# Installation and Usage

## Requirements

- Node.js 20 or newer
- npm
- Git

## Install globally from GitHub

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

For development testing before the v0.2.0 branch is merged:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git#feat/cdk-global-cli-v0.1.0
```

## Initialize a project

Open a terminal at the project root:

```powershell
cdk-kit init --dry-run
cdk-kit init
```

Review the preview. Existing user-owned files are skipped. Locally modified CDK-managed files are preserved. Add `--yes` only when you explicitly want to apply the plan without an interactive confirmation.

## Other commands

```powershell
cdk-kit doctor
cdk-kit status
cdk-kit profiles
cdk-kit update --dry-run
cdk-kit learn
cdk-kit uninstall --dry-run
```

## Technology profiles

Six profile documents are installed under `.cdk/profiles/`. Run `cdk-kit profiles` to see which profiles match repository markers. Profile detection is advisory. Cursor should inspect project source/configuration and read only matching profiles; profiles do not override project truth.

## Update the global CLI

Reinstall the GitHub package to fetch the newest default-branch revision:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

The `cdk-kit update` command updates project-level assets to the version of the currently installed CLI; it does not update the global CLI executable.
