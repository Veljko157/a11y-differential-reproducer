import { newCalibrationPage, loadHtml } from "./browser.mjs";

export async function mutateFixed(browser, html, mutation) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);
    await page.evaluate((m) => {
      const el = document.querySelector(m.selector);
      if (!el) throw new Error(`Mutation target not found: ${m.selector}`);
      if (m.type === "remove") {
        el.remove();
      } else if (m.type === "unwrap") {
        el.replaceWith(...el.childNodes);
      } else if (m.type === "clear-text") {
        el.textContent = "";
      } else if (m.type === "remove-attribute") {
        el.removeAttribute(m.attribute);
      } else {
        throw new Error(`Unsupported fixed mutation: ${m.type}`);
      }
    }, mutation);
    return await page.content();
  } finally {
    await context.close();
  }
}

function pathToElement(root, path) {
  let node = root;
  for (const index of path) {
    node = node?.children?.[index] ?? null;
    if (!node) break;
  }
  return node;
}

export async function generateOperations(browser, html, protectedSelector) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);
    return await page.evaluate((protectedSel) => {
      const target = document.querySelector(protectedSel);
      const ops = [];
      const body = document.body;

      function elementPath(el) {
        const path = [];
        let cur = el;
        while (cur && cur !== body) {
          const parent = cur.parentElement;
          if (!parent) return null;
          path.unshift([...parent.children].indexOf(cur));
          cur = parent;
        }
        return cur === body ? path : null;
      }

      function isTargetOrAncestor(el) {
        return Boolean(target && (el === target || el.contains(target)));
      }

      const wrappers = ["main", "section", "div", "header", "footer", "nav", "aside"];
      for (const el of [...document.querySelectorAll(wrappers.join(","))]) {
        const path = elementPath(el);
        if (!path || el === target) continue;
        ops.push({
          type: "unwrap",
          path,
          label: `unwrap<${el.tagName.toLowerCase()}>`,
        });
      }

      // Deterministic DOM-order removals. Ancestors of the target are included:
      // engine/identity oracle must reject them, which is useful evidence.
      for (const el of [...document.body.querySelectorAll("*")]) {
        if (el === target) continue;
        const tag = el.tagName.toLowerCase();
        if (["html", "body", "script", "style"].includes(tag)) continue;
        const path = elementPath(el);
        if (!path) continue;
        ops.push({
          type: "remove",
          path,
          label: `remove<${tag}>`,
          targetAncestor: isTargetOrAncestor(el),
        });
      }

      // Text simplification is deliberately generic and includes the target.
      // The profile, not the reducer, decides whether this is allowed.
      for (const el of [...document.body.querySelectorAll("*")]) {
        if (el.children.length !== 0) continue;
        if (!(el.textContent ?? "").trim()) continue;
        const path = elementPath(el);
        if (!path) continue;
        ops.push({
          type: "clear-text",
          path,
          label: `clear-text<${el.tagName.toLowerCase()}>`,
        });
      }

      // Attribute simplification, excluding the stable experiment marker.
      for (const el of [...document.body.querySelectorAll("*")]) {
        const path = elementPath(el);
        if (!path) continue;
        for (const attr of [...el.attributes]) {
          if (attr.name === "data-act-diff-target") continue;
          if (attr.name === "id" && el === target) continue;
          ops.push({
            type: "remove-attribute",
            path,
            attribute: attr.name,
            label: `remove-attr(${attr.name})<${el.tagName.toLowerCase()}>`,
          });
        }
      }

      return ops;
    }, protectedSelector);
  } finally {
    await context.close();
  }
}

export async function applyOperation(browser, html, op) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);
    const applied = await page.evaluate((operation) => {
      function byPath(root, path) {
        let node = root;
        for (const index of path) {
          node = node?.children?.[index] ?? null;
          if (!node) return null;
        }
        return node;
      }

      const el = byPath(document.body, operation.path);
      if (!el) return false;

      if (operation.type === "remove") el.remove();
      else if (operation.type === "unwrap") el.replaceWith(...el.childNodes);
      else if (operation.type === "clear-text") el.textContent = "";
      else if (operation.type === "remove-attribute") el.removeAttribute(operation.attribute);
      else return false;
      return true;
    }, op);

    if (!applied) return null;
    return await page.content();
  } finally {
    await context.close();
  }
}

export async function htmlStats(browser, html) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);
    return await page.evaluate(() => ({
      elements: document.querySelectorAll("*").length,
      bodyElements: document.body.querySelectorAll("*").length,
      bytes: new TextEncoder().encode(document.documentElement.outerHTML).length,
    }));
  } finally {
    await context.close();
  }
}
