import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracks which row's toggle request is in flight, so we can disable just
  // that button and avoid double-clicks without blocking the whole table.
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/books/admin", { params: { limit: 100 } })
      .then(({ data }) => setBooks(data.books))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this book permanently? This also removes its files from storage.")) return;
    await api.delete(`/books/${id}`);
    load();
  };

  const handleTogglePublish = async (book) => {
    const nextPublished = !book.published;
    setTogglingId(book._id);
    try {
      await api.put(`/books/${book._id}`, { published: nextPublished });
      // Update local state directly instead of a full reload, so the row
      // updates instantly and the rest of the table doesn't flicker.
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, published: nextPublished } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update publish status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <p className="text-ivory/50">Loading…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy-700/60 text-ivory/50">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Author</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => {
            // Treat missing `published` (books created before this field
            // existed) as published, so nothing disappears from the site
            // the first time this ships.
            const isPublished = b.published !== false;
            const isToggling = togglingId === b._id;

            return (
              <tr key={b._id} className="border-b border-navy-700/40 text-ivory/80">
                <td className="py-3 pr-4">{b.title}</td>
                <td className="py-3 pr-4">{b.author}</td>
                <td className="py-3 pr-4">{b.category}</td>
                <td className="py-3 pr-4">{b.isFree ? "Free" : `$${b.price.toFixed(2)}`}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isPublished
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "bg-ivory/10 text-ivory/50"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 rounded-full ${
                        isPublished ? "bg-[#22c55e]" : "bg-ivory/40"
                      }`}
                    />
                    {isPublished ? "Published" : "Unpublished"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <button
                    onClick={() => handleTogglePublish(b)}
                    disabled={isToggling}
                    className="mr-4 text-gold-400 hover:text-gold-300 disabled:opacity-50"
                  >
                    {isToggling ? "…" : isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <Link to={`/admin/books/${b._id}/edit`} className="mr-4 text-gold-400 hover:text-gold-300">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {books.length === 0 && <p className="mt-6 text-ivory/50">No books yet.</p>}
    </div>
  );
}