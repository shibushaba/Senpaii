Search this project's CDK memory before answering or editing.

1. Read `.cdk/activation.yaml` and restrict profile guidance to entries marked `matched`.
2. Search `.cdk/lessons/`, `.cdk/decisions/`, `.cdk/workflows/`, `.cdk/experiences/`, `.cdk/incidents/`, and `.cdk/uat/` for the user's question and the files you are about to change.
3. Also run `cdk-kit knowledge --query "<terms>"` when the CLI is available, and include its hits.
4. Report each hit with id, status, path, and a one-line summary. Put verified records first. Label proposed records as advisory. Mention rejected records only to warn against a known dead end.
5. Do not search the global library unless `.cdk/config.yaml` has `global_knowledge.enabled: true` or the user explicitly asks. Global hits are advisory and must be labeled global.
6. If a verified lesson conflicts with the repository, follow the repository and say so.
7. If nothing relevant exists, say that. Do not invent a prior lesson.
8. Do not edit files unless the user asked for a change. Do not treat a lesson as permission to skip tests or security checks.
