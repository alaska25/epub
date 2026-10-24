import { writeFileSync } from "node:fs";

const SITE = "https://adyoolau.com";
// Change to your API base URL (the value your frontend uses for the API)
const API = process.env.VITE_API_URL || "https://server-prod-1.onrender.com/api";

const staticPaths = ["/", "/catalog", "/templates", "/about", "/contact", "/refund-policy", "/terms", "/privacy-policy"];

async function list(path, key) {
  try {
    const res = await fetch(`${API}${path}?limit=1000`);
    const data = await res.json();
    return data[key] ?? data ?? [];
  } catch {
    return []; // build still succeeds if the API is asleep or down
  }
}

const books = await list("/books", "books");
const templates = await list("/templates", "templates");

const urls = [
  ...staticPaths,
  ...books.map((b) => `/book/${b._id}`),
  ...templates.map((t) => `/template/${t._id}`),
];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

writeFileSync("public/sitemap.xml", xml);
console.log(`Sitemap written with ${urls.length} URLs`);