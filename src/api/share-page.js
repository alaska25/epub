// frontend/api/share-page.js
// Serves the normal SPA index.html with Open Graph / Twitter tags filled in
// for one book or template, so social crawlers (which don't run JavaScript)
// get a proper preview. Real visitors get the same page and the app boots as usual.

const SITE = "https://www.adyoolau.com";
const API = "https://api.adyoolau.com/api";
const OBJECT_ID = /^[0-9a-f]{24}$/i;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const clip = (s, n) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

async function getJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

export default async function handler(req, res) {
  const { kind, id } = req.query; // kind: "book" | "template"

  let html;
  try {
    const r = await fetch(`${SITE}/index.html`, { signal: AbortSignal.timeout(4000) });
    html = await r.text();
  } catch {
    return res.redirect(302, SITE);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  if (!OBJECT_ID.test(String(id)) || !["book", "template"].includes(kind)) {
    return res.status(200).send(html);
  }

  try {
    const item = await getJson(`${API}/${kind === "book" ? "books" : "templates"}/${id}`);
    const title = `${item.title}${item.author ? ` by ${item.author}` : ""} | Adyoolau`;
    const description = clip(item.description || item.tagline || "", 200);
    const image = item.coverUrl || `${SITE}/og-default.png`;
    const url = `${SITE}/${kind}/${id}`;

    const tags = `
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="${kind === "book" ? "book" : "website"}" />
    <meta property="og:site_name" content="Adyoolau" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(url)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />`;

    // Remove default tags from index.html first, because crawlers use the first one they see.
    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
      .replace(/<meta\s+(?:property|name)="(?:og:|twitter:|description)[^>]*>\s*/gi, "")
      .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
      .replace("</head>", `${tags}\n  </head>`);
  } catch (err) {
    console.warn("share-page: using default tags:", err.message);
  }

  res.status(200).send(html);
}