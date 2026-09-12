/**
 * Local-only visual tagger for the reusable media library.
 *
 * Reads originals from MEDIA_SOURCE_DIR, sends each resized copy only to the
 * Ollama server running on this Mac, and saves structured tags in Supabase.
 * It never edits, moves, or uploads the original files.
 *
 * Run: npx tsx scripts/analyze-local-media.ts
 * Optional: MEDIA_ANALYSIS_BATCH_SIZE=10 npx tsx scripts/analyze-local-media.ts
 */
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const sourceDir = process.env.MEDIA_SOURCE_DIR;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const syncEndpoint = process.env.MEDIA_SYNC_ENDPOINT;
const syncToken = process.env.MEDIA_SYNC_TOKEN;
const batchSize = Math.max(1, Number.parseInt(process.env.MEDIA_ANALYSIS_BATCH_SIZE ?? "10", 10) || 10);
const model = process.env.MEDIA_ANALYSIS_MODEL ?? "qwen2.5vl:3b";
const ollamaUrl = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434";

const useDirectSupabase = Boolean(serviceRole && !serviceRole.includes("SENSITIVE"));
if (!sourceDir || !supabaseUrl || (!useDirectSupabase && (!syncEndpoint || !syncToken))) {
  throw new Error("MEDIA_SOURCE_DIR와 Supabase 서비스 키 또는 MEDIA_SYNC_ENDPOINT/MEDIA_SYNC_TOKEN이 필요합니다.");
}

const supabase = createClient(supabaseUrl, serviceRole ?? "unused-direct-key", { auth: { autoRefreshToken: false, persistSession: false } });
const subjectTags = ["배관", "수도계량기", "보일러", "분배기", "변기", "세면대", "샤워부스", "싱크대", "배수관", "천장", "벽체", "바닥", "베란다", "창틀", "외벽", "옥상", "탐지장비", "보수공구"];
const leakTags = ["수도배관 누수", "온수배관 누수", "난방배관 누수", "보일러 누수", "분배기 누수", "수도계량기 누수", "화장실 누수", "욕실 누수", "변기 누수", "세면대 누수", "샤워부스 누수", "싱크대 누수", "주방 배수관 누수", "하수관 누수", "천장 누수", "베란다 누수", "외벽 누수", "옥상 누수", "창틀 누수"];
const symptomTags = ["계량기가 계속 돌아감", "수도요금이 갑자기 증가함", "보일러 압력이 계속 떨어짐", "천장 물자국이 생김", "천장에서 물이 떨어짐", "벽지나 벽면이 젖음", "바닥 습기가 계속됨", "장판이나 마루가 들뜸", "욕실 바닥 물고임이 계속됨", "곰팡이와 습기가 심해짐", "하수구 냄새가 올라옴", "변기 주변 바닥이 젖음", "아랫집 천장에 누수가 생김"];
const stages = new Set(["damage", "inspection", "detection", "repair", "completion", "unknown"]);

type Asset = { id: string; source_relative_path: string | null; file_name: string };
type ModelResult = { scene_summary?: unknown; work_stage?: unknown; visible_subject_tags?: unknown; leak_type_tags?: unknown; symptom_tags?: unknown; confidence?: unknown };
type AnalysisOutput = { scene_summary: string; work_stage: string; visible_subject_tags: string[]; leak_type_tags: string[]; symptom_tags: string[]; confidence: number; ai_result: Record<string, unknown> };

function allowed(values: unknown, options: string[]) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === "string" && options.includes(value)))];
}

function safePath(root: string, relative: string) {
  const full = path.resolve(root, relative);
  if (!full.startsWith(`${root}${path.sep}`) && full !== root) throw new Error("허용되지 않은 사진 경로입니다.");
  return full;
}

async function analyzeImage(imagePath: string): Promise<AnalysisOutput> {
  const image = await sharp(imagePath).rotate().resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const prompt = `당신은 누수·설비 현장 사진을 분류하는 보조자입니다. 사진에 실제로 보이는 것만 한국어 JSON으로 답하세요. 지역, 고객, 누수 원인, 보수 완료 여부를 추측하지 마세요.\n\nwork_stage는 damage, inspection, detection, repair, completion, unknown 중 하나입니다.\nvisible_subject_tags는 다음 중 실제로 보이는 것만: ${subjectTags.join(", ")}\nleak_type_tags는 사진만으로 강하게 연결되는 경우에만: ${leakTags.join(", ")}\nsymptom_tags는 사진만으로 보이는 경우에만: ${symptomTags.join(", ")}\nconfidence는 0~100 정수입니다.\n형식: {"scene_summary":"80자 이내", "work_stage":"unknown", "visible_subject_tags":[], "leak_type_tags":[], "symptom_tags":[], "confidence":0}`;
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, stream: false, format: "json", messages: [{ role: "user", content: prompt, images: [image.toString("base64")] }] }),
  });
  if (!response.ok) throw new Error(`Ollama 분석 실패: ${response.status}`);
  const payload = (await response.json()) as { message?: { content?: string } };
  const raw = JSON.parse(payload.message?.content ?? "{}") as ModelResult;
  const confidence = typeof raw.confidence === "number" && Number.isFinite(raw.confidence) ? Math.max(0, Math.min(100, Math.round(raw.confidence))) : 0;
  const workStage = typeof raw.work_stage === "string" && stages.has(raw.work_stage) ? raw.work_stage : "unknown";
  return {
    scene_summary: typeof raw.scene_summary === "string" ? raw.scene_summary.slice(0, 240) : "",
    work_stage: workStage,
    visible_subject_tags: allowed(raw.visible_subject_tags, subjectTags),
    leak_type_tags: allowed(raw.leak_type_tags, leakTags),
    symptom_tags: allowed(raw.symptom_tags, symptomTags),
    confidence,
    ai_result: raw as Record<string, unknown>,
  };
}

async function getPendingAssets(): Promise<Asset[]> {
  if (!useDirectSupabase) {
    const response = await fetch(`${syncEndpoint}?action=analysis-pending&limit=${batchSize}`, {
      headers: { authorization: `Bearer ${syncToken}` },
    });
    if (!response.ok) throw new Error(`분석 대기열 조회 실패: ${response.status}`);
    const payload = (await response.json()) as { assets?: Asset[] };
    return Array.isArray(payload.assets) ? payload.assets : [];
  }
  const { data: pending, error: pendingError } = await supabase.from("media_asset_analysis").select("asset_id").eq("analysis_status", "pending").limit(batchSize);
  if (pendingError) throw new Error(`분석 대기열 조회 실패: ${pendingError.message}`);
  const ids = (pending ?? []).map((row) => row.asset_id);
  if (!ids.length) return [];
  const { data: assets, error: assetError } = await supabase.from("media_assets").select("id, source_relative_path, file_name").in("id", ids).eq("active", true);
  if (assetError) throw new Error(`사진 목록 조회 실패: ${assetError.message}`);
  return (assets ?? []) as Asset[];
}

async function saveResult(assetId: string, status: "tagged" | "needs_review" | "failed", result: AnalysisOutput) {
  if (!useDirectSupabase) {
    const response = await fetch(syncEndpoint!, {
      method: "POST",
      headers: { authorization: `Bearer ${syncToken}`, "content-type": "application/json" },
      body: JSON.stringify({ action: "analysis-result", assetId, status, model, sceneSummary: result.scene_summary, workStage: result.work_stage, visibleSubjectTags: result.visible_subject_tags, leakTypeTags: result.leak_type_tags, symptomTags: result.symptom_tags, confidence: result.confidence, aiResult: result.ai_result }),
    });
    if (!response.ok) throw new Error(`분석 결과 저장 실패: ${response.status}`);
    return;
  }
  const { error } = await supabase.from("media_asset_analysis").update({ ...result, analysis_status: status, analysis_version: model, analyzed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("asset_id", assetId);
  if (error) throw new Error(error.message);
}

async function main() {
  const root = path.resolve(sourceDir!);
  const assets = await getPendingAssets();
  if (!assets.length) { console.log("분석할 사진이 없습니다."); return; }
  console.log(`로컬 사진 분석 시작: ${assets.length}장 · 모델 ${model}`);
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    if (!asset.source_relative_path) continue;
    try {
      if (useDirectSupabase) await supabase.from("media_asset_analysis").update({ analysis_status: "analyzing" }).eq("asset_id", asset.id);
      const result = await analyzeImage(safePath(root, asset.source_relative_path));
      const status = result.confidence >= 60 && result.visible_subject_tags.length > 0 ? "tagged" : "needs_review";
      await saveResult(asset.id, status, result);
      console.log(`${index + 1}/${assets.length} ${status} · ${asset.file_name} · ${result.work_stage} · ${result.visible_subject_tags.join(", ") || "태그 없음"}`);
    } catch (error) {
      const fallback = { scene_summary: "", work_stage: "unknown", visible_subject_tags: [] as string[], leak_type_tags: [] as string[], symptom_tags: [] as string[], confidence: 0, ai_result: { error: error instanceof Error ? error.message : String(error) } };
      await saveResult(asset.id, "failed", fallback).catch(() => undefined);
      console.error(`${index + 1}/${assets.length} 실패 · ${asset.file_name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
