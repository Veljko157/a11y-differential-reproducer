import { evaluateStable } from "./evaluate.mjs";
import { sameEngineObservation } from "./state.mjs";

export async function runControlledProbe({
  browser,
  id,
  family,
  act,
  spec,
  baselineHtml,
  safeHtml,
  invalidHtml,
  profileBuilder,
  expected,
}) {
  const baseline = await evaluateStable(browser, baselineHtml, spec);
  const safe = await evaluateStable(browser, safeHtml, spec);
  const invalid = await evaluateStable(browser, invalidHtml, spec);

  const profile = baseline.representative
    ? profileBuilder(baseline.representative)
    : null;

  const safeProfile = profile && safe.representative
    ? profile.evaluate(safe.representative)
    : null;
  const invalidProfile = profile && invalid.representative
    ? profile.evaluate(invalid.representative)
    : null;

  const observed = {
    baselineSignature: baseline.representative?.signature ?? null,
    safeSignature: safe.representative?.signature ?? null,
    invalidSignature: invalid.representative?.signature ?? null,
    baselineStable: baseline.stable,
    safeStable: safe.stable,
    invalidStable: invalid.stable,
    safeEngineObservationPreserved:
      Boolean(baseline.representative && safe.representative) &&
      sameEngineObservation(baseline.representative, safe.representative),
    safeProfilePreserved: safeProfile?.pass ?? null,
    invalidProfilePreserved: invalidProfile?.pass ?? null,
  };

  const expectedPatternObserved =
    baseline.stable &&
    safe.stable &&
    invalid.stable &&
    observed.baselineSignature === expected.baselineSignature &&
    observed.safeSignature === expected.safeSignature &&
    observed.invalidSignature === expected.invalidSignature &&
    observed.safeEngineObservationPreserved === true &&
    observed.safeProfilePreserved === true &&
    observed.invalidProfilePreserved === false;

  return {
    id,
    family,
    act,
    hypothesis: expected.hypothesis,
    predeclaredExpectedPattern: expected,
    observed,
    expectedPatternObserved,
    profile: profile ? {
      id: profile.id,
      family: profile.family,
      mustPreserve: profile.mustPreserve,
    } : null,
    profileChecks: {
      safe: safeProfile,
      invalid: invalidProfile,
    },
    baseline,
    safe,
    invalid,
  };
}
