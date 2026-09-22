import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function readPackageVersion(packageName) {
  // Do not assume package.json is an exported subpath.
  let entry;
  try {
    entry = require.resolve(packageName);
  } catch {
    return null;
  }

  let dir = path.dirname(entry);
  for (let i = 0; i < 10; i += 1) {
    const candidate = path.join(dir, "package.json");
    try {
      const raw = await fs.readFile(candidate, "utf8");
      const pkg = JSON.parse(raw);
      if (pkg?.name === packageName) return pkg.version ?? null;
    } catch {
      // keep climbing
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function getPackageVersions() {
  const names = [
    "@axe-core/playwright",
    "@siteimprove/alfa-playwright",
    "@siteimprove/alfa-test-utils",
    "@siteimprove/alfa-rules",
    "@siteimprove/alfa-web",
    "playwright",
  ];
  return Object.fromEntries(
    await Promise.all(names.map(async (name) => [name, await readPackageVersion(name)])),
  );
}
