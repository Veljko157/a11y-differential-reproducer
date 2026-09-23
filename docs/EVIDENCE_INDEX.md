# Evidence index

This page points reviewers to the smallest set of files needed to inspect the pre-grant feasibility evidence.

## Integrity and protocol

- [`calibration-0.6.2/PROTOCOL-FREEZE.md`](../calibration-0.6.2/PROTOCOL-FREEZE.md) — frozen hypothesis, independent variable, profiles and stop rules.
- [`calibration-0.6.2/IMPLEMENTATION-PATCH-0.6.1.md`](../calibration-0.6.2/IMPLEMENTATION-PATCH-0.6.1.md) — first implementation-only correction.
- [`calibration-0.6.2/IMPLEMENTATION-PATCH-0.6.2.md`](../calibration-0.6.2/IMPLEMENTATION-PATCH-0.6.2.md) — narrow Alfa normalization correction; protocol unchanged.
- [`calibration-0.6.2/SOURCE-SHA256.txt`](../calibration-0.6.2/SOURCE-SHA256.txt) — SHA-256 hashes for 35 frozen source/document files.

## Environment and preflight

- [`00-environment.json`](../calibration-0.6.2/output-frozen-20260906-232212/00-environment.json)
- [`00-preflight.json`](../calibration-0.6.2/output-frozen-20260906-232212/00-preflight.json)

## Controlled probes

- [`01-name-label.json`](../calibration-0.6.2/output-frozen-20260906-232212/01-name-label.json)
- [`02-visibility-applicability.json`](../calibration-0.6.2/output-frozen-20260906-232212/02-visibility-applicability.json)
- [`03-idref-relationship.json`](../calibration-0.6.2/output-frozen-20260906-232212/03-idref-relationship.json)

Each controlled probe also preserves baseline/safe/invalid HTML snapshots in the same directory.

## EXP4 causal A/B evidence

- [`04-hero-comparison.json`](../calibration-0.6.2/output-frozen-20260906-232212/04-hero-comparison.json) — compact comparison and first oracle divergence.
- [`04-hero-engine-only-trace.json`](../calibration-0.6.2/output-frozen-20260906-232212/04-hero-engine-only-trace.json) — accepted/rejected candidate trace for the engine-only oracle.
- [`04-hero-profile-gated-trace.json`](../calibration-0.6.2/output-frozen-20260906-232212/04-hero-profile-gated-trace.json) — corresponding profile-gated trace.
- [`04-hero-engine-only.html`](../calibration-0.6.2/output-frozen-20260906-232212/04-hero-engine-only.html)
- [`04-hero-profile-gated.html`](../calibration-0.6.2/output-frozen-20260906-232212/04-hero-profile-gated.html)

The key observation in `04-hero-comparison.json` is a same-candidate divergence: the engine-only oracle accepts `remove<td>` while the profile-gated oracle rejects the corresponding state because the target-row data-cell witness count changes.

## External transfer evidence

Two separate records exist for the same previously known W3C ACT example:

- **Historical summary:** 9 versus 10 elements; the original artifact remains missing. See [`EXTERNAL_TRANSFER_STATUS.md`](EXTERNAL_TRANSFER_STATUS.md).
- **Author-run follow-up, 23 September 2026:** `PATTERN_OBSERVED`, 8 versus 9 elements, with the source, observations, decision traces and final HTML saved. See [the result and its limits](EXTERNAL_TRANSFER_RESULT_2026-09-23.md) and [the run files](../supplements/external-transfer-20260922/runs/2026-09-23T19-56-47-492Z-15956/).

The follow-up artifact was checked and its classification recalculated from saved observations. This was not a new independent browser replay. It does not recover the historical run or count as held-out evaluation. The [current status](EXTERNAL_TRANSFER_FOLLOWUP.md) and [funding boundary](PRE_GRANT_BOUNDARY_2026-09-23.md) explain how it relates to the proposed Phase 1.
