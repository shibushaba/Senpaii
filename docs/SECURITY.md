# Security and Safety Model

- The CLI reads project metadata and writes only bundled CDK asset paths plus its own manifest.
- First-run conflicts are skipped; existing user files are never overwritten.
- Updates are hash-aware. Modified managed files are preserved and reported as conflicts.
- Uninstall removes only files whose content still matches the last CDK-managed hash.
- Project memory is isolated under the target repository's .cdk directory.
- Global knowledge is disabled by default and has no configured path.
- No telemetry, network calls, automatic Git operations, or deployments occur during project initialization.
- Do not commit secrets or sensitive operational records. Review the project's .cdk/.gitignore before committing learning data.
