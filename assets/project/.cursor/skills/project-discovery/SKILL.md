---
name: project-discovery
description: Understand an unfamiliar or existing repository before making changes.
---


# Project Discovery

## When to use
Use when opening a new, unfamiliar, inherited or long-unmaintained repository.

## Procedure
1. Check working tree and branch. Preserve all existing changes.
2. Inventory top-level folders, manifests, lockfiles, configuration, docs, CI and tests.
3. Identify application entry points, runtime versions and execution commands from actual files.
4. Trace representative user/API flows through UI, routing, domain logic, persistence and external services.
5. Map module boundaries, ownership, shared abstractions and data stores.
6. Inspect authentication, authorization, tenant boundaries, secrets handling and deployment configuration at a high level.
7. Run only safe, non-destructive discovery commands. Do not install, migrate, seed or deploy without approval.
8. Record confirmed facts, inferences and unknowns separately.

## Deliverable
Produce a repository map, verified developer commands, key flows, architecture summary, risks, unknowns and recommended next investigation. Do not edit files unless explicitly asked.
