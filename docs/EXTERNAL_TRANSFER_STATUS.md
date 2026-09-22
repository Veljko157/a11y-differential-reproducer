# External transfer check — evidence status

The grant working record documents one post-freeze check using **W3C ACT rule `d0f69e`, Failed Example 2** as an independently specified structural case. The same frozen `0.6.2` validity-gate idea was reported as being applied without profile retuning.

The recorded summary is:

- stable cross-engine contrast: `CANT_TELL|FAIL`;
- `ENGINE_ONLY` final size: 9 elements;
- `PROFILE_GATED` final size: 10 elements;
- engine-only final profile: not preserved;
- profile-gated final profile: preserved;
- first oracle divergence: `remove<th>`;
- pre-registered classification: `STRONG_TRANSFER`.

**Evidence boundary:** the raw external fixture/run outputs were not present in the supplied `act-diff-calibration-0.6.2` archive used to construct this public repository. Consequently, the summary above is retained only as a traceability note and is **not presented here as independently replayable evidence**. The reproducible evidence in this repository is the frozen calibration pack itself.

If the original raw external-run artifact is later recovered, it should be added unchanged with its own environment record and cryptographic hashes rather than recreated from memory or retuned after the fact.

Official ACT reference: https://www.w3.org/WAI/standards-guidelines/act/rules/d0f69e/proposed/
