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
  const { data, error } = await adminDb()
    .from("media_assets")
    .select("source_sha256")
    .not("source_sha256", "is", null);
  if (error) return NextResponse.json({ error: "Asset lookup failed" }, { status: 502 });
  return NextResponse.json({ hashes: data.map((asset) => asset.source_sha256).filter(Boolean) });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const sourceHash = form.get("sourceHash");
  const relativePath = form.get("relativePath");
  if (!(file instanceof File) || file.type !== "image/webp" || file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }
  if (typeof sourceHash !== "string" || !/^[a-f0-9]{64}$/.test(sourceHash)) {
    return NextResponse.json({ error: "Invalid source hash" }, { status: 400 });
  }
  if (typeof relativePath !== "string" || relativePath.length > 500) {
    return NextResponse.json({ error: "Invalid source path" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `assets/${sourceHash}.webp`;
  const db = adminDb();
  const { error: uploadError } = await db.storage
    .from("post-images")
    .upload(storagePath, buffer, { contentType: "image/webp", upsert: false });
  if (uploadError && !/already exists/i.test(uploadError.message)) {
    return NextResponse.json({ error: "Storage upload failed" }, { status: 502 });
  }
  const { data: publicUrl } = db.storage.from("post-images").getPublicUrl(storagePath);
  // A partial index may exist on older installations, which PostgREST cannot
  // use as an `onConflict` target. Check first so both old and new schemas work.
  const { data: existing, error: lookupError } = await db
    .from("media_assets")
    .select("id")
    .eq("source_sha256", sourceHash)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Asset lookup failed" }, { status: 502 });
  const { error: insertError } = existing
    ? { error: null }
    : await db.from("media_assets").insert({
        url: publicUrl.publicUrl,
        file_name: `${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}.webp`,
        mime_type: "image/webp",
        source_sha256: sourceHash,
        source_relative_path: relativePath,
      });
  if (insertError) return NextResponse.json({ error: "Asset record failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
