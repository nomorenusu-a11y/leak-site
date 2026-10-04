import { readFile, readdir } from "node:fs/promises";

const siteUrl = new URL(process.env.SITE_URL || "https://nomorenusu.com");
const submitAll = /^(1|true)$/i.test(process.env.SUBMIT_ALL || "");
const dryRun = /^(1|true)$/i.test(process.env.DRY_RUN || "");

function kstDate(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("-", "");
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

async function indexNowKey() {
  const files = await readdir(new URL("../public/", import.meta.url));
  const file = files.find((name) => /^[a-f0-9]{64}\.txt$/i.test(name));
  if (!file) throw new Error("public/에서 IndexNow 키 파일을 찾지 못했습니다.");
  const value = (await readFile(new URL(`../public/${file}`, import.meta.url), "utf8")).trim();
  if (value !== file.slice(0, -4)) throw new Error("IndexNow 키 파일명과 내용이 다릅니다.");
  return value;
}

const sitemapResponse = await fetch(new URL("/sitemap.xml", siteUrl), {
  headers: { "user-agent": "nomorenusu-indexnow/1.0" },
  signal: AbortSignal.timeout(20_000),
});
if (!sitemapResponse.ok) throw new Error(`사이트맵 응답 ${sitemapResponse.status}`);

const sitemap = await sitemapResponse.text();
const allUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => decodeXml(match[1].trim()))
  .filter((value) => {
    try {
      return new URL(value).host === siteUrl.host;
    } catch {
      return false;
    }
  });

const datePrefixes = new Set([kstDate(), kstDate(-1)]);
const recentUrls = allUrls.filter((value) => {
  const slug = new URL(value).pathname.match(/^\/posts\/(\d{8})-/)?.[1];
  return slug ? datePrefixes.has(slug) : false;
});
const urlList = submitAll
  ? allUrls
  : [...new Set([new URL("/", siteUrl).href, new URL("/posts", siteUrl).href, ...recentUrls])];

if (urlList.length === 0) {
  console.log("IndexNow에 보낼 공개 URL이 없습니다.");
  process.exit(0);
}

if (dryRun) {
  console.log(
    JSON.stringify({ dryRun: true, submitAll, dates: [...datePrefixes], urlList }, null, 2),
  );
  process.exit(0);
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

console.log(
  JSON.stringify({
    ok: true,
    status: response.status,
    submitted: urlList.length,
    mode: submitAll ? "all" : "recent",
    dates: [...datePrefixes],
  }),
);
