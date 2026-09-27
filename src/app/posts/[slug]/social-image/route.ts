import sharp from "sharp";
import { getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/env";
import { POST_SOCIAL_IMAGE_HEIGHT, POST_SOCIAL_IMAGE_WIDTH } from "@/lib/seo/post-image";

export const runtime = "nodejs";
export const revalidate = 3600;

async function fetchImage(url: string) {
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error(`Failed to fetch source image: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
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
    const png = await sharp(source)
      .rotate()
      .resize(POST_SOCIAL_IMAGE_WIDTH, POST_SOCIAL_IMAGE_HEIGHT, {
        fit: "cover",
        position: "attention",
      })
      .png({ compressionLevel: 8 })
      .toBuffer();

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Failed to create post social image", { slug, sourceUrl, error });
    return new Response("Image generation failed", { status: 502 });
  }
}
