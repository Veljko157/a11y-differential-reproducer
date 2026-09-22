# Pre-grant scope and funding boundary

## Completed before the requested grant

The following work is pre-existing feasibility evidence and is **not** proposed for retroactive funding:

- the `0.6.0` frozen calibration protocol;
- implementation corrections `0.6.1` and `0.6.2` that leave the protocol unchanged;
- the engine state normalization used by the calibration pack;
- EXP1 name/label controlled probe;
- EXP2 visibility/applicability controlled probe;
- EXP3 IDREF/relationship controlled probe;
- EXP4 structural/set-based same-reducer A/B experiment;
- the frozen machine-readable calibration outputs included in this repository;
- unit tests and syntax checks contained in the calibration pack.

The snapshot is intentionally narrow. It exists to reduce feasibility risk around the core validity-gate idea.

## Requested Phase 1 work

The proposed funded implementation would turn the narrow calibration mechanism into reusable FOSS infrastructure. The intended Phase 1 scope is:

1. **Engine-neutral state model and new-input workflow** — separate execution from outcome and support URL/local/imported inputs within a declared capability subset.
2. **Portable reproduction bundle and standalone verifier** — a versioned evidence contract that can be independently replayed/verified without trusting the reducer that produced it.
3. **Three bounded reference adapters** — adapter capabilities and provenance for the planned reference engines, without claiming complete rule parity.
4. **Limited standalone disagreement discovery and runtime correctness** — only for curated/versioned comparison mappings; unsupported or non-comparable cases fail closed.
5. **Four reproduction-validity profile families** — name/label, visibility/applicability, IDREF/relationship and structural/set-based dependencies.
6. **Reference reducer and rejection evidence** — reduction only while the declared state can demonstrably be preserved; rejected candidates remain inspectable evidence.
7. **Frozen evaluation, packaging and public release** — reproducible evaluation, documentation, CI/release discipline and explicit unsupported/failure outcomes.

## Explicitly outside the requested Phase 1

- a general-purpose accessibility scanner or compliance report;
- arbitrary rule pairing based only on names or outcomes;
- a universal oracle deciding which engine is normatively correct;
- universal WCAG/ACT coverage;
- a large public disagreement corpus;
- a full third-party adapter SDK/conformance ecosystem;
- broad browser/runtime/version matrices;
- guaranteed reduction for every input;
- a full GUI;
- mandatory Testaro/Open Scans integration.

A valid terminal result may therefore be an explicit refusal such as unsupported capability/profile, unstable observation, no comparable disagreement, or no safe reduction.
