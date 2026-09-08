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
const DRY_RUN = process.env.MEDIA_SYNC_DRY_RUN === "1";
const BATCH_SIZE = Number.parseInt(process.env.MEDIA_SYNC_BATCH_SIZE ?? "0", 10) || 0;

const sourceDir = process.env.MEDIA_SOURCE_DIR;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const syncEndpoint = process.env.MEDIA_SYNC_ENDPOINT;
const syncToken = process.env.MEDIA_SYNC_TOKEN;
const useDirectSupabase = Boolean(serviceRole && !serviceRole.includes("SENSITIVE"));

if (!sourceDir || !supabaseUrl || (!useDirectSupabase && (!syncEndpoint || !syncToken))) {
  throw new Error(
    "MEDIA_SOURCE_DIR와 Supabase 서비스 키 또는 MEDIA_SYNC_ENDPOINT/MEDIA_SYNC_TOKEN이 필요합니다.",
  );
}

const supabase = createClient(supabaseUrl!, serviceRole ?? "unused-direct-key", {
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
  let known = new Set<string>();
  if (!DRY_RUN) {
    if (useDirectSupabase) {
      const { data: existing, error: existingError } = await supabase
        .from("media_assets")
        .select("source_sha256")
        .not("source_sha256", "is", null);
      if (existingError) throw new Error(`라이브러리 조회 실패: ${existingError.message}`);
      known = new Set(
        (existing ?? [])
          .map((asset) => asset.source_sha256)
          .filter((value): value is string => Boolean(value)),
      );
    }
  }
  let processed = 0;
  let skipped = 0;
  let scheduled = 0;
  let optimizedBytes = 0;
  const failures: string[] = [];

  console.log(
    `${DRY_RUN ? "사전 검사" : "동기화"}: 사진 ${files.length}장. 영상 파일은 자동으로 제외됩니다.`,
  );
  await runPool(files, async (filePath) => {
    // A dry-run batch deliberately stops before hashing the rest of the archive.
    // This keeps capacity checks bounded on very large desktop folders.
    if (DRY_RUN && BATCH_SIZE > 0 && scheduled >= BATCH_SIZE) return;
    const relativePath = path.relative(root, filePath);
    try {
      const hash = await sha256(filePath);
      if (known.has(hash)) {
        skipped += 1;
        return;
      }
      if (BATCH_SIZE > 0 && scheduled >= BATCH_SIZE) return;
      scheduled += 1;
      let webp = await sharp(filePath)
        .rotate()
        .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      // Keep every derivative comfortably below the direct-upload request limit.
      if (webp.byteLength > 4 * 1024 * 1024) {
        webp = await sharp(filePath)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 65 })
          .toBuffer();
      }
      optimizedBytes += webp.byteLength;
      if (!DRY_RUN && useDirectSupabase) {
        const storagePath = `assets/${hash}.webp`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(storagePath, webp, { contentType: "image/webp", upsert: false });
        if (uploadError && !/already exists/i.test(uploadError.message)) {
          throw new Error(`업로드 실패: ${uploadError.message}`);
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
        if (insertError) throw new Error(`등록 실패: ${insertError.message}`);
        known.add(hash);
      }
      if (!DRY_RUN && !useDirectSupabase) {
        const form = new FormData();
        form.append(
          "file",
          new Blob([new Uint8Array(webp)], { type: "image/webp" }),
          `${hash}.webp`,
        );
        form.append("sourceHash", hash);
        form.append("relativePath", relativePath);
        const response = await fetch(syncEndpoint!, {
          method: "POST",
          headers: { authorization: `Bearer ${syncToken}` },
          body: form,
        });
        if (!response.ok) throw new Error(`전송 실패: ${response.status}`);
      }
      processed += 1;
      if (processed % 10 === 0 || processed === files.length - skipped) {
        console.log(
          `${DRY_RUN ? "검사" : "등록"} ${processed}장 · 건너뜀 ${skipped}장 · 오류 ${failures.length}장`,
        );
      }
    } catch (error) {
      failures.push(`${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
      console.error(`건너뜀(오류) · ${relativePath}`);
    }
  });
  console.log(
    `${DRY_RUN ? "사전 검사 완료" : "동기화 완료"}: 이번 실행 사진 ${processed}장, 기존 사진 ${skipped}장, 오류 ${failures.length}장, 최적화 용량 ${(optimizedBytes / 1024 ** 3).toFixed(2)}GB. 원본 파일은 변경하지 않았습니다.`,
  );
  if (failures.length) {
    console.error(`처리하지 못한 파일 ${failures.length}장:\n${failures.join("\n")}`);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
