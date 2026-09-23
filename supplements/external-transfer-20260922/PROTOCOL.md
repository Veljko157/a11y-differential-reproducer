# Exploratory transfer protocol, 22 September 2026

This is an explicit addition after the v0.6.2 freeze. It was written with knowledge of the historical external summary (CANT_TELL|FAIL, 9 versus 10 elements, remove<th>), so it is not a blind test or an independent preregistration. It does not alter or extend the frozen confirmatory experiment. It is a new, separately logged run on an externally specified example.

## Fixed choices

- Use exactly the W3C d0f69e Failed Example 2 file whose digest is in SOURCE.json. Add only the target marker to #col2.
- Reuse the frozen adapters, comparison rules, reducer, candidate order and buildHeroStructuralProfile implementation without editing them.
- First run the frozen hero preflight and stop if its documented PASS|FAIL baseline does not reproduce.
- For the external baseline require 3/3 engine-observation stability, execution by both engines, applicability, known differing outcomes, one marked target, and a passing baseline profile on all three observations.
- Reuse the reference Chromium build 151.0.7922.34. Record all other package and runtime details; do not silently substitute a browser.
- Run ENGINE_ONLY and PROFILE_GATED using the same reducer on the same starting HTML. Save both full traces and final HTML.
- The transferred structural profile keeps its original identifier and explanatory text. Some wording is specific to the rowheader calibration case. In this external example the unmodified predicates compare the current state against the external baseline. This experiment assesses those explicit predicates; it does not validate the profile for all structural rules or provide universal semantics.
- Engine results in this calibration implementation are normalised rule-level observations. A unique marked target does not turn them into a fully general target-level adapter. The example contains multiple headers, so the result must not be described as proving a defect in a particular target's rule result.

## Classification

Record PATTERN_OBSERVED only if both final states remain stable and preserve their selected engine observations, the engine-only final violates the transferred profile, the gated final preserves the profile in all three checks, and a concrete engine-only accepted candidate is rejected by the gated arm at the same pass, candidate index, complete operation and observed target state for PROFILE_INVARIANT_VIOLATED.

Do not classify by final size alone. Otherwise report PATTERN_NOT_OBSERVED, INELIGIBLE, CONTROL_PREFLIGHT_FAILED, or BLOCKED with evidence. An unknown or failed engine execution is not a disagreement. An inapplicable case is not used for this experiment. Do not retune or try replacement examples to obtain the historical numbers.

## Meaning

A positive new run would show the limited pattern on this externally specified example using the declared predicates and frozen core. It would not recover the missing old run, establish statistical generalisation, prove which engine is right, or demonstrate adoption or website impact.
