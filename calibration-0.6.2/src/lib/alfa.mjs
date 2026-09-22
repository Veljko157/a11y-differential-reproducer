import { Audit, Rules } from "@siteimprove/alfa-test-utils";
import { Playwright } from "@siteimprove/alfa-playwright";
import { Execution, Outcome } from "./state.mjs";
import { summarizeAlfaAggregates, classifyAlfaSummary } from "./alfa-aggregates.mjs";

export async function runAlfaRule(page, ruleNumber) {
  const selection = { visited: 0, selected: 0 };
  try {
    const document = await page.evaluateHandle(() => window.document);
    const alfaPage = await Playwright.toPage(document);

    // Official Alfa API: cherry-pick by the numeric part of SIA-RXX.
    const officialPick = Rules.cherryPickFilter(ruleNumber);
    const include = (rule) => {
      selection.visited += 1;
      const selected = Boolean(officialPick(rule));
      if (selected) selection.selected += 1;
      return selected;
    };

    const result = await Audit.run(alfaPage, { rules: { include } });
    const summary = summarizeAlfaAggregates(result.resultAggregates);

    if (selection.selected === 0) {
      return {
        engine: "alfa",
        ruleNumber,
        ruleUri: `https://alfa.siteimprove.com/rules/sia-r${ruleNumber}`,
        execution: Execution.NOT_EXECUTED,
        outcome: Outcome.UNKNOWN,
        applicable: null,
        selection,
        ...summary,
        reason: "requested rule was not selected by Alfa rule registry/filter",
      };
    }

    if (summary.aggregateCount === 0) {
      return {
        engine: "alfa",
        ruleNumber,
        ruleUri: `https://alfa.siteimprove.com/rules/sia-r${ruleNumber}`,
        execution: Execution.EXECUTED,
        outcome: Outcome.INAPPLICABLE,
        applicable: false,
        selection,
        ...summary,
      };
    }

    const classification = classifyAlfaSummary(summary, {
      selected: selection.selected,
      outcomeFiltering: false,
    });

    return {
      engine: "alfa",
      ruleNumber,
      ruleUri: `https://alfa.siteimprove.com/rules/sia-r${ruleNumber}`,
      execution: Execution.EXECUTED,
      outcome: classification.outcome,
      applicable: classification.applicable,
      selection,
      ...summary,
      reason:
        classification.reason === "NO_TARGET_OUTCOMES"
          ? "requested rule was selected, but produced no failed/passed/cantTell outcomes; no outcome filter is configured"
          : classification.reason === "UNCLASSIFIED_NONEMPTY_AGGREGATE"
            ? "non-empty Alfa aggregate could not be classified through documented failed/passed/cantTell predicates"
            : undefined,
    };
  } catch (error) {
    return {
      engine: "alfa",
      ruleNumber,
      ruleUri: `https://alfa.siteimprove.com/rules/sia-r${ruleNumber}`,
      execution: Execution.ERROR,
      outcome: Outcome.UNKNOWN,
      applicable: null,
      selection,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
