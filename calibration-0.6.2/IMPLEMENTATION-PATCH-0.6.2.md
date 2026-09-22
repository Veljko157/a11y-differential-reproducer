# Implementation patch 0.6.2

This is an adapter-only correction. **The frozen experimental protocol is unchanged.**

## Evidence observed in 0.6.1

For EXP2 baseline and safe states, SIA-R12 was explicitly selected (`selected=1`) and Alfa returned one rule aggregate with `failed=0`, `passed=0`, and `cantTell=0`. No outcome filter is configured by `runAlfaRule`. The target is under `aria-hidden=true` and Chromium records it as AX-ignored. The invalid mutation exposes the same button and both engines then return FAIL.

## Correction

The Alfa adapter now normalizes a selected rule with a non-empty aggregate and zero failed/passed/cantTell outcomes to `INAPPLICABLE`, but **only on this no-outcome-filter audit path**. If outcome filtering is possible, the same zero-count shape remains `UNKNOWN`.

This is intentionally narrower than the previously rejected shortcut “zero aggregates always mean INAPPLICABLE”. Rule-selection evidence is still mandatory, and `NOT_EXECUTED`, `INAPPLICABLE`, and `UNKNOWN` remain distinct.

No fixture, expected signature, reducer logic, profile predicate, ACT mapping, candidate order, stability policy, or hypothesis was changed.
