import { readFile, readdir } from "node:fs/promises";

import { inspectPostHtml, recentFeedPosts, requestWithRetry, sitemapDates } from "./indexnow-preflight.mjs";

const siteUrl = new URL(process.env.SITE_URL || "https://nomorenusu.com");
const submitAll = /^(1|true)$/i.test(process.env.SUBMIT_ALL || "");
const dryRun = /^(1|true)$/i.test(process.env.DRY_RUN || "");

async function indexNowKey() {
  const files = await readdir(new URL("../public/", import.meta.url));
  const file = files.find((name) => /^[a-f0-9]{64}\.txt$/i.test(name));
  if (!file) throw new Error("public/에서 IndexNow 키 파일을 찾지 못했습니다.");
  const value = (await readFile(new URL(`../public/${file}`, import.meta.url), "utf8")).trim();
  if (value !== file.slice(0, -4)) throw new Error("IndexNow 키 파일명과 내용이 다릅니다.");
  return value;
}

const until = Date.now();
const [sitemapResponse, feedResponse] = await Promise.all([
  requestWithRetry(new URL("/sitemap.xml", siteUrl)),
  requestWithRetry(new URL("/feed.xml", siteUrl)),
]);
if (!sitemapResponse.ok) throw new Error(`사이트맵 응답 ${sitemapResponse.status}`);
if (!feedResponse.ok) throw new Error(`RSS 응답 ${feedResponse.status}`);

const allUrls = sitemapDates(await sitemapResponse.text(), siteUrl);
if (!allUrls.size) throw new Error("사이트맵에서 공개 주소를 찾지 못했습니다.");
const feedPosts = recentFeedPosts(await feedResponse.text(), siteUrl, {
  since: until - 72 * 3_600_000,
  until,
});
if (!feedPosts.length) throw new Error("RSS에서 최근 72시간 공개 글을 찾지 못했습니다.");
const failures = [];
const verified = [];
const images = new Map();

async function verifyPost(url) {
  if (!allUrls.has(url)) throw new Error("사이트맵 누락");
  const page = await requestWithRetry(url);
  const { problems, image } = inspectPostHtml(url, {
    status: page.status, headers: page.headers, body: await page.text(),
    lastModified: allUrls.get(url),
  });
  if (problems.length) throw new Error(problems.join(", "));
  if (!images.has(image)) {
    images.set(image, (async () => {
      const response = await requestWithRetry(image);
      await response.body?.cancel();
      return response.status === 200 && /^image\//i.test(response.headers.get("content-type") ?? "");
    })());
  }
  if (!(await images.get(image))) throw new Error("대표 이미지 응답 오류");
}

for (let offset = 0; offset < feedPosts.length; offset += 4) {
  await Promise.all(feedPosts.slice(offset, offset + 4).map(async (url) => {
    try {
      await verifyPost(url);
      verified.push(url);
    } catch (error) {
      failures.push({ url, reason: error.message });
    }
  }));
}
const failedUrls = new Set(failures.map(({ url }) => url));
const urlList = submitAll && failures.length === 0
  ? [...allUrls.keys()]
  : feedPosts.filter((url) => !failedUrls.has(url));

function log(result) {
  console.log(JSON.stringify({ ...result, checked: feedPosts.length, verified: verified.length, failures, urlList }, null, 2));
  if (failures.length) process.exitCode = 1;
}

if (urlList.length === 0) {
  log({ dryRun, submitted: 0 });
  process.exit(process.exitCode ?? 0);
}

if (dryRun) {
  log({ dryRun: true, submitAll });
  process.exit(process.exitCode ?? 0);
}

const key = await indexNowKey();
const response = await fetch("https://searchadvisor.naver.com/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: siteUrl.host,
    key,
    keyLocation: new URL(`/${key}.txt`, siteUrl).href,
    urlList,
  }),
  signal: AbortSignal.timeout(20_000),
});

if (![200, 202].includes(response.status)) {
  throw new Error(
    `네이버 IndexNow 응답 ${response.status}: ${(await response.text()).slice(0, 300)}`,
  );
}

log({
  ok: failures.length === 0,
  status: response.status,
  submitted: urlList.length,
  mode: submitAll && failures.length === 0 ? "all" : "recent",
});
