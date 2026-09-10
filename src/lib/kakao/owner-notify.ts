import "server-only";

import { getKakaoOwnerNotifyConfig, publicEnv, serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PROVIDER = "kakao_owner_notify";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type StoredIntegration = {
  provider: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string;
  scope: string | null;
};

type KakaoTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

function b64url(bytes: Uint8Array) { return Buffer.from(bytes).toString("base64url"); }
function unb64url(value: string) { return new Uint8Array(Buffer.from(value, "base64url")); }

async function cryptoKey() {
  const material = await crypto.subtle.digest("SHA-256", encoder.encode(serverEnv().SESSION_SECRET));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encrypt(value: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cryptoKey(), encoder.encode(value));
  return `${b64url(iv)}.${b64url(new Uint8Array(encrypted))}`;
}

async function decrypt(value: string) {
  const [ivRaw, cipherRaw] = value.split(".");
  if (!ivRaw || !cipherRaw) throw new Error("Stored Kakao token is malformed");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64url(ivRaw) }, await cryptoKey(), unb64url(cipherRaw));
  return decoder.decode(plain);
}

export function kakaoRedirectUri() {
  return `${publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/admin/integrations/kakao/callback`;
}

export async function saveKakaoOwnerTokens(tokens: KakaoTokens) {
  if (!tokens.refresh_token) throw new Error("카카오 갱신 토큰을 받지 못했습니다.");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("admin_integrations").upsert({
    provider: PROVIDER,
    access_token_encrypted: await encrypt(tokens.access_token),
    refresh_token_encrypted: await encrypt(tokens.refresh_token),
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    scope: tokens.scope ?? "talk_message",
  }, { onConflict: "provider" });
  if (error) throw new Error(`카카오 연결 저장 실패: ${error.message}`);
}

export async function connectKakaoOwnerFromCode(code: string) {
  const { restApiKey, clientSecret } = getKakaoOwnerNotifyConfig();
  const body = new URLSearchParams({ grant_type: "authorization_code", client_id: restApiKey, redirect_uri: kakaoRedirectUri(), code });
  if (clientSecret) body.set("client_secret", clientSecret);
  const response = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" }, body, cache: "no-store" });
  if (!response.ok) throw new Error(`카카오 토큰 발급 실패 (${response.status})`);
  await saveKakaoOwnerTokens(await response.json() as KakaoTokens);
}

async function currentAccessToken(): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("admin_integrations").select("provider,access_token_encrypted,refresh_token_encrypted,expires_at,scope").eq("provider", PROVIDER).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("카카오 알림 계정이 아직 연결되지 않았습니다.");
  const stored = data as StoredIntegration;
  if (new Date(stored.expires_at).getTime() > Date.now() + 5 * 60_000) return decrypt(stored.access_token_encrypted);

  const { restApiKey, clientSecret } = getKakaoOwnerNotifyConfig();
  const body = new URLSearchParams({ grant_type: "refresh_token", client_id: restApiKey, refresh_token: await decrypt(stored.refresh_token_encrypted) });
  if (clientSecret) body.set("client_secret", clientSecret);
  const response = await fetch("https://kauth.kakao.com/oauth/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" }, body, cache: "no-store" });
  if (!response.ok) throw new Error(`카카오 토큰 갱신 실패 (${response.status})`);
  const refreshed = await response.json() as KakaoTokens;
  const { error: updateError } = await supabase.from("admin_integrations").update({
    access_token_encrypted: await encrypt(refreshed.access_token),
    refresh_token_encrypted: refreshed.refresh_token ? await encrypt(refreshed.refresh_token) : stored.refresh_token_encrypted,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    scope: refreshed.scope ?? stored.scope,
  }).eq("provider", PROVIDER);
  if (updateError) throw new Error(updateError.message);
  return refreshed.access_token;
}

export async function sendKakaoOwnerNotification(input: { id: string; customerName: string; phone: string; region?: string | null; apartment?: string | null; symptom: string }) {
  const origin = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const location = [input.region, input.apartment].filter(Boolean).join(" · ") || "지역 미입력";
  const template = {
    object_type: "text",
    text: ["[새 견적 신청]", `이름: ${input.customerName}`, `연락처: ${input.phone}`, `지역: ${location}`, `증상: ${input.symptom.replace(/\s+/g, " ").slice(0, 220)}`].join("\n"),
    link: { web_url: `${origin}/admin/requests/${input.id}`, mobile_web_url: `${origin}/admin/requests/${input.id}` },
    button_title: "접수 내용 보기",
  };
  const body = new URLSearchParams({ template_object: JSON.stringify(template) });
  const response = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${await currentAccessToken()}`, "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`카카오 알림 발송 실패 (${response.status})`);
}

export async function kakaoOwnerNotifyConnected() {
  try {
    const { data } = await createSupabaseAdminClient().from("admin_integrations").select("provider,updated_at").eq("provider", PROVIDER).maybeSingle();
    return data;
  } catch { return null; }
}
