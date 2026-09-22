import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "output") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (entry.isFile() && p.endsWith(".mjs")) out.push(p);
  }
  return out;
}

const files = await walk(root);
for (const file of files) {
  const r = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (r.status !== 0) {
    process.stderr.write(r.stdout ?? "");
    process.stderr.write(r.stderr ?? "");
    process.exit(r.status ?? 1);
  }
}
console.log(`Syntax OK: ${files.length} files`);
