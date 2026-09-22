import test from "node:test";
import assert from "node:assert/strict";
import {
  sameEngineObservation,
  engineObservationKey,
  Execution,
  Outcome,
} from "../src/lib/state.mjs";
import {
  buildNameLabelProfile,
  buildVisibilityProfile,
  buildIdrefProfile,
  buildHeroStructuralProfile,
} from "../src/lib/profiles.mjs";

function obs(overrides = {}) {
  return {
    axe: {
      execution: Execution.EXECUTED,
      outcome: Outcome.PASS,
      applicable: true,
    },
    alfa: {
      execution: Execution.EXECUTED,
      outcome: Outcome.FAIL,
      applicable: true,
    },
    target: {
      selector: "[data-act-diff-target='primary']",
      exists: true,
      count: 1,
      tag: "th",
      explicitRole: "rowheader",
      text: "a",
      ariaHiddenAncestor: false,
      headers: { tokens: [], resolved: [] },
      labelledby: { tokens: [], resolved: [] },
      table: {
        exists: true,
        sameRowDataCellCount: 2,
        headerCandidateCount: 1,
      },
      ax: { role: "rowheader", name: "a", ignored: false },
      ...overrides,
    },
  };
}

test("engine observation excludes semantic profile fields but includes engine state and target cardinality", () => {
  const a = obs();
  const b = obs({ ax: { role: "rowheader", name: "", ignored: false } });
  assert.equal(sameEngineObservation(a, b), true);
  assert.equal(engineObservationKey(a), engineObservationKey(b));
});

test("engine observation changes when one engine outcome changes", () => {
  const a = obs();
  const b = structuredClone(a);
  b.alfa.outcome = Outcome.PASS;
  assert.equal(sameEngineObservation(a, b), false);
});

test("hero profile rejects accessible-name drift that engine observation intentionally does not encode", () => {
  const base = obs();
  const profile = buildHeroStructuralProfile(base);
  const changed = obs({ ax: { role: "rowheader", name: "", ignored: false } });
  assert.equal(profile.evaluate(changed).pass, false);
});

test("hero profile rejects structural witness-count drift", () => {
  const base = obs();
  const profile = buildHeroStructuralProfile(base);
  const changed = obs({
    table: { exists: true, sameRowDataCellCount: 1, headerCandidateCount: 1 },
  });
  assert.equal(profile.evaluate(changed).pass, false);
});

test("name profile rejects broken remote label relationship", () => {
  const base = {
    ...obs(),
    target: {
      ...obs().target,
      tag: "button",
      ax: { role: "button", name: "Save", ignored: false },
      labelledby: {
        tokens: ["remote-label"],
        resolved: [{ id: "remote-label", exists: true, text: "Save" }],
      },
    },
  };
  const profile = buildNameLabelProfile(base);
  const changed = structuredClone(base);
  changed.target.ax.name = "";
  changed.target.labelledby.resolved[0].exists = false;
  assert.equal(profile.evaluate(changed).pass, false);
});

test("visibility profile rejects exposure-state drift", () => {
  const base = {
    ...obs(),
    target: {
      ...obs().target,
      ariaHiddenAncestor: true,
      ax: { role: null, name: null, ignored: true },
    },
  };
  const profile = buildVisibilityProfile(base);
  const changed = structuredClone(base);
  changed.target.ariaHiddenAncestor = false;
  changed.target.ax.ignored = false;
  assert.equal(profile.evaluate(changed).pass, false);
});

test("IDREF profile rejects unresolved header", () => {
  const base = {
    ...obs(),
    target: {
      ...obs().target,
      headers: {
        tokens: ["price-header"],
        resolved: [{
          id: "price-header", exists: true, tag: "th", sameTable: true, text: "Price",
        }],
      },
    },
  };
  const profile = buildIdrefProfile(base);
  const changed = structuredClone(base);
  changed.target.headers.resolved[0].exists = false;
  assert.equal(profile.evaluate(changed).pass, false);
});
