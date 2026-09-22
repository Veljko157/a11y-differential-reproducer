# Limitations and claim boundaries

This is a feasibility/calibration snapshot, not a production accessibility-testing platform.

It supports only a narrow claim: in at least one stable ACT-anchored calibration scenario, preserving the selected per-engine observation is not sufficient to guarantee preservation of an explicitly declared reproduction-validity state.

It does **not** establish any of the following:

- that every cross-engine difference is a bug;
- that similar engine rule names are automatically comparable;
- that one engine is normatively correct and another incorrect;
- universal semantic preservation;
- global or algorithmic testcase minimality;
- complete ACT or WCAG coverage;
- that the four dependency families are exhaustive;
- arbitrary-web or arbitrary-framework generalization;
- a real-world frequency or effect-size estimate;
- complete browser/runtime portability;
- safe handling of every dynamic application state or closed Shadow DOM;
- a production per-target Alfa API;
- guaranteed reduction for every supported input.

The current Alfa integration is deliberately conservative and the calibration fixtures use one explicitly marked target. `NOT_EXECUTED`, `INAPPLICABLE`, `ERROR` and `UNKNOWN` are kept distinct rather than collapsed into pass/fail.

The intended future infrastructure therefore uses an explicit fail-closed model: when comparability, stability, capability or reproduction validity cannot be established, the correct outcome is a machine-readable refusal or an unreduced/equal-size verified artifact, not an invented reduction.
