import { siteConfig } from "@/lib/env";

export const POST_SOCIAL_IMAGE_WIDTH = 1200;
export const POST_SOCIAL_IMAGE_HEIGHT = 630;

/**
 * Search engines receive one deterministic, first-party image URL per post.
 * The route converts the post's field photo to PNG and supplies fixed dimensions.
 */
export function postSocialImageUrl(slug: string) {
  return `${siteConfig.url}/posts/${encodeURIComponent(slug)}/social-image`;
}
