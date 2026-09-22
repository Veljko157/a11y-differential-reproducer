import path from "node:path";
import process from "node:process";
import { FIXTURE_DIR } from "./config.mjs";
import { readText } from "./lib/io.mjs";

export const FIXTURES = Object.freeze({
  exp1: {
    baseline: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>EXP1 baseline</title></head>
<body>
  <main>
    <p id="remote-label">Save</p>
    <button data-act-diff-target="primary" aria-labelledby="remote-label"></button>
    <aside id="safe-noise">Unrelated note</aside>
  </main>
</body>
</html>`,
  },
  exp2: {
    baseline: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>EXP2 baseline</title></head>
<body>
  <main>
    <div id="hidden-wrapper" aria-hidden="true">
      <button data-act-diff-target="primary"></button>
    </div>
    <aside id="safe-noise">Unrelated note</aside>
  </main>
</body>
</html>`,
  },
  exp3: {
    baseline: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>EXP3 baseline</title></head>
<body>
  <main>
    <table>
      <tbody>
        <tr>
          <th id="price-header" scope="row">Price</th>
          <td data-act-diff-target="primary" headers="price-header">10</td>
        </tr>
      </tbody>
    </table>
    <aside id="safe-noise">Unrelated note</aside>
  </main>
</body>
</html>`,
  },
});

export async function getHeroHtml() {
  const external = process.env.HERO_FIXTURE?.trim();
  const file = external
    ? path.resolve(external)
    : path.join(FIXTURE_DIR, "04-alfa-1883-style.html");
  return { html: await readText(file), file, external: Boolean(external) };
}
