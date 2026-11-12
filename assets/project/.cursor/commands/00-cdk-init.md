Inspect the repository and make sure CDK project memory exists without disturbing work that is already here.

1. Check Git status and do not revert or overwrite user changes.
2. Read `.cdk/config.yaml` when it exists. Do not enable `global_knowledge` and do not change `auto_promote`.
3. If the CDK layout is missing, tell the user to run `cdk-kit init --dry-run` and then `cdk-kit init`. Prefer the CLI, because it records hashes and will not clobber local edits.
4. Create only missing memory directories and templates if the user explicitly wants you to initialize files yourself: `experiences/`, `journal/`, `lessons/proposed|verified|rejected/`, `decisions/`, `workflows/`, `uat/`, `incidents/`, `promotion-queue/`. Do not overwrite an existing file.
5. Read `.cdk/activation.yaml` and report matched profiles and active quality gates. If the file is absent, say which stack markers you can see and that activation is written by `cdk-kit init`.
6. Search verified lessons and workflows that match the detected stack. Surface up to three that should influence the next change. Label anything proposed as proposed.
7. Do not install dependencies, edit application source, commit, push, or deploy.
8. Report files created, files preserved, profiles matched, and the lessons you would consult first.
