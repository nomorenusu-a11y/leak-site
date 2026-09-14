import "server-only";

import { siteConfig } from "@/lib/env";

export const INDEXNOW_KEY = "3c7a9a6877ce54921ba048ae7f5156b8890269597cfb609911671e25cda05e40";

export type IndexNowResult = {
  ok: boolean;
  submitted: number;
  status: number;
  error?: string;
};

export async function submitIndexNow(urls: string[]): Promise<IndexNowResult> {
  const origin = new URL(siteConfig.url);
  const urlList = Array.from(
    new Set(
      urls
        .map((value) => new URL(value, origin).toString())
        .filter((value) => new URL(value).host === origin.host),
    ),
  ).slice(0, 10_000);

  if (urlList.length === 0) return { ok: true, submitted: 0, status: 200 };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        host: origin.host,
        key: INDEXNOW_KEY,
        keyLocation: `${origin.origin}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    return {
      ok: response.ok,
      submitted: response.ok ? urlList.length : 0,
      status: response.status,
      error: response.ok ? undefined : `IndexNow returned ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      submitted: 0,
      status: 0,
      error: error instanceof Error ? error.message : "IndexNow request failed",
    };
  }
}
