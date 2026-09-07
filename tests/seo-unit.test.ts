import test from "node:test";
import assert from "node:assert/strict";
import {
  PILOT_REGIONS,
  resolveRegion,
  regionPath,
  regionAncestors,
  SEOUL_DONGS,
  SEOUL_DISTRICTS,
} from "../src/lib/regions";
import { validTermIds, SEO_TERMS } from "../src/lib/seo/taxonomy";
import { collectPages } from "../src/lib/collect-pages";
import { parseListSearch, listPath } from "../src/lib/post-list-search";
import { categoryValues } from "../src/lib/post-categories";
import robots from "../src/app/robots";
import { localBusinessJsonLd } from "../src/lib/seo/schema";
import {
  regionFaqs,
  regionMetadataTitle,
  regionPageDescription,
  regionPageTitle,
} from "../src/lib/seo/regions";
import { defaultRegionContent } from "../src/lib/regions";

test("official Seoul hierarchy supports 25 districts and 467 legal dongs while rejecting invalid routes", () => {
  assert.equal(SEOUL_DISTRICTS.length, 25);
  assert.equal(SEOUL_DONGS.length, 467);
  assert.deepEqual(PILOT_REGIONS.map(regionPath).sort(), [
    "/seoul",
    "/seoul/dobong-gu",
    "/seoul/dobong-gu/banghak-dong",
    "/seoul/dobong-gu/chang-dong",
    "/seoul/dobong-gu/dobong-dong",
    "/seoul/dobong-gu/ssangmun-dong",
  ]);
  for (const [district, dong] of [
    ["gangnam-gu", "chang-dong"],
    ["dobong-gu", "chang-1-dong"],
    ["dobong-gu", "ssangmun-dong-boiler"],
    ["dobong-gu", "ssangmun-dong/boiler"],
  ])
    assert.equal(resolveRegion(district, dong), undefined);
  assert.equal(resolveRegion("gangnam-gu")?.name, "강남구");
  assert.equal(resolveRegion("dobong-gu", "ssangmun-dong")?.name, "쌍문동");
  assert.equal(regionAncestors(PILOT_REGIONS[2]).length, 3);
});
test("symptom is not a leak cause or detection method", () => {
  assert(validTermIds(["symptom:meter-running"]));
  assert(!validTermIds(["leak_type:meter-running"]));
  assert.equal(SEO_TERMS.filter((t) => t.axis === "detection_method").length, 4);
  assert.equal(SEO_TERMS.filter((t) => t.axis === "work_type").length, 4);
});
test("a legal-dong page covers related leak intents without creating combination URLs", () => {
  const ssangmun = PILOT_REGIONS.find((region) => region.slug === "ssangmun-dong")!;
  const content = defaultRegionContent(ssangmun.id);
  assert.equal(regionPageTitle(ssangmun, content), "쌍문동 누수탐지");
  assert.equal(
    regionMetadataTitle(ssangmun, content),
    "쌍문동 누수탐지 | 아파트·화장실·천장·배관 누수 상담",
  );
  for (const keyword of [
    "쌍문동 아파트 누수",
    "화장실·욕실 누수",
    "수도·온수·난방배관",
    "보일러 누수",
  ])
    assert(regionPageDescription(ssangmun, content).includes(keyword));
  assert(
    regionFaqs(ssangmun, content).some((faq) =>
      faq.question.includes("수도배관·온수배관·난방배관"),
    ),
  );
  assert.equal(resolveRegion("dobong-gu", "ssangmun-dong-boiler"), undefined);
});
test("all slugs collected beyond 1000 and server-side caps; failure is not a partial success", async () => {
  const source = Array.from({ length: 1203 }, (_, i) => i);
  const result = await collectPages(
    async (from, to) => source.slice(from, Math.min(to + 1, from + 100)),
    500,
  );
  assert.deepEqual(result, source);
  await assert.rejects(
    collectPages(async (from) => {
      if (from) throw new Error("DB down");
      return [1];
    }),
  );
});
test("pagination offsets, category preservation and malformed query rejection", () => {
  assert.deepEqual(parseListSearch({ page: "2", cat: "leak" }), { page: 2, category: "leak" });
  assert.equal(listPath("/posts", 2, "leak"), "/posts?cat=leak&page=2");
  for (const page of ["0", "-1", "abc", "1.2", "999999999999999999"])
    assert.equal(parseListSearch({ page }), null);
  assert(categoryValues("leak").includes("누수 탐지"));
  assert.deepEqual(categoryValues("pipe"), ["pipe", "배관"]);
});
test("preview is blocked even under NODE_ENV production; placeholder rating removed", () => {
  const environment = process.env as Record<string, string | undefined>;
  const prevNode = environment.NODE_ENV;
  environment.NODE_ENV = "production";
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";
  assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" });
  if (prev === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = prev;
  if (prevNode === undefined) delete environment.NODE_ENV;
  else environment.NODE_ENV = prevNode;
  const schema = localBusinessJsonLd();
  assert(!("aggregateRating" in schema));
  assert(schema.image.endsWith("/og-image.png"));
});
