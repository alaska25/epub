import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InfoLink } from "./InfoModal.jsx";
// TIP: convert these to .webp (see scripts/compress-images.mjs) and change
// the extensions below, e.g. "./images/29342.webp".
import image29342 from "./images/29342.jpg";
import image29340 from "./images/29340.jpg";
import image29339 from "./images/29339.jpg";

// Slide copy comes from translation keys (heroCarousel.slide1/2/3.*);
// only the images and link targets stay hardcoded here.
const SLIDE_META = [
  {
    key: "slide1",
    primaryTo: "/catalog",
    secondaryTo: "/catalog?search=free",
    image: image29342,
    hasNote: false,
  },
  {
    key: "slide2",
    primaryTo: "/catalog",
    secondaryTo: "/refund-policy",
    image: image29339,
    hasNote: false,
  },
  {
    key: "slide3",
    primaryTo: "/catalog?search=free",
    secondaryTo: "/about",
    image: image29340,
    hasNote: true,
  },
];

// Long enough to finish reading a slide.
const AUTO_ADVANCE_MS = 8000;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Just the dots. Used on its own under the mobile banner, and inside the
// desktop controls.
function Dots({ index, count, onGo }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onGo(i)}
          aria-label={t("heroCarousel.goToSlide", { number: i + 1 })}
          aria-current={i === index}
          // Padding makes the tap target ~24px tall while the dot stays 8px
          className={`group rounded-full px-1 py-2 ${FOCUS_RING}`}
        >
          <span
            className={`block h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-gold-500" : "w-2 bg-ivory/30 group-hover:bg-ivory/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Arrows + dots for desktop, shown below the text.
// (backdrop-blur removed: it re-blurs every frame during the crossfade and
// is a common cause of stutter on phones and older laptops.)
function Controls({ index, count, onPrev, onNext, onGo }) {
  const { t } = useTranslation();
  const arrow = `rounded-full border border-ivory/30 bg-ink/80 p-2 text-ivory/70 hover:border-gold-500 hover:text-gold-400 ${FOCUS_RING}`;

  return (
    <div className="flex items-center gap-4">
      <button onClick={onPrev} aria-label={t("heroCarousel.prevSlide")} className={arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Dots index={index} count={count} onGo={onGo} />

      <button onClick={onNext} aria-label={t("heroCarousel.nextSlide")} className={arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// The first slide loads eagerly with high priority (it's the page's LCP
// image); the others are lazy so they don't compete for bandwidth.
function SlideImage({
  src,
  first,
  className = "absolute inset-0 h-full w-full object-contain object-center bg-ink",
}) {
  return (
    <img
      src={src}
      alt=""
      decoding="async"
      loading={first ? "eager" : "lazy"}
      fetchpriority={first ? "high" : "auto"}
      className={className}
    />
  );
}

export default function HeroCarousel() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  // Counts automatic advances so each slide is shown once, then autoplay stops.
  const ticksRef = useRef(0);
  const touchX = useRef(null);

  // Build the full slide objects (translated text + static meta) on each
  // render so a language change immediately updates the copy.
  const SLIDES = SLIDE_META.map((meta) => ({
    ...meta,
    eyebrow: t(`heroCarousel.${meta.key}.eyebrow`),
    title: t(`heroCarousel.${meta.key}.title`),
    highlight: t(`heroCarousel.${meta.key}.highlight`),
    body: t(`heroCarousel.${meta.key}.body`),
    primaryCta: { label: t(`heroCarousel.${meta.key}.primaryCta`), to: meta.primaryTo },
    secondaryCta: { label: t(`heroCarousel.${meta.key}.secondaryCta`), to: meta.secondaryTo },
    note: meta.hasNote ? t(`heroCarousel.${meta.key}.note`) : null,
  }));

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDE_META.length);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;

    timerRef.current = setInterval(() => {
      // Don't churn through slides in a background tab.
      if (document.hidden) return;
      // Show each slide once, then stay put on the last one.
      if (ticksRef.current >= SLIDE_META.length - 1) {
        clearInterval(timerRef.current);
        return;
      }
      ticksRef.current += 1;
      advance();
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index, paused]);

  // Used for every manual action (arrows, dots, swipes). Once the visitor
  // takes control, autoplay stops for good.
  const goTo = (i) => {
    ticksRef.current = SLIDE_META.length - 1;
    const nextIndex = ((i % SLIDE_META.length) + SLIDE_META.length) % SLIDE_META.length;
    setIndex(nextIndex);
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    // Ignore small movements so taps on the button still work.
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
  };

  const controlProps = {
    index,
    count: SLIDES.length,
    onPrev: () => goTo(index - 1),
    onNext: () => goTo(index + 1),
    onGo: goTo,
  };

  return (
    // Pause autoplay while the pointer is over the hero or keyboard focus is
    // inside it (also an accessibility requirement for auto-moving content).
    <section
      className="relative overflow-hidden border-b border-navy-700/60 bg-ink md:min-h-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* ───────────── MOBILE: compact banner card + dots ─────────────
          Text and one button on the left, picture on the right, dots below
          the card. Swipe left/right to change slides. Colors come from the
          theme tokens, so it follows light and dark mode. */}
      <div className="px-6 pb-3 pt-1 md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative overflow-hidden rounded-3xl border border-navy-700/60 bg-gradient-to-br from-gold-500/20 via-navy-900 to-navy-900">
          {/* All slides share ONE grid cell, so the card is always as tall
              as the tallest slide and nothing below it moves. */}
          <div className="grid">
            {SLIDES.map((s, i) => {
              const isActive = i === index;
              const Heading = i === 0 ? "h1" : "h2";

              return (
                <div
                  key={s.key}
                  className={`col-start-1 row-start-1 grid grid-cols-[1.15fr,1fr] items-center gap-3 p-4 transition-[opacity,visibility] duration-500 motion-reduce:transition-none ${
                    isActive ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  <div className="min-w-0">
                    <Heading className="font-sans text-xl font-bold leading-[1.1] tracking-[-0.03em] text-ivory [text-wrap:balance] sm:text-2xl">
                      {s.title} {s.highlight}
                    </Heading>
                    <p className="mt-2 line-clamp-2 text-sm leading-snug text-ivory/70">{s.body}</p>
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`mt-4 inline-block rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink shadow-md shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                    </InfoLink>
                  </div>

                  <div className="relative h-32 sm:h-44">
                    <SlideImage
                      src={s.image}
                      first={i === 0}
                      className="absolute inset-0 h-full w-full rounded-2xl object-cover object-center"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex justify-center">
          <Dots index={index} count={SLIDES.length} onGo={goTo} />
        </div>
      </div>

      {/* ───────────── DESKTOP / TABLET (md and up) ───────────── */}
      {/* Full-bleed background image. */}
      <div className="absolute inset-0 hidden md:block">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <SlideImage src={s.image} first={i === 0} />
          </div>
        ))}
        {/* Scrim is near-opaque under the text column so lettering baked into
            the photos can't show through the headline. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/20" />
      </div>

      <div className="relative mx-auto hidden max-w-6xl items-center gap-10 px-6 md:grid md:min-h-[560px] md:grid-cols-[1.2fr,1fr] md:py-20">
        <div>
          {/* All slides share ONE grid cell, so this block is always as tall
              as the tallest slide and nothing below the carousel moves.
              Inactive slides are `invisible`, which also removes their links
              from the tab order and from screen readers. */}
          <div className="grid">
            {SLIDES.map((s, i) => {
              const isActive = i === index;
              const Heading = i === 0 ? "h1" : "h2";

              return (
                <div
                  key={s.key}
                  className={`col-start-1 row-start-1 transition-[opacity,visibility,transform] duration-500 motion-reduce:transition-none ${
                    isActive
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-2 opacity-0"
                  }`}
                >
                  {/* Eyebrow: rounded-3xl (not -full) so a wrapped two-line
                      label doesn't turn into a blob */}
                  <p className="inline-flex max-w-full items-center gap-2 rounded-3xl border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {s.eyebrow}
                  </p>

                  <Heading className="mt-5 font-sans text-6xl font-bold leading-[1.05] tracking-[-0.035em] text-ivory [text-wrap:balance]">
                    {s.title} {s.highlight}
                  </Heading>

                  <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ivory/75">{s.body}</p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`rounded-full bg-gold-500 px-6 py-3 text-center text-sm font-semibold text-ink shadow-lg shadow-gold-500/20 transition hover:bg-gold-400 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                    </InfoLink>
                    <InfoLink
                      to={s.secondaryCta.to}
                      className={`rounded-full border border-ivory/25 px-6 py-3 text-center text-sm font-semibold text-ivory/90 transition hover:border-gold-500 hover:text-gold-400 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.secondaryCta.label}
                    </InfoLink>
                  </div>

                  {s.note && <p className="mt-4 text-sm text-ivory/60">{s.note}</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <Controls {...controlProps} />
          </div>
        </div>
      </div>
    </section>
  );
}