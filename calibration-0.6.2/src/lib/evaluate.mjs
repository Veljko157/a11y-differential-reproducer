import { runAxeRule } from "./axe.mjs";
import { runAlfaRule } from "./alfa.mjs";
import { newCalibrationPage, loadHtml } from "./browser.mjs";
import { captureTargetDomState, captureTargetAxState } from "./dom-state.mjs";
import {
  allStableByKey,
  engineObservationKey,
  stateSignature,
} from "./state.mjs";

export async function evaluateOnce(browser, html, spec) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);

    const target = await captureTargetDomState(page, spec.targetSelector);
    const ax = await captureTargetAxState(page, spec.targetSelector);

    // Keep both engines on the same rendered page state.
    const axe = await runAxeRule(page, spec.axeRule);
    const alfa = await runAlfaRule(page, spec.alfaRule);

    const observation = {
      axe,
      alfa,
      target: { ...target, ax },
    };
    return {
      ...observation,
      signature: stateSignature(observation),
      engineObservationKey: engineObservationKey(observation),
    };
  } finally {
    await context.close();
  }
}

export async function evaluateStable(browser, html, spec, runs = 3) {
  const observations = [];
  for (let i = 0; i < runs; i += 1) {
    observations.push(await evaluateOnce(browser, html, spec));
  }

  const stable = allStableByKey(observations, (x) => x.engineObservationKey);
  const representative = observations[0] ?? null;

  return {
    stable,
    runs: observations.length,
    representative,
    observations,
    signatures: observations.map((x) => x.signature),
    engineObservationKeys: observations.map((x) => x.engineObservationKey),
  };
}
