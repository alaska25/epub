import { useEffect, useState, useCallback, useRef } from "react";
import { InfoLink } from "./InfoModal.jsx";
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
    note: "No credit card required.",
    image: image29008,
  },
];

const AUTO_ADVANCE_MS = 6500;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index]);

  const goTo = (i) => {
    const nextIndex = ((i % SLIDES.length) + SLIDES.length) % SLIDES.length;
    setIndex(nextIndex);
  };

  return (
    <section className="relative overflow-hidden border-b border-navy-700/60 bg-ink">
      {/* Full-bleed background image: desktop/tablet only (md and up).
          On mobile the image renders in normal flow instead, see below,
          so it can never collide with the text. */}
      <div className="hidden md:block">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${s.image})`,
              opacity: i === index ? 1 : 0,
            }}
          />
        ))}
        {/* Scrim is near-opaque under the text column so lettering baked into
            the photos can't show through the headline. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20 pointer-events-none" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-10 md:min-h-[560px] md:grid-cols-[1.2fr,1fr] md:py-20">
        <div>
          {/* All slides share ONE grid cell, so this block is always as tall
              as the tallest slide and nothing below the carousel moves.
              Inactive slides are `invisible`, which also removes their links
              from the tab order and from screen readers. */}
          <div className="grid">
            {SLIDES.map((s, i) => {
              const isActive = i === index;
              // Only the first slide is the page's h1; the rest are h2s
              const Heading = i === 0 ? "h1" : "h2";

              return (
                <div
                  key={s.title}
                  className={`col-start-1 row-start-1 transition-[opacity,visibility,transform] duration-500 motion-reduce:transition-none ${
                    isActive
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0"
                  }`}
                >
                  {/* Eyebrow: a quiet pill in sentence case, not tracked caps */}
                  <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80 backdrop-blur-sm">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {s.eyebrow}
                  </p>

                  {/* Headline: heavy sans, tight tracking and leading, one
                      color, balanced line breaks */}
                  <Heading className="mt-5 font-sans text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-ivory [text-wrap:balance] sm:text-5xl md:text-6xl">
                    {s.title} {s.highlight}
                  </Heading>

                  {/* Mobile-only image: sits in normal document flow between
                      the heading and body copy, so it can never overlap text.
                      Hidden on md+ where the full-bleed background is used. */}
                  <div className="relative mt-6 h-56 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 sm:h-64 md:hidden">
                    <img
                      src={s.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>

                  <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-ivory/75 md:text-lg">
                    {s.body}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                    </InfoLink>
                    <InfoLink
                      to={s.secondaryCta.to}
                      className={`rounded-full border border-ivory/25 px-6 py-3 text-sm font-semibold text-ivory/90 transition hover:border-gold-500 hover:text-gold-400 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.secondaryCta.label}
                    </InfoLink>
                  </div>

                  {s.note && <p className="mt-4 text-sm text-ivory/60">{s.note}</p>}
                </div>
              );
            })}
          </div>

          {/* Dots + inline arrows: always visible, all screen sizes */}
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className={`rounded-full border border-ivory/30 bg-ink/50 p-2 text-ivory/70 backdrop-blur-sm hover:border-gold-500 hover:text-gold-400 ${FOCUS_RING}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${FOCUS_RING} ${
                    i === index ? "w-6 bg-gold-500" : "w-2 bg-ivory/30 hover:bg-ivory/50"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className={`rounded-full border border-ivory/30 bg-ink/50 p-2 text-ivory/70 backdrop-blur-sm hover:border-gold-500 hover:text-gold-400 ${FOCUS_RING}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}