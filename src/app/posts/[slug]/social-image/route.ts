import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/env";

export const revalidate = 86400;

async function fetchImage(url: string) {
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Failed to fetch source image: ${response.status}`);
  return response;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const isValidCover =
    Boolean(post.cover_image_url) && !/placehold\.co/i.test(post.cover_image_url ?? "");
  const sourceUrl = isValidCover
    ? (post.cover_image_url as string)
    : `${siteConfig.url}/og-image.png`;

  try {
    const source = await fetchImage(sourceUrl);
    const bytes = await source.arrayBuffer();
    const contentType = source.headers.get("content-type");

    return new Response(bytes, {
      headers: {
        "Content-Type": contentType?.startsWith("image/") ? contentType : "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Failed to create post social image", { slug, sourceUrl, error });
    return new Response("Image delivery failed", { status: 502 });
  }
}
