import { TARGET_SELECTOR, RULES } from "../config.mjs";
import { FIXTURES } from "../fixtures.mjs";
import { mutateFixed } from "../lib/mutate.mjs";
import { runControlledProbe } from "../lib/controlled.mjs";
import { buildVisibilityProfile } from "../lib/profiles.mjs";
import { writeJson, writeText } from "../lib/io.mjs";

export async function runExp2(browser) {
  const baselineHtml = FIXTURES.exp2.baseline;
  const safeHtml = await mutateFixed(browser, baselineHtml, {
    type: "remove", selector: "#safe-noise",
  });
  const invalidHtml = await mutateFixed(browser, baselineHtml, {
    type: "unwrap", selector: "#hidden-wrapper",
  });

  const spec = {
    targetSelector: TARGET_SELECTOR,
    axeRule: RULES.name.axe,
    alfaRule: RULES.name.alfa,
  };

  const report = await runControlledProbe({
    browser,
    id: "EXP2",
    family: "visibility/applicability",
    act: RULES.name.act,
    spec,
    baselineHtml,
    safeHtml,
    invalidHtml,
    profileBuilder: buildVisibilityProfile,
    expected: {
      hypothesis: "Applicability/exposure state must not be collapsed into an ordinary PASS/FAIL observation.",
      baselineSignature: "INAPPLICABLE|INAPPLICABLE",
      safeSignature: "INAPPLICABLE|INAPPLICABLE",
      invalidSignature: "FAIL|FAIL",
    },
  });

  await writeText("02-visibility-applicability-baseline.html", baselineHtml);
  await writeText("02-visibility-applicability-safe.html", safeHtml);
  await writeText("02-visibility-applicability-invalid.html", invalidHtml);
  await writeJson("02-visibility-applicability.json", report);
  return report;
}
