import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import image29008 from "./images/29008.jpg";
import image29006 from "./images/29006.jpg";
import image29009 from "./images/29009.jpg";

const SLIDES = [
  {
    eyebrow: "Digital Products • Ebooks • Templates • Tools",
    title: "A library that fits in your",
    highlight: "pocket.",
    body: "Adyoolau brings together fiction, nonfiction, and reference titles you can buy once and read anywhere — in the browser or downloaded for offline reading.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
    image: image29009,
  },
  {
    eyebrow: "No Subscriptions",
    title: "Buy once,",
    highlight: "keep forever.",
    body: "Every book is yours after purchase — no expiring licenses, no recurring fees. Download a copy to keep, or read it in the browser whenever you like.",
    primaryCta: { label: "Browse the Catalog", to: "/catalog" },
    secondaryCta: { label: "See our Refund Policy", to: "/refund-policy" },
    image: image29006,
  },
  {
    eyebrow: "New Here?",
    title: "Try a title,",
    highlight: "on us.",
    body: "Not ready to commit? A handful of our titles are completely free to claim — a low-risk way to see what Adyoolau is about before you buy.",
    primaryCta: { label: "Start with a Free Title", to: "/catalog?search=free" },
    secondaryCta: { label: "About Adyoolau", to: "/about" },
    image: image29008,
  },
];

const AUTO_ADVANCE_MS = 6500;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  // Stabilize the slide advancing logic
  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  // Set and reset interval dynamically when users change slides manually
  useEffect(() => {
    timerRef.current = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index]);

  const goTo = (i) => {
    const nextIndex = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setIndex(nextIndex);
  };

  const slide = SLIDES[index];

  return (
    <section className="relative overflow-hidden border-b border-navy-700/60 bg-ink">
      {/* Background images rendered in full using bg-contain */}
      {SLIDES.map((s, i) => (
        <div
          key={s.image}
          className="absolute inset-0 bg-contain bg-no-repeat bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${s.image})`,
            opacity: i === index ? 1 : 0,
          }}
        />
      ))}
      
      {/* Dark gradient overlay so text stays readable over any photo */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40 pointer-events-none" />

      <div className="relative mx-auto grid min-h-[520px] max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[1.2fr,1fr] md:min-h-[560px] md:py-20">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-gold-500/80">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.1] text-ivory md:text-6xl">
            {slide.title} <span className="text-gold-400">{slide.highlight}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ivory/70">{slide.body}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={slide.primaryCta.to}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
            >
              {slide.primaryCta.label}
            </Link>
            <Link
              to={slide.secondaryCta.to}
              className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-medium text-ivory/90 hover:border-gold-500 hover:text-gold-400"
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
                  i === index ? "w-6 bg-gold-500" : "w-2 bg-ivory/30 hover:bg-ivory/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-ivory/30 bg-ink/50 p-2 text-ivory/70 backdrop-blur-sm hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-ivory/30 bg-ink/50 p-2 text-ivory/70 backdrop-blur-sm hover:border-gold-500 hover:text-gold-400 md:block"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}
