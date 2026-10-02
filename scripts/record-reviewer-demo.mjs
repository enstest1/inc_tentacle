import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const base = process.env.TENTACLE_DEMO_URL ?? "http://127.0.0.1:3010";
const outDir = path.resolve("demo");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

async function caption(text) {
  await page.evaluate((value) => {
    document.getElementById("tentacle-demo-caption")?.remove();
    const el = document.createElement("div");
    el.id = "tentacle-demo-caption";
    el.textContent = value;
    Object.assign(el.style, {
      position: "fixed", left: "24px", bottom: "24px", zIndex: "999999",
      maxWidth: "900px", padding: "14px 18px", borderRadius: "12px",
      background: "rgba(0,0,0,.88)", color: "white", font: "600 20px system-ui",
      boxShadow: "0 8px 30px rgba(0,0,0,.35)",
    });
    document.body.appendChild(el);
  }, text);
}
await page.goto(`${base}/agents`, { waitUntil: "networkidle" });
await caption("Tentacle for Agents: MCP + HTTP API + x402 discovery on Ink");
await page.waitForTimeout(7000);
await page.evaluate(() => window.scrollTo({ top: 620, behavior: "smooth" }));
await page.waitForTimeout(5000);

await page.goto(`${base}/api/agent/manifest`, { waitUntil: "networkidle" });
await caption("Machine-readable agent manifest");
await page.waitForTimeout(6000);

await page.goto(`${base}/api/x402/discovery`, { waitUntil: "networkidle" });
await caption("x402 V2 discovery metadata; paid settlement stays explicitly gated");
await page.waitForTimeout(6000);

await page.goto(`${base}/stats?network=sepolia`, { waitUntil: "domcontentloaded" });
await caption("Explorer-backed Ink Sepolia evidence: 30 BatchExecuted test events");
await page.waitForTimeout(12000);
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
await page.waitForTimeout(5000);

await page.goto("https://explorer-sepolia.inkonchain.com/address/0xDc44eAa018d93f05CB66078a7AB2eEe49a80524a?tab=contract", { waitUntil: "domcontentloaded", timeout: 30000 });
await caption("Verified TentacleBatcher source on Ink Sepolia");
await page.waitForTimeout(8000);

const video = page.video();
await context.close();
await browser.close();
const recorded = await video.path();
const target = path.join(outDir, "tentacle-reviewer-demo.webm");
if (recorded !== target) fs.copyFileSync(recorded, target);
console.log(target);
