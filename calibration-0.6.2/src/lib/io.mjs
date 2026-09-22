import fs from "node:fs/promises";
import path from "node:path";
import { OUTPUT_DIR } from "../config.mjs";

export async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

export async function writeJson(name, value) {
  await ensureOutputDir();
  const p = path.join(OUTPUT_DIR, name);
  await fs.writeFile(p, JSON.stringify(value, null, 2) + "\n", "utf8");
  return p;
}

export async function writeText(name, value) {
  await ensureOutputDir();
  const p = path.join(OUTPUT_DIR, name);
  await fs.writeFile(p, value, "utf8");
  return p;
}

export async function readText(file) {
  return fs.readFile(file, "utf8");
}

export function cleanError(error) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: "Error", message: String(error) };
}
