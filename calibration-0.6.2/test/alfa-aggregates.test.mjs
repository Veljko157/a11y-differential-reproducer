import test from "node:test";
import assert from "node:assert/strict";
import { summarizeAlfaAggregates, unwrapAggregate, classifyAlfaSummary } from "../src/lib/alfa-aggregates.mjs";

class FakeAlfaCollection {
  constructor(values, tupleMaterialisation = false) {
    this.values = values;
    this.tupleMaterialisation = tupleMaterialisation;
    this.size = values.length;
  }

  filter(predicate) {
    return new FakeAlfaCollection(this.values.filter(predicate), this.tupleMaterialisation);
  }

  toArray() {
    if (!this.tupleMaterialisation) return [...this.values];
    return this.values.map((value, index) => [`rule-${index}`, value]);
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }
}

test("Alfa aggregate classifier follows documented collection filter semantics", () => {
  const collection = new FakeAlfaCollection([
    { failed: 1, passed: 0, cantTell: 0 },
  ]);
  const s = summarizeAlfaAggregates(collection);
  assert.equal(s.aggregateCount, 1);
  assert.equal(s.bucketAggregates.failed, 1);
  assert.equal(s.bucketAggregates.passed, 0);
  assert.equal(s.bucketAggregates.cantTell, 0);
});

test("Alfa aggregate classifier is not confused by tuple-like toArray materialisation", () => {
  const collection = new FakeAlfaCollection([
    { failed: 1, passed: 0, cantTell: 0 },
  ], true);
  const s = summarizeAlfaAggregates(collection);
  assert.equal(s.bucketAggregates.failed, 1);
});

test("unwrapAggregate finds the aggregate value in a map-like entry", () => {
  const aggregate = { failed: 0, passed: 1, cantTell: 0 };
  assert.equal(unwrapAggregate(["rule-key", aggregate]), aggregate);
});

test("Alfa aggregate classifier distinguishes PASS and CANT_TELL buckets", () => {
  const pass = summarizeAlfaAggregates(new FakeAlfaCollection([
    { failed: 0, passed: 2, cantTell: 0 },
  ]));
  const cantTell = summarizeAlfaAggregates(new FakeAlfaCollection([
    { failed: 0, passed: 0, cantTell: 1 },
  ]));
  assert.equal(pass.bucketAggregates.passed, 1);
  assert.equal(cantTell.bucketAggregates.cantTell, 1);
});


test("selected Alfa rule with non-empty zero-outcome aggregate is INAPPLICABLE when no outcome filter is configured", () => {
  const summary = {
    aggregateCount: 1,
    bucketAggregates: { failed: 0, passed: 0, cantTell: 0 },
    totals: { failed: 0, passed: 0, cantTell: 0 },
  };
  assert.deepEqual(classifyAlfaSummary(summary, { selected: 1, outcomeFiltering: false }), {
    outcome: "INAPPLICABLE",
    applicable: false,
    reason: "NO_TARGET_OUTCOMES",
  });
});

test("zero-outcome aggregate remains UNKNOWN if an outcome filter could have removed results", () => {
  const summary = {
    aggregateCount: 1,
    bucketAggregates: { failed: 0, passed: 0, cantTell: 0 },
    totals: { failed: 0, passed: 0, cantTell: 0 },
  };
  assert.deepEqual(classifyAlfaSummary(summary, { selected: 1, outcomeFiltering: true }), {
    outcome: "UNKNOWN",
    applicable: null,
    reason: "UNCLASSIFIED_NONEMPTY_AGGREGATE",
  });
});
