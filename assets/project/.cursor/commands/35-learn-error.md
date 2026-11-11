Capture an error so the next attempt does not repeat a dead end.

1. Record the exact symptom: command or request, exit code or status, and the relevant message. Redact secrets, cookies, and customer data.
2. List the attempts already made and the result of each. Mark attempts that failed as failed. Do not promote a failed attempt into the recommended fix.
3. State the current root-cause hypothesis and the evidence for and against it. Keep unknowns explicit.
4. Write `.cdk/experiences/EXP-YYYYMMDD-NNN.md` from `.cdk/templates/experience.md` with `category: error`.
5. If, and only if, a fix was verified by a command, test, or user-confirmed result, also write a proposed lesson under `.cdk/lessons/proposed/` that states the cause, the fix, and how to tell it is the same bug next time.
6. Name a regression test that would catch this. Add the test only when the user asked for a code change; otherwise leave it as a recommendation in the lesson.
7. Do not set the lesson to verified. Do not promote it. Do not weaken a test to hide the error.
8. Close with the experience id, whether a lesson was filed, and the next diagnostic if the cause is still unproven.
