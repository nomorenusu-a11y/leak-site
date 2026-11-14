export const YETI = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Yeti/1.1";

export function decodeXml(value) {
  return value.replace(/&(amp|lt|gt|quot|apos|#39|#x27);/gi, (_, entity) =>
    ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", "#x27": "'" })[entity.toLowerCase()],
  );
}

function element(xml, tag) {
  const value = xml.match(new RegExp(`<${tag}>([^<]+)</${tag}>`, "i"))?.[1];
  return value ? decodeXml(value.trim()) : "";
}

export function sitemapDates(xml, siteUrl) {
  const entries = new Map();
  for (const [, entry] of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const location = element(entry, "loc");
    if (URL.canParse(location) && new URL(location).origin === siteUrl.origin) {
      entries.set(location, Date.parse(element(entry, "lastmod")));
    }
  }
  return entries;
}

export function recentFeedPosts(rss, siteUrl, { since, until }) {
  if (!/<rss\b/i.test(rss) || !/<\/rss>/i.test(rss)) throw new Error("RSS 형식 오류");
  const posts = new Set();
  for (const [, item] of rss.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const date = Date.parse(element(item, "pubDate"));
    const url = new URL(element(item, "link"));
    if (!Number.isFinite(date) || url.origin !== siteUrl.origin ||
        !/^\/posts\/[^/]+$/.test(url.pathname) || url.search || url.hash) {
      throw new Error("RSS 게시글 주소 또는 발행일 오류");
    }
    if (date > until) throw new Error("RSS에 미래 예약 글이 포함됐습니다.");
    if (date >= since) posts.add(url.href);
  }
  return [...posts];
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(
      ([, name, double, single]) => [name.toLowerCase(), decodeXml(double ?? single)],
    ),
  );
}

export function inspectPostHtml(url, { status, headers, body, lastModified }) {
  if (status !== 200) return { problems: [`HTTP ${status}`] };
  const head = body.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const tags = [...head.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const meta = (name) => tags.find((tag) => (tag.name ?? tag.property) === name)?.content;
  const canonicals = tags.filter((tag) => tag.rel?.toLowerCase() === "canonical");
  const problems = [];
  if (canonicals.length !== 1 || canonicals[0].href !== url) problems.push("대표 주소 불일치");
  const robots = tags.filter((tag) => /^(robots|yeti)$/i.test(tag.name ?? ""));
  if ([headers.get("x-robots-tag"), ...robots.map((tag) => tag.content)]
      .some((value) => /\b(noindex|none)\b/i.test(value ?? ""))) problems.push("색인 차단 지시");
  if (!/<title>[^<]+<\/title>/i.test(head) || !/<h1\b/i.test(body)) problems.push("제목·본문 확인 실패");
  const modified = Date.parse(meta("article:modified_time") ?? "");
  if (Number.isFinite(lastModified) && !(modified >= lastModified)) {
    problems.push("사이트맵보다 오래된 공개 페이지");
  }
  let image;
  try {
    image = new URL(meta("og:image"));
    if (image.protocol !== "https:" && image.protocol !== "http:") throw new Error("invalid");
  } catch {
    problems.push("대표 이미지 주소 오류");
    image = undefined;
  }
  return { problems, image: image?.href };
}

export async function requestWithRetry(url, request = fetch, options = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await request(url, {
        headers: { "user-agent": YETI },
        redirect: "manual",
        signal: AbortSignal.timeout(12_000),
        ...options,
      });
      if (attempt || response.status < 500) return response;
      await response.body?.cancel();
    } catch (error) {
      if (attempt) throw error;
    }
  }
}
