import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_BYTES = 5 * 1024 * 1024;

function isAuthorized(request: Request) {
  const expected = process.env.MEDIA_SYNC_TOKEN;
  const received = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !received || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}
function adminDb() {
  const { url, serviceRole } = getSupabaseAdminConfig();
  return createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = adminDb();
  const url = new URL(request.url);
  if (url.searchParams.get("action") === "analysis-pending") {
    const requested = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
    const limit = Number.isFinite(requested) ? Math.max(1, Math.min(requested, 20)) : 10;
    const { data: pending, error: pendingError } = await db.from("media_asset_analysis").select("asset_id").eq("analysis_status", "pending").limit(limit);
    if (pendingError) return NextResponse.json({ error: "Analysis queue lookup failed" }, { status: 502 });
    const ids = (pending ?? []).map((row) => row.asset_id);
    if (!ids.length) return NextResponse.json({ assets: [] });
    const { data: assets, error: assetError } = await db.from("media_assets").select("id, source_relative_path, file_name").in("id", ids).eq("active", true);
    if (assetError) return NextResponse.json({ error: "Asset lookup failed" }, { status: 502 });
    return NextResponse.json({ assets: assets ?? [] });
  }
  const { data, error } = await db.from("media_assets").select("source_sha256").not("source_sha256", "is", null);
  if (error) return NextResponse.json({ error: "Asset lookup failed" }, { status: 502 });
  return NextResponse.json({ hashes: data.map((asset) => asset.source_sha256).filter(Boolean) });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("content-type")?.includes("application/json")) {
    const input = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (input?.action !== "analysis-result" || typeof input.assetId !== "string") return NextResponse.json({ error: "Invalid analysis payload" }, { status: 400 });
    const validStatus = ["tagged", "needs_review", "failed"].includes(String(input.status));
    const validStage = ["damage", "inspection", "detection", "repair", "completion", "unknown"].includes(String(input.workStage));
    const validTags = (value: unknown) => Array.isArray(value) && value.every((tag) => typeof tag === "string" && tag.length <= 80) && value.length <= 20;
    if (!validStatus || !validStage || typeof input.confidence !== "number" || input.confidence < 0 || input.confidence > 100 || !validTags(input.visibleSubjectTags) || !validTags(input.leakTypeTags) || !validTags(input.symptomTags)) return NextResponse.json({ error: "Invalid analysis result" }, { status: 400 });
    const { error } = await adminDb().from("media_asset_analysis").update({ analysis_status: input.status, analysis_version: typeof input.model === "string" ? input.model.slice(0, 80) : "local-vision", scene_summary: typeof input.sceneSummary === "string" ? input.sceneSummary.slice(0, 240) : "", work_stage: input.workStage, visible_subject_tags: input.visibleSubjectTags, leak_type_tags: input.leakTypeTags, symptom_tags: input.symptomTags, confidence: Math.round(input.confidence), ai_result: typeof input.aiResult === "object" && input.aiResult ? input.aiResult : {}, analyzed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("asset_id", input.assetId);
    if (error) return NextResponse.json({ error: "Analysis result save failed" }, { status: 502 });
    return NextResponse.json({ ok: true });
  }
  const form = await request.formData();
  const file = form.get("file");
  const sourceHash = form.get("sourceHash");
  const relativePath = form.get("relativePath");
  if (!(file instanceof File) || file.type !== "image/webp" || file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  if (typeof sourceHash !== "string" || !/^[a-f0-9]{64}$/.test(sourceHash)) return NextResponse.json({ error: "Invalid source hash" }, { status: 400 });
  if (typeof relativePath !== "string" || relativePath.length > 500) return NextResponse.json({ error: "Invalid source path" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `assets/${sourceHash}.webp`;
  const db = adminDb();
  const { error: uploadError } = await db.storage.from("post-images").upload(storagePath, buffer, { contentType: "image/webp", upsert: false });
  if (uploadError && !/already exists/i.test(uploadError.message)) return NextResponse.json({ error: "Storage upload failed" }, { status: 502 });
  const { data: publicUrl } = db.storage.from("post-images").getPublicUrl(storagePath);
  const { data: existing, error: lookupError } = await db.from("media_assets").select("id").eq("source_sha256", sourceHash).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Asset lookup failed" }, { status: 502 });
  const { error: insertError } = existing ? { error: null } : await db.from("media_assets").insert({ url: publicUrl.publicUrl, file_name: `${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}.webp`, mime_type: "image/webp", source_sha256: sourceHash, source_relative_path: relativePath });
  if (insertError) return NextResponse.json({ error: "Asset record failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
