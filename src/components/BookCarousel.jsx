import { useRef } from "react";
import BookCard from "./BookCard.jsx";

export default function BookCarousel({ books }) {
  const scrollRef = useRef(null);

  const scrollByAmount = (direction) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild?.offsetWidth || 200;
    scrollRef.current.scrollBy({ left: direction * (cardWidth + 24) * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll left"
        className="absolute -left-4 top-1/3 z-10 hidden -translate-y-1/2 rounded-full border border-navy-700 bg-navy-900 p-2 text-ivory/60 hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 no-scrollbar"
      >
        {books.map((book) => (
          <div key={book._id} className="w-40 flex-shrink-0 snap-start sm:w-48">
            <BookCard book={book} showAddToCart />
          </div>
        ))}
      </div>

      <button
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll right"
        className="absolute -right-4 top-1/3 z-10 hidden -translate-y-1/2 rounded-full border border-navy-700 bg-navy-900 p-2 text-ivory/60 hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}