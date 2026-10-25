import { mkdirSync, writeFileSync } from "node:fs";

const SITE = "https://www.adyoolau.com";
const API = process.env.VITE_API_URL || "https://api.adyoolau.com/api";

// Static pages. Add or remove to match your routes.
const STATIC_PATHS = ["/", "/templates", "/books"];

// Pages three or more levels deep that come from the API.
// Adjust `detailPath` if your book route differs from /book/:id.
const SOURCES = [
  { path: "/templates", key: "templates", detailPath: (x) => `/template/${x._id}` },
  { path: "/books", key: "books", detailPath: (x) => `/book/${x._id}` },
];

// Your API caps `limit` at 50, so page through the results.
async function fetchAll(path, key) {
  const items = [];
  for (let page = 1; page <= 100; page++) {
    const res = await fetch(`${API}${path}?page=${page}&limit=50`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`${path} returned ${res.status}`);
    const data = await res.json();
    const batch = Array.isArray(data) ? data : data[key] || [];
    items.push(...batch);
    if (Array.isArray(data) || page >= (data.pages || 1)) break;
  }
  return items;
}

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const paths = new Set(STATIC_PATHS);

for (const { path, key, detailPath } of SOURCES) {
  try {
    const items = await fetchAll(path, key);
    items.forEach((item) => paths.add(detailPath(item)));
    console.log(`Sitemap: ${items.length} entries from ${path}`);
  } catch (err) {
    // Never fail the deploy just because the sitemap couldn't refresh.
    console.warn(`Sitemap: skipped ${path} (${err.message})`);
  }
}

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...paths]
  .map(
    (p) =>
      `  <url>\n    <loc>${escapeXml(SITE + (p === "/" ? "" : p))}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
  )
  .join("\n")}
</urlset>
`;

mkdirSync("public", { recursive: true });
writeFileSync("public/sitemap.xml", xml);
console.log(`Sitemap written with ${paths.size} URLs`);