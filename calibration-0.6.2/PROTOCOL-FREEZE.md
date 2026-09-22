# Protocol freeze — calibration 0.6.0

Freeze date: 2026-09-06

## Claim under test

For at least one stable, ACT-anchored cross-engine accessibility outcome contrast, preservation of the selected engine observation is not necessarily sufficient to preserve the configured reproduction-validity state.

## Independent variable in EXP4

Only the acceptance oracle:

- A: `ENGINE_ONLY`
- B: `ENGINE_ONLY AND PROFILE`

The reducer implementation, mutation operators, operation ordering, fixture, engine versions, browser settings, target marker and baseline are otherwise identical.

## Predeclared controlled mutations

### EXP1 — name/label

- SAFE: remove `#safe-noise`.
- INVALID: remove `#remote-label`.
- Expected: `PASS|PASS -> FAIL|FAIL` for INVALID.
- ACT anchor: `97a4e1`.

### EXP2 — visibility/applicability

- SAFE: remove `#safe-noise`.
- INVALID: unwrap `#hidden-wrapper`.
- Expected: `INAPPLICABLE|INAPPLICABLE -> FAIL|FAIL`.
- ACT anchor: `97a4e1`.

### EXP3 — IDREF/relationship

- SAFE: remove `#safe-noise`.
- INVALID: remove `#price-header` while retaining the target `headers` attribute.
- Expected: `PASS|PASS -> FAIL|FAIL`.
- ACT anchor: `a25f45`.

## EXP4

- ACT anchor: `d0f69e`.
- Expected pinned baseline: `PASS|FAIL` (`axe th-has-data-cells | Alfa SIA-R46`).
- Baseline must be stable 3/3.
- Exactly one `data-act-diff-target="primary"` must exist.
- If preflight does not reproduce the frozen baseline, EXP4 stops.
- The expected signature must not be edited after observing a different result.

## Hero MUST_PRESERVE profile

The configured case contract preserves:

1. unique target marker;
2. `<th>` target type;
3. explicit `role="rowheader"`;
4. AX role;
5. baseline accessible name as case identity;
6. table context;
7. target-row data-cell witness count;
8. header-candidate count.

The accessible-name predicate is explicitly a **case-identity** condition, not a statement that ACT `d0f69e` requires a header to have a non-empty name.

## Primary positive pattern

A positive result requires a concrete candidate satisfying:

```text
engine observation preserved = true
profile preserved            = false
ENGINE_ONLY decision         = ACCEPT
```

and the final `PROFILE_GATED` reduction must preserve both engine observation and profile.

Element-count differences are secondary.

## Stop rules

Do not add new fixtures/operators merely because the primary pattern is absent.

Allowed implementation fixes before rerun:
- syntax/import fixes;
- output serialization fixes;
- selector bugs that make a predeclared mutation fail to target its declared node;
- browser-launch engineering fixes;
- Alfa API parsing fixes that do not redefine outcomes.

Requires a protocol amendment:
- changing expected engine signatures after seeing results;
- changing which semantic condition an existing profile claims to preserve;
- adding a fifth confirmatory experiment;
- changing the hero fixture because the result is unfavorable, except to use the exact previously verified #1883 fixture already produced by earlier PoC work and explicitly record that override.
