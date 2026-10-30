import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import BookCard from "../components/BookCard.jsx";
import BackButton from "../components/BackButton.jsx";
import Reveal from "../components/Reveal.jsx";

// Books in the first row skip the fade-in and get high-priority images, so the
// top of the page appears at once. The rest keep the animation and lazy images.
const PRIORITY_COUNT = 4;

function SkeletonBook() {
  return (
    <div>
      <div className="aspect-[2/3] w-full animate-pulse rounded-md bg-navy-800" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-navy-800" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-navy-800" />
    </div>
  );
}

const PAGE_BTN =
  "grid h-9 w-9 place-items-center rounded-full text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

function ChevronIcon({ dir }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={dir === "prev" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

export default function Catalog() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);

  const isFreeFilter = search.trim().toLowerCase() === "free";

  const [query, setQuery] = useState(isFreeFilter ? "" : search);
  useEffect(() => {
    setQuery(isFreeFilter ? "" : search);
  }, [search, isFreeFilter]);

  useEffect(() => {
    api
      .get("/books/categories", { silent: true })
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false; // stops a slow, older response overwriting a newer one
    setLoading(true);
    setLoadError(false);
    api
      .get("/books", {
        params: { search, category, page, limit: 12 },
        timeout: 45000, // allows for a sleeping backend waking up
        silent: true,
      })
      .then(({ data }) => {
        if (ignore) return;
        setBooks(data.books);
        setPages(data.pages);
      })
      .catch(() => {
        if (!ignore) setLoadError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [search, category, page, retryKey]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const goToPage = (n) => {
    if (n < 1 || n > pages || n === page) return;
    updateParam("page", n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BackButton fallback="/" className="mb-6" />

      <h1 className="font-display text-3xl text-ivory">{t("catalog.title")}</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.target.value.trim())}
          placeholder={t("catalog.searchPlaceholder")}
          aria-label={t("catalog.searchAriaLabel")}
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          aria-label={t("catalog.filterByCategory")}
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory focus:border-gold-500"
        >
          <option value="">{t("catalog.allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {isFreeFilter && (
          <button
            type="button"
            onClick={() => updateParam("search", "")}
            aria-label={t("catalog.clearFreeFilter")}
            className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-sm font-medium text-ivory/90 transition-colors hover:border-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
          >
            {t("catalog.freeBooks")}
            <span aria-hidden="true" className="text-ivory/50">
              ✕
            </span>
          </button>
        )}
      </div>

      {loading ? (
        <div
          className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4"
          aria-busy="true"
          aria-label={t("common.loadingBooks")}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonBook key={i} />
          ))}
        </div>
      ) : loadError ? (
        <div className="mt-12 rounded-2xl border border-dashed border-navy-700 px-6 py-14 text-center">
          <p className="font-display text-lg text-ivory">
            {t("catalog.loadError", "Couldn't load books")}
          </p>
          <p className="mt-1 text-sm text-ivory/60">
            {t("catalog.loadErrorHint", "The server may be waking up. Please try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-5 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-medium text-ink hover:bg-gold-400"
          >
            {t("catalog.tryAgain", "Try again")}
          </button>
        </div>
      ) : books.length === 0 ? (
        <p className="mt-12 text-ivory/50">
          {isFreeFilter ? t("catalog.noFreeBooks") : t("catalog.noResults")}
        </p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book, i) =>
              i < PRIORITY_COUNT ? (
                <BookCard key={book._id} book={book} showAddToCart priority={i === 0 ? "high" : true} />
              ) : (
                <Reveal key={book._id} delay={Math.min((i - PRIORITY_COUNT) * 50, 400)}>
                  <BookCard book={book} showAddToCart />
                </Reveal>
              )
            )}
          </div>

          {pages > 1 && (
            <nav
              aria-label={t("catalog.pagination", "Pagination")}
              className="mt-12 flex items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                aria-label={t("catalog.prevPage", "Previous page")}
                className={`${PAGE_BTN} border border-navy-700 text-ivory/70 hover:border-gold-500 disabled:pointer-events-none disabled:opacity-40`}
              >
                <ChevronIcon dir="prev" />
              </button>

              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToPage(i + 1)}
                  aria-label={t("catalog.pageAriaLabel", { number: i + 1 })}
                  aria-current={page === i + 1 ? "page" : undefined}
                  className={`${PAGE_BTN} ${
                    page === i + 1
                      ? "bg-gold-500 text-ink"
                      : "border border-navy-700 text-ivory/70 hover:border-gold-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pages}
                aria-label={t("catalog.nextPage", "Next page")}
                className={`${PAGE_BTN} border border-navy-700 text-ivory/70 hover:border-gold-500 disabled:pointer-events-none disabled:opacity-40`}
              >
                <ChevronIcon dir="next" />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}