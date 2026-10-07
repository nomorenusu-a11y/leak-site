import { siteConfig } from "@/lib/env";

export const POST_SOCIAL_IMAGE_WIDTH = 1200;
export const POST_SOCIAL_IMAGE_HEIGHT = 630;

/**
 * Search engines receive one deterministic, first-party image URL per post.
 * The route serves the post's field photo through a stable first-party URL.
 */
export function postSocialImageUrl(slug: string) {
  return `${siteConfig.url}/posts/${encodeURIComponent(slug)}/social-image`;
}
