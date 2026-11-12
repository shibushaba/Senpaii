Independently review the requested lesson. Default to the newest files in `.cdk/lessons/proposed/` when no id is given.

1. Read the lesson, its source experiences, `.cdk/templates/lesson.md`, and `.cdk/schemas/lesson.schema.json`.
2. Check the file that is actually on disk. Note duplicate YAML keys, missing evidence, over-broad scope, and claims that the experience does not support.
3. Classify each statement as evidence, hypothesis, recommendation, or unknown.
4. Look for an existing verified lesson that already says the same thing, and for a verified lesson that contradicts it.
5. Recommend one outcome: keep proposed, verify, or reject. Verification requires a repeated observation, a test, or an independent source named in the record. A single unreproduced attempt stays proposed.
6. Do not edit, move, verify, reject, or promote unless the user explicitly chooses one of those outcomes.
7. If the user says to verify, move the file to `.cdk/lessons/verified/`, set `status: verified`, and record what evidence justified it. If the user says to reject, move it to `.cdk/lessons/rejected/` with the reason.
8. End with the recommendation, the gaps, and the exact files inspected. Do not enable global knowledge.
