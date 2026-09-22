# Implementation patch 0.6.1 — protocol unchanged

This is an implementation-only hotfix to calibration protocol 0.6.0. It does **not** change any fixture claim, expected signature, hypothesis, profile predicate, reducer search order, or acceptance criterion.

Two defects were discovered by the first local preflight/controlled run on 2026-09-06:

1. `mutateFixed()` and `applyOperation()` returned the unresolved `page.content()` promise from inside a `try/finally`. The Playwright context could therefore close before `page.content()` resolved, producing `Target page, context or browser has been closed`. Both calls now use `return await page.content()` so content is captured before closing the context.

2. The 0.6.0 Alfa adapter classified a non-empty `resultAggregates` collection only after materialising it with a generic conversion helper. On the observed environment this yielded one apparent aggregate but no readable `failed/passed/cantTell` values, despite Alfa selecting SIA-R46. 0.6.1 classifies the original `resultAggregates` collection using Siteimprove's documented access pattern (`resultAggregates.filter(aggregate => aggregate.failed > 0).size`) and keeps materialised data only as diagnostics/fallback.

Protocol-freeze rule: if preflight still does not reproduce the predeclared `PASS|FAIL` hero signature after this implementation repair, do not change the expected signature or profile. Inspect the exact historical fixture/environment path instead.
