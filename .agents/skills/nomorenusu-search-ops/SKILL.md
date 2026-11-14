---
name: nomorenusu-search-ops
description: Operate and improve the No More Leaks (노모어누수) website search system. Use for Naver SEO, publishing schedules, regional leak content, indexing, sitemaps, metadata, structured data, search visibility dashboards, technical audits, or diagnosing why nomorenusu.com is not being exposed.
---

# Nomorenusu Search Ops

Read [references/site-profile.md](references/site-profile.md) before changing search, publishing, regional pages, or metadata.

## Work in this order

1. Check `AGENTS.md`, the current branch, working tree, and production URL.
2. Establish evidence before changing code:
   - Run `seo report --url https://nomorenusu.com --crawl-max-pages 250 --crawl-max-depth 5 --actions-only --json`.
   - Read every returned finding and all retained inventories.
   - Use SearchAdvisor or the admin search snapshot for Naver impressions, clicks, queries, and indexed-page evidence. Do not treat a normal search result check as complete coverage.
3. Prioritize:
   - crawl/index blockers;
   - canonical, title, description, H1, sitemap, internal-link, and structured-data defects;
   - pages with real impressions but weak clicks;
   - unique pages supported by real evidence.
4. For every generated page, enforce the publishing gate in the site profile. Keep thin or unsupported location pages `noindex`.
5. Run typecheck, lint, tests, production build, and browser verification.
6. Deploy only after checks pass. Verify the canonical domain, sitemap, RSS, public post metadata, structured data, and mobile layout. Check future posts only in the admin calendar and by sitemap exclusion.
7. Re-run the same audit. Record each original finding as fixed/changed, no-change/not-needed, or deferred with evidence.
8. Judge performance over comparable 14-day and 28-day windows. Never promise a ranking date.

## Verify each stage for recent posts

- Use the actual Korean publication date to select a recent cohort. Compare public records with RSS and sitemap, then verify the canonical HTML and its preview image. An IndexNow HTTP 200 or 202 confirms receipt only.
- Run `DRY_RUN=1 node scripts/submit-naver-indexnow.mjs` after changing publish or cache behavior. Verify that the checks catch intentionally broken fixtures for future publication, wrong canonical, noindex, missing image, stale HTML, and temporary HTTP failures. Never inject faults into the public site.
- If the sitemap revision is newer than the canonical HTML, use the authenticated post editor and its path revalidation where available. Check the original URL again before sending an update. A cache-busting query is diagnostic evidence only.
- Use Naver URL Inspection for crawl and index evidence. Check ordinary queries for visibility and record the query, date, and exact matching URL. An empty sample or a blocked search stays unconfirmed. Follow the official report for exposure and clicks after its reporting delay.
- Select new topics from observed queries or verified customer questions first. Give the guidance in the first paragraph. Use photos that match the symptom and label reference photos as such. Add a link from a relevant public page when the link helps the reader.

## Scope

Focus on the website and its own public pages. Do not add Naver Blog work unless the user explicitly changes scope. Prefer free first-party data and local audits. Do not add paid SEO providers without explicit authorization.
