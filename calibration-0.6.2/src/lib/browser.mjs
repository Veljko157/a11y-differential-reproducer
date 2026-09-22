import { chromium } from "playwright";

export async function launchCalibrationBrowser() {
  return chromium.launch({ headless: true });
}

export async function newCalibrationPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
    colorScheme: "light",
    reducedMotion: "no-preference",
    forcedColors: "none",
    timezoneId: "UTC",
    javaScriptEnabled: true,
  });
  const page = await context.newPage();
  return { context, page };
}

export async function loadHtml(page, html) {
  await page.setContent(html, {
    waitUntil: "load",
    timeout: 15_000,
  });
  await page.waitForTimeout(20);
}

export async function canonicalizeHtml(browser, html) {
  const { context, page } = await newCalibrationPage(browser);
  try {
    await loadHtml(page, html);
    return await page.content();
  } finally {
    await context.close();
  }
}
