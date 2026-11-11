# Security and Safety Model

- The CLI reads project metadata and writes bundled CDK paths, generated `activation.yaml`, and its own manifest.
- `cdk-kit knowledge` reads this project's `.cdk/` records. It reads the user-level library only when the project has enabled global knowledge or the user passes `--global`.
- `cdk-kit promote` refuses a lesson outside `.cdk/lessons/verified/`, a lesson that is not `verified`, a lesson whose title is already in the library, and content that looks like a private key, cloud access key, bearer token, API token, or assigned credential. It redacts email addresses in the global copy.
- Promotion writes only after `--yes`. A dry run writes nothing. There is no setting that turns approval off.
- `cdk-kit sync` rewrites local index files. It does not contact a network. The project mirror is written only when `global_knowledge.enabled` is true, and uninstall deletes that generated index.
- `cdk-kit retract` moves one global lesson into the local archive. It does not delete the project's copy.
- First-run conflicts are skipped. Existing user files are never overwritten.
- Updates are hash-aware. Modified managed files are preserved and reported.
- Uninstall removes only files whose content still matches the last CDK-managed hash.
- Project memory stays under the target repository's `.cdk/` directory. One project's records are not searched from another project.
- The CLI does not commit, push, deploy, or install dependencies in the target project.
- Do not put secrets or customer payloads in learning records. The scanner is a backstop, not a reason to paste credentials into a lesson.
