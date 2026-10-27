import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

// Shared by the /library page and the Library tab in the account panel.
export default function LibraryPanel() {
  const [books, setBooks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // allSettled: if one list fails, the other still shows
    Promise.allSettled([
      api.get("/auth/library", { silent: true }),
      api.get("/auth/library/templates", { silent: true }),
    ])
      .then(([booksRes, templatesRes]) => {
        if (booksRes.status === "fulfilled") setBooks(booksRes.value.data);
        if (templatesRes.status === "fulfilled") setTemplates(templatesRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (template) => {
    setError("");
    setDownloadingId(template._id);
    try {
      const { data } = await api.get(`/templates/${template._id}/access`, { silent: true });
      window.location.assign(data.url); // signed link with an attachment header
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the download. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <p className="text-ivory/50">Loading…</p>;

  if (books.length === 0 && templates.length === 0) {
    return (
      <p className="text-ivory/50">
        You haven't added anything yet.{" "}
        <Link to="/catalog" className="text-gold-400 hover:text-gold-300">
          Browse the catalog
        </Link>{" "}
        or{" "}
        <Link to="/templates" className="text-gold-400 hover:text-gold-300">
          see templates
        </Link>
        .
      </p>
    );
  }

  return (
    <>
      {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

      {books.length > 0 && (
        <section>
          <h2 className="font-display text-xl text-ivory">Books</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book) => (
              <Link key={book._id} to={`/read/${book._id}`} className="group block">
                <div className="aspect-[2/3] overflow-hidden rounded-md bg-navy-800">
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="mt-3 font-display text-base leading-snug text-ivory group-hover:text-gold-400">
                  {book.title}
                </h3>
                <p className="text-sm text-ivory/50">{book.author}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {templates.length > 0 && (
        <section className={books.length > 0 ? "mt-14" : ""}>
          <h2 className="font-display text-xl text-ivory">Templates</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <article
                key={t._id}
                className="flex flex-col rounded-2xl border border-white/10 bg-navy-900/40 p-2.5"
              >
                <Link
                  to={`/template/${t._id}`}
                  className="block aspect-[16/10] overflow-hidden rounded-xl bg-navy-800"
                >
                  <img
                    src={t.coverUrl}
                    alt={`Preview of ${t.title}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                </Link>
                <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                  <h3 className="font-display text-base leading-snug text-ivory">{t.title}</h3>
                  {t.category && <p className="mt-1 text-xs text-ivory/50">{t.category}</p>}
                  <button
                    type="button"
                    onClick={() => handleDownload(t)}
                    disabled={downloadingId === t._id}
                    className="mt-4 h-10 rounded-full bg-gold-500 text-sm font-semibold text-ink transition-colors hover:bg-gold-400 disabled:opacity-50"
                  >
                    {downloadingId === t._id ? "Preparing…" : "Download zip"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}