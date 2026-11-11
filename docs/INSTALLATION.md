# Installation and Usage

## Requirements

- Node.js 20 or newer
- npm
- Git, for a Git URL install

## Install the CLI

After this release is on the default branch:

```powershell
npm install --global git+https://github.com/shibushaba/Senpaii.git
```

From a local checkout of the commit you want to test:

```powershell
npm install
npm install --global .
```

The global command is compiled from `src/cli.ts`. Reinstall the package to change the CLI version. `cdk-kit update` only refreshes project files to match the CLI that is already installed.

## Initialize a project

From the project root:

```powershell
cdk-kit init --dry-run
cdk-kit init
```

Review the preview. Existing user-owned files are skipped. Locally modified CDK-managed files are preserved. Add `--yes` only when you want to apply the plan without a prompt.

## Other commands

```powershell
cdk-kit doctor
cdk-kit status
cdk-kit profiles
cdk-kit update --dry-run
cdk-kit learn
cdk-kit knowledge --query "retry"
cdk-kit promote .cdk/lessons/verified/example.md --dry-run
cdk-kit sync
cdk-kit uninstall --dry-run
```

## Technology profiles and gates

Six profiles are installed under `.cdk/profiles/` and eight gates under `.cdk/quality-gates/`. `cdk-kit profiles` shows which profiles matched and which gates are active for this repository. The same selection is stored in `.cdk/activation.yaml`. Detection is advisory. Confirm the framework and the database from source before applying a profile.

A `requirements.txt` that does not mention Django or FastAPI does not select the Python profile. `manage.py`, or a manifest that names Django or FastAPI, does. Django and common SQL drivers also select the SQL / Supabase profile.

## Learning commands

In Cursor, `/32-knowledge` searches project memory and `/35-learn-error` through `/39-learn-incident` capture specific events. `/34-promote-lesson` writes a proposal under `.cdk/promotion-queue/`. It does not publish the lesson. Publishing is `cdk-kit promote <file> --yes`.

## Where global knowledge lives

Unset `CDK_HOME` uses `~/.cdk-kit`. Set `CDK_HOME` to keep the library somewhere else. The project does not see that library until `global_knowledge.enabled` is true and you run `cdk-kit sync`, or you pass `--global` to a search.
