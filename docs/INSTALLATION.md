# Installation and Usage

## Requirements

- Node.js 20 or newer
- npm
- Git

## Install globally from GitHub

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

For development testing before the feature branch is merged:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git#feat/cdk-global-cli-v0.1.0
```

## Initialize a project

Open a terminal at the project root:

```powershell
cdk-kit init --dry-run
cdk-kit init
```

Review the preview. Add `--yes` only when you explicitly want to apply the plan without an interactive confirmation.

## Other commands

```powershell
cdk-kit doctor
cdk-kit status
cdk-kit update --dry-run
cdk-kit learn
cdk-kit uninstall --dry-run
```

## Update the global CLI

Reinstall the GitHub package to fetch the newest default-branch revision:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

The `cdk-kit update` command updates project-level assets to the version of the currently installed CLI; it does not update the global CLI executable.
