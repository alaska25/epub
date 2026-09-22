import { useState, useEffect } from "react";
import BookCard from "./BookCard";

export default function BookCarousel({ books = [] }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4); // Default to 4 on desktop

  const CARD_WIDTH = 240;
  const GAP_WIDTH = 24; // gap-6 is 24px
  const STEP = CARD_WIDTH + GAP_WIDTH;

  // Track the viewport width to know how many cards can cleanly fit on the screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1); // Mobile screens show 1 card completely
      } else if (window.innerWidth < 768) {
        setVisibleCount(2); // Small tablets show 2 cards
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3); // Large tablets show 3 cards
      } else {
        setVisibleCount(4); // Desktop monitors show 4 cards perfectly
      }
    };

    handleResize(); // Run immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate the safe boundary limit so you can't slide into blank space
  const maxScrollIndex = Math.max(0, books.length - visibleCount);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(maxScrollIndex, prev + 1));
  };

  if (!books || books.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-gold-500/80">
            Featured Books
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink dark:text-ivory">
            Popular titles
          </h2>
        </div>
        <a href="/catalog" className="text-sm font-medium text-gold-500 hover:underline">
          View all books &rarr;
        </a>
      </div>

      {/* Outer Context Window Container Frame */}
      <div className="relative mt-8 w-full">
        
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          disabled={scrollIndex === 0}
          aria-label="Previous items"
          className="absolute -left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 dark:border-ivory/20 bg-white dark:bg-ink p-3 text-ink dark:text-ivory shadow-md transition-all hover:bg-slate-50 dark:hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* The Clipped Window Track */}
        <div className="w-full overflow-hidden rounded-lg">
          
          {/* Transforming Slider Track Ribbon */}
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${scrollIndex * STEP}px)`,
            }}
          >
            {books.map((book) => (
              <div 
                key={book._id} 
                className="w-[240px] shrink-0"
              >
                <BookCard book={book} showAddToCart={true} />
              </div>
            ))}
          </div>

        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          disabled={scrollIndex >= maxScrollIndex}
          aria-label="Next items"
          className="absolute -right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-slate-200 dark:border-ivory/20 bg-white dark:bg-ink p-3 text-ink dark:text-ivory shadow-md transition-all hover:bg-slate-50 dark:hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  );
}
