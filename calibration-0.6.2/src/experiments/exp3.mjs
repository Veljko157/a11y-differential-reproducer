import { TARGET_SELECTOR, RULES } from "../config.mjs";
import { FIXTURES } from "../fixtures.mjs";
import { mutateFixed } from "../lib/mutate.mjs";
import { runControlledProbe } from "../lib/controlled.mjs";
import { buildIdrefProfile } from "../lib/profiles.mjs";
import { writeJson, writeText } from "../lib/io.mjs";

export async function runExp3(browser) {
  const baselineHtml = FIXTURES.exp3.baseline;
  const safeHtml = await mutateFixed(browser, baselineHtml, {
    type: "remove", selector: "#safe-noise",
  });
  const invalidHtml = await mutateFixed(browser, baselineHtml, {
    type: "remove", selector: "#price-header",
  });

  const spec = {
    targetSelector: TARGET_SELECTOR,
    axeRule: RULES.headers.axe,
    alfaRule: RULES.headers.alfa,
  };

  const report = await runControlledProbe({
    browser,
    id: "EXP3",
    family: "IDREF/relationship",
    act: RULES.headers.act,
    spec,
    baselineHtml,
    safeHtml,
    invalidHtml,
    profileBuilder: buildIdrefProfile,
    expected: {
      hypothesis: "A syntactically retained headers attribute is insufficient when its referenced relationship no longer resolves.",
      baselineSignature: "PASS|PASS",
      safeSignature: "PASS|PASS",
      invalidSignature: "FAIL|FAIL",
    },
  });

  await writeText("03-idref-relationship-baseline.html", baselineHtml);
  await writeText("03-idref-relationship-safe.html", safeHtml);
  await writeText("03-idref-relationship-invalid.html", invalidHtml);
  await writeJson("03-idref-relationship.json", report);
  return report;
}
