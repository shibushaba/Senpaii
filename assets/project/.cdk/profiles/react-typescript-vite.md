# React / TypeScript / Vite Profile

Use only when confirmed by repository manifests and source files.

## Discovery
Inspect `package.json`, lockfile, tsconfig, Vite config, routing, state/data libraries, component patterns, CSS system, tests and build scripts.

## Engineering
- Prefer strict, useful TypeScript types; avoid `any` unless justified.
- Follow existing component, hooks, state and data-fetching patterns.
- Keep components focused; extract logic only when it improves clarity/reuse.
- Handle loading, empty, error, success and permission states.
- Avoid stale async updates and race conditions.
- Use semantic HTML, keyboard access, visible focus and accessible labels.
- Do not place secrets in client bundles or `VITE_*` variables.
- Validate data at runtime at external boundaries; TypeScript types alone do not validate network data.
- Consider bundle size, unnecessary renders and request waterfalls when relevant.

## Verification
Discover and run the repository's actual lint, typecheck, test and build scripts. Do not assume a particular test framework.
