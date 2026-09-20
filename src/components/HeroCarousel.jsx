import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    eyebrow: "Digital Products • Ebooks • Templates • Tools",
    title: "A library that fits in your",
    highlight: "pocket.",
    body: "Adyoolau brings together fiction, nonfiction, and reference titles you can buy once and read anywhere — in the browser or downloaded for offline reading.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
  },
  {
    eyebrow: "No Subscriptions",
    title: "Buy once,",
    highlight: "keep forever.",
    body: "Every book is yours after purchase — no expiring licenses, no recurring fees. Download a copy to keep, or read it in the browser whenever you like.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "See our Refund Policy", to: "/refund-policy" },
  },
  {
    eyebrow: "New Here?",
    title: "Try a title,",
    highlight: "on us.",
    body: "Not ready to commit? A handful of our titles are completely free to claim — a low-risk way to see what Adyoolau is about before you buy.",
    primaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
    secondaryCta: { label: "About Adyoolau", to: "/about" },
  },
];

const AUTO_ADVANCE_MS = 6500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i) => setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  const slide = SLIDES[index];

  return (
    <section className="relative overflow-hidden border-b border-navy-700/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.2fr,1fr] md:py-28">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-gold-500/80">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.1] text-ivory md:text-6xl">
            {slide.title} <span className="text-gold-400">{slide.highlight}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ivory/60">{slide.body}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={slide.primaryCta.to}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
            >
              {slide.primaryCta.label}
            </Link>
            <Link
              to={slide.secondaryCta.to}
              className="rounded-full border border-navy-700 px-6 py-3 text-sm font-medium text-ivory/80 hover:border-gold-500 hover:text-gold-400"
            >
              {slide.secondaryCta.label}
            </Link>
          </div>

          {/* Dots */}
          <div className="mt-10 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-gold-500" : "w-2 bg-navy-700 hover:bg-navy-600"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hidden items-center justify-center md:flex">
          <div className="grid grid-cols-3 gap-3 opacity-90">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-20 rounded bg-gradient-to-b from-navy-700 to-navy-900"
                style={{ transform: `translateY(${i % 2 === 0 ? "0" : "16px"})` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-navy-700 bg-ink/60 p-2 text-ivory/60 hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-navy-700 bg-ink/60 p-2 text-ivory/60 hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}