import { useState } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Shows featured books as a grid so nothing is hidden behind a swipe.
// 2 columns on phones, 3 on tablets, 4 on desktop. The first `initial` books
// show at first; "Show more" reveals the rest. On tablets (3 columns) the
// collapsed view trims to 6 so the last row is never half empty.
export default function BookGrid({ books = [], initial = 8 }) {
  const [expanded, setExpanded] = useState(false);
  if (!books || books.length === 0) return null;

  const visible = expanded ? books : books.slice(0, initial);
  const canExpand = books.length > initial && !expanded;

  return (
    <section aria-label="Featured books" className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Featured books
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ivory sm:text-4xl">
            Popular titles
          </h2>
        </div>
        <Link
          to="/catalog"
          className={`shrink-0 rounded-sm pb-1 text-sm font-semibold text-gold-500 underline-offset-4 transition-colors hover:text-gold-400 hover:underline ${FOCUS_RING}`}
        >
          View all books &rarr;
        </Link>
      </div>

      {/* items-stretch + h-full makes every card in a row the same height */}
      <ul className="mt-6 grid grid-cols-2 items-stretch gap-x-3 gap-y-5 sm:mt-8 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((book, i) => (
          <li
            key={book._id}
            className={`flex [&>*]:h-full [&>*]:w-full ${!expanded && i >= 6 && i < initial ? "md:max-lg:hidden" : ""}`}
          >
            <BookCard book={book} showAddToCart={true} compact={false} />
          </li>
        ))}
      </ul>

      {canExpand && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`rounded-full border border-gold-500/50 px-7 py-3 text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/10 ${FOCUS_RING}`}
          >
            Show {books.length - initial} more
          </button>
        </div>
      )}
    </section>
  );
}