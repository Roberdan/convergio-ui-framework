# ADR 0001: Thor is the sole authority for task completion

Status: Accepted | Date: 01 Apr 2026 | Plan: 10044

## Context

Plan 10044 executed 46 tasks successfully (typecheck+build clean, PR #1 created) but could not be closed on the daemon because no task was ever submitted through Thor validation. The executor set tasks to `done` directly, bypassing the ValidatorGate. Retroactive validation via forced-admin was also rejected.

## Decision

ONLY Thor can transition a task to `done`. The lifecycle is immutable: `pending → in_progress → submitted → done (Thor only)`. After all wave tasks reach `submitted`, the executor MUST call `cvg plan validate {plan_id}` which triggers Thor batch validation. No exceptions, no forced-admin, no direct status=done.

## Consequences

- Positive: Quality gate is always enforced; no untested code reaches done
- Negative: Adds ~30s per wave for Thor validation; cannot retroactively close plans

## Enforcement

- Rule: CONSTITUTION.md rules X1-X8
- Check: `cvg plan validate {plan_id}` returns `validated > 0`
- Implementation: SQLite trigger `enforce_thor_done` in ConvergioPlatform daemon
