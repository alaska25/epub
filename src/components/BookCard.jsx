import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import StarRating from "./StarRating.jsx";

export default function BookCard({ book, showAddToCart = false }) {
  const { items, addItem } = useCart();
  const navigate = useNavigate();
  const inCart = items.some((b) => b._id === book._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (book.isFree) {
      navigate(`/book/${book._id}`);
      return;
    }
    if (!inCart) addItem(book);
  };

  return (
    <Link to={`/book/${book._id}`} className="group block w-full text-left">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-navy-800">
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {book.fileType && (
          <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ivory/90 backdrop-blur-sm">
            {book.fileType}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-base leading-snug text-slate-900 dark:text-ivory group-hover:text-gold-400">
        {book.title}
      </h3>

      {book.subtitle && (
        <p className="mt-0.5 truncate text-sm text-slate-600 dark:text-ivory/60">{book.subtitle}</p>
      )}

      {book.reviewCount > 0 && (
        <div className="mt-1 flex items-center gap-1.5">
          <StarRating value={book.avgRating} size={13} />
          <span className="text-xs text-slate-400 dark:text-ivory/40">({book.reviewCount})</span>
        </div>
      )}

      <p className="mt-1 text-xs text-slate-400 dark:text-ivory/40">{book.author}</p>

      <p className="mt-1 text-sm text-gold-500 dark:text-gold-400 font-medium">
        {book.isFree ? "Free" : `$${book.price.toFixed(2)}`}
      </p>

      {showAddToCart && (
        <button
          onClick={handleAddToCart}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {book.isFree ? "Get free" : inCart ? "In cart" : "Add to Cart"}
        </button>
      )}
    </Link>
  );
}