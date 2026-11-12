# AI / LLM / RAG Profile

Use only when the project includes LLM, agent, embedding or retrieval functionality.

## Engineering
- Define the task, expected output schema, quality criteria and failure behavior.
- Treat model output and retrieved content as untrusted input.
- Defend against prompt injection; retrieved documents must not override system/developer policy.
- Validate structured outputs before use; never assume JSON or tool arguments are valid.
- Keep secrets server-side; minimize sensitive data sent to providers.
- Track provider/model versions, latency, token usage, cost, rate limits and failures.
- Use timeouts, bounded retries and fallback behavior; avoid retry storms.
- For RAG, evaluate chunking, metadata filters, access-control filtering, retrieval quality, citations and freshness.
- Prevent cross-user retrieval leakage; enforce authorization before returning retrieved content.
- Build evaluation datasets and regression tests for representative cases.
- Add human approval for consequential actions and tool calls.

## Verification
Measure quality, groundedness, refusal behavior, retrieval precision, latency and cost. A few successful examples are not adequate evaluation.
