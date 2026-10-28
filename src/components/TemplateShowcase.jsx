import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import Reveal from "./Reveal.jsx";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";

export default function TemplateShowcase() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [started, setStarted] = useState(false); // true once the section is near the screen
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { items, addItem } = useCart();
  const placeholderRef = useRef(null);
  const addedTimerRef = useRef(null);

  // Start loading only when the section is about to scroll into view, so it
  // doesn't compete with the featured books request at the top of the page.
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!started) return;
    let ignore = false;
    api
      .get("/templates", {
        params: { limit: 3 },
        timeout: 45000, // allows for a sleeping backend waking up
        silent: true, // a secondary section: hide quietly instead of showing an error toast
      })
      .then(({ data }) => {
        if (!ignore) setTemplates(data.templates);
      })
      .catch((err) => console.error("Failed to load templates:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [started]);

  useEffect(() => () => clearTimeout(addedTimerRef.current), []);

  // Reserve space while loading so the sections below don't jump down
  // when the templates arrive.
  if (loading) return <section ref={placeholderRef} className="h-[520px]" aria-hidden="true" />;
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
    <section className="border-t border-navy-700/60 bg-navy-900/40">
      <Reveal className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
            {t("templates.eyebrow")}
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-ivory sm:text-4xl">
            {t("templates.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            {t("templates.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {templates.map((template) => {
            const inCart = items.some((i) => i._id === template._id);
            const justAdded = addedId === template._id;
            const detailsPath = `/template/${template._id}`;

            // <article> with separate links and buttons: no <button> inside an <a>
            return (
              <article
                key={template._id}
                className="group flex flex-col overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60 transition hover:border-gold-500/50"
              >
                <Link to={detailsPath} aria-label={`View details for ${template.title}`} className="block">
                  <img
                    src={template.coverUrl}
                    alt={template.title}
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="160"
                    className="h-40 w-full object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg text-ivory">
                    <Link to={detailsPath} className="transition-colors hover:text-gold-400">
                      {template.title}
                    </Link>
                  </h3>
                  {template.tagline && <p className="mt-1 text-sm text-ivory/60">{template.tagline}</p>}

                  <div className="mt-auto">
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gold-400">
                        {template.isFree ? t("templates.free") : `$${template.price.toFixed(2)}`}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, template)}
                        disabled={inCart}
                        className="shrink-0 rounded-full border border-gold-500/40 px-3.5 py-1.5 text-xs font-medium text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-default disabled:border-navy-700 disabled:text-ivory/40 disabled:hover:bg-transparent"
                      >
                        {inCart ? t("templates.inCart") : justAdded ? t("templates.added") : t("templates.addToCart")}
                      </button>
                    </div>

                    <Link
                      to={detailsPath}
                      className="mt-3 flex w-full items-center justify-center rounded-full border border-navy-700 px-4 py-2 text-sm font-medium text-ivory/80 transition-colors hover:border-gold-500 hover:text-gold-400"
                    >
                      {t("templates.viewDetails", "View Details")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/templates"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 px-5 py-2.5 text-sm font-medium text-gold-400 transition hover:bg-gold-500/10"
          >
            {t("templates.seeAll")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}