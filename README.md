# A11y Differential Reproducer — pre-grant feasibility snapshot

This repository publishes the **pre-grant feasibility/calibration work** behind the proposed project **Open Differential Debugging and Reproducibility Infrastructure for Web Accessibility Testing Engines**.

> **Funding boundary:** the code in `calibration-0.6.2/` was completed before the requested NLnet Restack funding. It is evidence of feasibility, not the proposed funded Phase 1 implementation.

The narrow claim tested here is:

> Preserving a stable target-level cross-engine observation is not necessarily sufficient to preserve a valid reproduction under an explicitly declared accessibility-state contract.

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

A post-freeze check was separately recorded in the grant working evidence using W3C ACT rule `d0f69e` Failed Example 2. The raw machine outputs for that external run are **not present in the supplied `0.6.2` calibration archive**, so this repository does not present that transfer result as independently replayable evidence yet. See [`docs/EXTERNAL_TRANSFER_STATUS.md`](docs/EXTERNAL_TRANSFER_STATUS.md).

## Integrity

The original calibration subtree is kept as supplied. Its own [`SOURCE-SHA256.txt`](calibration-0.6.2/SOURCE-SHA256.txt) validates 35 source/document files from the frozen pack. The wrapper documentation in this repository was added later to make the funding boundary and evidence easier to review.

## License

Unless otherwise noted, original project code and documentation in this repository are licensed under the [Apache License 2.0](LICENSE). Third-party packages are not vendored and remain under their respective licenses.
