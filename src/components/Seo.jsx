import { Helmet } from "react-helmet-async";

// The ONE main address. The other version (www) should redirect to this in
// Vercel, so Google sees a single official URL for each page.
const SITE = "https://adyoolau.com";

export default function Seo({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noindex = false,
  jsonLd,
}) {
  const url = `${SITE}${path}`;
  const fullTitle = title ? `${title} | Adyoolau` : "Adyoolau";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex" />}
      <meta property="og:site_name" content="Adyoolau" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}