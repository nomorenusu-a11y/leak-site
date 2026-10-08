<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Production safety rules

These rules protect the live `nomorenusu.com` search presence. Follow them for every production change.

1. The production host is Cloudflare Workers. Do not reconnect the production domain to Vercel or add Vercel DNS records.
2. Keep both custom domains in `cloudflare.config.ts`: `nomorenusu.com` and `www.nomorenusu.com`.
3. Do not remove `VINEXT_KV_CACHE` or the `kvDataAdapter()` configuration. ISR pages require this cache binding on Cloudflare.
4. Before production deployment, run `npm test` and `npm run build:vinext`. Stop if either fails.
5. Deploy only with `npm run deploy:vinext`. After deployment run `npm run verify:production`.
6. A deployment is not complete until the homepage, `robots.txt`, `sitemap.xml`, a public post, and its social image all return HTTP 200 on `https://nomorenusu.com`.
7. Public pages must use the `노모어누수` brand and must not expose `유레카`, `최태환`, `leak-site.vercel.app`, or a `noindex` directive.
8. Keep canonical, Open Graph, sitemap, and robots URLs on `https://nomorenusu.com`.
9. Do not request or open future scheduled post URLs before their `published_at` time. Verify them through the admin calendar and sitemap exclusion only.
10. Do not claim a Naver ranking improvement from a deployment alone. Verify impressions, clicks, queries, and indexed URLs in Naver Search Advisor after enough collection time.
11. If production verification fails, restore the last known working Worker version first. Do not continue content publishing while the public site is unavailable.
12. Never commit secrets, `.env.local`, Supabase service-role values, admin passwords, or temporary CLI state under `supabase/.temp/`.

The operator-facing recovery checklist is in `docs/PRODUCTION_RUNBOOK.md`.
