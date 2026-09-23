# Exploratory external transfer follow-up

The author completed a new run on 23 September 2026 with the recorded classification **PATTERN_OBSERVED**. Its unchanged outputs are in [runs/2026-09-23T19-56-47-492Z-15956/](runs/2026-09-23T19-56-47-492Z-15956/). Read the [result and evidence limits](../../docs/EXTERNAL_TRANSFER_RESULT_2026-09-23.md) before interpreting it.

The earlier preparation attempt on 22 September was blocked by a browser-download failure. The new run is a separate result; it does not recover the missing historical output or change the frozen v0.6.2 experiment.

## Inspect the saved run

- `result.json` gives the classification and its checks.
- `baseline.json`, `final-engine-only.json` and `final-profile-gated.json` retain three observations for each state.
- Both `*-trace.json` files retain the reduction decisions; both final HTML files are included.
- `source.json`, `run.json`, `environment.json` and `core-integrity.json` record the source and execution context.
- `FILES_SHA256.json` covers the other 16 run files. Preserve their exact bytes. The local `.gitattributes` disables Git line-ending conversion for `runs/`.
- [EVIDENCE_REVIEW_2026-09-23.json](EVIDENCE_REVIEW_2026-09-23.json) records a static review and recalculation from those saved observations. It is not a fresh browser replay or the proposed Phase 1 standalone verifier.

## Optional new execution

No further execution is needed to retain the recorded result. Someone who wants a new run can use the commands below from the repository root. See [PROTOCOL.md](PROTOCOL.md) first. The runner checks the frozen core and control baseline, then uses the same fixed external input. Every invocation writes a separate directory under `runs/`.

Windows PowerShell:

```powershell
cd calibration-0.6.2
npm.cmd ci
npx.cmd --no-install playwright install chromium
cd ..
node --test supplements/external-transfer-20260922/test/analysis.test.mjs
node supplements/external-transfer-20260922/run.mjs
```

On other shells use `npm` and `npx` instead of `npm.cmd` and `npx.cmd`. The frozen package requires Node >=22.12; the successful recorded run used Node 24.12.0, Playwright 1.62.1 and Chromium 151.0.7922.34.

Inspect `result.json`, not only the process exit code: a completed process can report `PATTERN_NOT_OBSERVED`. Retain blocked, ineligible and negative runs too. An interrupted run without its final result and manifest is incomplete. Do not change the input, profile, expected control result or browser merely to obtain a positive classification.
