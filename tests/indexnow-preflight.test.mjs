import assert from "node:assert/strict";
import test from "node:test";
import { inspectPostHtml, recentFeedPosts, requestWithRetry, sitemapDates } from "../scripts/indexnow-preflight.mjs";

const site = new URL("https://example.com");
const post = "https://example.com/posts/a-post";
const image = "https://example.com/photo.webp";
const stamp = Date.parse("2026-11-14T00:00:00Z");
const window = { since: stamp, until: stamp + 3_600_000 };
const rss = (url, date) => `<rss><channel><item><link>${url}</link><pubDate>${new Date(date).toUTCString()}</pubDate></item></channel></rss>`;

test("selects a recently published RSS URL without relying on the slug date", () => {
  assert.deepEqual(recentFeedPosts(rss(post, stamp), site, window), [post]);
  assert.deepEqual(recentFeedPosts(rss(post, stamp - 1_000), site, window), []);
});

test("rejects future and off-site RSS entries", () => {
  assert.throws(() => recentFeedPosts(rss(post, stamp + 7_200_000), site, window), /미래/);
  assert.throws(() => recentFeedPosts(rss("https://elsewhere.com/posts/a", stamp), site, window));
});

const html = `<html><head><title>누수탐지</title><link href="${post}" rel="canonical"><meta content="${image}" property="og:image"></head><body><h1>누수탐지</h1></body></html>`;
const inspect = (body, status = 200, headers = {}) => inspectPostHtml(post, {
  status, headers: new Headers(headers), body,
});

test("marks broken publish signals individually", () => {
  assert.deepEqual(inspect(html), { problems: [], image });
  assert.deepEqual(inspect(html, 404).problems, ["HTTP 404"]);
  assert.deepEqual(inspect(html.replace(post, site.href)).problems, ["대표 주소 불일치"]);
  assert.deepEqual(inspect(html, 200, { "x-robots-tag": "noindex" }).problems, ["색인 차단 지시"]);
  assert.deepEqual(inspect(html.replace("</head>", '<meta name="Yeti" content="none"></head>')).problems, ["색인 차단 지시"]);
  assert.deepEqual(inspect(html.replace("og:image", "og:image:alt")).problems, ["대표 이미지 주소 오류"]);
});

test("retries a temporary upstream error once and preserves hard failures", async () => {
  let calls = 0;
  assert.equal((await requestWithRetry(post, async () =>
    new Response("", { status: ++calls === 1 ? 503 : 200 }))).status, 200);
  assert.equal(calls, 2);
  calls = 0;
  assert.equal((await requestWithRetry(post, async () => {
    calls++;
    return new Response("", { status: 404 });
  })).status, 404);
  assert.equal(calls, 1);
});

test("blocks notification when the canonical HTML lags its sitemap revision", () => {
  const stampText = new Date(stamp).toISOString();
  const locations = sitemapDates(`<urlset><url><loc>${post}</loc><lastmod>${stampText}</lastmod></url></urlset>`, site);
  assert.equal(locations.get(post), stamp);
  const body = html.replace("</head>", `<meta property="article:modified_time" content="${stampText}"></head>`);
  const inspectRevision = (lastModified) => inspectPostHtml(post, {
    status: 200, headers: new Headers(), body, lastModified,
  }).problems;
  assert.deepEqual(inspectRevision(stamp + 1000), ["사이트맵보다 오래된 공개 페이지"]);
  assert.deepEqual(inspectRevision(stamp), []);
});
