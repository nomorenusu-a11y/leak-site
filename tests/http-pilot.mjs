// Run only against the isolated local fixture app. No external requests or writes.
import assert from "node:assert/strict";
const base = process.env.PILOT_TEST_URL ?? "http://127.0.0.1:3100";
if (new URL(base).hostname !== "127.0.0.1") throw new Error("Loopback only");
const paths = [
  "/seoul",
  "/seoul/dobong-gu",
  ...["chang-dong", "ssangmun-dong", "banghak-dong", "dobong-dong"].map(
    (x) => "/seoul/dobong-gu/" + x,
  ),
];
for (const path of paths) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, path);
  assert(html.includes(`href="https://nomorenusu.com${path}"`), "canonical " + path);
  assert(/<meta name="description" content="[^"]+"/.test(html), "description " + path);
  const json = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]),
  );
  assert(
    json.some((j) => j["@type"] === "BreadcrumbList"),
    path,
  );
  assert(
    json.some((j) => j["@type"] === "FAQPage"),
    path,
  );
  assert(html.includes("견적 신청서 작성"), path);
  assert(html.includes('href="tel:+821057004026"'), "phone CTA " + path);
  assert(
    html.includes("이런 증상인가요?") || html.includes("누수 증상, 이런 경우인가요?"),
    "symptoms " + path,
  );
  assert(html.includes("누수 확인은 이렇게 진행합니다"), "steps " + path);
  console.log("PASS metadata, H1, breadcrumb, FAQ, CTA:", path);
}
for (const path of [
  "/seoul/gangnam-gu",
  "/seoul/dobong-gu/chang-1-dong",
  "/seoul/dobong-gu/ssangmun-dong/boiler",
  "/posts?page=0",
  "/posts?page=999",
])
  assert.equal((await fetch(base + path)).status, 404, path);
const page2 = await (await fetch(base + "/posts?page=2")).text();
assert(page2.includes('href="/posts/local-test-13"'));
assert(!page2.includes('href="/posts/local-test-1"'));
const category2 = await (await fetch(base + "/posts?cat=leak&page=2")).text();
assert(category2.includes('href="/posts/local-test-14"'));
assert(category2.includes('href="/posts?cat=leak"'));
const region2 = await (await fetch(base + "/posts/region/dobong?page=2")).text();
assert(region2.includes('href="/posts/local-test-13"'));
const chang = await (await fetch(base + paths[2])).text();
assert(chang.includes('href="/posts/local-test-1"'));
const empty = await (await fetch(base + paths[3])).text();
assert(empty.includes("도봉구 인근 실제 사례"));
assert(
  empty.replaceAll("<!-- -->", "").includes("현재 쌍문동으로 확인된 공개 사례는 아직 없습니다"),
);
assert(empty.includes('href="/posts/local-test-1"'));
for (const keyword of [
  "쌍문동 누수탐지",
  "쌍문동 아파트 누수",
  "쌍문동 화장실 누수",
  "쌍문동 욕실 누수",
  "쌍문동 천장 누수",
  "쌍문동 수도배관 누수",
  "쌍문동 온수배관 누수",
  "쌍문동 난방배관 누수",
  "쌍문동 보일러 누수",
  "쌍문동 계량기 누수",
  "쌍문동 배관 누수",
])
  assert(empty.replaceAll("<!-- -->", "").includes(keyword), keyword);
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
for (const path of paths) assert(sitemap.includes("<loc>https://nomorenusu.com" + path + "</loc>"));
assert.equal((sitemap.match(/<loc>https:\/\/nomorenusu.com\/seoul/g) ?? []).length, 6);
assert(sitemap.includes("/posts/local-test-15"));
const robots = await (await fetch(base + "/robots.txt")).text();
assert(robots.includes("Disallow: /"));
console.log(
  "PASS scope 404s, real pagination/filtering, verified-only cases, sitemap six URLs, preview robots",
);
