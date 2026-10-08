const SITE_URL = (process.env.SITE_URL || "https://nomorenusu.com").replace(/\/$/, "");
const MIN_SITEMAP_URLS = Number(process.env.MIN_SITEMAP_URLS || 300);
const forbidden = ["유레카", "최태환", "leak-site.vercel.app"];

const priorityPages = [
  {
    path: "/posts/bulgwang-house-water-meter-leak-guide",
    title: "불광동 수도계량기 누수",
  },
  {
    path: "/posts/munjeong-apartment-hot-water-pipe-leak-guide",
    title: "문정동 온수배관 누수",
  },
];

const failures = [];

async function request(path, options = {}) {
  const url = `${SITE_URL}${path}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "NomorenusuProductionVerifier/1.0",
      ...(options.headers || {}),
    },
    ...options,
  });
  const body = options.method === "HEAD" ? "" : await response.text();
  return { url, response, body };
}

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

function metaContent(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${escaped}["'][^>]+content=["']([^"']+)["']|` +
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${escaped}["']`,
    "i",
  );
  const match = html.match(pattern);
  return match?.[1] || match?.[2] || "";
}

function canonicalHref(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match?.[1] || "";
}

function assertPublicHtml(name, url, response, body) {
  requireCondition(response.status === 200, `${name}: expected HTTP 200, got ${response.status}`);
  requireCondition(!/noindex/i.test(body), `${name}: unexpected noindex directive`);
  requireCondition(body.includes("노모어누수"), `${name}: 노모어누수 brand is missing`);
  for (const word of forbidden) {
    requireCondition(!body.includes(word), `${name}: forbidden text found: ${word}`);
  }
  const canonical = canonicalHref(body);
  requireCondition(
    canonical.startsWith(`${SITE_URL}/`) || canonical === SITE_URL,
    `${name}: invalid canonical URL: ${canonical || "missing"}`,
  );
  requireCondition(
    url.startsWith(SITE_URL),
    `${name}: redirected away from production domain: ${url}`,
  );
}

try {
  const home = await request("/");
  assertPublicHtml("homepage", home.response.url, home.response, home.body);
  requireCondition(
    /cloudflare/i.test(home.response.headers.get("server") || ""),
    `homepage: expected Cloudflare server header, got ${home.response.headers.get("server") || "missing"}`,
  );

  const robots = await request("/robots.txt");
  requireCondition(
    robots.response.status === 200,
    `robots.txt: expected HTTP 200, got ${robots.response.status}`,
  );
  requireCondition(
    !/^\s*Disallow:\s*\/$/im.test(robots.body),
    "robots.txt: site-wide crawling is blocked",
  );
  requireCondition(
    robots.body.includes(`${SITE_URL}/sitemap.xml`),
    "robots.txt: production sitemap URL is missing",
  );

  const sitemap = await request("/sitemap.xml");
  requireCondition(
    sitemap.response.status === 200,
    `sitemap.xml: expected HTTP 200, got ${sitemap.response.status}`,
  );
  const locations = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  requireCondition(
    locations.length >= MIN_SITEMAP_URLS,
    `sitemap.xml: expected at least ${MIN_SITEMAP_URLS} URLs, got ${locations.length}`,
  );
  requireCondition(
    locations.every((location) => location.startsWith(`${SITE_URL}/`) || location === SITE_URL),
    "sitemap.xml: non-production domain URL found",
  );

  for (const page of priorityPages) {
    const result = await request(page.path);
    assertPublicHtml(page.path, result.response.url, result.response, result.body);
    const title = result.body.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
    requireCondition(title.includes(page.title), `${page.path}: expected search title is missing`);
    const description = metaContent(result.body, "name", "description");
    requireCondition(
      description.length >= 50,
      `${page.path}: meta description is missing or too short`,
    );
    const socialImage = metaContent(result.body, "property", "og:image");
    requireCondition(
      socialImage.startsWith(`${SITE_URL}/`),
      `${page.path}: production Open Graph image is missing`,
    );
    if (socialImage.startsWith(SITE_URL)) {
      const imagePath = socialImage.slice(SITE_URL.length);
      const image = await request(imagePath, { method: "HEAD" });
      requireCondition(
        image.response.status === 200,
        `${page.path}: social image returned ${image.response.status}`,
      );
      requireCondition(
        (image.response.headers.get("content-type") || "").startsWith("image/"),
        `${page.path}: social image has an invalid content type`,
      );
    }
    requireCondition(
      locations.includes(`${SITE_URL}${page.path}`),
      `${page.path}: URL is missing from sitemap.xml`,
    );
  }
} catch (error) {
  failures.push(
    `verification request failed: ${error instanceof Error ? error.message : String(error)}`,
  );
}

if (failures.length > 0) {
  console.error("Production verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production verification passed for ${SITE_URL}.`);
console.log(`- sitemap URLs: at least ${MIN_SITEMAP_URLS}`);
console.log(`- priority pages: ${priorityPages.length}`);
console.log("- homepage, robots, sitemap, metadata, canonical URLs, and social images: OK");
