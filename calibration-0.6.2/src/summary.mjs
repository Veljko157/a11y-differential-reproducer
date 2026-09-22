import { writeJson, writeText } from "./lib/io.mjs";

function yes(value) {
  return value === true ? "YES" : value === false ? "NO" : "N/A";
}

export async function writeSummary({ environment, preflight, exp1, exp2, exp3, exp4 }) {
  const summary = {
    generatedAt: new Date().toISOString(),
    environment,
    preflight: {
      ready: preflight?.ready ?? null,
      expectedSignature: preflight?.expectedSignature ?? null,
      observedSignature: preflight?.observedSignature ?? null,
    },
    controlled: {
      exp1: exp1?.expectedPatternObserved ?? null,
      exp2: exp2?.expectedPatternObserved ?? null,
      exp3: exp3?.expectedPatternObserved ?? null,
    },
    hero: {
      primaryPatternObserved: exp4?.primaryPatternObserved ?? null,
      firstOracleDivergence: exp4?.firstOracleDivergence ?? null,
      engineOnlyAfter: exp4?.engineOnly?.stats?.after ?? null,
      profileGatedAfter: exp4?.profileGated?.stats?.after ?? null,
    },
    claimSupportedByThisRun:
      Boolean(
        exp4?.primaryPatternObserved &&
        exp1?.expectedPatternObserved &&
        exp2?.expectedPatternObserved &&
        exp3?.expectedPatternObserved
      ),
    scopeNote:
      "This is calibration/feasibility evidence only. No universal generalization is claimed.",
  };

  const md = `# Calibration 0.6.0 summary

Generated: ${summary.generatedAt}

## Preflight

- ready: **${yes(summary.preflight.ready)}**
- expected hero signature: \`${summary.preflight.expectedSignature}\`
- observed hero signature: \`${summary.preflight.observedSignature}\`

## Controlled probes

- EXP1 name/label expected pattern: **${yes(summary.controlled.exp1)}**
- EXP2 visibility/applicability expected pattern: **${yes(summary.controlled.exp2)}**
- EXP3 IDREF/relationship expected pattern: **${yes(summary.controlled.exp3)}**

## Hero experiment

- primary oracle-divergence pattern observed: **${yes(summary.hero.primaryPatternObserved)}**
- first engine-only ACCEPT / profile REJECT candidate: ${
    summary.hero.firstOracleDivergence
      ? `\`${summary.hero.firstOracleDivergence.operation?.label ?? "unknown"}\``
      : "none observed"
  }
- engine-only final stats: \`${JSON.stringify(summary.hero.engineOnlyAfter)}\`
- profile-gated final stats: \`${JSON.stringify(summary.hero.profileGatedAfter)}\`

## Frozen interpretation

The claim is supported by this run only if the controlled probes behave as predeclared **and**
the hero experiment produces a concrete candidate accepted by the engine-observation oracle
while violating the configured profile, with the profile-gated arm preserving that profile.

**Claim supported by this run: ${yes(summary.claimSupportedByThisRun)}**

A NO result is retained. Do not add a fifth experiment to force a positive result.
`;

  await writeJson("99-summary.json", summary);
  await writeText("99-summary.md", md);
  return summary;
}
