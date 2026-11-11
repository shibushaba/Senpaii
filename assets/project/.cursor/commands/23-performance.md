Investigate performance of [FLOW / ENDPOINT / SCREEN].

Do not optimize by intuition alone. Establish the workload and observable symptom, inspect traces/metrics/query plans or use available profiling tools. Identify bottlenecks and rank by measured impact and confidence.

Consider N+1 queries, indexes, payload size, caching, rendering, memory, concurrency and network round trips as relevant. Propose a baseline, targeted change and repeatable measurement. Avoid premature caching or weakening correctness. Do not run load tests against production without approval.
