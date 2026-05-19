"use server";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LeakRequestInsert } from "@/types/database";

// =============================================================================
// 입력 검증 스키마
// =============================================================================

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^010-?\d{3,4}-?\d{4}$/,
    "010으로 시작하는 휴대전화 번호 형식이어야 합니다",
  )
  .transform((s) => {
    const digits = s.replace(/\D/g, "");
    return digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3");
  });

const inputSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(2, "이름은 2자 이상")
    .max(10, "이름은 10자 이내"),
  phone: phoneSchema,
  region: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v ? v : undefined)),
  apartment: z
    .string()
    .trim()
    .max(50)
    .optional()
    .transform((v) => (v ? v : undefined)),
  symptom: z
    .string()
    .trim()
    .min(10, "증상은 10자 이상")
    .max(500, "증상은 500자 이내"),
  utm_source: z.string().trim().max(100).optional(),
  utm_campaign: z.string().trim().max(100).optional(),
  city_code: z.string().trim().max(100).optional(),
});

export type QuoteFieldErrors = Partial<
  Record<keyof z.input<typeof inputSchema>, string>
>;

export type SubmitQuoteState =
  | { status: "idle" }
  | { status: "success"; utmSource?: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: QuoteFieldErrors;
    };

// =============================================================================
// 이미지 파일 검증 (zod 밖)
// =============================================================================

function pickImages(formData: FormData): File[] {
  const all = formData.getAll("images");
  const files: File[] = [];
  for (const item of all) {
    if (item instanceof File && item.size > 0) {
      files.push(item);
    }
  }
  return files;
}

function validateImages(files: File[]):
  | { ok: true }
  | { ok: false; message: string } {
  if (files.length > MAX_IMAGES) {
    return { ok: false, message: `사진은 최대 ${MAX_IMAGES}장까지 첨부할 수 있어요.` };
  }
  for (const f of files) {
    if (!ALLOWED_MIME.includes(f.type as (typeof ALLOWED_MIME)[number])) {
      return {
        ok: false,
        message: "JPG, PNG, WEBP 이미지만 첨부할 수 있어요.",
      };
    }
    if (f.size > MAX_BYTES) {
      return { ok: false, message: "한 장당 5MB를 넘을 수 없어요." };
    }
  }
  return { ok: true };
}

function extFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function buildObjectPath(mime: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ts = now.getTime();
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `requests/${yyyy}/${mm}/${ts}-${rand}.${extFromMime(mime)}`;
}

// =============================================================================
// Server Action
// =============================================================================

export async function submitQuote(
  _prev: SubmitQuoteState,
  formData: FormData,
): Promise<SubmitQuoteState> {
  // 1) 기본 필드 검증
  const raw = {
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    apartment: formData.get("apartment"),
    symptom: formData.get("symptom"),
    utm_source: formData.get("utm_source") || undefined,
    utm_campaign: formData.get("utm_campaign") || undefined,
    city_code: formData.get("city_code") || undefined,
  };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const fieldErrors: QuoteFieldErrors = {};
    for (const [key, msgs] of Object.entries(flat)) {
      if (msgs && msgs[0]) {
        fieldErrors[key as keyof QuoteFieldErrors] = msgs[0];
      }
    }
    return {
      status: "error",
      message: "입력하신 내용을 확인해 주세요.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  // 2) 이미지 검증
  const files = pickImages(formData);
  const imgCheck = validateImages(files);
  if (!imgCheck.ok) {
    return { status: "error", message: imgCheck.message };
  }

  // 3) Supabase 클라이언트 준비 (키 미설정이면 명확한 에러)
  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (err) {
    console.error("[submit-quote] supabase admin config:", err);
    return {
      status: "error",
      message: "서버 설정이 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // 4) 이미지 업로드 (있을 때만)
  const imageUrls: string[] = [];
  for (const file of files) {
    const path = buildObjectPath(file.type);
    const { error } = await supabase.storage
      .from("request-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("[submit-quote] upload error:", error);
      return {
        status: "error",
        message:
          "이미지 업로드 중 문제가 발생했어요. 사진을 빼고 다시 시도해 주세요.",
      };
    }
    const { data: pub } = supabase.storage
      .from("request-images")
      .getPublicUrl(path);
    imageUrls.push(pub.publicUrl);
  }

  // 5) symptom 본문 끝에 이미지 URL 추가
  const symptomBody =
    imageUrls.length > 0
      ? `${data.symptom}\n\n[첨부 사진]\n${imageUrls.join("\n")}`
      : data.symptom;

  // 6) DB insert
  const row: LeakRequestInsert = {
    customer_name: data.customer_name,
    phone: data.phone,
    region: data.region ?? null,
    apartment: data.apartment ?? null,
    symptom: symptomBody,
    utm_source: data.utm_source ?? null,
    utm_campaign: data.utm_campaign ?? null,
    city_code: data.city_code ?? null,
  };

  const { error: insertError } = await supabase
    .from("leak_requests")
    .insert(row);

  if (insertError) {
    console.error("[submit-quote] insert error:", insertError);
    return {
      status: "error",
      message: "신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
    };
  }

  return { status: "success", utmSource: data.utm_source };
}
