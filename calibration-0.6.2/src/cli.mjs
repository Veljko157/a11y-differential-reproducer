import process from "node:process";
import { launchCalibrationBrowser } from "./lib/browser.mjs";
import { captureEnvironment } from "./lib/environment.mjs";
import { writeJson } from "./lib/io.mjs";
import { runExp1 } from "./experiments/exp1.mjs";
import { runExp2 } from "./experiments/exp2.mjs";
import { runExp3 } from "./experiments/exp3.mjs";
import { preflightHero, runExp4 } from "./experiments/exp4.mjs";
import { writeSummary } from "./summary.mjs";

function printControlled(report) {
  console.log(`\n=== ${report.id}: ${report.family} ===`);
  console.log(`ACT: ${report.act}`);
  console.log(`baseline: ${report.observed.baselineSignature} stable=${report.observed.baselineStable}`);
  console.log(`safe    : ${report.observed.safeSignature} stable=${report.observed.safeStable}`);
  console.log(`invalid : ${report.observed.invalidSignature} stable=${report.observed.invalidStable}`);
  console.log(`safe engine observation preserved: ${report.observed.safeEngineObservationPreserved}`);
  console.log(`safe profile preserved           : ${report.observed.safeProfilePreserved}`);
  console.log(`invalid profile preserved        : ${report.observed.invalidProfilePreserved}`);
  console.log(`expected pattern observed         : ${report.expectedPatternObserved}`);
}

function printHero(report) {
  console.log("\n=== EXP4: structural/set-based hero ===");
  console.log(`ACT: ${report.act}`);
  console.log(`baseline: ${report.preflight.observedSignature}`);
  console.log(`engine-only after : ${JSON.stringify(report.engineOnly.stats.after)}`);
  console.log(`profile-gated after: ${JSON.stringify(report.profileGated.stats.after)}`);
  console.log(`engine-only final profile preserved: ${report.engineOnly.finalProfileCheck.pass}`);
  console.log(`profile-gated final profile preserved: ${report.profileGated.finalProfileCheck.pass}`);
  if (report.firstOracleDivergence) {
    console.log(`first oracle divergence: ${report.firstOracleDivergence.operation?.label}`);
  } else {
    console.log("first oracle divergence: NONE");
  }
  console.log(`primary pattern observed: ${report.primaryPatternObserved}`);
}

async function main() {
  const command = process.argv[2] ?? "help";

  if (command === "help") {
    console.log("Commands: preflight | exp1 | exp2 | exp3 | exp4 | controlled | all");
    return;
  }

  const environment = await captureEnvironment();
  await writeJson("00-environment.json", environment);
  console.log("Environment:");
  console.log(JSON.stringify(environment, null, 2));

  const browser = await launchCalibrationBrowser();
  try {
    if (command === "preflight") {
      const pf = await preflightHero(browser);
      await writeJson("00-preflight.json", pf);
      console.log("\n=== PREFLIGHT ===");
      console.log(`hero: ${pf.heroFixture}`);
      console.log(`expected: ${pf.expectedSignature}`);
      console.log(`observed: ${pf.observedSignature}`);
      console.log(`ready: ${pf.ready}`);
      if (!pf.ready) process.exitCode = 2;
      return;
    }

    let exp1 = null;
    let exp2 = null;
    let exp3 = null;
    let exp4 = null;

    if (["exp1", "controlled", "all"].includes(command)) {
      exp1 = await runExp1(browser);
      printControlled(exp1);
      if (command === "exp1") return;
    }
    if (["exp2", "controlled", "all"].includes(command)) {
      exp2 = await runExp2(browser);
      printControlled(exp2);
      if (command === "exp2") return;
    }
    if (["exp3", "controlled", "all"].includes(command)) {
      exp3 = await runExp3(browser);
      printControlled(exp3);
      if (command === "exp3") return;
    }
    if (command === "controlled") return;

    if (["exp4", "all"].includes(command)) {
      const pf = await preflightHero(browser);
      await writeJson("00-preflight.json", pf);
      if (!pf.ready) {
        console.error("\nPREFLIGHT FAILED. EXP4 WILL NOT RUN.");
        console.error("Do not change the expected signature to fit the result.");
        process.exitCode = 2;
        return;
      }
      exp4 = await runExp4(browser, pf);
      printHero(exp4);
      if (command === "exp4") return;
    }

    if (command === "all") {
      const summary = await writeSummary({
        environment,
        preflight: exp4?.preflight ?? null,
        exp1, exp2, exp3, exp4,
      });
      console.log("\n=== FINAL ===");
      console.log(`claimSupportedByThisRun: ${summary.claimSupportedByThisRun}`);
      return;
    }

    throw new Error(`Unknown command: ${command}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error?.stack ?? String(error));
  process.exitCode = 1;
});
