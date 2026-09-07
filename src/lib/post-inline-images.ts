import type { PostImage } from "@/types/database";

const MARKER = /\[\[post-image:([0-9a-f-]{36})\]\]/gi;

export type PostContentPart = { type: "markdown"; value: string } | { type: "image"; image: PostImage };

/** Only UUIDs belonging to the current post are rendered as images. */
export function splitPostContentByImages(content: string, images: PostImage[]): PostContentPart[] {
  const byId = new Map(images.map((image) => [image.id.toLowerCase(), image]));
  const parts: PostContentPart[] = [];
  let cursor = 0;
  for (const match of content.matchAll(MARKER)) {
    const image = byId.get(match[1].toLowerCase());
    if (!image || match.index === undefined) continue;
    if (match.index > cursor) parts.push({ type: "markdown", value: content.slice(cursor, match.index) });
    parts.push({ type: "image", image });
    cursor = match.index + match[0].length;
  }
  if (cursor < content.length || parts.length === 0) parts.push({ type: "markdown", value: content.slice(cursor) });
  return parts;
}

export function hasInlinePostImages(content: string, images: PostImage[]) {
  return splitPostContentByImages(content, images).some((part) => part.type === "image");
}
