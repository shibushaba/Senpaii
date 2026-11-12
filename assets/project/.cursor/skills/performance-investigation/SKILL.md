---
name: performance-investigation
description: Measure and improve performance without sacrificing correctness.
---


# Performance Investigation

## Procedure
1. Define user-visible symptom, target metric and workload.
2. Establish a reproducible baseline using existing telemetry or safe profiling.
3. Trace latency across client, network, server, database and external dependencies.
4. Inspect query plans, N+1 patterns, payload sizes, render cycles, memory and concurrency as applicable.
5. Rank bottlenecks by measured impact and confidence.
6. Propose the smallest targeted optimization.
7. Check cache invalidation, consistency, resource limits and operational complexity.
8. Benchmark before/after under comparable conditions.
9. Add monitoring or regression checks where practical.

## Guardrails
Do not optimize by intuition alone. Do not run load tests against production without explicit approval. Avoid premature caching and correctness trade-offs.

## Deliverable
Baseline, evidence, bottleneck, proposed/implemented change, before/after measurement and remaining risks.
