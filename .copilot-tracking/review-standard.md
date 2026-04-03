# Plan 10060 Spec Review

**Plan:** Maranello Design System v4 — Docs, Search, A11y, Quality
**Tasks:** 18 (across 5 waves: W1, W2, WC, W3, WF)
**Reviewed:** spec field completeness, dependencies, effort, model strategy, F-xx coverage, closure wave

---

## BLOCKERS

### B-1: Orphaned tasks — TF-tests missing dependencies

`TF-tests` depends on `[T3-01, T3-04]` but **does not depend on**:

| Task  | What it delivers                    |
|-------|-------------------------------------|
| T2-03 | Cmd-K fuzzy search (F-07)           |
| T2-04 | Accessibility hardening (F-09)      |
| T3-02 | Guide: creating a component (F-10)  |
| T3-03 | Guides: icons + extending (F-11/12) |

These four tasks have **no downstream consumer** in the closure wave. The plan can reach `TF-deploy-verify` without them being completed, which means F-07, F-09, F-10, F-11, and F-12 could silently be skipped.

**Fix:** Add `T2-03`, `T2-04`, `T3-02`, `T3-03` to `TF-tests.depends_on`.

---

### B-2: T1-02 verify[] doesn't validate its own success criterion

The `do` section states: _"grep -rn '#[0-9a-fA-F]{6}' finds zero matches outside readPalette functions"_ but `verify[]` only runs `pnpm typecheck` and `pnpm build`. The core deliverable (no hardcoded hex) is never machine-verified.

**Fix:** Add a verify command, e.g.:
```yaml
- "grep -rn '#[0-9a-fA-F]\\{6\\}' src/components/maranello/ --include='*.tsx' | grep -v readPalette | grep -v '// palette' | wc -l | xargs test 0 -eq"
```

---

## ADVISORIES

### A-1: T2-01 scope risk (effort 3, 52 components)

52 component demos in a single task is the largest unit in the plan. If the executor fails partway through, the entire task must be retried. Consider noting in the `do` that partial progress should be committed per-category so retries don't lose work.

### A-2: T3-03 has no dependencies but references artifacts from T1-02 and T2-02

The guide content discusses `--mn-*` tokens (introduced in T1-02) and the catalog (T2-02). While documentation can be written speculatively, adding `depends_on: [T1-02, T2-02]` would ensure the guides reference finalized conventions.

### A-3: TF-deploy-verify verify[] can't validate interactive features

The task says to verify "Cmd-K fuzzy search works" and "A11yFab is visible" but the `verify[]` array only runs `pnpm build` and JSON parse. These UI checks require E2E tests or manual verification. Consider adding E2E smoke commands or noting them as manual checks.

### A-4: TC-01 output_type is "pr" for a checkpoint

A session checkpoint is operational overhead — `output_type: chore` or `checkpoint` would be more semantically accurate, though this is cosmetic.

### A-5: Session checkpoint not strictly required

The plan has 18 tasks (threshold is >20), so the checkpoint is optional. It's still good practice and correctly placed after W2, so no action needed — just noting compliance.

---

## FIELD COMPLETENESS

| Task | id | do | type | output_type | model | executor | validator | effort | verify[] | test_criteria | depends_on |
|------|----|----|------|-------------|-------|----------|-----------|--------|----------|---------------|------------|
| T1-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 ✅ | ✅ | ✅ | ✅ |
| T1-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3 ✅ | ⚠️ B-2 | ✅ | ✅ |
| T1-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ✅ |
| T1-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ✅ |
| T2-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3 ✅ | ✅ | ✅ | ✅ |
| T2-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ✅ |
| T2-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ✅ |
| T2-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ✅ |
| T2-05 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3 ✅ | ✅ | ✅ | ✅ |
| TC-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 ✅ | ✅ | ✅ | ✅ |
| T3-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3 ✅ | ✅ | ✅ | ✅ |
| T3-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | doc-validator | 2 ✅ | ✅ | ✅ | ✅ |
| T3-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | doc-validator | 2 ✅ | ✅ | ✅ | ✅ |
| T3-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 ✅ | ✅ | ✅ | ✅ |
| TF-tests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 ✅ | ✅ | ✅ | ⚠️ B-1 |
| TF-doc | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | doc-validator | 1 ✅ | ✅ | ✅ | ✅ |
| TF-pr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 ✅ | ✅ | ✅ | ✅ |
| TF-deploy-verify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 ✅ | ✅ | ✅ | ✅ |

## F-xx COVERAGE

| Req   | Description                          | Mapped To        | Status |
|-------|--------------------------------------|------------------|--------|
| F-01  | Reorganize categories                | T1-04            | ✅     |
| F-02  | Eliminate /preview                   | T1-04            | ✅     |
| F-03  | Fix network barrel                   | T1-01            | ✅     |
| F-04  | 52 missing component demos           | T2-01            | ✅     |
| F-05  | Props table + semantic docs          | T2-05            | ✅     |
| F-06  | .mdx files                           | T3-01            | ✅     |
| F-07  | Fuzzy search Cmd-K                   | T2-03            | ⚠️ orphaned (B-1) |
| F-08  | Fix colors/contrast                  | T1-02, T1-03     | ✅     |
| F-09  | A11y                                 | T2-04            | ⚠️ orphaned (B-1) |
| F-10  | Guide creating component             | T3-02            | ⚠️ orphaned (B-1) |
| F-11  | Guide adding icons                   | T3-03            | ⚠️ orphaned (B-1) |
| F-12  | Guide extending system               | T3-03            | ⚠️ orphaned (B-1) |
| F-13  | Fix oversized files + registry + E2E | T1-01, T3-04, T1-04 | ✅ |
| F-14  | Sidebar + Cmd-K navigation           | T1-04            | ✅     |
| F-15  | All checks pass                      | TF-tests         | ✅     |

## CLOSURE WAVE ORDER

`TF-tests → TF-doc → TF-pr → TF-deploy-verify` ✅ Correct

## MODEL STRATEGY

All tasks use `gpt-5.3-codex` (main work) or `gpt-5-mini` (chores/docs). No `claude` models used except where architecture/security would warrant it — none needed here. ✅ Compliant

---

## VERDICT: ❌ BLOCK

**Fix B-1 and B-2 before importing.** Both are mechanical fixes (add 4 task IDs to one depends_on array; add 1 verify command). After those fixes, the plan is ready to execute.
