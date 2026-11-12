# Python / Django / FastAPI Profile

Use only when the repository actually uses Python and the relevant framework.

## Discovery
Inspect `pyproject.toml`, `requirements*.txt`, lockfiles, Python version, app entry points, settings, URL/router definitions, ORM models, migrations, tests, lint/type tools and deployment config.

## Python engineering
- Follow the project's supported Python version and formatting/linting tools.
- Use type hints where consistent with the codebase.
- Keep domain logic out of transport/controller layers.
- Validate external input with the project's established validation approach.
- Avoid broad exception handling and silent failures.
- Use context managers and resource cleanup.
- Do not block async event loops with synchronous I/O in async paths.

## Django
- Inspect apps, settings, middleware, URL routing, models, managers, serializers/forms, permissions and signals.
- Enforce permissions server-side; do not rely on template/UI visibility.
- Avoid N+1 queries; inspect `select_related` / `prefetch_related` opportunities.
- Use migrations and constraints for data integrity.
- Be cautious with signals and hidden side effects.
- Test permissions, model behavior, views/API contracts and migrations as appropriate.

## FastAPI
- Use existing router/dependency/schema patterns.
- Define request/response schemas and validation explicitly.
- Use dependency injection for shared resources and auth.
- Manage async database/HTTP clients correctly.
- Keep blocking work out of async endpoints.
- Document error semantics and response models.

## Verification
Discover actual project commands; do not assume `pytest`, `ruff`, `mypy` or `manage.py` exist.
