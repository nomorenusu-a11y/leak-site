export const POST_SEARCH_METADATA_REVISED_AT = new Date("2026-09-27T12:58:00.000Z");

/**
 * Global search metadata changes are real document updates even when the post
 * body stored in the database did not change. Keep that revision visible to
 * crawlers while preserving newer editorial timestamps.
 */
export function postSitemapLastModified(updatedAt: string | Date) {
  const editorialUpdate = new Date(updatedAt);
  if (Number.isNaN(editorialUpdate.valueOf())) return POST_SEARCH_METADATA_REVISED_AT;
  return editorialUpdate > POST_SEARCH_METADATA_REVISED_AT
    ? editorialUpdate
    : POST_SEARCH_METADATA_REVISED_AT;
}
