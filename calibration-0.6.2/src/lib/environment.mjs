import process from "node:process";
import { chromium } from "playwright";
import { getPackageVersions } from "./packages.mjs";

export async function captureEnvironment() {
  const browser = await chromium.launch({ headless: true });
  try {
    return {
      generatedAt: new Date().toISOString(),
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      chromium: browser.version(),
      packages: await getPackageVersions(),
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
      colorScheme: "light",
      reducedMotion: "no-preference",
      forcedColors: "none",
      timezoneId: "UTC",
      javaScriptEnabled: true,
    };
  } finally {
    await browser.close();
  }
}
