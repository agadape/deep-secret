// Drives the real dev build in the installed Chrome (headless) through one full round on Sepolia with the dev test
// key: connect → (claim) → walk to the dock → cast → reveal 5 fish → bucket → sell all. Saves screenshots.
// Usage: node scripts/e2e-ui.mjs [url]
import puppeteer from "puppeteer-core";

const url = process.argv[2] ?? "http://localhost:5173/";
const shots = new URL("../test-shots/", import.meta.url);
const t0 = Date.now();
const log = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--window-size=1280,800"],
});
const page = await browser.newPage();
const MOBILE = process.env.MOBILE === "1";
const LOOK = process.env.LOOK === "1"; // stop after walking to the dock (no transactions)
await page.setViewport(MOBILE ? { width: 390, height: 844, isMobile: true, hasTouch: true } : { width: 1280, height: 800 });
page.on("pageerror", (e) => log(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && log(`console.error: ${m.text().slice(0, 200)}`));
const shot = async (name) => {
  await page.screenshot({ path: new URL(`${name}.png`, shots).pathname.slice(1) });
  log(`screenshot ${name}.png`);
};
const text = (sel) => page.$eval(sel, (e) => e.textContent).catch(() => "");
const clickText = async (t) => {
  const ok = await page.evaluate((t) => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes(t) && !x.disabled);
    b?.click();
    return !!b;
  }, t);
  if (!ok) throw new Error(`button "${t}" not found or disabled`);
};
const waitFor = async (label, fn, ms = 120_000) => {
  const end = Date.now() + ms;
  let last = 0;
  while (Date.now() < end) {
    if (await page.evaluate(fn)) return log(label);
    if (Date.now() - last > 10_000) {
      last = Date.now();
      const st = await page.evaluate(() => [".hud-bottom .status", ".toast"].map((q) => document.querySelector(q)?.textContent ?? "").join(" | "));
      log(`  waiting for ${label}: ${st}`);
    }
    await sleep(500);
  }
  throw new Error(`timeout: ${label}`);
};

await page.goto(url, { waitUntil: "load" });
await waitFor("connect screen", () => !!document.querySelector(".connect-card"));
await sleep(800);
await shot(MOBILE ? "m01-connect" : "01-connect");
await clickText("Dev: use test key");
await waitFor("HUD with decrypted Pearls", () => /🦪 \d+/.test(document.querySelector(".hud-top")?.textContent ?? ""), 180_000);
log(`HUD: ${await text(".hud-top")}`);
if ((await text(".cast small")).includes("starter")) {
  await clickText("Shop");
  await clickText("Claim starter pack");
  await waitFor("starter claimed", () => !/starter/.test(document.querySelector(".cast small")?.textContent ?? ""), 120_000);
  await clickText("✕");
}
// walk south onto the dock until the cast button says we are at the water
await page.evaluate(() => (window.__pad.down = true));
await waitFor("at the water's edge", () => /CAST · /.test(document.querySelector(".cast")?.textContent ?? ""), 15_000);
await sleep(1200);
await page.evaluate(() => (window.__pad.down = false));
await shot(MOBILE ? "m02-at-dock" : "02-at-dock");
log(`cast button: ${await text(".cast")}`);
if (LOOK) {
  await clickText("Bucket");
  await sleep(500);
  await shot(MOBILE ? "m03-bucket" : "03-bucket-look");
  await browser.close();
  log("LOOK DONE");
  process.exit(0);
}

const castStart = Date.now();
await clickText("CAST");
await waitFor("tx sent", () => /beneath the surface/.test(document.querySelector(".hud-bottom")?.textContent ?? ""), 60_000);
await shot("03-waiting");
await waitFor("reveal", () => !!document.querySelector(".reveal-card"), 180_000);
log(`cast → first card: ${((Date.now() - castStart) / 1000).toFixed(1)} s`);
for (let i = 0; i < 5; i++) {
  log(`card ${i + 1}: ${(await text(".reveal-card")).replace(/\s+/g, " ").slice(0, 120)}`);
  if (i === 0) await shot("04-reveal-1");
  await page.evaluate(() => document.querySelector(".reveal-card button.primary").click());
  await sleep(400);
}
await waitFor("bucket refreshed", () => /Bucket \([1-9]/.test(document.querySelector("nav")?.textContent ?? ""), 120_000);
await clickText("Bucket");
await sleep(500);
await shot("05-bucket");
const before = await text(".hud-top");
await clickText("Sell all");
await waitFor("sold", () => /Sold\./.test(document.querySelector(".toast")?.textContent ?? ""), 180_000);
log(`HUD before sell: ${before} | after: ${await text(".hud-top")}`);
await shot("06-after-sell");

await browser.close();
log("E2E UI DONE");
