"use client";

import { useEffect } from "react";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * /posts/[slug] 페이지 진입 시 1회 view_post 이벤트 발사.
 */
export function PostViewTracker({
  slug,
  regionTags,
}: {
  slug: string;
  regionTags: string[];
}) {
  useEffect(() => {
    trackEvent(EVENTS.VIEW_POST, {
      slug,
      region_tags: regionTags.join(",") || "(none)",
    });
  }, [slug, regionTags]);
  return null;
}
