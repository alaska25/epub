import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { flyToCart } from "../utils/flyToCart.js";
import BackButton from "../components/BackButton.jsx";

export default function Templates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { items, addItem } = useCart();
  const navigate = useNavigate();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = 9;

  useEffect(() => {
    api.get("/templates/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/templates", { params: { search: search || undefined, category: category || undefined, page, limit } })
      .then(({ data }) => {
        setTemplates(data.templates);
        setTotal(data.total);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (e, template) => {
    e.preventDefault();
    e.stopPropagation();

    const imgEl = e.currentTarget.closest("a")?.querySelector("img");
    flyToCart(imgEl);

    addItem(template);
    setAddedId(template._id);
    setTimeout(() => setAddedId((id) => (id === template._id ? null : id)), 1500);
  };

  // Plain navigation rather than a nested <Link> — the whole card is
  // already an <a>, and an <a> inside an <a> is invalid/unpredictable.
  const handleViewDetails = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/template/${template._id}`);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <BackButton fallback="/" className="mb-6" />

      <h1 className="font-display text-3xl tracking-tight text-ivory">Templates</h1>
      <p className="mt-2 text-ivory/60">Production-ready starter kits for your next project.</p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          defaultValue={search}
          onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.currentTarget.value.trim())}
          placeholder="Search templates..."
          className="w-full max-w-xs rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory focus:border-gold-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(search || category) && (
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-ivory/50 hover:text-ivory"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-12 text-center text-ivory/50">Loading…</p>
      ) : templates.length === 0 ? (
        <p className="mt-12 text-center text-ivory/50">No templates match your search.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => {
              const inCart = items.some((i) => i._id === t._id);
              const justAdded = addedId === t._id;

              return (
                <Link
                  key={t._id}
                  to={`/template/${t._id}`}
                  className="group overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60 transition hover:border-gold-500/50"
                >
                  <img src={t.coverUrl} alt={t.title} className="h-40 w-full object-cover" />
                  <div className="p-5">
                    <p className="font-display text-lg text-ivory">{t.title}</p>
                    {t.tagline && <p className="mt-1 text-sm text-ivory/60">{t.tagline}</p>}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gold-400">
                        {t.isFree ? "Free" : `$${t.price.toFixed(2)}`}
                      </p>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, t)}
                        disabled={inCart}
                        className="shrink-0 rounded-full border border-gold-500/40 px-3.5 py-1.5 text-xs font-medium text-gold-400 transition hover:bg-gold-500/10 disabled:cursor-default disabled:border-navy-700 disabled:text-ivory/40 disabled:hover:bg-transparent"
                      >
                        {inCart ? "In cart" : justAdded ? "Added ✓" : "Add to cart"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleViewDetails(e, t)}
                      className="mt-3 flex w-full items-center justify-center rounded-full border border-navy-700 px-4 py-2 text-sm font-medium text-ivory/80 transition-colors hover:border-gold-500 hover:text-gold-400"
                    >
                      View Details
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                    p === page ? "bg-gold-500 text-ink" : "text-ivory/60 hover:text-ivory"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <p className="mt-4 text-center text-xs text-ivory/40">{total} template{total !== 1 ? "s" : ""} total</p>
        </>
      )}
    </div>
  );
}