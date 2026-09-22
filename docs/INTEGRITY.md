# Integrity notes

The directory `calibration-0.6.2/` was extracted from the source archive supplied for public packaging on 2026-09-22. All files covered by its `SOURCE-SHA256.txt` are preserved byte-for-byte. The non-frozen working `output/` directory is intentionally ignored by Git, while `output-frozen-20260906-232212/` is preserved as evidence.

SHA-256 of the supplied archive bytes:

`12d45792d2ad74c772ba2642beb95ab30c24225d0a49f450c905ceb7febaa0e8`

Within the calibration pack, `SOURCE-SHA256.txt` validates 35 source/document files. The public-repository wrapper (top-level README, license, CI and files under `docs/`) was added after the experimental freeze and is intentionally outside that original manifest.

No calibration source file covered by the frozen source manifest was modified while creating this wrapper.
