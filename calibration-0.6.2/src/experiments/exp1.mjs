import { TARGET_SELECTOR, RULES } from "../config.mjs";
import { FIXTURES } from "../fixtures.mjs";
import { mutateFixed } from "../lib/mutate.mjs";
import { runControlledProbe } from "../lib/controlled.mjs";
import { buildNameLabelProfile } from "../lib/profiles.mjs";
import { writeJson, writeText } from "../lib/io.mjs";

export async function runExp1(browser) {
  const baselineHtml = FIXTURES.exp1.baseline;
  const safeHtml = await mutateFixed(browser, baselineHtml, {
    type: "remove", selector: "#safe-noise",
  });
  const invalidHtml = await mutateFixed(browser, baselineHtml, {
    type: "remove", selector: "#remote-label",
  });

  const spec = {
    targetSelector: TARGET_SELECTOR,
    axeRule: RULES.name.axe,
    alfaRule: RULES.name.alfa,
  };

  const report = await runControlledProbe({
    browser,
    id: "EXP1",
    family: "name/label",
    act: RULES.name.act,
    spec,
    baselineHtml,
    safeHtml,
    invalidHtml,
    profileBuilder: buildNameLabelProfile,
    expected: {
      hypothesis: "A remote accessible-name dependency is part of the declared reproduction state.",
      baselineSignature: "PASS|PASS",
      safeSignature: "PASS|PASS",
      invalidSignature: "FAIL|FAIL",
    },
  });

  await writeText("01-name-label-baseline.html", baselineHtml);
  await writeText("01-name-label-safe.html", safeHtml);
  await writeText("01-name-label-invalid.html", invalidHtml);
  await writeJson("01-name-label.json", report);
  return report;
}
