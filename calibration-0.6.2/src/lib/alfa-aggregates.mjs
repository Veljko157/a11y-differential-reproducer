function numeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function collectionSize(collection) {
  if (!collection) return 0;
  if (typeof collection.size === "number") return collection.size;
  if (typeof collection.size === "function") {
    try {
      const n = collection.size();
      if (Number.isFinite(Number(n))) return Number(n);
    } catch {}
  }
  if (Array.isArray(collection)) return collection.length;
  try { return Array.from(collection).length; } catch {}
  return 0;
}

function hasAggregateFields(value) {
  if (!value || (typeof value !== "object" && typeof value !== "function")) return false;
  return "failed" in value || "passed" in value || "cantTell" in value;
}

export function unwrapAggregate(value) {
  if (hasAggregateFields(value)) return value;

  // Some Alfa collection materialisations may expose map-like [key, value]
  // entries even though the collection's own filter callback receives the
  // aggregate value. Prefer whichever tuple member actually has aggregate
  // fields instead of silently reading undefined as zero.
  if (Array.isArray(value)) {
    for (const item of value) {
      if (hasAggregateFields(item)) return item;
    }
  }

  for (const key of ["value", "aggregate", "result"]) {
    if (hasAggregateFields(value?.[key])) return value[key];
  }

  return value;
}

function directBucketCount(collection, field) {
  if (!collection || typeof collection.filter !== "function") return null;
  try {
    // This is the access pattern documented by Siteimprove for
    // resultAggregates: result.resultAggregates.filter(a => a.failed > 0).size
    const filtered = collection.filter((candidate) => {
      const aggregate = unwrapAggregate(candidate);
      return numeric(aggregate?.[field]) > 0;
    });
    return collectionSize(filtered);
  } catch {
    return null;
  }
}

function materialize(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.toArray === "function") {
    try {
      const array = collection.toArray();
      if (Array.isArray(array)) return array;
      try { return Array.from(array); } catch {}
    } catch {}
  }
  try { return Array.from(collection); } catch {}
  return [];
}

function describe(value) {
  const aggregate = unwrapAggregate(value);
  const keys = aggregate && (typeof aggregate === "object" || typeof aggregate === "function")
    ? Object.keys(aggregate)
    : [];
  return {
    containerKind: Array.isArray(value) ? "array-entry" : typeof value,
    constructor: aggregate?.constructor?.name ?? null,
    keys,
    failed: aggregate?.failed ?? null,
    passed: aggregate?.passed ?? null,
    cantTell: aggregate?.cantTell ?? null,
  };
}

export function summarizeAlfaAggregates(collection) {
  const aggregateCount = collectionSize(collection);
  const materialized = materialize(collection);

  let failedAggregates = directBucketCount(collection, "failed");
  let passedAggregates = directBucketCount(collection, "passed");
  let cantTellAggregates = directBucketCount(collection, "cantTell");

  // Fallback only if the collection does not expose the documented filter API.
  if (failedAggregates === null || passedAggregates === null || cantTellAggregates === null) {
    const aggregates = materialized.map(unwrapAggregate);
    failedAggregates = aggregates.filter((a) => numeric(a?.failed) > 0).length;
    passedAggregates = aggregates.filter((a) => numeric(a?.passed) > 0).length;
    cantTellAggregates = aggregates.filter((a) => numeric(a?.cantTell) > 0).length;
  }

  // Numeric totals are diagnostic only. Classification is deliberately based
  // on the original collection's documented filter semantics above.
  const unwrapped = materialized.map(unwrapAggregate);
  const totals = unwrapped.reduce(
    (acc, a) => ({
      failed: acc.failed + numeric(a?.failed),
      passed: acc.passed + numeric(a?.passed),
      cantTell: acc.cantTell + numeric(a?.cantTell),
    }),
    { failed: 0, passed: 0, cantTell: 0 },
  );

  return {
    aggregateCount,
    bucketAggregates: {
      failed: failedAggregates,
      passed: passedAggregates,
      cantTell: cantTellAggregates,
    },
    totals,
    materializedDiagnostics: materialized.map(describe),
  };
}

export function classifyAlfaSummary(summary, { selected = 1, outcomeFiltering = false } = {}) {
  if (selected <= 0) {
    return { outcome: "UNKNOWN", applicable: null, reason: "NOT_SELECTED" };
  }

  if (summary.aggregateCount === 0) {
    return { outcome: "INAPPLICABLE", applicable: false, reason: "NO_AGGREGATE_AFTER_SELECTED_RULE" };
  }

  if (summary.bucketAggregates.failed > 0) {
    return { outcome: "FAIL", applicable: true, reason: null };
  }
  if (summary.bucketAggregates.cantTell > 0) {
    return { outcome: "CANT_TELL", applicable: true, reason: null };
  }
  if (summary.bucketAggregates.passed > 0) {
    return { outcome: "PASS", applicable: true, reason: null };
  }

  const zeroTotals =
    summary.totals.failed === 0 &&
    summary.totals.cantTell === 0 &&
    summary.totals.passed === 0;

  if (!outcomeFiltering && zeroTotals) {
    return { outcome: "INAPPLICABLE", applicable: false, reason: "NO_TARGET_OUTCOMES" };
  }

  return { outcome: "UNKNOWN", applicable: null, reason: "UNCLASSIFIED_NONEMPTY_AGGREGATE" };
}
