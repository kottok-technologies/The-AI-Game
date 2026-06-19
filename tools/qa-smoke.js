const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright-core");

const edgePath = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const root = path.resolve(__dirname, "..");
const fileUrl = pathToFileURL(path.join(root, "index.html")).href;
const storeKey = "the-ai-game-v2";

async function main() {
  const browser = await chromium.launch({ executablePath: edgePath, headless: true });
  const viewports = [
    { width: 360, height: 740, name: "small phone" },
    { width: 390, height: 844, name: "modern phone" },
    { width: 768, height: 1024, name: "tablet" },
    { width: 900, height: 900, name: "desktop square" }
  ];
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(fileUrl);
    await page.waitForSelector("#overlay:not([hidden])");
    const original = await page.evaluate((key) => localStorage.getItem(key), storeKey);
    try {
      const metrics = await page.evaluate(() => ({
        version: document.querySelector(".build-label").textContent,
        missions: document.querySelectorAll("#missionGrid option").length,
        difficulties: document.querySelectorAll("#difficultyRow button").length,
        overflow: overlay.scrollWidth > overlay.clientWidth + 1
      }));
      if (metrics.overflow) throw new Error(`${viewport.name}: overlay horizontal overflow`);
      if (metrics.missions < 8) throw new Error(`${viewport.name}: expected expanded mission set`);
      if (metrics.difficulties !== 3) throw new Error(`${viewport.name}: expected 3 difficulty modes`);

      await page.locator("#startButton").click();
      await page.waitForTimeout(100);
      await page.evaluate(() => {
        startSystemEvent("routing");
        collect({ kind: "signal", lane: 0 });
        collect({ kind: "context", lane: 1 });
        collect({ kind: "guardrail", lane: 2 });
        endGame();
      });
      await page.waitForSelector("#runSummary:not([hidden])");
      const summary = await page.locator("#runSummary").innerText();
      if (!summary.includes("incidents cleared")) throw new Error(`${viewport.name}: summary missing incident row`);
      if (errors.length) throw new Error(`${viewport.name}: ${errors.join(" | ")}`);
      results.push({ viewport: viewport.name, ok: true, version: metrics.version });
    } finally {
      await page.evaluate(({ key, value }) => {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }, { key: storeKey, value: original });
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
