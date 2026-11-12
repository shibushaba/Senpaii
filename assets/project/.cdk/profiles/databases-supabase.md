# SQL / PostgreSQL / MySQL / Supabase Profile

Use only for databases confirmed in the repository.

## Discovery
Inspect schema, migrations, ORM/query layer, indexes, constraints, row-level security policies, roles, connection configuration and backup practices.

## Engineering
- Enforce data integrity in the database where appropriate.
- Use parameterized queries and least-privilege roles.
- Review indexes against real query patterns and query plans.
- Consider transaction boundaries, locking, isolation and concurrency.
- Treat migrations as deployable code; plan compatibility and rollback/forward-fix.
- For Supabase, inspect RLS policies, grants, security-definer functions, exposed schemas and service-role usage.
- Never expose service-role or privileged database credentials to browsers/mobile clients.
- Test access as different user/role contexts, including cross-tenant attempts.
- Avoid destructive SQL without explicit approval and a verified backup.

## Verification
Validate schema, policies, migrations and representative queries in a safe non-production environment.
