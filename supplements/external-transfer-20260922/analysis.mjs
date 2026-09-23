import { sameEngineObservation } from '../../calibration-0.6.2/src/lib/state.mjs';
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function assessBaseline(baseline, profile) {
  const known = new Set(['PASS', 'FAIL', 'CANT_TELL']);
  const observations = baseline?.observations ?? [];
  const checks = {
    stableThreeRuns: baseline?.stable === true && observations.length === 3,
    enginesExecuted: observations.length > 0 && observations.every(o =>
      o.axe?.execution === 'EXECUTED' && o.alfa?.execution === 'EXECUTED'),
    applicableKnownContrast: observations.length > 0 && observations.every(o =>
      o.axe?.applicable === true && o.alfa?.applicable === true &&
      known.has(o.axe?.outcome) && known.has(o.alfa?.outcome) &&
      o.axe.outcome !== o.alfa.outcome),
    targetUnique: observations.length > 0 && observations.every(o =>
      o.target?.exists === true && o.target?.count === 1),
    baselineProfilePreserved: observations.length > 0 && observations.every(o =>
      profile.evaluate(o).pass === true),
  };
  return { eligible: Object.values(checks).every(Boolean), checks };
}

export function analyseTransfer({baseline, engineOnly, profileGated, engineFinal, gatedFinal, profile}) {
  const eligibility = assessBaseline(baseline, profile);
  let divergence = null;
  let matchingRejection = null;
  for (const step of engineOnly.accepted) {
    if (!step.observedTarget || !step.decision?.engineObservationPreserved) continue;
    const candidateProfile = profile.evaluate({target: step.observedTarget});
    if (candidateProfile.pass) continue;
    divergence = {
      pass: step.pass, candidateIndex: step.candidateIndex, operation: step.operation,
      observedTarget: step.observedTarget, observedSignature: step.observedSignature,
      profile: candidateProfile,
    };
    matchingRejection = profileGated.rejected.find(other =>
      other.pass === step.pass && other.candidateIndex === step.candidateIndex &&
      equal(other.operation, step.operation) && equal(other.observedTarget, step.observedTarget) &&
      other.observedSignature === step.observedSignature &&
      other.decision?.reason === 'PROFILE_INVARIANT_VIOLATED') ?? null;
    break;
  }
  const finalStates = result => result?.observations ?? [];
  const engineStates = finalStates(engineFinal);
  const gatedStates = finalStates(gatedFinal);
  const baselineObservation = baseline.representative;
  const beforeDivergence = trace => trace.accepted
    .filter(step => step.pass < divergence.pass)
    .map(step => ({pass:step.pass, candidateIndex:step.candidateIndex,
      operation:step.operation, target:step.observedTarget, signature:step.observedSignature}));
  const checks = {
    eligibleBaseline: eligibility.eligible,
    stableEngineOnlyFinal: engineFinal?.stable === true && engineStates.length === 3,
    stableGatedFinal: gatedFinal?.stable === true && gatedStates.length === 3,
    engineObservationsPreserved: engineStates.length > 0 && engineStates.every(o => sameEngineObservation(baselineObservation, o)),
    gatedObservationsPreserved: gatedStates.length > 0 && gatedStates.every(o => sameEngineObservation(baselineObservation, o)),
    engineOnlyProfileViolated: engineStates.length > 0 && engineStates.every(o => profile.evaluate(o).pass === false),
    gatedProfilePreserved: gatedStates.length > 0 && gatedStates.every(o => profile.evaluate(o).pass === true),
    sameCandidateDivergence: Boolean(divergence && matchingRejection),
    sameAcceptedPrefix: Boolean(divergence) && equal(beforeDivergence(engineOnly), beforeDivergence(profileGated)),
  };
  return {
    status: !eligibility.eligible ? 'INELIGIBLE' :
      Object.values(checks).every(Boolean) ? 'PATTERN_OBSERVED' : 'PATTERN_NOT_OBSERVED',
    eligibility, checks, firstOracleDivergence: divergence,
    matchedProfileGatedDecision: matchingRejection,
    engineOnly: {stats:engineOnly.stats, checks:engineOnly.checks,
      finalProfileChecks:engineStates.map(o => profile.evaluate(o))},
    profileGated: {stats:profileGated.stats, checks:profileGated.checks,
      finalProfileChecks:gatedStates.map(o => profile.evaluate(o))},
  };
}
