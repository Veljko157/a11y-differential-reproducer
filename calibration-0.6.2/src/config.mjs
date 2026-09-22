import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");
export const OUTPUT_DIR = path.join(ROOT, "output");
export const FIXTURE_DIR = path.join(ROOT, "fixtures");

export const TARGET_SELECTOR = "[data-act-diff-target='primary']";
export const STABILITY_RUNS = 3;

export const EXPECTED = Object.freeze({
  heroSignature: "PASS|FAIL",
  heroAxeRule: "th-has-data-cells",
  heroAlfaRule: 46,
});

export const RULES = Object.freeze({
  name: {
    axe: "button-name",
    alfa: 12,
    act: "97a4e1",
  },
  headers: {
    axe: "td-headers-attr",
    alfa: 45,
    act: "a25f45",
  },
  tableHeaderAssignedCells: {
    axe: "th-has-data-cells",
    alfa: 46,
    act: "d0f69e",
  },
});
