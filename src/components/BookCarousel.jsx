import { useState, useEffect, useRef } from "react";
import BookCard from "./BookCard";

export default function BookCarousel({ books = [] }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [cardWidth, setCardWidth] = useState(240);

  const containerRef = useRef(null);
  const GAP_WIDTH = 24; // gap-6 is 24px (mobile uses a smaller gap, see below)
  const MOBILE_GAP_WIDTH = 8; // gap-2 for a tighter, more even mobile row

  const gap = window.innerWidth < 640 ? MOBILE_GAP_WIDTH : GAP_WIDTH;
  const STEP = cardWidth + gap;

  useEffect(() => {
    const handleResize = () => {
      let count;
      if (window.innerWidth < 640) {
        count = 4; // Mobile: show 4 cards
      } else if (window.innerWidth < 768) {
        count = 2; // Small tablets
      } else if (window.innerWidth < 1024) {
        count = 3; // Large tablets
      } else {
        count = 4; // Desktop
      }
      setVisibleCount(count);

      // Measure the actual container width and derive card width from it,
      // instead of relying on a fixed 240px that won't fit small screens.
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const currentGap = window.innerWidth < 640 ? MOBILE_GAP_WIDTH : GAP_WIDTH;
        const totalGap = currentGap * (count - 1);
        const width = (containerWidth - totalGap) / count;
        setCardWidth(width);
      }
    };

    handleResize(); // Run immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxScrollIndex = Math.max(0, books.length - visibleCount);

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(maxScrollIndex, prev + 1));
  };

  if (!books || books.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-6 sm:py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-gold-500/80">
            Featured Books
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold text-ink">
            Popular titles
          </h2>
        </div>
        <a href="/catalog" className="text-sm font-medium text-gold-500 hover:underline">
          View all books &rarr;
        </a>
      </div>

      {/* Outer Context Window Container Frame */}
      <div className="relative mt-4 w-full sm:mt-8" ref={containerRef}>

        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          disabled={scrollIndex === 0}
          aria-label="Previous items"
          className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-navy-700/60 bg-ink p-1.5 text-ivory shadow-md transition-all hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0 sm:-left-4 sm:p-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 sm:h-4 sm:w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* The Clipped Window Track */}
        <div className="w-full overflow-hidden rounded-lg">

          {/* Transforming Slider Track Ribbon */}
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap: `${gap}px`,
              transform: `translateX(-${scrollIndex * STEP}px)`,
            }}
          >
            {books.map((book) => (
              <div
                key={book._id}
                className="shrink-0"
                style={{ width: `${cardWidth}px` }}
              >
                <BookCard book={book} showAddToCart={true} compact={cardWidth < 140} />
              </div>
            ))}
          </div>

        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          disabled={scrollIndex >= maxScrollIndex}
          aria-label="Next items"
          className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-navy-700/60 bg-ink p-1.5 text-ivory shadow-md transition-all hover:bg-navy-800 disabled:pointer-events-none disabled:opacity-0 sm:-right-4 sm:p-3"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3 sm:h-4 sm:w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

      </div>
    </section>
  );
}