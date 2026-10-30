import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import Reveal from "./Reveal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

// `templates` is optional. When the page already has them (the homepage does),
// pass them in and this section skips its own request.
export default function TemplateShowcase({ templates: provided }) {
  const { t } = useTranslation();
  const [fetched, setFetched] = useState([]);
  const [started, setStarted] = useState(false); // true once the section is near the screen
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { items, addItem } = useCart();
  const placeholderRef = useRef(null);
  const addedTimerRef = useRef(null);

  const hasProvided = Boolean(provided?.length);
  const templates = hasProvided ? provided.slice(0, 3) : fetched;

  // Start loading only when the section is about to scroll into view, so it
  // doesn't compete with the featured books request at the top of the page.
  useEffect(() => {
    if (hasProvided) return;
    const node = placeholderRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasProvided]);

  useEffect(() => {
    if (!started || hasProvided) return;
    let ignore = false;
    api
      .get("/templates", {
        params: { limit: 3 },
        timeout: 45000, // allows for a sleeping backend waking up
        silent: true, // a secondary section: hide quietly instead of showing an error toast
      })
      .then(({ data }) => {
        if (!ignore) setFetched(data?.templates ?? []);
      })
      .catch((err) => console.error("Failed to load templates:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [started, hasProvided]);

  useEffect(() => () => clearTimeout(addedTimerRef.current), []);

  // Reserve space while loading so the sections below don't jump down
  // when the templates arrive.
  if (!hasProvided && loading) {
    return <section ref={placeholderRef} className="h-[640px]" aria-hidden="true" />;
  }
  if (templates.length === 0) return null;

  const handleAddToCart = (e, template) => {
    // The cover image lives in the same card (<article>) as the button
    const imgEl = e.currentTarget.closest("article")?.querySelector("img");
    flyToCart(imgEl);

    // Tag the item as a template so the cart sends it to checkout as one.
    // Without this, checkout treats it as a book (bookIds) and create-order fails with a 400.
    addItem({ ...template, itemType: "template" });
    setAddedId(template._id);
    clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(
      () => setAddedId((id) => (id === template._id ? null : id)),
      1500
    );
  };

  return (
    <section className="relative isolate overflow-hidden border-t border-navy-700/60">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-gold-500/10 blur-3xl" />
      <Reveal className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ivory [text-wrap:balance] sm:text-4xl lg:text-[2.75rem]">
              {t("templates.title")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory/65 sm:text-lg">
              {t("templates.subtitle")}
            </p>
          </div>
          <Link
            to="/templates"
            className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-gold-500/50 px-5 py-2.5 text-sm font-semibold text-gold-400 transition hover:bg-gold-500/10 sm:self-auto ${FOCUS_RING}`}
          >
            {t("templates.seeAll")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {templates.map((template) => {
            const inCart = items.some((i) => i._id === template._id);
            const justAdded = addedId === template._id;
            const detailsPath = `/template/${template._id}`;

            // <article> with separate links and buttons: no <button> inside an <a>
            return (
              <article
                key={template._id}
                className="group flex flex-col rounded-3xl border border-navy-700/60 bg-gradient-to-b from-navy-900/70 to-navy-900/30 p-2.5 transition-all duration-300 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/10 motion-reduce:transition-none"
              >
                <Link
                  to={detailsPath}
                  aria-label={`View details for ${template.title}`}
                  className={`relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-800 ${FOCUS_RING}`}
                >
                  <img
                    src={template.coverUrl}
                    alt={template.title}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="500"
                    className="h-full w-full object-cover object-top transition duration-500 md:group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  {template.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20">
                      {template.category}
                    </span>
                  )}
                </Link>

                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-xl font-semibold leading-snug text-ivory">
                      <Link to={detailsPath} className={`rounded-sm transition-colors hover:text-gold-400 ${FOCUS_RING}`}>
                        {template.title}
                      </Link>
                    </h3>
                    <p className="shrink-0 rounded-full bg-gold-500/10 px-3 py-1 text-sm font-semibold tabular-nums text-gold-400">
                      {template.isFree ? t("templates.free") : `$${template.price.toFixed(2)}`}
                    </p>
                  </div>

                  {template.tagline && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/65">{template.tagline}</p>
                  )}

                  {/* Actions pinned to the bottom so cards of different heights line up */}
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, template)}
                      disabled={inCart}
                      className={`flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-gold-500 px-3 text-sm font-semibold text-ink transition hover:bg-gold-400 active:scale-[0.98] disabled:cursor-default disabled:bg-ivory/10 disabled:text-ivory/60 disabled:active:scale-100 ${FOCUS_RING}`}
                    >
                      {inCart ? t("templates.inCart") : justAdded ? t("templates.added") : t("templates.addToCart")}
                    </button>
                    <Link
                      to={detailsPath}
                      className={`flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-navy-700 px-3 text-sm font-medium text-ivory/85 transition-colors hover:border-gold-500/60 hover:bg-gold-500/10 hover:text-gold-400 ${FOCUS_RING}`}
                    >
                      {t("templates.viewDetails", "View details")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}