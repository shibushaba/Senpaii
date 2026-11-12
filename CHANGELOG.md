# Changelog

## 0.3.0 — 2026-11-11

- Ships the Cursor Development Kit as loose files under `assets/project/`: 8 engineering rules plus learning rules, 30 engineering commands plus learning commands, 13 skills plus `cdk-learning`, 6 profiles, 8 quality gates, and 6 toolkit docs.
- The published `cdk-kit` executable is `dist/cli.js`, compiled from `src/` during `prepare`. The hand-maintained `bin/cdk-kit.js` is gone.
- Project setup writes `.cdk/activation.yaml` from repository evidence. Python/Django/FastAPI matches framework evidence rather than any `requirements.txt`. Active quality gates follow the matched profiles.
- Adds a local, opt-in learning library: `cdk-kit knowledge`, `promote`, `sync`, and `retract`. A lesson is copied into the user-level store only after `promote --yes`. Nothing is downloaded or uploaded.
- Cursor rules now tell the agent to consult project memory before acting and to propose a lesson after a fix, a failed attempt, a review, or a release.
- CI installs and smoke-tests the commit under test.

## 0.2.0 — 2026-11-11

- Added the global CLI, project manifest, and learning-memory starter.
- Documented the full v1.0 catalog before the catalog files were present. 0.3.0 is the release that actually installs them.

## 0.1.0 — 2026-11-11

- Initial project-local learning starter.
