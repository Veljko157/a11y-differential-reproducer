# Small practical evaluation within T7

Status: proposed Phase 1 evaluation. No usability, time-saving or adoption results have been obtained by this supplement. The work remains within the existing 80-hour T7 allocation and total 875-hour / EUR 35,000 plan.

## Aim

Check whether a user can prepare and share a trustworthy reproduction with a reasonable amount of manual work, while preserving the technical comparison between ENGINE_ONLY and PROFILE_GATED. This is a small case study, not a statistically representative user study.

## Cases and common completion rule

Choose a small fixed set before measuring, separate from development fixtures. Record case source, engine versions, comparison mapping, target, supported profile and eligibility. Keep unsupported and unstable cases in the report with refusal reasons. The external ACT example used in the historical summary and the 23 September 2026 follow-up is already known. It must not be described as a held-out or blind evaluation case, or used to satisfy the reviewer-selected unseen-input gate.

For a case to count as a completed reproduction, the selected engine observations and declared conditions must hold, the evidence must be saved, and the bundle must pass the separate verifier. The same definition applies to manual and assisted preparation. A smaller invalid HTML file is not a successful baseline. An unreduced but verified case can succeed; the result must state that no safe reduction was obtained.

## Record each attempt

| Item | What to record |
|---|---|
| Human effort | Active preparation minutes, interventions, and which steps required judgement |
| Machine effort | Run duration, engine calls, candidate counts and environment |
| Result quality | Final verification result, profile failures detected and reasons for refusal |
| Reduction | Starting/final element and byte counts, alongside validity |
| Replay | Whether another person can follow instructions from a clean setup; help and blockers recorded |
| Upstream usefulness | Links to reports, feedback, accepted tests or fixes only if they actually occur |

Use a predetermined stopping budget for both manual and assisted attempts. Include failed and timed-out attempts; do not calculate savings from successful examples alone. Separate active human time from waiting time and setup cost. Report raw per-case observations and disclose case familiarity, run order and learning effects. If only the author performs the exercise, call it an author-run case study. Without a comparable manual attempt, report assisted effort alone and make no percentage-savings claim.

## Acceptance and external cooperation

The Phase 1 gate remains delivery of the supported workflow, verifier, documented boundaries and reviewer-selected unseen input test. Observations about preparation effort are evaluation outputs, with no promised percentage improvement. A replay by someone outside the implementation work is valuable; record its circumstances if it happens. A promised integration, recruited user cohort, engine fix or accepted upstream report is not a required milestone. If no independent replay or upstream feedback occurs, state that explicitly.

## Wider impact log

Maintain links from a generated example to an upstream report, then to any accepted change, release and consuming tool update. These are different stages. Benefits to website visitors require actual remediation and must not be inferred from package downloads or the engine's total installed base. Outreach is already sufficient for this application; no new broad contact campaign is part of this plan.
