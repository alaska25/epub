import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuthModal } from "../context/AuthModalContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";
import { pushToast } from "../utils/toastStore.js";
import Seo from "../components/Seo.jsx";

const SITE = "https://www.adyoolau.com";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";
const BTN_PRIMARY = `inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-7 py-4 text-base font-bold text-ink shadow-[0_12px_40px_-8px] shadow-gold-500/50 ring-1 ring-gold-500/40 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 ${FOCUS_RING}`;
const BTN_BAR = BTN_PRIMARY.replace("w-full", "w-auto shrink-0").replace("px-7 py-4 text-base", "px-6 py-3 text-sm");
const BTN_SECONDARY = `inline-flex items-center justify-center gap-2 rounded-full border border-navy-700 px-5 py-3 text-sm font-semibold text-ivory/85 transition hover:border-gold-500/60 hover:text-gold-400 ${FOCUS_RING}`;

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// A browser window around the cover and the live preview, so the product
// reads as "a real site you will own". The traffic-light dots are fixed
// colours on purpose: they should look the same in light and dark themes.
function BrowserFrame({ url, children }) {
  let host = "";
  try {
    host = url ? new URL(url).host : "";
  } catch {
    host = "";
  }
  return (
    <div className="rounded-[1.25rem] bg-gradient-to-br from-gold-300/60 via-gold-500/15 to-ivory/10 p-px shadow-[0_40px_90px_-30px] shadow-black/60">
      <div className="overflow-hidden rounded-[calc(1.25rem-1px)] bg-navy-900">
        <div className="flex items-center gap-3 border-b border-navy-700/70 px-4 py-3">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          {host && (
            <span className="min-w-0 flex-1 truncate rounded-full bg-ink/60 px-4 py-1 text-center text-xs text-ivory/55">
              {host}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// Shows "src/components" dimmed and "Hero.jsx" bright, so the tree is easy to scan.
function FilePath({ path }) {
  const i = path.lastIndexOf("/");
  return (
    <li className="truncate font-mono">
      {i >= 0 && <span className="text-ivory/40">{path.slice(0, i + 1)}</span>}
      <span className="text-ivory/85">{path.slice(i + 1)}</span>
    </li>
  );
}

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const { openLogin } = useAuthModal();
  const coverRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    // Without this, navigating here from a scrolled-down position on the
    // templates listing (common on mobile, where cards run long) leaves
    // this page rendered at that same scroll offset, landing near the
    // footer instead of the top of the new page.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    setLoading(true);
    setNotFound(false);
    api
      .get(`/templates/${id}`)
      .then(({ data }) => setTemplate(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12" aria-busy="true">
        <span role="status" className="sr-only">Loading template</span>
        <div className="h-10 w-2/3 animate-pulse rounded-full bg-navy-800" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr,380px]">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-navy-800" />
          <div className="h-80 animate-pulse rounded-3xl bg-navy-800" />
        </div>
      </div>
    );
  }

  if (notFound || !template) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <Seo title="Template not found" noindex />
        <h1 className="font-serif text-3xl text-ivory">Template not found</h1>
        <p className="mt-4 text-ivory/60">It may have been removed or unpublished.</p>
        <Link to="/templates" className={`mt-6 inline-block text-gold-400 hover:text-gold-300 ${FOCUS_RING}`}>
          Back to templates
        </Link>
      </div>
    );
  }

  const inCart = items.some((i) => i._id === template._id);
  const price = template.price ?? 0;

  // The demo link is entered by an admin, so only allow real http(s) URLs
  // (never javascript: or data: links).
  const demoUrl = /^https?:\/\//i.test(template.liveDemoUrl || "") ? template.liveDemoUrl : null;

  const handleAddToCart = () => {
    flyToCart(coverRef.current);
    // Tag the item as a template so the cart sends it to checkout as one.
    // Without this, checkout can mistake it for a book (bookIds) and the
    // backend fails to find it, so the buyer can't pay.
    addItem({ ...template, itemType: "template" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleClaimFree = async () => {
    if (!user) {
      openLogin();
      return;
    }
    setError("");
    setClaiming(true);
    try {
      await api.post(`/templates/${template._id}/claim`);
      navigate("/library");
    } catch (err) {
      setError(err.response?.data?.message || "Could not claim this template.");
    } finally {
      setClaiming(false);
    }
  };

  // Uses the phone's share sheet when available, otherwise copies the link.
  // The link is tagged so visits from shares show up in your analytics.
  const handleShare = async () => {
    const url = `${SITE}/template/${template._id}?utm_source=share&utm_medium=button`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.title,
          text: template.tagline || template.title,
          url,
        });
      } catch {
        /* the person closed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      pushToast({ type: "success", message: "Link copied" });
    } catch {
      pushToast({ type: "error", message: "Could not copy the link" });
    }
  };

  // One buy action, used by the card and the phone bar so they always agree.
  const renderCta = (cls) =>
    template.isFree ? (
      <button onClick={handleClaimFree} disabled={claiming} className={cls}>
        {claiming ? "Adding…" : "Get for free"}
      </button>
    ) : inCart ? (
      <Link to="/cart" className={cls}>
        View cart &amp; checkout
      </Link>
    ) : (
      <button onClick={handleAddToCart} className={cls}>
        {added ? "Added ✓" : "Add to cart"}
      </button>
    );

  const hasInside = template.readme || template.fileTree?.length > 0;

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6 pb-28 pt-10 lg:py-14">
        <Seo
          title={template.title}
          description={(template.tagline || template.description || "").replace(/\s+/g, " ").slice(0, 155)}
          path={`/template/${template._id}`}
          image={template.coverUrl}
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: template.title,
            image: template.coverUrl,
            description: template.tagline || template.description,
            category: template.category,
            offers: {
              "@type": "Offer",
              price: template.isFree ? 0 : price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE}/template/${template._id}`,
            },
          }}
        />

        {/* Back goes to the templates listing; Home is a quiet icon-only
            shortcut on the opposite end, matching the book detail page. */}
        <div className="flex items-center justify-between">
          <Link to="/templates" className={`rounded-sm text-sm text-ivory/60 hover:text-ivory ${FOCUS_RING}`}>
            ← Back to templates
          </Link>
          <Link
            to="/"
            aria-label="Home"
            title="Home"
            className={`-mr-2 inline-flex h-10 items-center gap-2 rounded-full px-2 text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-gold-500 sm:px-3 ${FOCUS_RING}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-[18px] w-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10v9a1 1 0 0 0 1 1h3.5v-5.5h4V20H17.5a1 1 0 0 0 1-1v-9" />
            </svg>
            <span className="hidden text-sm sm:inline">Home</span>
          </Link>
        </div>

        {/* Title block */}
        <header className="mt-8 max-w-3xl">
          {template.category && (
            <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
              {template.category}
            </span>
          )}
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-ivory [text-wrap:balance] sm:text-5xl lg:text-6xl">
            {template.title}
          </h1>
          {template.tagline && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory/70">{template.tagline}</p>
          )}
          {template.techStack?.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {template.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-navy-700 bg-navy-900/70 px-3.5 py-1.5 text-xs font-medium text-ivory/75"
                >
                  {tech}
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-[1fr,380px]">
          {/* Cover in a browser frame */}
          <div className="lg:col-start-1">
            <BrowserFrame url={demoUrl}>
              <img
                ref={coverRef}
                src={template.coverUrl}
                alt={template.title}
                decoding="async"
                className="w-full object-cover"
              />
            </BrowserFrame>
          </div>

          {/* Buy card: stays in view while the visitor reads on desktop */}
          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-24">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-gold-300/60 via-gold-500/15 to-ivory/10 p-px shadow-[0_30px_70px_-25px] shadow-black/60">
              <div className="rounded-[calc(1.75rem-1px)] bg-gradient-to-br from-navy-900 to-ink p-6 sm:p-7">
                <p className="font-serif text-5xl font-semibold tracking-tight text-ivory">
                  {template.isFree ? "Free" : `$${price.toFixed(2)}`}
                </p>
                <p className="mt-1 text-sm text-ivory/60">
                  {template.isFree ? "Yours to keep, no payment needed." : "One-time payment, yours to keep."}
                </p>

                <div className="mt-6">
                  {renderCta(BTN_PRIMARY)}
                </div>

                <div className={`mt-3 grid gap-3 ${demoUrl ? "grid-cols-2" : "grid-cols-1"}`}>
                  {demoUrl && (
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
                      Live demo ↗
                    </a>
                  )}
                  <button type="button" onClick={handleShare} className={BTN_SECONDARY}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 6l-4-4-4 4M12 2v13" />
                    </svg>
                    Share
                  </button>
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <ul className="mt-6 space-y-3 border-t border-navy-700/60 pt-6 text-sm text-ivory/80">
                  <li className="flex gap-2.5">
                    <CheckIcon />
                    Complete source code, not a locked demo
                  </li>
                  <li className="flex gap-2.5">
                    <CheckIcon />
                    {template.isFree ? "Added to your library instantly" : "In your library right after payment"}
                  </li>
                  {!template.isFree && (
                    <li className="flex gap-2.5">
                      <CheckIcon />
                      <span>
                        Secure checkout.{" "}
                        <Link to="/refund-policy" className="underline underline-offset-4 hover:text-ivory">
                          Refund policy
                        </Link>
                      </span>
                    </li>
                  )}
                </ul>

                {(template.version || template.repoUrl) && (
                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-navy-700/60 pt-6 text-sm">
                    {template.version && (
                      <div>
                        <dt className="text-ivory/50">Version</dt>
                        <dd className="mt-0.5 font-medium text-ivory/90">{template.version}</dd>
                      </div>
                    )}
                    {template.repoUrl && (
                      <div>
                        <dt className="text-ivory/50">Preview repo</dt>
                        <dd className="mt-0.5">
                          <a
                            href={template.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gold-400 hover:text-gold-300"
                          >
                            View source ↗
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </div>
          </aside>

          {/* Description, preview, contents */}
          <div className="space-y-14 lg:col-start-1">
            {template.description && (
              <section>
                <h2 className="font-serif text-2xl font-semibold text-ivory sm:text-3xl">About this template</h2>
                <p className="mt-4 max-w-[65ch] whitespace-pre-line text-base leading-relaxed text-ivory/75">
                  {template.description}
                </p>
              </section>
            )}

            {/* Live preview: desktop/tablet only. On phones a scrolling page
                inside a page is awkward, so they use the "Live demo" button.
                Some demo sites forbid being embedded, so a new-tab link stays
                underneath as the fallback. */}
            {demoUrl && (
              <section className="hidden md:block">
                <h2 className="font-serif text-2xl font-semibold text-ivory sm:text-3xl">Try it live</h2>
                <div className="mt-5">
                  <BrowserFrame url={demoUrl}>
                    <iframe
                      src={demoUrl}
                      title={`${template.title} live preview`}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-popups"
                      className="h-[560px] w-full bg-white"
                    />
                  </BrowserFrame>
                </div>
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-block rounded-sm text-sm text-gold-400 hover:text-gold-300 ${FOCUS_RING}`}
                >
                  Preview not loading? Open the demo in a new tab ↗
                </a>
              </section>
            )}

            {hasInside && (
              <section>
                <h2 className="font-serif text-2xl font-semibold text-ivory sm:text-3xl">What's inside</h2>
                <p className="mt-2 max-w-[65ch] text-sm text-ivory/60">
                  Pulled directly from the template's zip, so you can check the docs and structure before you buy.
                </p>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  {template.readme && (
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ivory/85">README</h3>
                      <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl border border-navy-700 bg-navy-900 p-5 text-xs leading-relaxed text-ivory/75">
                        {template.readme}
                      </pre>
                    </div>
                  )}

                  {template.fileTree?.length > 0 && (
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-ivory/85">
                        File structure{template.fileTree.length >= 500 && " (truncated)"}
                      </h3>
                      <div className="mt-2 max-h-96 overflow-auto rounded-2xl border border-navy-700 bg-navy-900 p-5">
                        <ul className="space-y-1 text-xs">
                          {template.fileTree.map((path) => (
                            <FilePath key={path} path={path} />
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Phones: price and buy button stay in reach while reading */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700/70 bg-ink/95 px-4 pt-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-serif text-2xl font-semibold leading-none text-ivory">
              {template.isFree ? "Free" : `$${price.toFixed(2)}`}
            </p>
            <p className="mt-1 truncate text-xs text-ivory/60">{template.title}</p>
          </div>
          {renderCta(BTN_BAR)}
        </div>
      </div>
    </div>
  );
}