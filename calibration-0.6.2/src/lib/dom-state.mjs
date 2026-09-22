export async function captureTargetDomState(page, selector) {
  return page.evaluate((sel) => {
    const nodes = [...document.querySelectorAll(sel)];
    const target = nodes[0] ?? null;
    if (!target) {
      return {
        selector: sel,
        exists: false,
        count: nodes.length,
      };
    }

    const hiddenAncestor = target.closest(
      "[aria-hidden='true'],[hidden],[inert]",
    );

    const style = getComputedStyle(target);
    const table = target.closest("table");
    const row = target.closest("tr");
    const sameRowDataCells = row
      ? [...row.children].filter((el) => {
          const tag = el.tagName.toLowerCase();
          const role = el.getAttribute("role");
          return tag === "td" || role === "cell" || role === "gridcell";
        })
      : [];

    const allHeaderCandidates = table
      ? [...table.querySelectorAll("th,[role='rowheader'],[role='columnheader']")]
      : [];

    const headersRaw = target.getAttribute("headers") ?? "";
    const headerTokens = headersRaw.trim() ? headersRaw.trim().split(/\s+/) : [];
    const resolvedHeaders = headerTokens.map((id) => {
      const el = document.getElementById(id);
      return {
        id,
        exists: Boolean(el),
        tag: el?.tagName?.toLowerCase() ?? null,
        sameTable: Boolean(el && table && el.closest("table") === table),
        text: el?.textContent?.trim() ?? null,
      };
    });

    const labelRaw = target.getAttribute("aria-labelledby") ?? "";
    const labelTokens = labelRaw.trim() ? labelRaw.trim().split(/\s+/) : [];
    const resolvedLabels = labelTokens.map((id) => {
      const el = document.getElementById(id);
      return {
        id,
        exists: Boolean(el),
        text: el?.textContent?.trim() ?? null,
      };
    });

    return {
      selector: sel,
      exists: true,
      count: nodes.length,
      tag: target.tagName.toLowerCase(),
      id: target.id || null,
      explicitRole: target.getAttribute("role"),
      text: target.textContent?.trim() ?? "",
      ariaHiddenAncestor: Boolean(hiddenAncestor),
      hiddenAncestorTag: hiddenAncestor?.tagName?.toLowerCase() ?? null,
      computed: {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
      },
      headers: {
        raw: headersRaw,
        tokens: headerTokens,
        resolved: resolvedHeaders,
      },
      labelledby: {
        raw: labelRaw,
        tokens: labelTokens,
        resolved: resolvedLabels,
      },
      table: table ? {
        exists: true,
        rowCount: table.rows?.length ?? table.querySelectorAll("tr").length,
        targetRowIndex: row ? [...table.querySelectorAll("tr")].indexOf(row) : -1,
        sameRowDataCellCount: sameRowDataCells.length,
        headerCandidateCount: allHeaderCandidates.length,
      } : { exists: false },
    };
  }, selector);
}

export async function captureTargetAxState(page, selector) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send("Accessibility.enable");
    const { root } = await client.send("DOM.getDocument", {
      depth: -1,
      pierce: true,
    });
    const { nodeId } = await client.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector,
    });

    if (!nodeId) {
      return {
        available: true,
        foundInDom: false,
        ignored: null,
        role: null,
        name: null,
      };
    }

    const { nodes } = await client.send("Accessibility.getPartialAXTree", {
      nodeId,
      fetchRelatives: false,
    });
    const node = nodes?.[0] ?? null;
    if (!node) {
      return {
        available: true,
        foundInDom: true,
        ignored: true,
        role: null,
        name: null,
        reason: "CDP returned no AX node for DOM target",
      };
    }

    return {
      available: true,
      foundInDom: true,
      ignored: Boolean(node.ignored),
      role: node.role?.value ?? null,
      name: node.name?.value ?? "",
      ignoredReasons: node.ignoredReasons ?? [],
    };
  } catch (error) {
    return {
      available: false,
      foundInDom: null,
      ignored: null,
      role: null,
      name: null,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await client.detach().catch(() => {});
  }
}
