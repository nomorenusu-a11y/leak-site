import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/env";
import { markdownToPlainText } from "@/lib/markdown";

export const dynamic = "force-dynamic";

function xmlEscape(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function GET() {
  const { posts } = await getPublishedPosts({ page: 1, perPage: 50 });
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/posts/${post.slug}`;
      const description = post.excerpt ?? markdownToPlainText(post.content, 220);
      return `
    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xmlEscape(description)}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(siteConfig.name)} 작업사례</title>
    <link>${siteConfig.url}/posts</link>
    <description>서울·경기·인천 누수 점검 및 작업사례</description>
    <language>ko-KR</language>${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
