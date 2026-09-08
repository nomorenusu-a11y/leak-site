/**
 * One-time / repeatable Mac photo library synchronizer.
 *
 * Reads only MEDIA_SOURCE_DIR, ignores movies, creates a web-sized WebP copy,
 * and records the source SHA-256 so future runs resume without duplicates.
 * Original local files are never edited, moved, or deleted.
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_CONCURRENT_UPLOADS = 2;

const sourceDir = process.env.MEDIA_SOURCE_DIR;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!sourceDir || !supabaseUrl || !serviceRole) {
  throw new Error(
    "MEDIA_SOURCE_DIR, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY가 필요합니다.",
  );
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listImages(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listImages(fullPath);
      return entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
        ? [fullPath]
        : [];
    }),
  );
  return nested.flat();
}

async function sha256(filePath: string) {
  const data = await fs.readFile(filePath);
  return createHash("sha256").update(data).digest("hex");
}

async function runPool<T>(items: T[], task: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, items.length) }, async () => {
      while (next < items.length) {
        const item = items[next++];
        await task(item);
      }
    }),
  );
}

async function main() {
  const root = path.resolve(sourceDir!);
  const files = await listImages(root);
  const { data: existing, error: existingError } = await supabase
    .from("media_assets")
    .select("source_sha256")
    .not("source_sha256", "is", null);
  if (existingError) throw new Error(`라이브러리 조회 실패: ${existingError.message}`);
  const known = new Set((existing ?? []).map((asset) => asset.source_sha256).filter(Boolean));
  let processed = 0;
  let skipped = 0;

  console.log(`사진 ${files.length}장을 확인합니다. 영상 파일은 자동으로 제외됩니다.`);
  await runPool(files, async (filePath) => {
    const hash = await sha256(filePath);
    if (known.has(hash)) {
      skipped += 1;
      return;
    }
    const relativePath = path.relative(root, filePath);
    const webp = await sharp(filePath)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const storagePath = `assets/${hash}.webp`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(storagePath, webp, { contentType: "image/webp", upsert: false });
    if (uploadError && !/already exists/i.test(uploadError.message)) {
      throw new Error(`${relativePath} 업로드 실패: ${uploadError.message}`);
    }
    const { data: publicUrl } = supabase.storage.from("post-images").getPublicUrl(storagePath);
    const { error: insertError } = await supabase.from("media_assets").upsert(
      {
        url: publicUrl.publicUrl,
        file_name: path.basename(filePath),
        mime_type: "image/webp",
        source_sha256: hash,
        source_relative_path: relativePath,
      },
      { onConflict: "source_sha256", ignoreDuplicates: true },
    );
    if (insertError) throw new Error(`${relativePath} 등록 실패: ${insertError.message}`);
    known.add(hash);
    processed += 1;
    console.log(`등록 ${processed}장 · 건너뜀 ${skipped}장 · ${relativePath}`);
  });
  console.log(
    `완료: 새 사진 ${processed}장, 기존 사진 ${skipped}장. 원본 파일은 변경하지 않았습니다.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
