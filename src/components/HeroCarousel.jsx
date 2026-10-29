import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InfoLink } from "./InfoModal.jsx";
// TIP: convert these to .webp (see scripts/compress-images.mjs) and change
// the extensions below, e.g. "./images/29342.webp".
import image29204 from "./images/29204.jpg";
import image29236 from "./images/29236.jpg";
import image28821 from "./images/28821.png";

// Slide copy comes from translation keys (heroCarousel.slide1/2/3.*);
// only the images and link targets stay hardcoded here.
const SLIDE_META = [
  {
    key: "slide1",
    primaryTo: "/catalog",
    secondaryTo: "/catalog?search=free",
    image: image29204,
    hasNote: false,
  },
  {
    key: "slide2",
    primaryTo: "/catalog",
    secondaryTo: "/refund-policy",
    image: image29236,
    hasNote: false,
  },
  {
    key: "slide3",
    primaryTo: "/catalog?search=free",
    secondaryTo: "/about",
    image: image28821,
    hasNote: true,
  },
];

// Long enough to finish reading a slide.
const AUTO_ADVANCE_MS = 8000;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";

// Optional trust points. Add heroCarousel.trust1/2/3 to your locale files to
// translate them; the defaults below are used until you do.
const TRUST_KEYS = [
  { key: "trust1", fallback: "Instant access" },
  { key: "trust2", fallback: "Secure checkout" },
  { key: "trust3", fallback: "Money-back guarantee" },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0 text-gold-400">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 111.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Just the dots. Used on its own under the mobile banner, and inside the
// desktop controls. The active dot is a pill that fills while autoplay runs.
function Dots({ index, count, onGo, progress }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      {Array.from({ length: count }, (_, i) => {
        const active = i === index;
        return (
          <button
            key={i}
            onClick={() => onGo(i)}
            aria-label={t("heroCarousel.goToSlide", { number: i + 1 })}
            aria-current={active}
            // Padding makes the tap target ~24px tall while the dot stays 6px
            className={`group rounded-full px-1 py-2.5 ${FOCUS_RING}`}
          >
            <span
              className={`relative block h-1.5 overflow-hidden rounded-full transition-all duration-500 ${
                active ? "w-10 bg-ivory/20" : "w-3 bg-ivory/25 group-hover:bg-ivory/50"
              }`}
            >
              {active && (
                <span
                  key={progress ? `run-${index}` : `static-${index}`}
                  className={`absolute inset-y-0 left-0 rounded-full bg-gold-400 ${
                    progress ? "hero-progress" : "w-full"
                  }`}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Arrows + dots for desktop, shown below the text.
// (backdrop-blur removed: it re-blurs every frame during the crossfade and
// is a common cause of stutter on phones and older laptops.)
function Controls({ index, count, onPrev, onNext, onGo, progress }) {
  const { t } = useTranslation();
  const arrow = `rounded-full border border-ivory/20 bg-ivory/5 p-2.5 text-ivory/70 transition hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-400 ${FOCUS_RING}`;

  return (
    <div className="flex items-center gap-4">
      <button onClick={onPrev} aria-label={t("heroCarousel.prevSlide")} className={arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Dots index={index} count={count} onGo={onGo} progress={progress} />

      <button onClick={onNext} aria-label={t("heroCarousel.nextSlide")} className={arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <span className="ml-1 font-mono text-xs tabular-nums tracking-widest text-ivory/40" aria-hidden="true">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
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
  // True once autoplay has finished or the visitor took control.
  const [stopped, setStopped] = useState(false);
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

  const trust = TRUST_KEYS.map(({ key, fallback }) =>
    t(`heroCarousel.${key}`, { defaultValue: fallback })
  );

  const advance = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDE_META.length);
  }, []);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || reduceMotion || stopped) return;

    timerRef.current = setInterval(() => {
      // Don't churn through slides in a background tab.
      if (document.hidden) return;
      // Show each slide once, then stay put on the last one.
      if (ticksRef.current >= SLIDE_META.length - 1) {
        clearInterval(timerRef.current);
        setStopped(true);
        return;
      }
      ticksRef.current += 1;
      advance();
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timerRef.current);
  }, [advance, index, paused, stopped, reduceMotion]);

  // Used for every manual action (arrows, dots, swipes). Once the visitor
  // takes control, autoplay stops for good.
  const goTo = (i) => {
    ticksRef.current = SLIDE_META.length - 1;
    setStopped(true);
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

  // The progress fill only shows while autoplay is actually counting down.
  const showProgress = !stopped && !paused && !reduceMotion;

  const controlProps = {
    index,
    count: SLIDES.length,
    onPrev: () => goTo(index - 1),
    onNext: () => goTo(index + 1),
    onGo: goTo,
    progress: showProgress,
  };

  return (
    // Pause autoplay while the pointer is over the hero or keyboard focus is
    // inside it (also an accessibility requirement for auto-moving content).
    <section
      className="relative isolate overflow-hidden border-b border-navy-700/60 bg-ink md:min-h-[640px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        // Only unpause when focus leaves the hero entirely, not when it
        // moves between elements inside it.
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <style>{`
        @keyframes hero-fill { from { width: 0%; } to { width: 100%; } }
        .hero-progress { animation: hero-fill ${AUTO_ADVANCE_MS}ms linear forwards; }
        @keyframes hero-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .hero-float { animation: hero-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-progress, .hero-float { animation: none; }
          .hero-progress { width: 100%; }
        }
      `}</style>

      {/* ───────────── BACKGROUND (decorative) ─────────────
          Layered glows + a faint grid, masked so it fades out at the edges.
          Static (no blur filters) so it stays cheap to paint. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-gold-500/15 blur-3xl" />
        <div className="absolute -bottom-48 right-0 h-[560px] w-[560px] rounded-full bg-navy-700/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            color: "rgb(255 255 255)",
            maskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 20%, transparent 75%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      </div>

      {/* ───────────── MOBILE: compact banner card + dots ─────────────
          Text and one button on the left, picture on the right, dots below
          the card. Swipe left/right to change slides. Colors come from the
          theme tokens, so it follows light and dark mode. */}
      <div className="px-5 pb-3 pt-4 md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative overflow-hidden rounded-3xl border border-ivory/10 bg-gradient-to-br from-gold-500/25 via-navy-900 to-navy-900 shadow-xl shadow-black/30">
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
                    <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-400">
                      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold-400" />
                      <span className="truncate">{s.eyebrow}</span>
                    </p>
                    <Heading className="font-sans text-xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ivory [text-wrap:balance] sm:text-2xl">
                      {s.title}{" "}
                      <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                        {s.highlight}
                      </span>
                    </Heading>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-ivory/70 sm:text-sm">{s.body}</p>
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`group/cta mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-3 py-2.5 text-center text-[13px] font-bold leading-tight text-ink shadow-lg shadow-gold-500/25 transition hover:brightness-110 active:scale-[0.98] sm:inline-flex sm:w-auto sm:px-5 sm:text-sm ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                      <ArrowIcon />
                    </InfoLink>
                  </div>

                  <div className="relative flex h-32 items-center justify-center sm:h-44">
                    <div aria-hidden="true" className="absolute inset-4 rounded-full bg-gold-500/20 blur-2xl" />
                    <SlideImage
                      src={s.image}
                      first={i === 0}
                      className="relative max-h-full max-w-full rounded-2xl object-contain shadow-xl ring-1 ring-ivory/15"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex justify-center">
          <Dots index={index} count={SLIDES.length} onGo={goTo} progress={showProgress} />
        </div>
      </div>

      {/* ───────────── DESKTOP / TABLET (md and up) ───────────── */}
      <div className="relative mx-auto hidden max-w-7xl items-center gap-12 px-6 md:grid md:min-h-[640px] md:grid-cols-[1.1fr,1fr] md:py-20 lg:px-10">
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
                      : "invisible translate-y-3 opacity-0"
                  }`}
                >
                  {/* Eyebrow: rounded-3xl (not -full) so a wrapped two-line
                      label doesn't turn into a blob */}
                  <p className="inline-flex max-w-full items-center gap-2.5 rounded-3xl border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-300">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
                    </span>
                    {s.eyebrow}
                  </p>

                  <Heading className="mt-6 font-sans text-5xl font-extrabold leading-[1.04] tracking-[-0.04em] text-ivory [text-wrap:balance] lg:text-6xl xl:text-7xl">
                    {s.title}{" "}
                    <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                      {s.highlight}
                    </span>
                  </Heading>

                  <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ivory/75 lg:text-xl">{s.body}</p>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <InfoLink
                      to={s.primaryCta.to}
                      className={`group/cta inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-8 py-4 text-center text-base font-bold text-ink shadow-xl shadow-gold-500/30 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.primaryCta.label}
                      <ArrowIcon />
                    </InfoLink>
                    <InfoLink
                      to={s.secondaryCta.to}
                      className={`rounded-full border border-ivory/25 bg-ivory/5 px-8 py-4 text-center text-base font-semibold text-ivory/90 transition hover:border-gold-500 hover:bg-gold-500/10 hover:text-gold-300 active:scale-[0.98] ${FOCUS_RING}`}
                    >
                      {s.secondaryCta.label}
                    </InfoLink>
                  </div>

                  {s.note && <p className="mt-4 text-sm text-ivory/60">{s.note}</p>}
                </div>
              );
            })}
          </div>

          {/* Trust row: quick credibility cues for first-time visitors */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ivory/70">
            {trust.map((label) => (
              <li key={label} className="flex items-center gap-2">
                <CheckIcon />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-ivory/10 pt-6">
            <Controls {...controlProps} />
          </div>
        </div>

        {/* Picture column: slides crossfade in the same spot, beside the text
            instead of behind it, so nothing overlaps the copy. The image sits
            in a framed, glowing card with a gentle float. */}
        <div className="relative h-[440px] lg:h-[520px]" aria-hidden="true">
          <div className="absolute inset-8 rounded-full bg-gold-500/20 blur-3xl" />
          <div className="absolute right-2 top-6 h-24 w-24 rounded-2xl border border-gold-500/30 bg-gold-500/10" />
          <div className="absolute bottom-4 left-0 h-16 w-16 rounded-full border border-ivory/15" />

          <div className="hero-float absolute inset-x-4 inset-y-6">
            <div className="relative h-full rounded-[2rem] border border-ivory/15 bg-gradient-to-br from-ivory/10 to-ivory/[0.02] p-3 shadow-2xl shadow-black/50">
              <div className="relative h-full overflow-hidden rounded-3xl bg-navy-900 ring-1 ring-ivory/10">
                {SLIDES.map((s, i) => (
                  <div
                    key={s.key}
                    className={`absolute inset-0 flex items-center justify-center p-3 transition-opacity duration-1000 motion-reduce:transition-none ${
                      i === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <SlideImage
                      src={s.image}
                      first={i === 0}
                      className="max-h-full max-w-full rounded-2xl object-contain"
                    />
                  </div>
                ))}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}