# 노모어누수 search profile

## Identity and scope

- Canonical domain: https://nomorenusu.com
- Brand: 노모어누수
- Service area: 서울·경기·인천 전 지역
- Primary search engine: 네이버
- Public conversion: phone and Kakao consultation
- Admin search page: /admin/search-visibility
- Publishing calendar: /admin/calendar
- Content scope: website posts and regional pages; exclude external blog work
- Never reintroduce former brand names or personal representative names.

## Publishing gate

Publish an indexable post only when all items pass:

1. One clear user problem combines a real location, building context, symptom, and inspection subject.
2. The title starts with the useful Korean terms and remains concise. The HTML title should normally keep the first clause and brand.
3. The opening paragraph answers what the reader should check without pretending a diagnosis is confirmed.
4. The body contains page-specific observations, a practical check sequence, limits, and a next action. Avoid shuffled template paragraphs.
5. Claims about a completed job, exact cause, equipment used, price, arrival time, or result require real evidence.
6. Use original field photos when available. Write descriptive alt text. Five distinct relevant images are the minimum target for image-list markup; a carousel is never guaranteed.
7. Add two to four useful internal links: one regional parent, one symptom/service cluster, one closely related case, and the conversion path when relevant.
8. Set one H1, a self-referencing canonical URL, unique metadata, Article and breadcrumb markup, and include the public URL in the sitemap.
9. Future scheduled posts must return unavailable until their publish time. Public posts must open with 200 status.
10. If the page lacks unique evidence, keep it draft or noindex. Volume targets do not override this gate.

## Regional page policy

- Keep generic district and legal-dong fallback pages noindex until reviewed copy or verified local evidence exists.
- Do not fabricate a case to make a location page indexable.
- Prefer strengthening a useful district or symptom hub over creating many near-duplicate pages.
- Link crawlers to canonical routes, not tracking or city query variants.

## Measurement

Track Naver impressions, clicks, click-through rate, query, landing URL, collection/index status, and sitemap health. Compare equal periods. A page appearing for site: searches proves discovery only; it does not prove useful ranking. Use 14-day and 28-day decisions:

- growing impressions: improve snippet and internal links;
- impressions without clicks: rewrite title and description around the shown query;
- no impressions after repeated collection: inspect uniqueness, internal links, canonical, and indexability;
- several pages competing for one intent: merge, redirect, or noindex the weaker page.

## Release checks

- /robots.txt permits Yeti and points to /sitemap.xml.
- /sitemap.xml contains every currently public post and no future post.
- /feed.xml returns RSS XML.
- /llms.txt returns plain text.
- Homepage has one primary H1.
- List and category pages have unique metadata and an appropriate CollectionPage/ItemList.
- Public post title, Korean breadcrumb, canonical, OG image, Article markup, and image-list markup are accurate.
- Mobile and desktop layouts have no clipping or horizontal overflow.
