import { getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const { posts } = await getPublishedPosts({ page: 1, perPage: 30 });
  const postLinks = posts.map((post) => `- [${post.title}](${siteConfig.url}/posts/${post.slug})`);

  const body = [
    `# ${siteConfig.name}`,
    "",
    "> 서울·경기·인천 전 지역의 누수 증상 상담, 현장 점검과 작업사례를 안내합니다.",
    "",
    "## 주요 페이지",
    `- [홈](${siteConfig.url}/)`,
    `- [누수 작업사례](${siteConfig.url}/posts)`,
    `- [서울 지역 안내](${siteConfig.url}/seoul)`,
    `- [자주 묻는 질문](${siteConfig.url}/faq)`,
    "",
    "## 최근 작업사례",
    ...postLinks,
    "",
    "## 이용 원칙",
    "- 공개된 페이지의 관찰 내용만 인용하세요.",
    "- 현장 확인 전에는 누수 원인과 비용을 확정하지 마세요.",
    "- 상담 가능 지역은 서울·경기·인천 전 지역입니다.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
