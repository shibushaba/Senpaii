Perform a first-pass security review of [SCOPE / REPOSITORY]. Do not call this a formal audit.

Inspect applicable areas:
- Secrets in tracked files, configuration examples and relevant Git history where accessible.
- Authentication and server-side authorization.
- Object-level access, tenant isolation and IDOR.
- Input validation, injection and output encoding.
- Session, token, password and cryptographic handling.
- File uploads, webhooks, redirects, CORS/CSRF and rate limiting.
- Sensitive data in logs and error responses.
- Dependency and configuration risks.
- Data exposure, backup and operational concerns.

For every finding provide severity, evidence (file/line or reproducible flow), impact, exploit preconditions and remediation. Separate confirmed vulnerabilities from questions needing verification. Do not expose secret values; identify location and rotate/revoke if exposed. Do not change code until I approve a remediation plan.
