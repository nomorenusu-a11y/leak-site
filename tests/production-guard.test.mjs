import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cloudflareConfig = await readFile(
  new URL("../cloudflare.config.ts", import.meta.url),
  "utf8",
);
const viteConfig = await readFile(new URL("../vite.config.ts", import.meta.url), "utf8");
const agentRules = await readFile(new URL("../AGENTS.md", import.meta.url), "utf8");

test("production stays on both Cloudflare custom domains with persistent ISR cache", () => {
  assert.match(cloudflareConfig, /nomorenusu\.com/);
  assert.match(cloudflareConfig, /www\.nomorenusu\.com/);
  assert.match(cloudflareConfig, /VINEXT_KV_CACHE/);
  assert.match(viteConfig, /kvDataAdapter/);
});

test("repository instructions protect the production host and future scheduled URLs", () => {
  assert.match(agentRules, /Do not reconnect the production domain to Vercel/);
  assert.match(agentRules, /Do not request or open future scheduled post URLs/);
  assert.match(agentRules, /npm run verify:production/);
});
