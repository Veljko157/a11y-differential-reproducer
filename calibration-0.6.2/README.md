# Implementation status

**0.6.2 is an implementation hotfix; the frozen 0.6.0 experimental protocol is unchanged.** See `IMPLEMENTATION-PATCH-0.6.2.md`.

# ACT Differential Calibration Pack 0.6.0

This is a deliberately small **pre-grant feasibility/calibration pack**. It is not the full Restack V1.

It tests one narrow claim:

> Preserving a stable target-level cross-engine observation is not necessarily sufficient to preserve a valid reproduction under an explicitly declared accessibility-state contract.

## Frozen scope

The pack contains exactly:

1. **EXP1 — name/label**: a controlled `aria-labelledby` dependency probe.
2. **EXP2 — visibility/applicability**: a controlled `aria-hidden` applicability probe.
3. **EXP3 — IDREF/relationship**: a controlled table `headers` dependency probe.
4. **EXP4 — structural/set-based hero experiment**: one deterministic greedy reducer run twice with the **same reduction algorithm and candidate order**, changing only the acceptance oracle:
   - `ENGINE_ONLY`: preserve engine observation + unique target marker.
   - `PROFILE_GATED`: the same condition **and** the configured `MUST_PRESERVE` contract.

No QualWeb integration, corpus, frozen holdout, Testaro bridge, SDK, general URL discovery, or full bundle/verifier implementation is added here.

## Why EXP4 uses two oracles, not two reducers

A comparison between two separately implemented reducers would be confounded: different search order or transforms could explain different outputs.

In 0.6.0 both arms call the same `greedyReduce()` implementation and the same deterministic `generateOperations()` implementation. The only switch is the acceptance predicate.

The engine-only trace is also post-checked with the profile so the report can point to the first **same candidate** that was accepted by the engine oracle but violates the declared profile.

## Engine state model in this pack

For each selected rule, the normalized record separates:

- `execution`: `EXECUTED`, `NOT_EXECUTED`, `ERROR`, `UNKNOWN`
- `outcome`: `PASS`, `FAIL`, `CANT_TELL`, `INAPPLICABLE`, `UNKNOWN`
- `applicable`: `true`, `false`, or `null`

A missing Alfa aggregate is **not** automatically called `INAPPLICABLE`. It is called `INAPPLICABLE` only when the requested Alfa rule-selection predicate was actually selected during that audit. Otherwise it becomes `NOT_EXECUTED` or `UNKNOWN`.

## Single-target limitation

The current Alfa Code Checker integration exposes result aggregates conveniently. For these calibration fixtures we therefore require exactly one explicitly marked candidate target:

```html
data-act-diff-target="primary"
```

That makes fixture-level rule applicability interpretable conservatively for the controlled calibration. It is **not** claimed as a production per-target Alfa API.

## ACT anchoring

Where available, the engine rule pairing is anchored to the same ACT rule:

- EXP1/EXP2: ACT `97a4e1` — button has non-empty accessible name.
- EXP3: ACT `a25f45` — `headers` references cells in the same table.
- EXP4: ACT `d0f69e` — table header cell has assigned cells.

The pack still reports an observed pair as a **candidate disagreement / outcome contrast**; it never decides which engine is normatively correct.

## Installation

PowerShell:

```powershell
cd B:\NLnet
Expand-Archive .\act-diff-calibration-0.6.0.zip -DestinationPath . -Force
cd .\act-diff-calibration-0.6.0

npm install
npx playwright install chromium

npm test
npm run check
npm run preflight
```

Do not skip `preflight`.

## Execution order

```powershell
npm run exp:controlled
npm run exp:4
```

or, only after preflight succeeds:

```powershell
npm run exp:all
```

Individual commands:

```powershell
npm run exp:1
npm run exp:2
npm run exp:3
npm run exp:4
```

## Critical preflight rule

The supplied hero fixture is intended to reproduce the already observed Alfa #1883-style contrast on the pinned dependency versions.

The default expected signature is:

```text
axe th-has-data-cells = PASS
Alfa SIA-R46          = FAIL
```

and the target marker count must be exactly `1`.

If your environment does not reproduce that stable baseline, **stop**. Do not edit the expected signature to match a new result. Preserve `output/00-preflight.json` and investigate fixture/version/runtime drift.

You can point EXP4 to a previously verified exact local fixture without changing source code:

```powershell
$env:HERO_FIXTURE="B:\path\to\your\previously-verified-1883-fixture.html"
npm run preflight
npm run exp:4
```

The external fixture must contain exactly one:

```html
data-act-diff-target="primary"
```

## Stability policy

- Baselines are checked `3/3`.
- Controlled safe/invalid states are checked `3/3`.
- During greedy reduction a candidate is screened once for cost.
- Before an accepted candidate is committed, it is re-evaluated enough times to total `3` identical observations.
- Final reduced states are checked `3/3`.

A flaky baseline or accepted candidate is rejected.

## Output

Typical output:

```text
output/
  00-environment.json
  00-preflight.json
  01-name-label.json
  01-name-label-baseline.html
  01-name-label-safe.html
  01-name-label-invalid.html
  02-visibility-applicability.json
  03-idref-relationship.json
  04-hero-engine-only.html
  04-hero-profile-gated.html
  04-hero-engine-only-trace.json
  04-hero-profile-gated-trace.json
  04-hero-comparison.json
  99-summary.json
  99-summary.md
```

## Interpretation discipline

A useful hero result is not “13 elements beats 14 elements.”

The primary evidence is a concrete candidate for which:

```text
engine observation preserved = YES
configured profile preserved = NO
ENGINE_ONLY                  = ACCEPT
PROFILE_GATED                = REJECT
```

Final DOM size is secondary.

The pack does **not** prove:

- universal semantic equivalence;
- that every ACT/WCAG rule needs one of these four profiles;
- that the profile is minimal;
- that disagreement implies one engine is wrong;
- a globally minimal testcase;
- generalization to arbitrary web applications;
- a real-world frequency/effect-size estimate.

If the expected hero phenomenon is not observed, retain that result. Do not add a fifth experiment until the claim is reconsidered.
