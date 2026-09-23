import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { analyseTransfer, assessBaseline } from './analysis.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const CORE = path.join(REPO, 'calibration-0.6.2');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const out = path.join(HERE, 'runs', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
await fs.mkdir(out, {recursive:true});
const saveJson = (name, value) => fs.writeFile(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const manifest = async () => {
  const files = (await fs.readdir(out)).filter(name => name !== 'FILES_SHA256.json').sort();
  const entries = {};
  for (const name of files) entries[name] = sha(await fs.readFile(path.join(out, name)));
  await saveJson('FILES_SHA256.json', entries);
};
let stage = 'integrity';
let browser;
let result = {status:'BLOCKED'};
const metadata = {
  schema:'external-transfer-attempt-v1', startedAt:new Date().toISOString(),
  node:process.version, platform:process.platform, arch:process.arch,
  protocol:'PROTOCOL.md', kind:'New exploratory follow-up; historical summary already known',
  historicalRunRecovered:false,
};
await saveJson('run.json', metadata);

try {
  const text = await fs.readFile(path.join(CORE, 'SOURCE-SHA256.txt'), 'utf8');
  const entries = [];
  for (const line of text.trim().split(/\r?\n/)) {
    const match = /^([a-f0-9]{64})\s+\*?(.+)$/i.exec(line);
    if (!match) throw new Error('Unrecognised source-manifest line');
    const relative = match[2].replaceAll('\\', '/');
    const file = path.resolve(CORE, relative);
    if (!file.startsWith(CORE + path.sep)) throw new Error('Manifest path outside the frozen core');
    const actual = sha(await fs.readFile(file));
    entries.push({file:relative, expected:match[1], actual, matches:actual === match[1]});
  }
  await saveJson('core-integrity.json', entries);
  if (entries.length !== 35 || entries.some(e => !e.matches)) throw new Error('Frozen source integrity check failed');

  stage = 'fixture';
  const source = JSON.parse(await fs.readFile(path.join(HERE,'SOURCE.json'),'utf8'));
  const original = await fs.readFile(path.join(HERE,'fixtures/act-d0f69e-failed-example-2.original.html'));
  if (sha(original) !== source.sourceSha256) throw new Error('External source digest mismatch');
  const html = original.toString('utf8');
  const needle = '<th id="col2">';
  if (html.split(needle).length !== 2 || html.includes('data-act-diff-target')) throw new Error('Unexpected target markup');
  const instrumented = html.replace(needle, '<th id="col2" data-act-diff-target="primary">');
  await fs.writeFile(path.join(out,'source.original.html'),original);
  await fs.writeFile(path.join(out,'input.instrumented.html'),instrumented);
  await saveJson('source.json',{...source, instrumentedSha256:sha(instrumented)});

  stage = 'loading-core';
  const {captureEnvironment} = await import('../../calibration-0.6.2/src/lib/environment.mjs');
  const {launchCalibrationBrowser} = await import('../../calibration-0.6.2/src/lib/browser.mjs');
  const {preflightHero} = await import('../../calibration-0.6.2/src/experiments/exp4.mjs');
  const {evaluateStable} = await import('../../calibration-0.6.2/src/lib/evaluate.mjs');
  const {buildHeroStructuralProfile} = await import('../../calibration-0.6.2/src/lib/profiles.mjs');
  const {greedyReduce} = await import('../../calibration-0.6.2/src/lib/reducer.mjs');
  const {RULES, TARGET_SELECTOR, STABILITY_RUNS} = await import('../../calibration-0.6.2/src/config.mjs');
  if (process.env.HERO_FIXTURE?.trim()) throw new Error('Unset HERO_FIXTURE: this follow-up first checks the unmodified supplied hero fixture');

  stage = 'environment';
  const environment = await captureEnvironment();
  await saveJson('environment.json',environment);
  if (environment.chromium !== '151.0.7922.34') throw new Error('Pinned Chromium build not available');
  browser = await launchCalibrationBrowser();

  stage = 'control-preflight';
  const control = await preflightHero(browser);
  await saveJson('control-preflight.json',control);
  if (!control.ready) {
    result = {status:'CONTROL_PREFLIGHT_FAILED', observed:control.observedSignature, expected:control.expectedSignature};
    process.exitCode = 2;
  } else {
    stage = 'external-baseline';
    const spec = {targetSelector:TARGET_SELECTOR,
      axeRule:RULES.tableHeaderAssignedCells.axe, alfaRule:RULES.tableHeaderAssignedCells.alfa};
    const baseline = await evaluateStable(browser,instrumented,spec,STABILITY_RUNS);
    await saveJson('baseline.json',baseline);
    const profile = buildHeroStructuralProfile(baseline.representative);
    await saveJson('profile.json',{id:profile.id,family:profile.family,rationale:profile.rationale,mustPreserve:profile.mustPreserve});
    const eligible = assessBaseline(baseline,profile);
    if (!eligible.eligible) {
      result = {status:'INELIGIBLE',...eligible,observed:baseline.signatures};
      process.exitCode = 2;
    } else {
      const options = {browser,baselineHtml:instrumented,baselineObservation:baseline.representative,spec,profile};
      stage = 'engine-only-reduction';
      const engineOnly = await greedyReduce({...options,mode:'ENGINE_ONLY'});
      await saveJson('engine-only-trace.json',engineOnly);
      await fs.writeFile(path.join(out,'engine-only.html'),engineOnly.html);
      stage = 'profile-gated-reduction';
      const profileGated = await greedyReduce({...options,mode:'PROFILE_GATED'});
      await saveJson('profile-gated-trace.json',profileGated);
      await fs.writeFile(path.join(out,'profile-gated.html'),profileGated.html);
      stage = 'final-checks';
      const engineFinal = await evaluateStable(browser,engineOnly.html,spec,STABILITY_RUNS);
      const gatedFinal = await evaluateStable(browser,profileGated.html,spec,STABILITY_RUNS);
      await saveJson('final-engine-only.json',engineFinal);
      await saveJson('final-profile-gated.json',gatedFinal);
      result = analyseTransfer({baseline,engineOnly,profileGated,engineFinal,gatedFinal,profile});
      result.observedBaseline = baseline.signatures;
    }
  }
} catch (error) {
  result = {status:'BLOCKED',stage,error:String(error?.message ?? error).replaceAll(REPO,'<repository>')};
  process.exitCode = 2;
} finally {
  if (browser) {
    try { await browser.close(); }
    catch (error) { result.browserCloseError = String(error?.message ?? error); }
  }
  result.completedAt = new Date().toISOString();
  result.historicalRunRecovered = false;
  await saveJson('result.json',result);
  await manifest();
  console.log(JSON.stringify({status:result.status,stage:result.stage,output:out},null,2));
}
