export const Execution = Object.freeze({
  EXECUTED: "EXECUTED",
  NOT_EXECUTED: "NOT_EXECUTED",
  ERROR: "ERROR",
  UNKNOWN: "UNKNOWN",
});

export const Outcome = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  CANT_TELL: "CANT_TELL",
  INAPPLICABLE: "INAPPLICABLE",
  UNKNOWN: "UNKNOWN",
});

export function stateSignature(observation) {
  return `${observation.axe.outcome}|${observation.alfa.outcome}`;
}

export function engineStateKey(engine) {
  return JSON.stringify({
    execution: engine.execution,
    outcome: engine.outcome,
    applicable: engine.applicable,
  });
}

export function engineObservationKey(observation) {
  return JSON.stringify({
    axe: {
      execution: observation.axe.execution,
      outcome: observation.axe.outcome,
      applicable: observation.axe.applicable,
    },
    alfa: {
      execution: observation.alfa.execution,
      outcome: observation.alfa.outcome,
      applicable: observation.alfa.applicable,
    },
    targetIdentity: {
      selector: observation.target.selector,
      exists: observation.target.exists,
      count: observation.target.count,
    },
  });
}

export function sameEngineObservation(a, b) {
  return engineObservationKey(a) === engineObservationKey(b);
}

export function allStableByKey(items, keyFn) {
  if (!items.length) return false;
  const first = keyFn(items[0]);
  return items.every((x) => keyFn(x) === first);
}
