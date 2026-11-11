# Safety Model

CDK uses a human-approval model for consequential actions.

## Always inspect before acting

- Current Git branch and working-tree status.
- Existing user changes and untracked files.
- Relevant scripts and configuration before running them.
- Database migration history before changing schemas.
- Deployment environment before release operations.

## Ask for explicit approval before

- Deleting or overwriting user data or files.
- Running destructive database commands or migrations against shared/production systems.
- Changing authentication, authorization, billing, payment or privacy behavior.
- Rotating or exposing credentials.
- Installing, removing or upgrading significant dependencies.
- Pushing branches, creating releases or deploying.
- Running commands with broad filesystem or network effects.

## Never

- Print, copy into chat, commit or hardcode secrets.
- Disable security checks to make tests pass without explicit, informed approval.
- Claim a security audit is complete based on a quick scan.
- Claim tests passed if they were not run.
- Hide failed checks or silently weaken tests.
- Modify unrelated files to make a diff look cleaner.

## Security review scope

A first-pass review is not a formal audit. Consider authentication, authorization, tenant isolation, input validation, output encoding, injection, secrets, dependency risk, rate limiting, logging of sensitive data, file uploads, CORS/CSRF, cryptography, backups and operational exposure as applicable.
