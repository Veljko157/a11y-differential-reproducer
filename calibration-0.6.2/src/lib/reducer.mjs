import { generateOperations, applyOperation, htmlStats } from "./mutate.mjs";
import { screenCandidate } from "./oracles.mjs";

export async function greedyReduce({
  browser,
  baselineHtml,
  baselineObservation,
  spec,
  profile,
  mode,
  maxPasses = 100,
}) {
  let current = baselineHtml;
  const accepted = [];
  const rejected = [];
  let checks = 0;

  for (let pass = 1; pass <= maxPasses; pass += 1) {
    const operations = await generateOperations(browser, current, spec.targetSelector);
    let changed = false;

    for (let index = 0; index < operations.length; index += 1) {
      const op = operations[index];
      const candidate = await applyOperation(browser, current, op);
      if (!candidate || candidate === current) continue;

      checks += 1;
      const screened = await screenCandidate({
        browser,
        html: candidate,
        spec,
        baselineObservation,
        profile,
        mode,
      });

      const record = {
        pass,
        candidateIndex: index,
        operation: op,
        accept: screened.accept,
        stable: screened.stable,
        decision: screened.decision,
        observedSignature: screened.first?.signature ?? null,
        observedTarget: screened.first?.target ?? null,
      };

      if (screened.accept) {
        const beforeStats = await htmlStats(browser, current);
        const afterStats = await htmlStats(browser, candidate);
        accepted.push({ ...record, beforeStats, afterStats });
        current = candidate;
        changed = true;
        break; // restart from the beginning, deterministic greedy search
      } else {
        rejected.push(record);
      }
    }

    if (!changed) break;
  }

  return {
    mode,
    html: current,
    checks,
    accepted,
    rejected,
    stats: {
      before: await htmlStats(browser, baselineHtml),
      after: await htmlStats(browser, current),
    },
  };
}
