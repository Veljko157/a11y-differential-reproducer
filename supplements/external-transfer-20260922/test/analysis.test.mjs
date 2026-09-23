import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { analyseTransfer, assessBaseline } from '../analysis.mjs';
import { buildHeroStructuralProfile } from '../../../calibration-0.6.2/src/lib/profiles.mjs';

const read = name => JSON.parse(fs.readFileSync(new URL('../../../calibration-0.6.2/output-frozen-20260906-232212/' + name,import.meta.url),'utf8'));
function recorded() {
  const report = read('04-hero-comparison.json');
  return {baseline:report.preflight.baseline,
    engineOnly:read('04-hero-engine-only-trace.json'),
    profileGated:read('04-hero-profile-gated-trace.json'),
    engineFinal:report.engineOnly.final,gatedFinal:report.profileGated.final,
    profile:buildHeroStructuralProfile(report.preflight.baseline.representative)};
}
test('classifier recovers the recorded calibration divergence; this is not a new engine run',()=> {
  const result=analyseTransfer(recorded());
  assert.equal(result.status,'PATTERN_OBSERVED');
  assert.equal(result.firstOracleDivergence.operation.label,'remove<td>');
});
test('matching an operation label without the actual candidate is insufficient',()=> {
  const input=recorded();
  const original=analyseTransfer(input).firstOracleDivergence;
  const candidate=input.profileGated.rejected.find(s=>s.pass===original.pass && s.candidateIndex===original.candidateIndex);
  candidate.operation.path=[999];
  assert.equal(analyseTransfer(input).status,'PATTERN_NOT_OBSERVED');
});
test('a drifting final profile prevents a positive classification',()=> {
  const input=recorded();
  input.gatedFinal.observations[2].target.table.headerCandidateCount+=1;
  assert.equal(analyseTransfer(input).status,'PATTERN_NOT_OBSERVED');
});
test('a missing engine execution cannot qualify as a disagreement',()=> {
  const input=recorded();
  input.baseline.observations[0].axe.execution='ERROR';
  assert.equal(assessBaseline(input.baseline,input.profile).eligible,false);
});
