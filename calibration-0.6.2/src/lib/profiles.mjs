function result(id, pass, expected, actual, note) {
  return { id, pass: Boolean(pass), expected, actual, note };
}

export function buildNameLabelProfile(baseline) {
  const b = baseline.target;
  return {
    id: "name-label-v0.1",
    family: "name/label",
    mustPreserve: [
      "unique target marker",
      "semantic button role",
      "accessible name value",
      "aria-labelledby token list",
      "all declared aria-labelledby targets remain resolvable",
    ],
    evaluate(candidate) {
      const c = candidate.target;
      const checks = [
        result("TARGET_UNIQUE", c.exists && c.count === 1, 1, c.count),
        result("AX_ROLE", c.ax?.role === b.ax?.role, b.ax?.role, c.ax?.role),
        result("ACCESSIBLE_NAME", c.ax?.name === b.ax?.name, b.ax?.name, c.ax?.name),
        result(
          "LABELLEDBY_TOKENS",
          JSON.stringify(c.labelledby?.tokens ?? []) === JSON.stringify(b.labelledby?.tokens ?? []),
          b.labelledby?.tokens ?? [],
          c.labelledby?.tokens ?? [],
        ),
        result(
          "LABELLEDBY_RESOLVES",
          (c.labelledby?.resolved ?? []).every((x) => x.exists),
          true,
          c.labelledby?.resolved ?? [],
        ),
      ];
      return { pass: checks.every((x) => x.pass), checks };
    },
  };
}

export function buildVisibilityProfile(baseline) {
  const b = baseline.target;
  return {
    id: "visibility-applicability-v0.1",
    family: "visibility/applicability",
    mustPreserve: [
      "unique target marker",
      "aria-hidden/hidden/inert ancestor state",
      "AX ignored/exposed state",
      "per-engine applicability (enforced separately by engine oracle)",
    ],
    evaluate(candidate) {
      const c = candidate.target;
      const checks = [
        result("TARGET_UNIQUE", c.exists && c.count === 1, 1, c.count),
        result(
          "HIDDEN_ANCESTOR_STATE",
          c.ariaHiddenAncestor === b.ariaHiddenAncestor,
          b.ariaHiddenAncestor,
          c.ariaHiddenAncestor,
        ),
        result(
          "AX_IGNORED_STATE",
          c.ax?.ignored === b.ax?.ignored,
          b.ax?.ignored,
          c.ax?.ignored,
        ),
      ];
      return { pass: checks.every((x) => x.pass), checks };
    },
  };
}

export function buildIdrefProfile(baseline) {
  const b = baseline.target;
  const baselineResolved = b.headers?.resolved ?? [];
  return {
    id: "idref-relationship-v0.1",
    family: "IDREF/relationship",
    mustPreserve: [
      "unique target marker",
      "headers token list",
      "each headers target resolves",
      "each headers target remains in the same table",
      "resolved target element type and text identity",
    ],
    evaluate(candidate) {
      const c = candidate.target;
      const cr = c.headers?.resolved ?? [];
      const checks = [
        result("TARGET_UNIQUE", c.exists && c.count === 1, 1, c.count),
        result(
          "HEADERS_TOKENS",
          JSON.stringify(c.headers?.tokens ?? []) === JSON.stringify(b.headers?.tokens ?? []),
          b.headers?.tokens ?? [],
          c.headers?.tokens ?? [],
        ),
        result(
          "HEADERS_ALL_RESOLVE",
          cr.length === baselineResolved.length && cr.every((x) => x.exists),
          baselineResolved.length,
          cr,
        ),
        result(
          "HEADERS_SAME_TABLE",
          cr.length === baselineResolved.length && cr.every((x) => x.sameTable),
          true,
          cr.map((x) => x.sameTable),
        ),
        result(
          "HEADERS_RESOLVED_IDENTITY",
          JSON.stringify(cr.map((x) => ({ id: x.id, tag: x.tag, text: x.text }))) ===
            JSON.stringify(baselineResolved.map((x) => ({ id: x.id, tag: x.tag, text: x.text }))),
          baselineResolved.map((x) => ({ id: x.id, tag: x.tag, text: x.text })),
          cr.map((x) => ({ id: x.id, tag: x.tag, text: x.text })),
        ),
      ];
      return { pass: checks.every((x) => x.pass), checks };
    },
  };
}

export function buildHeroStructuralProfile(baseline) {
  const b = baseline.target;
  return {
    id: "alfa-1883-rowheader-structure-v0.1",
    family: "structural/set-based",
    rationale: [
      "This is a configured reproduction-validity contract for the #1883-style case.",
      "It is not a claim that ACT d0f69e requires a non-empty header name.",
      "The contract preserves the explicit rowheader case identity and the table relation being debugged.",
    ],
    mustPreserve: [
      "unique target marker",
      "target remains a th element",
      "explicit role=rowheader remains present",
      "AX role remains rowheader",
      "target accessible-name value remains the baseline case identity",
      "target remains in a table",
      "same number of data-cell witnesses in the target row",
      "same number of header candidates in the target table",
    ],
    evaluate(candidate) {
      const c = candidate.target;
      const checks = [
        result("TARGET_UNIQUE", c.exists && c.count === 1, 1, c.count),
        result("TARGET_TAG", c.tag === b.tag, b.tag, c.tag),
        result("EXPLICIT_ROLE", c.explicitRole === b.explicitRole, b.explicitRole, c.explicitRole),
        result("AX_ROLE", c.ax?.role === b.ax?.role, b.ax?.role, c.ax?.role),
        result("ACCESSIBLE_NAME", c.ax?.name === b.ax?.name, b.ax?.name, c.ax?.name,
          "case-identity predicate; not asserted as an ACT d0f69e expectation"),
        result("TABLE_EXISTS", c.table?.exists === true, true, c.table?.exists),
        result(
          "TARGET_ROW_DATA_CELL_COUNT",
          c.table?.sameRowDataCellCount === b.table?.sameRowDataCellCount,
          b.table?.sameRowDataCellCount,
          c.table?.sameRowDataCellCount,
        ),
        result(
          "TABLE_HEADER_CANDIDATE_COUNT",
          c.table?.headerCandidateCount === b.table?.headerCandidateCount,
          b.table?.headerCandidateCount,
          c.table?.headerCandidateCount,
        ),
      ];
      return { pass: checks.every((x) => x.pass), checks };
    },
  };
}
