# Recorded external ACT follow-up, 23 September 2026

**Conclusion:** the supplied run supports `PATTERN_OBSERVED` for this one external example under the declared checks. Keeping the selected normalised engine states did not by itself keep the target's accessibility role and the declared table-header count. Adding the existing preservation check rejected the same candidate change.

This is an author-run exploratory result. The subsequent review checked the saved files and recalculated the classification; it did not execute the engines again.

## Source and recorded environment

The input is W3C ACT rule `d0f69e`, Failed Example 2, retrieved on 22 September 2026. The original 277-byte source is retained. Instrumentation adds only `data-act-diff-target="primary"` to the `th` with `id="col2"`; the instrumented source is 308 bytes. This identifies the tracked element without changing the example's text or adding an accessibility role.

- [Official example](https://www.w3.org/WAI/content-assets/wcag-act-rules/testcases/d0f69e/6bb6ca5dcdbd1fef063561f61de88740db24bd5d.html)
- [ACT rule](https://www.w3.org/WAI/standards-guidelines/act/rules/d0f69e/proposed/)
- Run: `2026-09-23T19-56-47-492Z-15956`
- Windows x64; Node `24.12.0`; Chromium `151.0.7922.34`; Playwright `1.62.1`.
- `@axe-core/playwright` `4.13.0`; Alfa Playwright/test-utils `0.84.2`; Alfa rules/web `0.119.0`.
- Selected rules: axe `th-has-data-cells` and Alfa `SIA-R46`.

Full context is in the [saved environment](../supplements/external-transfer-20260922/runs/2026-09-23T19-56-47-492Z-15956/environment.json). The recorded dependencies match the frozen package declarations. The frozen control preflight records its expected `PASS|FAIL` result before the external comparison.

## Observed result

| Measure | Starting state | ENGINE_ONLY final | PROFILE_GATED final |
|---|---:|---:|---:|
| DOM elements, including browser-inserted elements | 12 | 8 | 9 |
| Descendants of body | 8 | 4 | 5 |
| Normalised axe / Alfa outcomes | CANT_TELL / FAIL | CANT_TELL / FAIL | CANT_TELL / FAIL |
| Repeated evaluations with that engine state | 3/3 | 3/3 | 3/3 |
| Declared preservation checks pass | 3/3 | 0/3 | 3/3 |
| Target AX role | columnheader | LayoutTableCell | columnheader |
| Header candidates in the table | 2 | 1 | 2 |

Both arms first accepted removal of the data row. At pass 2, candidate index 3 (zero-based), both considered removal of the other header, originally `#col1`, at body-relative element path `[0, 0, 0, 0]`. The target `#col2` remained uniquely marked and the selected engine states still matched the baseline. ENGINE_ONLY accepted the removal. PROFILE_GATED rejected that same operation and observed target state with `PROFILE_INVARIANT_VIOLATED`.

The two failing predicates were `AX_ROLE` (`columnheader` became `LayoutTableCell`) and `TABLE_HEADER_CANDIDATE_COUNT` (2 became 1). The accepted prefix before this decision was identical. The gated arm subsequently cleared the other header's text and removed its `id`, leaving an empty `th` beside the marked target.

The final saved HTML files are 228 and 237 bytes. The reducer's `stats.bytes` values, 213 and 222, measure the UTF-8 `documentElement.outerHTML` without the 15-byte doctype. These are distinct measurements, not a hash or reporting mismatch. There were 13 and 21 recorded candidate checks respectively; no human-effort or productivity claim is inferred from them.

## What the checks preserve

The engine comparison preserves the selected rules' execution status, normalised outcome and applicability, together with marker existence and uniqueness. It does not preserve every engine diagnostic. In particular, Alfa's aggregate passed count changes from 1 at the baseline to 0 in both final states. The result must therefore be described as preserving selected normalised rule observations, not all engine output or a fully general target-level result.

The frozen profile metadata still contains `rowheader` wording from its original calibration case. The executable predicates compare candidates against the supplied baseline: here the expected explicit role is absent (`null`), and the expected AX role is `columnheader`. `profile.json` is retained unchanged; the actual expected and observed values appear in the decision records. This follow-up does not validate the old descriptive wording for every external case.

The profile preserves specific declared conditions. Both arms remove the data row, so the result does not establish preservation of all table relationships or all ACT semantics. An unchanged accessible name is a chosen case-identity condition, not a claim that ACT d0f69e requires that name. Neither engine is declared wrong by this experiment.

## Artifact review

- All 16 hashes in `FILES_SHA256.json` match the supplied file bytes, and the manifest covers every other run file.
- All 35 recorded source-integrity entries agree with the frozen manifest and the original publish archive's source bytes. This cross-check does not authenticate the execution machine.
- The saved source matches the previously retrieved example; the target marker is the only input edit.
- The trace HTML matches the standalone final HTML files; final element counts and byte measurements agree.
- All three stored observations per state, engine-state keys, recorded profile decisions and the complete computed classification were checked. Recalculation using the unchanged classifier and frozen predicate functions exactly matches `result.json` apart from non-computed timestamp metadata.

See [the machine-readable review](../supplements/external-transfer-20260922/EVIDENCE_REVIEW_2026-09-23.json) and [the unchanged run files](../supplements/external-transfer-20260922/runs/2026-09-23T19-56-47-492Z-15956/).

This artifact review is not a fresh independent browser replay. The new run does not recover the historical 9-versus-10 record, constitute held-out validation, establish broad coverage, or measure adoption and downstream impact. It is completed pre-grant feasibility work. The supported general workflow, public bundle format, standalone verifier and wider evaluation remain proposed Phase 1 deliverables.
