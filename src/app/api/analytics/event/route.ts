import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hit } from "@/lib/rate-limit";

const eventNames = [
  "page_view",
  "view_post",
  "click_call",
  "click_kakao",
  "cta_click",
  "submit_quote",
  "filter_region",
  "scroll_50",
  "scroll_90",
  "outbound_click",
  "click_post_cta",
] as const;

const eventSchema = z.object({
  sessionId: z.string().uuid(),
  eventName: z.enum(eventNames),
  path: z.string().trim().min(1).max(500).startsWith("/"),
  acquisition: z.object({
    source: z.string().trim().min(1).max(120),
    referrerHost: z.string().trim().max(255).nullable(),
    searchQuery: z.string().trim().max(200).nullable(),
    utmSource: z.string().trim().max(100).nullable(),
    utmCampaign: z.string().trim().max(100).nullable(),
    isSearch: z.boolean(),
  }),
  deviceCategory: z.enum(["mobile", "tablet", "desktop"]),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const rate = hit(`analytics:${ip}`, 240, 60 * 60 * 1000);
    if (!rate.allowed)
      return NextResponse.json({ ok: false, error: "too_many_events" }, { status: 429 });

    const parsed = eventSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ ok: false, error: "invalid_event" }, { status: 400 });

    const value = parsed.data;
    const { error } = await createSupabaseAdminClient().from("analytics_events").insert({
      session_id: value.sessionId,
      event_name: value.eventName,
      path: value.path,
      source: value.acquisition.source,
      referrer_host: value.acquisition.referrerHost,
      search_query: value.acquisition.searchQuery,
      utm_source: value.acquisition.utmSource,
      utm_campaign: value.acquisition.utmCampaign,
      is_search: value.acquisition.isSearch,
      device_category: value.deviceCategory,
      metadata: value.metadata,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[analytics-event] collection failed", error);
    return NextResponse.json({ ok: false, error: "collection_failed" }, { status: 500 });
  }
}
