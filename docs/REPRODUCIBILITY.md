# Reproducing calibration 0.6.2

## Frozen successful environment

The included frozen environment record reports:

- Node: `v24.12.0`
- platform: Windows x64
- Chromium: `151.0.7922.34`
- Playwright: `1.62.1`
- `@axe-core/playwright`: `4.13.0`
- `@siteimprove/alfa-playwright`: `0.84.2`
- `@siteimprove/alfa-test-utils`: `0.84.2`
- `@siteimprove/alfa-rules`: `0.119.0`
- `@siteimprove/alfa-web`: `0.119.0`
- viewport: `1280 × 720`
- locale: `en-US`
- timezone: `UTC`
- JavaScript: enabled

The package metadata allows Node `>=22.12`, but Node `24.12.0` is the environment actually recorded by the frozen run.

## Clean installation

```bash
git clone <repository-url>
cd a11y-differential-reproducer/calibration-0.6.2
npm ci
npx playwright install chromium
```

On Linux, Playwright may require system browser dependencies. Follow Playwright's documented installation method for the host environment rather than changing project source or expected signatures.

## Verification order

Run the cheap checks first:

```bash
npm test
npm run check
```

The frozen pack contains 13 unit tests. The recorded source snapshot produced `13/13` passing tests and a syntax check over 26 files.

Then run the hero preflight:

```bash
npm run preflight
```

Expected pinned signature for the supplied hero fixture:

```text
axe th-has-data-cells = PASS
Alfa SIA-R46          = FAIL
```

The target marker count must be exactly one. If preflight fails, stop. Do **not** rewrite the expected result to fit the current environment.

Run the controlled probes:

```bash
npm run exp:controlled
```

Frozen observations:

| Experiment | Baseline | Safe | Invalid |
|---|---|---|---|
| EXP1 | `PASS|PASS` | `PASS|PASS` | `FAIL|FAIL` |
| EXP2 | `INAPPLICABLE|INAPPLICABLE` | `INAPPLICABLE|INAPPLICABLE` | `FAIL|FAIL` |
| EXP3 | `PASS|PASS` | `PASS|PASS` | invalid profile state |

Finally run EXP4:

```bash
npm run exp:4
```

Frozen result:

- baseline: `PASS|FAIL`
- `ENGINE_ONLY` after: 12 elements / 7 body elements / 506 bytes
- `PROFILE_GATED` after: 13 elements / 8 body elements / 515 bytes
- engine-only final profile preserved: `false`
- profile-gated final profile preserved: `true`
- first oracle divergence: `remove<td>`
- primary pattern observed: `true`

The primary claim is the oracle divergence on the same candidate. Final size is supporting information, not the success criterion.

## Frozen evidence files

The original successful run is preserved under:

`calibration-0.6.2/output-frozen-20260906-232212/`

Important records:

- `00-environment.json`
- `00-preflight.json`
- `01-name-label.json`
- `02-visibility-applicability.json`
- `03-idref-relationship.json`
- `04-hero-comparison.json`
- `04-hero-engine-only-trace.json`
- `04-hero-profile-gated-trace.json`
- the two final reduced HTML artifacts

## Stability policy

The pack uses 3/3 baseline checks, 3/3 checks for controlled states, repeated confirmation before committing accepted reducer candidates, and 3/3 checks of final reduced states. A flaky state is rejected rather than reinterpreted.

## Environment drift is evidence

This repository intentionally treats failure to reproduce the frozen hero baseline as information. Browser, accessibility-tree, engine or rule-version drift may matter. Preserve the failed `output/00-preflight.json` and investigate rather than silently changing the protocol.
