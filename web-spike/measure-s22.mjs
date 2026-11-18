// Drives the installed Chrome headless against the S22 page and prints the page's own measurements.
// Usage: node measure-s22.mjs <url>
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:5198/s22.html";
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--window-size=1280,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
const t0 = Date.now();
await page.goto(url, { waitUntil: "load" });
console.log(`load event after ${Date.now() - t0} ms`);
const nav = await page.evaluate(() => {
  const n = performance.getEntriesByType("navigation")[0];
  const res = performance.getEntriesByType("resource");
  const js = res.filter((r) => r.initiatorType === "script" || r.name.endsWith(".js"));
  return {
    domContentLoaded: Math.round(n.domContentLoadedEventEnd),
    load: Math.round(n.loadEventEnd),
    scripts: js.length,
    transferKB: Math.round(res.reduce((s, r) => s + (r.transferSize || 0), 0) / 1024),
  };
});
console.log(`navigation: ${JSON.stringify(nav)}`);
await page.waitForFunction(() => document.getElementById("out")?.textContent.includes("S22 DONE"), { timeout: 240_000 });
console.log((await page.$eval("#out", (e) => e.textContent)).trim());
await browser.close();
