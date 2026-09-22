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
6. Deploy only after checks pass. Verify the canonical domain, sitemap, RSS, one published post, one future post, metadata, structured data, and mobile layout.
7. Re-run the same audit. Record each original finding as fixed/changed, no-change/not-needed, or deferred with evidence.
8. Judge performance over comparable 14-day and 28-day windows. Never promise a ranking date.

## Scope

Focus on the website and its own public pages. Do not add Naver Blog work unless the user explicitly changes scope. Prefer free first-party data and local audits. Do not add paid SEO providers without explicit authorization.
