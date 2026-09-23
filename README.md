# A11y Differential Reproducer — pre-grant feasibility snapshot

This repository publishes the **pre-grant feasibility/calibration work** behind the proposed project **Open Differential Debugging and Reproducibility Infrastructure for Web Accessibility Testing Engines**.

> **Funding boundary:** the code in `calibration-0.6.2/` was completed before the requested NLnet Restack funding. It is evidence of feasibility, not the proposed funded Phase 1 implementation.

The narrow claim tested here is:

> Preserving stable normalised rule-level observations and a unique target marker is not necessarily sufficient to preserve the conditions required by an explicitly declared accessibility-state contract.

The calibration snapshot compares two acceptance oracles using the **same reducer, same candidate generator, same candidate ordering and same fixture**. Only the acceptance predicate changes:

- `ENGINE_ONLY`: preserve the selected per-engine observation and unique target marker.
- `PROFILE_GATED`: require the same engine observation **and** the configured `MUST_PRESERVE` reproduction-validity profile.

## What is frozen here

The exact source snapshot is under [`calibration-0.6.2/`](calibration-0.6.2/). Its experimental protocol was frozen as `0.6.0`; versions `0.6.1` and `0.6.2` are implementation/adapter corrections that explicitly leave the protocol unchanged.

The supplied snapshot contains:

| Experiment | Dependency family | ACT anchor | Frozen observed pattern |
|---|---|---|---|
| EXP1 | name / label | `97a4e1` | safe state preserved; invalid mutation breaks declared profile |
| EXP2 | visibility / applicability | `97a4e1` | `INAPPLICABLE|INAPPLICABLE` is preserved for safe state; invalid exposure changes state |
| EXP3 | IDREF / relationship | `a25f45` | safe state preserved; invalid relationship breaks declared profile |
| EXP4 | structural / set-based | `d0f69e` | `ENGINE_ONLY` accepts a smaller profile-invalid state; `PROFILE_GATED` rejects the semantic boundary crossing |

For EXP4 the frozen run records a stable `PASS|FAIL` baseline. The engine-only arm ends at 12 elements while violating the configured profile; the profile-gated arm ends at 13 elements while preserving it. The first same-candidate oracle divergence is `remove<td>`. **The size difference is secondary; the primary evidence is the concrete accept/reject divergence at a declared invariant boundary.**

See [`docs/EVIDENCE_INDEX.md`](docs/EVIDENCE_INDEX.md) and the frozen machine-readable outputs in [`calibration-0.6.2/output-frozen-20260906-232212/`](calibration-0.6.2/output-frozen-20260906-232212/).

## Reproduce the calibration

The original successful frozen run recorded Node `24.12.0`, Chromium `151.0.7922.34`, Playwright `1.62.1`, `@axe-core/playwright` `4.13.0`, Alfa Playwright/test-utils `0.84.2`, and Alfa rules/web `0.119.0`.

```bash
cd calibration-0.6.2
npm ci
npx playwright install chromium
npm test
npm run check
npm run preflight
npm run exp:controlled
npm run exp:4
```

Do not skip `preflight`. If the pinned hero signature is not reproduced, **stop and preserve the failure** rather than editing the expected result. Full instructions and expected observations are in [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md).

## What this repository does *not* claim

This snapshot is deliberately small. It does not claim universal semantic equivalence, global testcase minimality, arbitrary-web generalization, complete WCAG/ACT coverage, a correctness oracle for deciding which engine is right, or that every cross-engine difference is a bug. Cross-engine comparability must be explicitly justified; similar rule names or different outcomes are not sufficient by themselves.

See [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md).

## What the requested Phase 1 would add

The proposed funded work is broader than this calibration snapshot: a production-quality engine-neutral state model, versioned comparability layer, portable reproduction bundle, independent verifier, three bounded reference adapters, limited standalone discovery, four reproduction-validity profile families, a reference reducer, frozen evaluation and public release/documentation.

The detailed boundary between completed work and requested work is in [`docs/PRE_GRANT_SCOPE.md`](docs/PRE_GRANT_SCOPE.md).

## External transfer check

The historical post-freeze summary for W3C ACT rule `d0f69e`, Failed Example 2, reports 9 versus 10 elements. Its original run artifact remains missing; [`docs/EXTERNAL_TRANSFER_STATUS.md`](docs/EXTERNAL_TRANSFER_STATUS.md) retains that historical record. A **separate author-run follow-up on 23 September 2026** produced 8 versus 9 elements and has its own saved source, observations, traces and hashes. See [the new result](docs/EXTERNAL_TRANSFER_RESULT_2026-09-23.md) and [the current evidence overview](docs/EXTERNAL_TRANSFER_FOLLOWUP.md). The new artifact does not recover the earlier run.

## Practical use, impact and new external evidence

An author-run exploratory follow-up on 23 September 2026 recorded `PATTERN_OBSERVED` on one previously known external W3C ACT example. The two final cases contain 8 and 9 DOM elements. Both preserve the selected normalised engine states, but only the profile-gated result preserves the declared checks. The saved artifact has been reviewed and its classification recalculated; this is not an independent browser replay or broad validation.

See [the result and unchanged run files](docs/EXTERNAL_TRANSFER_RESULT_2026-09-23.md), [current evidence status](docs/EXTERNAL_TRANSFER_FOLLOWUP.md), and [completed preparation versus funded work](docs/PRE_GRANT_BOUNDARY_2026-09-23.md). The historical 9-versus-10 artifact remains missing. The original `v0.6.2-pregrant` tag is unchanged.

The proposed Phase 1 will help maintainers and researchers prepare examples that others can verify. If an example contributes to an accepted engine fix or regression test, the benefit may reach products using the affected engine. These are potential effects, not measured reach or adoption. See [the practical use case](docs/IMPACT_AND_USE_CASE.md) and [the evaluation plan](docs/PRACTICAL_EVALUATION.md).


## Integrity

The original calibration subtree is kept as supplied. Its own [`SOURCE-SHA256.txt`](calibration-0.6.2/SOURCE-SHA256.txt) validates 35 source/document files from the frozen pack. The wrapper documentation in this repository was added later to make the funding boundary and evidence easier to review.

## License

Unless otherwise noted, original project code and documentation in this repository are licensed under the [Apache License 2.0](LICENSE). Third-party packages are not vendored and remain under their respective licenses.

