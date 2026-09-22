import {
  TARGET_SELECTOR,
  RULES,
  EXPECTED,
  STABILITY_RUNS,
} from "../config.mjs";
import { getHeroHtml } from "../fixtures.mjs";
import { evaluateStable, evaluateOnce } from "../lib/evaluate.mjs";
import { buildHeroStructuralProfile } from "../lib/profiles.mjs";
import { greedyReduce } from "../lib/reducer.mjs";
import { writeJson, writeText } from "../lib/io.mjs";
import { sameEngineObservation } from "../lib/state.mjs";

async function findFirstOracleDivergence({
  browser,
  baselineObservation,
  spec,
  profile,
  engineOnlyTrace,
}) {
  // The engine-only trace already contains concrete candidates only as
  // observations, not full HTML. Therefore the causal comparison is obtained
  // from the profile result stored/recomputed for each accepted state by
  // replaying the final accepted HTML snapshots in the reducer comparison.
  //
  // More importantly, every ENGINE_ONLY accepted step records its observed
  // target state. We can evaluate that state through the pure profile because
  // profiles operate on the captured observation, not on reducer internals.
  for (const step of engineOnlyTrace.accepted) {
    const candidateObservation = {
      ...step.decisionCandidateObservation,
    };
    if (!candidateObservation?.target) continue;
    const p = profile.evaluate(candidateObservation);
    if (!p.pass && step.decision?.engineObservationPreserved) {
      return {
        pass: step.pass,
        candidateIndex: step.candidateIndex,
        operation: step.operation,
        engineOnlyAccepted: true,
        profileWouldAccept: false,
        profile: p,
        observedSignature: step.observedSignature,
      };
    }
  }
  return null;
}

function attachCandidateObservations(trace) {
  // Keep a normalized alias to make the causal post-check explicit.
  // reducer records observedTarget plus decision; the full engine observation
  // is not necessary for profile evaluation because profile predicates are
  // target-state predicates.
  for (const step of [...trace.accepted, ...trace.rejected]) {
    step.decisionCandidateObservation = {
      target: step.observedTarget,
    };
  }
  return trace;
}

export async function preflightHero(browser) {
  const hero = await getHeroHtml();
  const spec = {
    targetSelector: TARGET_SELECTOR,
    axeRule: RULES.tableHeaderAssignedCells.axe,
    alfaRule: RULES.tableHeaderAssignedCells.alfa,
  };
  const baseline = await evaluateStable(browser, hero.html, spec, STABILITY_RUNS);
  const rep = baseline.representative;

  const checks = {
    stable: baseline.stable,
    expectedSignature:
      rep?.signature === EXPECTED.heroSignature,
    uniqueTarget:
      rep?.target?.exists === true && rep?.target?.count === 1,
    axeExecuted:
      rep?.axe?.execution === "EXECUTED",
    alfaExecuted:
      rep?.alfa?.execution === "EXECUTED",
    alfaRuleSelected:
      (rep?.alfa?.selection?.selected ?? 0) > 0,
  };

  return {
    heroFixture: hero.file,
    externalFixtureOverride: hero.external,
    expectedSignature: EXPECTED.heroSignature,
    observedSignature: rep?.signature ?? null,
    act: RULES.tableHeaderAssignedCells.act,
    rules: {
      axe: RULES.tableHeaderAssignedCells.axe,
      alfa: `SIA-R${RULES.tableHeaderAssignedCells.alfa}`,
    },
    checks,
    ready: Object.values(checks).every(Boolean),
    baseline,
  };
}

export async function runExp4(browser, preflight = null) {
  const pf = preflight ?? await preflightHero(browser);
  if (!pf.ready) {
    throw new Error(
      "EXP4 preflight failed. Do not reinterpret the hero benchmark. " +
      "Inspect output/00-preflight.json or set HERO_FIXTURE to the previously verified exact fixture.",
    );
  }

  const hero = await getHeroHtml();
  const spec = {
    targetSelector: TARGET_SELECTOR,
    axeRule: RULES.tableHeaderAssignedCells.axe,
    alfaRule: RULES.tableHeaderAssignedCells.alfa,
  };
  const baselineStable = pf.baseline;
  const baselineObservation = baselineStable.representative;
  const profile = buildHeroStructuralProfile(baselineObservation);

  // SAME reducer, SAME operation generator, SAME ordering.
  // Only `mode` changes the acceptance predicate.
  let engineOnly = await greedyReduce({
    browser,
    baselineHtml: hero.html,
    baselineObservation,
    spec,
    profile,
    mode: "ENGINE_ONLY",
  });
  let profileGated = await greedyReduce({
    browser,
    baselineHtml: hero.html,
    baselineObservation,
    spec,
    profile,
    mode: "PROFILE_GATED",
  });

  engineOnly = attachCandidateObservations(engineOnly);
  profileGated = attachCandidateObservations(profileGated);

  const finalEngine = await evaluateStable(browser, engineOnly.html, spec, STABILITY_RUNS);
  const finalProfile = await evaluateStable(browser, profileGated.html, spec, STABILITY_RUNS);

  const engineFinalProfileResult = profile.evaluate(finalEngine.representative);
  const gatedFinalProfileResult = profile.evaluate(finalProfile.representative);

  const firstOracleDivergence = await findFirstOracleDivergence({
    browser,
    baselineObservation,
    spec,
    profile,
    engineOnlyTrace: engineOnly,
  });

  // Because both arms are identical until the first oracle divergence, the
  // profile-gated arm should encounter the same operation at the same pass and
  // candidate index and reject it for PROFILE_INVARIANT_VIOLATED.
  let matchedProfileGatedDecision = null;
  if (firstOracleDivergence) {
    matchedProfileGatedDecision = profileGated.rejected.find((step) =>
      step.pass === firstOracleDivergence.pass &&
      step.candidateIndex === firstOracleDivergence.candidateIndex &&
      step.operation?.type === firstOracleDivergence.operation?.type &&
      step.operation?.label === firstOracleDivergence.operation?.label
    ) ?? null;
  }

  const report = {
    experiment: "EXP4",
    family: "structural/set-based",
    act: RULES.tableHeaderAssignedCells.act,
    hypothesis:
      "For this stable ACT-anchored #1883-style contrast, the engine-observation oracle can accept a reduction that violates the configured reproduction-validity contract.",
    design: {
      sameReducerImplementation: true,
      sameCandidateGenerator: true,
      sameCandidateOrdering: true,
      onlyAcceptanceOracleChanges: true,
      engineOnlyOracle:
        "per-engine execution/outcome/applicability + unique stable target marker",
      profileGatedOracle:
        "engine-only oracle AND configured MUST_PRESERVE predicates",
    },
    heroFixture: hero.file,
    preflight: pf,
    configuredProfile: {
      id: profile.id,
      family: profile.family,
      rationale: profile.rationale,
      mustPreserve: profile.mustPreserve,
    },
    engineOnly: {
      checks: engineOnly.checks,
      stats: engineOnly.stats,
      acceptedCount: engineOnly.accepted.length,
      rejectedCount: engineOnly.rejected.length,
      final: finalEngine,
      finalProfileCheck: engineFinalProfileResult,
    },
    profileGated: {
      checks: profileGated.checks,
      stats: profileGated.stats,
      acceptedCount: profileGated.accepted.length,
      rejectedCount: profileGated.rejected.length,
      final: finalProfile,
      finalProfileCheck: gatedFinalProfileResult,
    },
    firstOracleDivergence,
    matchedProfileGatedDecision,
    primaryPatternObserved:
      finalEngine.stable &&
      finalProfile.stable &&
      sameEngineObservation(baselineObservation, finalEngine.representative) &&
      sameEngineObservation(baselineObservation, finalProfile.representative) &&
      engineFinalProfileResult.pass === false &&
      gatedFinalProfileResult.pass === true &&
      Boolean(firstOracleDivergence) &&
      matchedProfileGatedDecision?.decision?.reason === "PROFILE_INVARIANT_VIOLATED",
    interpretation:
      "Primary evidence is oracle divergence on a concrete candidate, not the final element-count difference.",
  };

  await writeText("04-hero-engine-only.html", engineOnly.html);
  await writeText("04-hero-profile-gated.html", profileGated.html);
  await writeJson("04-hero-engine-only-trace.json", engineOnly);
  await writeJson("04-hero-profile-gated-trace.json", profileGated);
  await writeJson("04-hero-comparison.json", report);
  return report;
}
