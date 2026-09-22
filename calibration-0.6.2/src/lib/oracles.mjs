import { evaluateOnce, evaluateStable } from "./evaluate.mjs";
import { sameEngineObservation } from "./state.mjs";

export function engineOnlyDecision(baselineObservation, candidateObservation) {
  const preserved = sameEngineObservation(baselineObservation, candidateObservation);
  return {
    accept: preserved,
    engineObservationPreserved: preserved,
    profile: null,
    reason: preserved ? "ENGINE_OBSERVATION_PRESERVED" : "ENGINE_OBSERVATION_CHANGED",
  };
}

export function profileGatedDecision(baselineObservation, candidateObservation, profile) {
  const engine = engineOnlyDecision(baselineObservation, candidateObservation);
  if (!engine.accept) return { ...engine, profile: null };

  const profileResult = profile.evaluate(candidateObservation);
  return {
    accept: profileResult.pass,
    engineObservationPreserved: true,
    profile: profileResult,
    reason: profileResult.pass
      ? "ENGINE_AND_PROFILE_PRESERVED"
      : "PROFILE_INVARIANT_VIOLATED",
  };
}

export async function screenCandidate({
  browser,
  html,
  spec,
  baselineObservation,
  profile,
  mode,
  commitStabilityRuns = 3,
}) {
  const first = await evaluateOnce(browser, html, spec);
  const firstDecision = mode === "PROFILE_GATED"
    ? profileGatedDecision(baselineObservation, first, profile)
    : engineOnlyDecision(baselineObservation, first);

  if (!firstDecision.accept) {
    return {
      accept: false,
      stable: null,
      first,
      decision: firstDecision,
      stability: null,
    };
  }

  const additional = Math.max(0, commitStabilityRuns - 1);
  const rest = [];
  for (let i = 0; i < additional; i += 1) {
    rest.push(await evaluateOnce(browser, html, spec));
  }
  const observations = [first, ...rest];
  const stable = observations.every(
    (x) => x.engineObservationKey === first.engineObservationKey,
  );

  if (!stable) {
    return {
      accept: false,
      stable: false,
      first,
      decision: {
        ...firstDecision,
        accept: false,
        reason: "NON_DETERMINISTIC_CANDIDATE",
      },
      stability: observations,
    };
  }

  if (mode === "PROFILE_GATED") {
    const profileStable = observations.every((x) => profile.evaluate(x).pass);
    if (!profileStable) {
      return {
        accept: false,
        stable: false,
        first,
        decision: {
          ...firstDecision,
          accept: false,
          reason: "NON_DETERMINISTIC_PROFILE_STATE",
        },
        stability: observations,
      };
    }
  }

  return {
    accept: true,
    stable: true,
    first,
    decision: firstDecision,
    stability: observations,
  };
}
