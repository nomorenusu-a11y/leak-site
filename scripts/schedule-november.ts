/**
 * Read-only by default. --apply=<reviewed manifest> writes new drafts, images,
 * then arms future publication. Never opens future public post URLs.
 * Credentials are read from the existing authenticated Supabase CLI, not files.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { buildNovemberPlan, validateNovemberPlan } from "../src/lib/november-content-plan";

const ref = fs.readFileSync("supabase/.temp/project-ref", "utf8").trim();
const apiKeys = JSON.parse(
  execFileSync(
    "npx",
    ["supabase", "projects", "api-keys", "--project-ref", ref, "--output", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  ),
);
const serviceKey = apiKeys.find((key: { name: string }) => key.name === "service_role")?.api_key;
if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL)
  throw new Error("Missing authorized Supabase connection");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
  auth: { persistSession: false },
});
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);
async function collect(table: string, columns: string) {
  const rows: any[] = [];
  for (let offset = 0; ; offset += 500) {
    const r = await db
      .from(table)
      .select(columns)
      .order(table === "media_asset_analysis" ? "asset_id" : "id")
      .range(offset, offset + 499);
    if (r.error) throw r.error;
    rows.push(...(r.data || []));
    if (!r.data || r.data.length < 500) return rows;
  }
}
function requireOk(r: any, label: string) {
  if (r.error) throw new Error(`${label}: ${r.error.message}`);
  return r.data;
}
function counts(rows: { published_at: string }[]) {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const d = new Date(+new Date(row.published_at) + 9 * 3600000).toISOString().slice(0, 10);
    out[d] = (out[d] || 0) + 1;
  }
  return out;
}
const apply = process.argv.find((x) => x.startsWith("--apply="))?.slice(8);
const manifestPath =
  process.argv.find((x) => x.startsWith("--out="))?.slice(6) ||
  "/tmp/nomorenusu-november-2026.json";

if (!apply) {
  const [existing, assets, analyses] = await Promise.all([
    collect("posts", "id,slug,title,published,published_at"),
    collect("media_assets", "id,url,file_name,active"),
    collect(
      "media_asset_analysis",
      "asset_id,analysis_status,visible_subject_tags,leak_type_tags,confidence,work_stage",
    ),
  ]);
  const now = new Date();
  const startDate = new Date(+now + 9 * 3600000).toISOString().slice(0, 10);
  if (!startDate.startsWith("2026-11-")) throw new Error("Only November 2026 is supported");
  const drafts = buildNovemberPlan({
    startDate,
    endDate: "2026-11-30",
    now,
    existing: existing.filter((x) => x.published),
  });
  const errors = validateNovemberPlan(drafts, now);
  const priorTitles = new Set(existing.map((x) => x.title.replace(/\s/g, "")));
  if (drafts.some((x) => priorTitles.has(x.title.replace(/\s/g, ""))))
    errors.push("Title overlaps an existing post");
  const analysisMap = new Map(
    analyses
      .filter((x) => x.analysis_status === "tagged" && x.confidence >= 70)
      .map((x) => [x.asset_id, x]),
  );
  const active = assets.filter(
    (x) => x.active && analysisMap.has(x.id) && /^https:\/\//.test(x.url),
  );
  const usage = new Map<string, number>();
  const prepared = drafts.map((d, index) => {
    const candidates = active
      .map((asset) => {
        const analysis = analysisMap.get(asset.id)!;
        const labels = [
          ...(analysis.visible_subject_tags || []),
          ...(analysis.leak_type_tags || []),
        ];
        const score = d.tags.reduce(
          (sum, tag) => sum + (labels.some((x) => x.includes(tag)) ? 10 : 0),
          0,
        );
        return { asset, score };
      })
      .filter((x) => x.score >= 10)
      .sort(
        (a, b) =>
          b.score - a.score ||
          (usage.get(a.asset.id) || 0) - (usage.get(b.asset.id) || 0) ||
          a.asset.id.localeCompare(b.asset.id),
      );
    const unique = [...new Map(candidates.map((x) => [x.asset.url, x])).values()].slice(0, 3);
    if (!unique.length) errors.push(`No relevant image: ${d.slug}`);
    const id = randomUUID();
    const images = unique.map(({ asset }, sort_order) => {
      usage.set(asset.id, (usage.get(asset.id) || 0) + 1);
      const analysis = analysisMap.get(asset.id)!;
      const visible = (analysis.visible_subject_tags || []).slice(0, 3).join("·") || "설비";
      return {
        id: randomUUID(),
        post_id: id,
        url: asset.url,
        sort_order,
        alt_text: `${visible} 상태를 살피는 점검 참고 사진`,
        caption: `노모어누수 사진 자료 중 ${visible} 관련 참고 사진입니다. 이 글의 지역에서 촬영한 현장 기록을 뜻하지 않습니다.`,
        work_stage: "점검 참고",
      };
    });
    const imageBlock = images.map((image) => `[[post-image:${image.id}]]`).join("\n\n");
    const content = d.content.replace(
      "## " + d.title.split(" ")[0] + "에서 상담을 요청할 때",
      `## 사진으로 보는 점검 참고 자료\n\n${imageBlock}\n\n## ${d.title.split(" ")[0]}에서 상담을 요청할 때`,
    );
    return {
      post: {
        id,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content,
        published: false,
        published_at: d.published_at,
        region_tags: d.region_tags,
        category: d.category,
        cover_image_url: images[0]?.url || null,
      },
      images,
      topicKey: d.topicKey,
    };
  });
  if (errors.length) throw new Error(JSON.stringify(errors));
  // All linked existing posts are already public; no article points to future reservations.
  const manifest = {
    campaign: "november-2026-v1",
    generatedAt: now.toISOString(),
    startDate,
    endDate: "2026-11-30",
    counts: counts(prepared.map((x) => x.post)),
    posts: prepared,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  const digest = createHash("sha256").update(fs.readFileSync(manifestPath)).digest("hex");
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        manifestPath,
        sha256: digest,
        posts: prepared.length,
        images: prepared.reduce((n, x) => n + x.images.length, 0),
        counts: manifest.counts,
        first: prepared[0]?.post.published_at,
        last: prepared.at(-1)?.post.published_at,
        samples: prepared
          .filter((_, i) => [0, 31, 62, 93, 124, 155, 186, 217, 248].includes(i))
          .map((x) => ({ title: x.post.title, length: x.post.content.length })),
      },
      null,
      2,
    ),
  );
} else {
  const manifest = JSON.parse(fs.readFileSync(apply, "utf8"));
  if (manifest.campaign !== "november-2026-v1") throw new Error("Unexpected manifest");
  const prepared = manifest.posts as { post: any; images: any[] }[];
  const expected = process.env.NOVEMBER_MANIFEST_SHA256;
  const actual = createHash("sha256").update(fs.readFileSync(apply)).digest("hex");
  if (!expected || expected !== actual) throw new Error("Reviewed manifest checksum required");
  if (prepared.some((x) => +new Date(x.post.published_at) <= Date.now() + 5 * 60000))
    throw new Error("Reservation is no longer safely in the future. Rebuild the plan.");
  // Idempotent resume is permitted only for the exact preassigned IDs in this manifest.
  const existing = await collect("posts", "id,slug,published,published_at");
  for (const x of prepared) {
    const conflict = existing.find((p) => p.slug === x.post.slug);
    if (conflict && (conflict.id !== x.post.id || +new Date(conflict.published_at) <= Date.now()))
      throw new Error(`Existing post conflict: ${x.post.slug}`);
  }
  for (let offset = 0; offset < prepared.length; offset += 40) {
    const batch = prepared.slice(offset, offset + 40);
    requireOk(
      await db.from("posts").upsert(
        batch.map((x) => ({ ...x.post, published: false })),
        { onConflict: "id" },
      ),
      "draft save",
    );
    requireOk(
      await db.from("post_images").upsert(
        batch.flatMap((x) => x.images),
        { onConflict: "id" },
      ),
      "image save",
    );
    console.log(`Prepared ${Math.min(offset + 40, prepared.length)}/${prepared.length} drafts`);
  }
  // Arm only complete records after every draft and image has been saved.
  for (let offset = 0; offset < prepared.length; offset += 80) {
    const batch = prepared.slice(offset, offset + 80);
    requireOk(
      await db
        .from("posts")
        .update({ published: true })
        .in(
          "id",
          batch.map((x) => x.post.id),
        )
        .gt("published_at", new Date().toISOString()),
      "arm reservations",
    );
  }
  const saved = (
    await collect("posts", "id,slug,title,published,published_at,content,cover_image_url")
  ).filter((x) => prepared.some((p) => p.post.id === x.id));
  if (saved.length !== prepared.length || saved.some((x) => !x.published))
    throw new Error("Incomplete calendar readback");
  for (const x of prepared) {
    const row = saved.find((p) => p.id === x.post.id);
    if (
      !row ||
      (row.published_at !== x.post.published_at.replace("Z", "+00:00") &&
        +new Date(row.published_at) !== +new Date(x.post.published_at)) ||
      row.content !== x.post.content
    )
      throw new Error(`Readback mismatch: ${x.post.slug}`);
  }
  const images = (await collect("post_images", "id,post_id,url")).filter((x) =>
    saved.some((p) => p.id === x.post_id),
  );
  if (images.length !== prepared.reduce((sum, x) => sum + x.images.length, 0))
    throw new Error("Image count mismatch");
  for (let offset = 0; offset < saved.length; offset += 80) {
    const r = await anon
      .from("posts")
      .select("id")
      .in(
        "id",
        saved.slice(offset, offset + 80).map((x) => x.id),
      );
    requireOk(r, "anonymous future query");
    if (r.data?.length) throw new Error("Future reservations are publicly readable");
  }
  const sitemap = await fetch("https://nomorenusu.com/sitemap.xml");
  if (!sitemap.ok) throw new Error(`Sitemap status ${sitemap.status}`);
  const xml = await sitemap.text();
  if (saved.some((x) => xml.includes(`/posts/${x.slug}`)))
    throw new Error("Future reservations included in sitemap");
  const report = {
    verifiedAt: new Date().toISOString(),
    campaign: manifest.campaign,
    posts: saved.length,
    images: images.length,
    counts: counts(saved),
    futurePublicRows: 0,
    futureSitemapEntries: 0,
    first: saved.map((x) => x.published_at).sort()[0],
    last: saved
      .map((x) => x.published_at)
      .sort()
      .at(-1),
    calendar: "https://nomorenusu.com/admin/calendar?month=2026-11",
  };
  fs.writeFileSync(apply.replace(".json", "-verified.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
