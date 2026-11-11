# Flutter / Dart Profile

Use only when the repository contains a Flutter application.

## Discovery
Inspect `pubspec.yaml`, lockfile, `analysis_options.yaml`, app entry points, navigation, state management, platform folders, flavors, permissions, background tasks and tests.

## Engineering
- Follow the project's established state-management and navigation approach.
- Keep UI, domain logic and data access responsibilities clear.
- Handle widget lifecycle, cancellation and async state updates safely.
- Request only necessary permissions and explain user-facing purpose.
- Treat background execution as platform-constrained; verify Android/iOS behavior rather than assuming continuous execution.
- Consider battery, network availability, offline state, retries and deduplication for location/sync workflows.
- Never embed privileged backend secrets in the mobile app.
- Handle platform-specific behavior and permission denial explicitly.

## Verification
Use actual Flutter/Dart commands supported by the repo. Test relevant devices/platforms; emulator success does not prove every physical-device behavior.
