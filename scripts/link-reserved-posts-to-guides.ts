/** Add relevant, already-public hub links to future advice articles only. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
const apply = process.argv.includes("--apply");
const keys = JSON.parse(
  execFileSync(
    "npx",
    [
      "supabase",
      "projects",
      "api-keys",
      "--project-ref",
      fs.readFileSync("supabase/.temp/project-ref", "utf8").trim(),
      "--output",
      "json",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  keys.find((x: { name: string }) => x.name === "service_role").api_key,
  { auth: { persistSession: false } },
);
const groups = [
  {
    keys: ["meter", "bill", "supply", "frozen", "thaw", "condensation"],
    slug: "bulgwang-house-water-meter-leak-guide",
    label: "계량기 반응과 급수관 누수를 구분하는 상세 안내",
  },
  {
    keys: ["heating", "pressure", "manifold"],
    slug: "gwangjin-heating-case-2026",
    label: "난방 불균형·압력 저하와 배관 점검 안내",
  },
  {
    keys: ["toilet-floor", "toilet-tank"],
    slug: "ssangmun-villa-toilet-leak-guide",
    label: "변기 급수와 배수 접합부를 나눠 확인하는 안내",
  },
  {
    keys: [
      "basin",
      "sink",
      "washer-supply",
      "laundry-drain",
      "waterproof",
      "shower",
      "shared",
      "shop",
      "backflow",
    ],
    slug: "20260925-september-078",
    label: "배수 중 물샘·역류와 배관 경계를 구분하는 안내",
  },
  {
    keys: [
      "hot",
      "ceiling",
      "lighting",
      "wall",
      "floor",
      "window",
      "roof",
      "facade",
      "balcony",
      "rainpipe",
      "after-repair",
    ],
    slug: "munjeong-apartment-hot-water-pipe-leak-guide",
    label: "천장 물자국의 배관·방수·외부 유입 비교 안내",
  },
];
const manifest = JSON.parse(fs.readFileSync("audits/nomorenusu-november-2026.json", "utf8"));
const bySlug = new Map<string, string>(manifest.posts.map((x: any) => [x.post.slug, x.topicKey]));
const r = await db
  .from("posts")
  .select("id,slug,content,updated_at,published_at")
  .like("slug", "202611%-november-%")
  .gt("published_at", new Date().toISOString())
  .eq("published", true)
  .order("published_at");
if (r.error) throw r.error;
const links = await db
  .from("posts")
  .select("slug,published_at,published")
  .in(
    "slug",
    groups.map((x) => x.slug),
  );
if (links.error) throw links.error;
if (
  links.data.length !== 5 ||
  links.data.some((x) => !x.published || Date.parse(x.published_at) > Date.now())
)
  throw new Error("Hub must already be public");
const changes = r.data
  .filter((x) => !x.content.includes("<!-- featured-hub:20261106 -->"))
  .map((p) => {
    const topic = bySlug.get(p.slug);
    const group = groups.find((x) => x.keys.includes(topic || ""));
    if (!group) throw new Error("No relevant hub for " + p.slug);
    const addition = `\n\n<!-- featured-hub:20261106 -->\n\n## 원인 구분을 더 자세히 확인하려면\n\n- [${group.label}](/posts/${group.slug})\n\n위 글은 다른 지역의 상담 안내이며, 같은 증상에서 무엇을 나눠 확인하는지 참고할 수 있습니다.`;
    return { ...p, addition };
  });
fs.writeFileSync(
  "/tmp/nomorenusu-future-hub-link-changes.json",
  JSON.stringify(
    changes.map(({ id, slug, addition }) => ({ id, slug, addition })),
    null,
    2,
  ),
);
if (apply)
  for (const p of changes) {
    const u = await db
      .from("posts")
      .update({ content: p.content + p.addition })
      .eq("id", p.id)
      .eq("updated_at", p.updated_at)
      .gt("published_at", new Date().toISOString())
      .select("id");
    if (u.error || u.data?.length !== 1)
      throw new Error("Concurrent reservation change: " + p.slug);
  }
console.log(
  JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    futureArticles: changes.length,
    linksToPublicHubs: changes.length,
    publicArticlesModified: 0,
    scheduleTimesChanged: 0,
  }),
);
