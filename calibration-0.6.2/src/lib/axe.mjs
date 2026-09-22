import AxeBuilder from "@axe-core/playwright";
import { Execution, Outcome } from "./state.mjs";

function hitsForRule(bucket, ruleId) {
  return (bucket ?? []).filter((x) => x?.id === ruleId);
}

export async function runAxeRule(page, ruleId) {
  try {
    const raw = await new AxeBuilder({ page }).withRules([ruleId]).analyze();
    const membership = {
      violations: hitsForRule(raw.violations, ruleId),
      passes: hitsForRule(raw.passes, ruleId),
      incomplete: hitsForRule(raw.incomplete, ruleId),
      inapplicable: hitsForRule(raw.inapplicable, ruleId),
    };

    const nonEmpty = Object.entries(membership).filter(([, v]) => v.length > 0);
    if (nonEmpty.length !== 1) {
      return {
        engine: "axe",
        ruleId,
        execution: Execution.UNKNOWN,
        outcome: Outcome.UNKNOWN,
        applicable: null,
        reason: nonEmpty.length === 0
          ? "selected rule absent from all four axe result buckets"
          : "selected rule appeared in multiple axe result buckets",
        bucketMembership: Object.fromEntries(
          Object.entries(membership).map(([k, v]) => [k, v.length]),
        ),
      };
    }

    const [bucket, rules] = nonEmpty[0];
    const rule = rules[0];
    const base = {
      engine: "axe",
      ruleId,
      execution: Execution.EXECUTED,
      nodeCount: Array.isArray(rule?.nodes) ? rule.nodes.length : null,
      targets: Array.isArray(rule?.nodes)
        ? rule.nodes.flatMap((n) => Array.isArray(n.target) ? [n.target] : [])
        : [],
      bucket,
    };

    if (bucket === "violations") return { ...base, outcome: Outcome.FAIL, applicable: true };
    if (bucket === "passes") return { ...base, outcome: Outcome.PASS, applicable: true };
    if (bucket === "incomplete") return { ...base, outcome: Outcome.CANT_TELL, applicable: true };
    return { ...base, outcome: Outcome.INAPPLICABLE, applicable: false };
  } catch (error) {
    return {
      engine: "axe",
      ruleId,
      execution: Execution.ERROR,
      outcome: Outcome.UNKNOWN,
      applicable: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
