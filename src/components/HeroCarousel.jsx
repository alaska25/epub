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
  { key: "slide1", primaryTo: "/catalog", secondaryTo: "/catalog?search=free", image: image29204, hasNote: false },
  { key: "slide2", primaryTo: "/catalog", secondaryTo: "/refund-policy", image: image29236, hasNote: false },
  { key: "slide3", primaryTo: "/catalog?search=free", secondaryTo: "/about", image: image28821, hasNote: true },
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

function CheckIcon({ className = "h-4 w-4 shrink-0 text-gold-400" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={className}>
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
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

// Dots: used under the mobile banner. The active dot is a pill that fills
// while autoplay runs.
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

// Desktop navigation: one labelled segment per slide (the label is the slide's
// own eyebrow), with the active segment filling as autoplay counts down.
function SlideTabs({ slides, index, onGo, onPrev, onNext, progress }) {
  const { t } = useTranslation();
  const arrow = `grid h-11 w-11 place-items-center rounded-full border border-ivory/15 bg-ivory/[0.04] text-ivory/70 transition hover:border-gold-500/70 hover:bg-gold-500/10 hover:text-gold-300 active:scale-95 ${FOCUS_RING}`;

  return (
    <div className="flex items-end gap-6">
      <div className="grid flex-1 grid-cols-3 gap-4">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.key}
              onClick={() => onGo(i)}
              aria-label={t("heroCarousel.goToSlide", { number: i + 1 })}
              aria-current={active}
              className={`group/tab text-left ${FOCUS_RING} rounded-sm`}
            >
              <span className="relative block h-[3px] overflow-hidden rounded-full bg-ivory/15">
                {active && (
                  <span
                    key={progress ? `run-${index}` : `static-${index}`}
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 ${
                      progress ? "hero-progress" : "w-full"
                    }`}
                  />
                )}
              </span>
              <span
                className={`mt-3 block truncate text-[13px] font-medium transition-colors duration-300 ${
                  active ? "text-ivory" : "text-ivory/65 group-hover/tab:text-ivory"
                }`}
              >
                {s.eyebrow}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2 pb-0.5">
        <button onClick={onPrev} aria-label={t("heroCarousel.prevSlide")} className={arrow}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={onNext} aria-label={t("heroCarousel.nextSlide")} className={arrow}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// The first slide loads eagerly with high priority (it's the page's LCP
// image); the others are lazy so they don't compete for bandwidth.
function SlideImage({ src, first, className = "" }) {
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

// Glass chip used for floating trust badges on the picture stage.
function Badge({ children, className = "" }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border border-ivory/20 bg-navy-900/80 px-4 py-3 text-sm font-medium text-ivory shadow-2xl shadow-black/40 ${className}`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-b from-gold-400 to-gold-500 text-ink">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
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
  const stageRef = useRef(null);

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

  // Used for every manual action (arrows, dots, swipes, keys). Once the
  // visitor takes control, autoplay stops for good.
  const goTo = (i) => {
    ticksRef.current = SLIDE_META.length - 1;
    setStopped(true);
    setIndex(((i % SLIDE_META.length) + SLIDE_META.length) % SLIDE_META.length);
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

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") goTo(index + 1);
    else if (e.key === "ArrowLeft") goTo(index - 1);
  };

  // Pointer-driven tilt + light on the desktop picture stage. Only runs for
  // mouse/pen, and never when the visitor prefers reduced motion.
  const onStageMove = (e) => {
    if (reduceMotion || e.pointerType === "touch") return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 9).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const onStageLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    ["--rx", "--ry", "--mx", "--my"].forEach((p) => el.style.removeProperty(p));
  };

  // The progress fill only shows while autoplay is actually counting down.
  const showProgress = !stopped && !paused && !reduceMotion;

  return (
    // Pause autoplay while the pointer is over the hero or keyboard focus is
    // inside it (also an accessibility requirement for auto-moving content).
    <section
      className="relative isolate overflow-hidden border-b border-gold-500/20 bg-ink md:min-h-[700px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onKeyDown={onKeyDown}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <style>{`
        @keyframes hero-fill { from { width: 0%; } to { width: 100%; } }
        .hero-progress { animation: hero-fill ${AUTO_ADVANCE_MS}ms linear forwards; }

        @keyframes hero-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .hero-float { animation: hero-float 7s ease-in-out infinite; }
        .hero-float-b { animation: hero-float 8s ease-in-out -3s infinite; }

        /* One orchestrated entrance each time a slide becomes active. */
        @keyframes hero-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .hero-in > * { animation: hero-rise 800ms cubic-bezier(.2,.7,.2,1) both; }
        .hero-in > *:nth-child(1) { animation-delay: 0ms; }
        .hero-in > *:nth-child(2) { animation-delay: 90ms; }
        .hero-in > *:nth-child(3) { animation-delay: 180ms; }
        .hero-in > *:nth-child(4) { animation-delay: 270ms; }
        .hero-in > *:nth-child(5) { animation-delay: 340ms; }

        /* Slow zoom on the active picture */
        @keyframes hero-zoom { from { transform: scale(1.06); } to { transform: scale(1); } }
        .hero-zoom { animation: hero-zoom 1600ms cubic-bezier(.2,.7,.2,1) both; }

        /* Light sweep across the primary button on hover */
        .cta-sheen::after {
          content: ""; position: absolute; inset: 0 auto 0 -60%; width: 40%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent);
          transform: skewX(-18deg) translateX(0); transition: transform 900ms ease;
        }
        .cta-sheen:hover::after { transform: skewX(-18deg) translateX(520%); }

        /* Slow drifting glow behind the picture */
        @keyframes hero-aurora { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(24px,-18px,0) scale(1.08); } }
        .hero-aurora { animation: hero-aurora 14s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hero-progress, .hero-float, .hero-float-b, .hero-aurora, .hero-zoom, .hero-in > * { animation: none; }
          .hero-progress { width: 100%; }
          .cta-sheen::after { display: none; }
        }
      `}</style>

      {/* ───────────── BACKGROUND (decorative) ───────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-aurora absolute -left-40 -top-48 h-[560px] w-[560px] rounded-full bg-gold-500/20 blur-3xl" />
        <div className="absolute -bottom-56 right-[-8rem] h-[640px] w-[640px] rounded-full bg-navy-700/60 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            color: "rgb(255 255 255)",
            maskImage: "radial-gradient(ellipse at 70% 45%, black 10%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 70% 45%, black 10%, transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* ───────────── MOBILE: banner card + dots ───────────── */}
      <div className="px-5 pb-3 pt-4 md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="relative overflow-hidden rounded-3xl border border-gold-500/25 bg-gradient-to-br from-gold-500/25 via-navy-900 to-navy-900 shadow-2xl shadow-black/40">
          <div aria-hidden="true" className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/80 to-transparent" />
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
                  <div className={`min-w-0 ${isActive ? "hero-in" : ""}`}>
                    <p className="flex items-center gap-2 text-xs font-medium text-gold-300">
                      <span aria-hidden="true" className="h-px w-5 shrink-0 bg-gold-400" />
                      <span className="truncate">{s.eyebrow}</span>
                    </p>
                    <Heading className="mt-2 font-serif text-[1.65rem] font-semibold leading-[1.08] tracking-tight text-ivory [text-wrap:balance] sm:text-3xl">
                      {s.title}{" "}
                      <span className="bg-gradient-to-r from-gold-500 to-gold-400 bg-clip-text pr-1 italic text-transparent">
                        {s.highlight}
                      </span>
                    </Heading>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-snug text-ivory/80 sm:text-sm">{s.body}</p>
                    <div>
                      <InfoLink
                        to={s.primaryCta.to}
                        className={`cta-sheen group/cta relative mt-3 flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-3 py-2.5 text-center text-[13px] font-bold leading-tight text-ink shadow-lg shadow-gold-500/30 transition active:scale-[0.98] sm:inline-flex sm:w-auto sm:px-5 sm:text-sm ${FOCUS_RING}`}
                      >
                        {s.primaryCta.label}
                        <ArrowIcon />
                      </InfoLink>
                    </div>
                  </div>

                  <div className="relative flex h-36 items-center justify-center sm:h-48">
                    <div aria-hidden="true" className="absolute inset-3 rounded-full bg-gold-500/25 blur-2xl" />
                    <SlideImage
                      src={s.image}
                      first={i === 0}
                      className="relative max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/50 ring-1 ring-gold-300/30"
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
      <div className="relative mx-auto hidden max-w-7xl items-center gap-12 px-6 md:grid md:min-h-[700px] md:grid-cols-[1.05fr,1fr] md:py-20 lg:px-10">
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
                  className={`col-start-1 row-start-1 transition-[opacity,visibility] duration-500 motion-reduce:transition-none ${
                    isActive ? "visible opacity-100 hero-in" : "invisible opacity-0"
                  }`}
                >
                  <p className="flex items-center gap-3 text-sm font-medium text-gold-300">
                    <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-gold-500 to-gold-300" />
                    {s.eyebrow}
                  </p>

                  <Heading className="mt-6 font-serif text-5xl font-semibold leading-[1.04] tracking-[-0.025em] text-ivory [text-wrap:balance] lg:text-6xl xl:text-[4.5rem]">
                    {s.title}{" "}
                    <span className="bg-gradient-to-r from-gold-500 to-gold-400 bg-clip-text pr-1 italic text-transparent">
                      {s.highlight}
                    </span>
                  </Heading>

                  <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ivory/75 lg:text-xl">{s.body}</p>

                  <div>
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                      <InfoLink
                        to={s.primaryCta.to}
                        className={`cta-sheen group/cta relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-9 py-4 text-center text-base font-bold text-ink shadow-[0_12px_40px_-8px] shadow-gold-500/50 ring-1 ring-gold-500/40 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${FOCUS_RING}`}
                      >
                        {s.primaryCta.label}
                        <ArrowIcon />
                      </InfoLink>
                      <InfoLink
                        to={s.secondaryCta.to}
                        className={`rounded-full border border-ivory/25 bg-ivory/[0.04] px-8 py-4 text-center text-base font-semibold text-ivory/90 transition hover:border-gold-400/70 hover:bg-gold-500/10 hover:text-gold-300 active:scale-[0.98] ${FOCUS_RING}`}
                      >
                        {s.secondaryCta.label}
                      </InfoLink>
                    </div>
                    {s.note && <p className="mt-4 text-sm text-ivory/70">{s.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust strip */}
          <ul className="mt-10 inline-flex flex-wrap items-center gap-y-2 rounded-2xl border border-ivory/10 bg-ivory/[0.03] px-2 py-1 text-sm text-ivory/80">
            {trust.map((label, n) => (
              <li
                key={label}
                className={`flex items-center gap-2 px-4 py-2 ${n > 0 ? "border-l border-ivory/10" : ""}`}
              >
                <CheckIcon />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-ivory/10 pt-6">
            <SlideTabs
              slides={SLIDES}
              index={index}
              progress={showProgress}
              onGo={goTo}
              onPrev={() => goTo(index - 1)}
              onNext={() => goTo(index + 1)}
            />
          </div>
        </div>

        {/* Picture stage: the memorable moment. A framed, gold-edged card that
            tilts toward the pointer with a moving highlight, floating trust
            badges, and a slow zoom as each picture arrives. */}
        <div
          className="relative h-[460px] lg:h-[560px]"
          aria-hidden="true"
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
        >
          <div className="hero-aurora absolute inset-6 rounded-full bg-gold-500/25 blur-3xl" />
          <div className="absolute right-0 top-4 h-28 w-28 rounded-3xl border border-gold-400/30 bg-gold-500/10" />
          <div className="absolute bottom-2 left-0 h-20 w-20 rounded-full border border-ivory/15" />

          <div className="hero-float absolute inset-x-6 inset-y-8">
            <div
              ref={stageRef}
              className="relative h-full [transform-style:preserve-3d]"
              style={{
                transform: "perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
                transition: "transform 350ms ease-out",
              }}
            >
              {/* Gold hairline frame */}
              <div className="h-full rounded-[2rem] bg-gradient-to-br from-gold-300/70 via-gold-500/20 to-ivory/10 p-px shadow-[0_40px_90px_-20px] shadow-black/70">
                <div className="relative h-full rounded-[calc(2rem-1px)] bg-gradient-to-br from-navy-900 to-ink p-3">
                  <div className="relative h-full overflow-hidden rounded-3xl bg-navy-900 ring-1 ring-ivory/10">
                    {SLIDES.map((s, i) => (
                      <div
                        key={s.key}
                        className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-1000 motion-reduce:transition-none ${
                          i === index ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <SlideImage
                          src={s.image}
                          first={i === 0}
                          className={`max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/50 ${
                            i === index ? "hero-zoom" : ""
                          }`}
                        />
                      </div>
                    ))}
                    {/* Pointer light + soft vignette */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(circle at var(--mx, 30%) var(--my, 0%), rgba(255,255,255,0.14), transparent 45%)",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                  </div>
                </div>
              </div>

              {/* Floating trust badges sit in front of the card */}
              <div className="absolute -left-8 top-12 [transform:translateZ(60px)]">
                <div className="hero-float-b">
                  <Badge>{trust[0]}</Badge>
                </div>
              </div>
              <div className="absolute -right-6 bottom-14 [transform:translateZ(80px)]">
                <div className="hero-float" style={{ animationDelay: "-2s" }}>
                  <Badge>{trust[2]}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}