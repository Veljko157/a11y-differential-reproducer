# Practical use and potential indirect impact

This document describes the proposed funded Phase 1. The frozen calibration prototype and the separately recorded external follow-up provide limited feasibility evidence. They do not demonstrate adoption or website-level impact.

## A concrete workflow

1. A researcher, developer or discovery tool identifies a possible difference between accessibility engines.
2. The proposed tool checks comparability, applicability and stability within its documented scope. A difference can be legitimate and is not automatically a bug.
3. It tries smaller examples while preserving both the engine observations and the conditions in a declared profile. It records accepted and rejected candidates.
4. It produces a portable evidence bundle or an explicit refusal. A separate verifier checks supported bundles.
5. An engine maintainer can use a verified example to investigate a report, add a regression test, or clarify a rule's assumptions. The maintainer can consume the example without installing the reducer in their own product.

The practical questions are whether this reduces manual preparation effort and prevents misleading reductions, and whether another person can repeat the result from the package. These questions will be measured during Phase 1, rather than assumed to have been answered by the current experiment.

## How a small tool could have wider effects

A verified example may lead to an accepted engine fix or regression test. A released fix may then reach products that use the affected rule and engine version. Developers using those products may receive more reliable findings, which can guide accessibility improvements on their sites. People with disabilities benefit when those improvements are actually implemented.

Each step is conditional. Engine adoption alone does not imply a fix, and a fix alone does not prove that websites have become more accessible. A discovery-only integration may help researchers investigate cases without changing any engine. Different integrations therefore have different routes to impact.

The project does not need every website owner to become a direct user. Its potential lies in improving reusable testing infrastructure at a point where results are shared across tools. That supports an infrastructure grant even with a specialist direct audience, but neither the size of that audience nor the downstream reach has yet been measured.

## Evidence already available

- Frozen EXP4 data records a reduction accepted by the engine-only check that violates the declared structural profile, while the profile-gated run preserves it.
- The supplied community appendices describe Testaro discussion of a possible discovery/reproduction workflow, independent Alfa community examination of preservation risks, and critical axe/ACT feedback on comparability.
- These are feasibility, workflow and design signals. No integration agreement, maintainer acceptance of this tool, or measured end-user benefit is claimed.
- A separate author-run follow-up on 23 September 2026 records the same limited pattern on one previously known external ACT example: 8 versus 9 elements, with a matching accepted/rejected header-removal candidate. Its saved files have been reviewed and its classification recalculated. See [the result](EXTERNAL_TRANSFER_RESULT_2026-09-23.md).
- The original historical 9-versus-10 run remains a summary without its original artifact. The new run has its own date and provenance; it does not recover the old run or establish independent adoption.

## Track evidence at the level it supports

| Observation | Defensible claim | Claim it does not support |
|---|---|---|
| A verifier checks a bundle | The supported case can be checked | An engine is wrong |
| Another person replays a case | Replay worked in that recorded environment | Regular adoption |
| A maintainer accepts a report or test | That artifact was useful to that project | All downstream users benefited |
| A released fix is linked to the example | A contribution reached an engine release | A count of improved websites |
| A consuming tool updates the affected engine | A documented distribution path exists | Website remediation occurred |
| A website fixes a verified issue | A specific remediation occurred | Universal conformance |

Downloads, stars, the number of URLs scanned by another tool and an engine's full user base will not be counted as beneficiaries of this project. Any future reach estimate must say which rule, release and consuming products are affected and how overlap was handled.

## Sources for the distribution mechanism

- Deque documents axe-core integrations with several test frameworks: https://www.deque.com/axe/core-documentation/integrations/
- Deque states that axe-core is the foundation for its web testing API packages: https://docs.deque.com/devtools-for-web/4/en/about-axe-devtools-apis/
- W3C explains the audience and purpose of ACT: https://www.w3.org/WAI/standards-guidelines/act/
- Existing project discussions are linked in the supplied community appendix. Those records describe discussion, not endorsements.

These sources establish that shared testing infrastructure is reused. They do not establish adoption of this proposed tool. Public sources checked on 22 September 2026.
