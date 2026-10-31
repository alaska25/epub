import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import HeroCarousel from "../components/HeroCarousel.jsx";
import BookGrid from "../components/BookGrid.jsx";
import Reveal from "../components/Reveal.jsx";
import TemplateShowcase from "../components/TemplateShowcase.jsx";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";
const BTN_GOLD = `inline-flex items-center justify-center rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-8 py-3.5 text-sm font-bold text-ink shadow-[0_12px_40px_-8px] shadow-gold-500/50 ring-1 ring-gold-500/40 transition hover:-translate-y-0.5 active:scale-[0.98] ${FOCUS_RING}`;

const ICONS = {
  book: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  phone: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  bolt: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  eye: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z",
  arrow: "M5 12h14M13 6l6 6-6 6",
};

const TABS = [
  {
    id: "readers",
    ns: "features",
    items: [
      { key: "quality", icon: "book" },
      { key: "readAnywhere", icon: "phone" },
      { key: "securePurchase", icon: "shield" },
      { key: "instantAccess", icon: "bolt" },
    ],
  },
  {
    id: "developers",
    ns: "templateFeatures",
    items: [
      { key: "fullSource", icon: "code" },
      { key: "instantDownload", icon: "bolt" },
      { key: "preview", icon: "eye" },
      { key: "securePurchase", icon: "shield" },
    ],
  },
];

const STEPS = [
  { key: "find", title: "Find a book", body: "Browse by category or search by title." },
  { key: "sample", title: "Read a free sample", body: "Try the first chapter. No account needed." },
  { key: "own", title: "Buy once, keep it", body: "It opens in your library right away." },
];

// Plain, checkable answers only. Edit the copy (or the locale keys) to match your policies.
const FAQ = [
  { key: "try", q: "Can I try a book before buying?", a: "Yes. Every book has a free first chapter you can read without an account." },
  { key: "after", q: "What happens after I pay?", a: "The book appears in your library right away, and you can open it on any device." },
  { key: "template", q: "What do I get with a template?", a: "The complete source code, ready to download and customize." },
  { key: "refund", q: "Can I get a refund?", a: "Our refund policy explains exactly when and how.", link: "/refund-policy" },
];

function Icon({ name, className = "h-6 w-6", stroke = 1.5 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden="true" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
  );
}

function SectionHeading({ title, subtitle, className = "" }) {
  return (
    <div className={className}>
      <h2 className="font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ivory [text-wrap:balance] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory/65 sm:text-lg">{subtitle}</p>}
    </div>
  );
}

function CarouselSkeleton({ label }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16" aria-busy="true">
      <span className="sr-only" role="status">{label}</span>
      <div className="h-8 w-56 animate-pulse rounded-full bg-navy-800" />
      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-navy-800" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-navy-800" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-navy-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Small stack of book spines. Decorative.
function Spines() {
  const spines = [
    "h-28 w-9 from-gold-300 to-gold-500",
    "h-36 w-11 from-navy-700 to-navy-900",
    "h-32 w-8 from-gold-500 to-gold-400",
    "h-40 w-10 from-[#e9e2d0] to-[#c9bfa4]",
    "h-28 w-9 from-navy-700 to-navy-800",
  ];
  return (
    <div aria-hidden="true" className="flex items-end gap-1.5">
      {spines.map((c, i) => (
        <div
          key={i}
          className={`rounded-t-md bg-gradient-to-b shadow-xl shadow-black/30 ring-1 ring-ivory/10 transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none ${c}`}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

// Tiny code window. Fixed colours on purpose so it reads as code in any theme.
function CodeWindow() {
  const row = (w, c) => <div className={`h-2 rounded-full ${c}`} style={{ width: w }} />;
  return (
    <div aria-hidden="true" className="w-56 overflow-hidden rounded-xl bg-[#0f1420] shadow-2xl shadow-black/40 ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none">
      <div className="flex gap-1.5 border-b border-white/10 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <div className="space-y-2.5 p-4">
        {row("55%", "bg-[#c8a24a]")}
        {row("80%", "bg-white/25")}
        <div className="pl-4">{row("62%", "bg-[#7aa2f7]/70")}</div>
        <div className="pl-4">{row("45%", "bg-white/25")}</div>
        {row("70%", "bg-[#9ece6a]/70")}
        {row("35%", "bg-white/25")}
      </div>
    </div>
  );
}

// Real book covers, fanned out like a hand of cards. Falls back to the spines.
function CoverFan({ books }) {
  const covers = (books || []).filter((b) => b.coverUrl).slice(0, 3);
  if (covers.length < 2) return <Spines />;
  const pose = [
    "-rotate-6 translate-y-2 group-hover:-translate-x-2 group-hover:-rotate-[9deg]",
    "z-10 -translate-y-3 group-hover:-translate-y-6",
    "rotate-6 translate-y-2 group-hover:translate-x-2 group-hover:rotate-[9deg]",
  ];
  return (
    <div aria-hidden="true" className="flex items-end pl-4">
      {covers.map((b, i) => (
        <img
          key={b._id || i}
          src={b.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={`-ml-4 aspect-[2/3] w-24 rounded-lg object-cover shadow-2xl shadow-black/50 ring-1 ring-black/10 transition-transform duration-500 first:ml-0 motion-reduce:transition-none sm:w-28 ${pose[i]}`}
        />
      ))}
    </div>
  );
}

// Real template previews inside a small browser window, with a second one
// peeking out behind. Falls back to the code window.
function TemplateStack({ templates }) {
  const covers = (templates || []).filter((x) => x.coverUrl).slice(0, 2);
  if (covers.length === 0) return <CodeWindow />;
  const Frame = ({ src, className }) => (
    <div className={`overflow-hidden rounded-xl bg-[#0f1420] shadow-2xl shadow-black/40 ring-1 ring-white/10 ${className}`}>
      <div className="flex gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </div>
      <img src={src} alt="" loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
    </div>
  );
  return (
    <div aria-hidden="true" className="relative h-40 w-60 sm:h-44 sm:w-64">
      {covers[1] && (
        <Frame
          src={covers[1].coverUrl}
          className="absolute -top-3 right-0 w-[88%] rotate-3 opacity-90 transition-transform duration-500 group-hover:translate-x-2 group-hover:rotate-6 motion-reduce:transition-none"
        />
      )}
      <Frame
        src={covers[0].coverUrl}
        className="absolute bottom-0 left-0 w-[92%] -rotate-2 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-0 motion-reduce:transition-none"
      />
    </div>
  );
}

// Two ways into the shop, as two big doors.
function PathCard({ to, title, body, cta, visual }) {
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-[2rem] border border-navy-700/70 bg-gradient-to-br from-navy-900 to-ink p-8 transition-colors duration-500 hover:border-gold-500/60 sm:p-10 ${FOCUS_RING}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl transition-opacity duration-500 group-hover:bg-gold-500/20" />
      <div className="relative">
        <h3 className="max-w-[16ch] font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ivory sm:text-4xl">{title}</h3>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-ivory/65">{body}</p>
      </div>
      <div className="relative mt-8 flex flex-col-reverse items-start gap-8 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-gold-400">
          {cta}
          <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" stroke={2.5} />
        </span>
        <div className="max-w-full self-center sm:self-auto">{visual}</div>
      </div>
    </Link>
  );
}

// A tilted sample page with a gold tab. Fixed paper colours (works in both themes).
function SamplePage({ chapter, tag }) {
  const line = "h-2 rounded-full bg-[#1c1a16]/15";
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
      <div className="absolute inset-0 translate-x-4 translate-y-4 rotate-[5deg] rounded-2xl bg-gold-500/20 blur-sm" />
      <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-[2.5deg] rounded-2xl bg-[#e4dcc8]" />
      <div className="relative -rotate-2 rounded-2xl bg-[#faf6ec] p-8 shadow-[0_40px_80px_-20px] shadow-black/70 transition-transform duration-700 hover:rotate-0 motion-reduce:transition-none">
        <span className="absolute -right-3 top-8 rounded-l-full bg-gradient-to-b from-gold-400 to-gold-500 py-1.5 pl-4 pr-5 text-xs font-bold text-ink shadow-lg">{tag}</span>
        <p className="font-serif text-sm italic text-[#1c1a16]/55">{chapter}</p>
        <div className="mt-3 h-6 w-3/4 rounded-full bg-[#1c1a16]/85" />
        <div className="mt-8 space-y-3">
          <div className={`${line} w-full`} />
          <div className={`${line} w-[94%]`} />
          <div className={`${line} w-full`} />
          <div className={`${line} w-[82%]`} />
          <div className="h-3" />
          <div className={`${line} w-full`} />
          <div className={`${line} w-[90%]`} />
          <div className={`${line} w-[60%]`} />
        </div>
      </div>
    </div>
  );
}

// A real book that has a free sample: its cover, title, author, rating and the
// start of its description, on the same paper card. Clicking opens its sample.
// Falls back to the drawn page when no featured book has a sample yet.
function SamplePreview({ book, chapter, tag, cta }) {
  if (!book) return <SamplePage chapter={chapter} tag={tag} />;
  const rated = book.reviewCount > 0 && book.avgRating != null;
  const excerpt = (book.description || "").replace(/\s+/g, " ").trim();
  return (
    <Link
      to={`/sample/${book._id}`}
      aria-label={`${cta}: ${book.title}`}
      className="group relative mx-auto block w-full max-w-sm rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
    >
      <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rotate-[5deg] rounded-2xl bg-gold-500/20 blur-sm" />
      <div aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 rotate-[2.5deg] rounded-2xl bg-[#e4dcc8]" />
      <div className="relative -rotate-2 rounded-2xl bg-[#faf6ec] p-7 shadow-[0_40px_80px_-20px] shadow-black/70 transition-transform duration-700 group-hover:rotate-0 motion-reduce:transition-none">
        <span className="absolute -right-3 top-7 rounded-l-full bg-gradient-to-b from-gold-400 to-gold-500 py-1.5 pl-4 pr-5 text-xs font-bold text-ink shadow-lg">{tag}</span>
        <p className="font-serif text-sm italic text-[#1c1a16]/55">{chapter}</p>
        <div className="mt-4 flex gap-4">
          {book.coverUrl && (
            <img src={book.coverUrl} alt="" loading="lazy" decoding="async" className="aspect-[2/3] w-24 shrink-0 rounded-md object-cover shadow-lg ring-1 ring-black/10" />
          )}
          <div className="min-w-0 pr-6">
            <h3 className="font-serif text-xl font-semibold leading-tight text-[#1c1a16]">{book.title}</h3>
            {book.author && <p className="mt-1 text-sm text-[#1c1a16]/65">{book.author}</p>}
            {rated && (
              <p className="mt-2 text-sm font-semibold text-[#8a6a1f]">
                ★ {Number(book.avgRating).toFixed(1)} <span className="font-normal text-[#1c1a16]/55">({book.reviewCount})</span>
              </p>
            )}
          </div>
        </div>
        {excerpt && <p className="mt-5 line-clamp-4 font-serif text-[15px] leading-relaxed text-[#1c1a16]/80">{excerpt}</p>}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6a1f]">
          {cta}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [detailSample, setDetailSample] = useState(null);
  const [tab, setTab] = useState("readers");
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    api
      .get("/books", {
        params: { limit: 12 },
        timeout: 45000, // allows for a sleeping backend waking up
        silent: true, // the on-page message below replaces the generic toast
      })
      .then(({ data }) => {
        if (!ignore) setFeatured(data?.books ?? []);
      })
      .catch(() => {
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [retryKey]);

  // Find a book with a free sample and load its full page once (the book list
  // only carries a few fields, so the description comes from the detail request).
  // If the list does not include `sampleFileType`, check the first few books instead.
  useEffect(() => {
    if (!featured.length) return;
    let ignore = false;
    const load = (b) =>
      api
        .get(`/books/${b._id}`, { silent: true })
        .then((r) => r.data)
        .catch(() => null);
    const flagged = featured.find((b) => b.sampleFileType);
    const run = flagged
      ? load(flagged)
      : Promise.all(featured.slice(0, 6).map(load)).then((list) => list.find((b) => b?.sampleFileType) || null);
    run.then((d) => {
      if (!ignore) setDetailSample(d);
    });
    return () => {
      ignore = true;
    };
  }, [featured]);

  // A few templates for the "Ship your next site faster" card. If this fails
  // the card simply keeps its abstract code-window picture.
  useEffect(() => {
    let ignore = false;
    api
      .get("/templates", { params: { limit: 3 }, silent: true })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.templates ?? [];
        if (!ignore) setTemplates(list);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubStatus("");
    try {
      const { data } = await api.post("/newsletter/subscribe", { email: email.trim() });
      setSubStatus(data?.message || t("newsletter.success", "You're subscribed."));
      setEmail("");
    } catch (err) {
      setSubStatus(err.response?.data?.message || t("newsletter.error"));
    } finally {
      setSubscribing(false);
    }
  };

  const active = TABS.find((x) => x.id === tab);
  // The first featured book that has a free sample (BookDetail uses sampleFileType the same way).
  const sampleBook = detailSample || featured.find((b) => b.sampleFileType) || null;
  const samplePath = sampleBook ? `/sample/${sampleBook._id}` : "/catalog?search=free";
  const onTabKey = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tab === "readers" ? "developers" : "readers";
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <div>
      <style>{`
        @keyframes home-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .home-fade { animation: home-fade 400ms cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .home-fade { animation: none; } }
      `}</style>

      {/* Hero: above the fold, so no reveal */}
      <HeroCarousel />

      {/* Featured books: right under the hero, so no reveal either */}
      {loading ? (
        <CarouselSkeleton label={t("common.loading", "Loading books")} />
      ) : error ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p role="alert" className="text-ivory/70">{t("common.booksError", "We couldn't load books. Please try again.")}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className={`mt-4 rounded-full bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink hover:bg-gold-400 ${FOCUS_RING}`}
          >
            {t("catalog.tryAgain", "Try again")}
          </button>
        </div>
      ) : featured.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-ivory/60">{t("common.noBooksYet")}</p>
        </div>
      ) : (
        <BookGrid books={featured} />
      )}

      {/* Two doors: readers and builders */}
      <section className="border-t border-navy-700/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal>
            <SectionHeading
              title={t("paths.title", "Two ways to use Adyoolau")}
              subtitle={t("paths.subtitle", "Pick up a book to read, or a template to build with. Either way, it's yours to keep.")}
            />
          </Reveal>
          <Reveal className="mt-12 grid gap-6 md:grid-cols-2" delay={100}>
            <PathCard
              to="/catalog"
              title={t("paths.readTitle", "Read something worth keeping")}
              body={t("paths.readBody", "Ebooks with a free first chapter, a library that works on every device.")}
              cta={t("paths.readCta", "Browse books")}
              visual={<CoverFan books={featured} />}
            />
            <PathCard
              to="/templates"
              title={t("paths.buildTitle", "Ship your next site faster")}
              body={t("paths.buildBody", "Production-ready templates with the full source code included.")}
              cta={t("paths.buildCta", "Browse templates")}
              visual={<TemplateStack templates={templates} />}
            />
          </Reveal>
        </div>
      </section>

      {/* Read before you buy */}
      <section className="relative overflow-hidden border-t border-navy-700/60 bg-gradient-to-b from-navy-900/60 to-ink">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-10 h-[480px] w-[480px] rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:grid-cols-[1.1fr,1fr] lg:py-28">
          <Reveal>
            <SectionHeading
              title={t("howItWorks.title", "Read before you buy")}
              subtitle={t("howItWorks.subtitle", "Every book has a free first chapter, so you know it's right before you pay.")}
            />
            <ol className="relative mt-10 space-y-8">
              <span aria-hidden="true" className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-gold-400/70 via-gold-500/30 to-transparent" />
              {STEPS.map((s, i) => (
                <li key={s.key} className="relative flex gap-5">
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-serif text-lg font-semibold text-gold-300 ring-1 ring-gold-500/60">{i + 1}</span>
                  <div className="pt-1.5">
                    <p className="text-lg font-semibold text-ivory">{t(`howItWorks.${s.key}.title`, s.title)}</p>
                    <p className="mt-1 text-base text-ivory/65">{t(`howItWorks.${s.key}.body`, s.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to={samplePath} className={`mt-10 ${BTN_GOLD}`}>
              {t("howItWorks.cta", "Read a free sample")}
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <SamplePreview
              book={sampleBook}
              chapter={t("howItWorks.sampleChapter", "Chapter 1")}
              tag={t("howItWorks.sampleTag", "Free sample")}
              cta={t("howItWorks.readThis", "Read this sample")}
            />
          </Reveal>
        </div>
      </section>

      {/* Why: a switch between audiences, one ledger of four points */}
      <section className="border-t border-navy-700/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              title={t("why.title", "Made to be owned, not rented")}
              subtitle={t("why.subtitle", "Whether you read or build, you get the file and keep it.")}
            />
            <div role="tablist" aria-label={t("why.title", "Made to be owned, not rented")} onKeyDown={onTabKey} className="inline-flex shrink-0 rounded-full border border-navy-700 bg-navy-900/60 p-1">
              {TABS.map((x) => (
                <button
                  key={x.id}
                  id={`tab-${x.id}`}
                  role="tab"
                  type="button"
                  aria-selected={tab === x.id}
                  aria-controls="why-panel"
                  tabIndex={tab === x.id ? 0 : -1}
                  onClick={() => setTab(x.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${FOCUS_RING} ${
                    tab === x.id ? "bg-gold-500 text-ink" : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  {x.id === "readers" ? t("why.readers", "For readers") : t("why.developers", "For developers")}
                </button>
              ))}
            </div>
          </Reveal>

          <div
            key={tab}
            id="why-panel"
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="home-fade mt-12 grid gap-px overflow-hidden rounded-3xl bg-navy-700/60 ring-1 ring-navy-700/60 sm:grid-cols-2 lg:grid-cols-4"
          >
            {active.items.map((f) => (
              <div key={f.key} className="bg-ink p-7 sm:p-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/25">
                  <Icon name={f.icon} className="h-6 w-6" />
                </span>
                <p className="mt-6 font-serif text-xl font-semibold text-ivory">{t(`${active.ns}.${f.key}.title`)}</p>
                <p className="mt-2 text-sm leading-relaxed text-ivory/65">{t(`${active.ns}.${f.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TemplateShowcase templates={templates} />

      {/* Questions a first-time buyer has */}
      <section className="border-t border-navy-700/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr,1.4fr] lg:py-28">
          <Reveal>
            <SectionHeading
              title={t("faq.title", "Questions before you buy?")}
              subtitle={t("faq.subtitle", "The short answers. Need more? Just ask in the chat.")}
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="divide-y divide-navy-700/60 border-y border-navy-700/60">
              {FAQ.map((f) => (
                <details key={f.key} className="group py-1">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-5 text-lg font-semibold text-ivory [&::-webkit-details-marker]:hidden ${FOCUS_RING}`}>
                    {t(`faq.${f.key}.q`, f.q)}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-400 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none">
                      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="pb-5 pr-10 text-base leading-relaxed text-ivory/70">
                    {t(`faq.${f.key}.a`, f.a)}{" "}
                    {f.link && (
                      <Link to={f.link} className="text-gold-400 underline underline-offset-4 hover:text-gold-300">
                        {t("faq.readPolicy", "Read the policy")}
                      </Link>
                    )}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing call-to-action: the last nudge before the footer */}
      <section className="relative isolate overflow-hidden border-t border-navy-700/60">
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/15 blur-3xl" />
        <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
          <h2 className="font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-ivory [text-wrap:balance] sm:text-5xl lg:text-6xl">
            {t("finalCta.title", "Start with a free chapter")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ivory/70">
            {t("finalCta.body", "No account, no card. If you like it, the whole book is a click away.")}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link to={samplePath} className={BTN_GOLD}>
              {t("finalCta.primary", "Read a free sample")}
            </Link>
            <Link
              to="/templates"
              className={`rounded-full border border-ivory/25 px-8 py-3.5 text-sm font-semibold text-ivory/90 transition hover:border-gold-400/70 hover:text-gold-300 ${FOCUS_RING}`}
            >
              {t("finalCta.secondary", "Browse templates")}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Newsletter */}
      <section className="border-t border-navy-700/60">
        <Reveal className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="rounded-[2rem] bg-gradient-to-br from-gold-300/60 via-gold-500/15 to-ivory/10 p-px">
            <div className="relative grid items-center gap-10 overflow-hidden rounded-[calc(2rem-1px)] bg-gradient-to-br from-navy-900 to-ink px-6 py-12 sm:px-12 lg:grid-cols-[1.1fr,1fr] lg:py-16">
              <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />
              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
                  <span aria-hidden="true" className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22c55e]" />
                  </span>
                  {t("newsletter.badge")}
                </p>
                <h2 className="mt-5 font-serif text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-ivory [text-wrap:balance] sm:text-4xl">{t("newsletter.title")}</h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ivory/70">{t("newsletter.subtitle")}</p>
              </div>
              <div className="relative">
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("newsletter.placeholder")}
                    aria-label={t("newsletter.emailAriaLabel")}
                    className={`flex-1 rounded-full border border-navy-700 bg-ink/60 px-5 py-3.5 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500 ${FOCUS_RING}`}
                  />
                  <button type="submit" disabled={subscribing} className={`${BTN_GOLD} disabled:opacity-50 disabled:hover:translate-y-0`}>
                    {subscribing ? t("newsletter.subscribing") : t("newsletter.subscribe")}
                  </button>
                </form>
                <p role="status" className="mt-4 min-h-5 text-sm text-gold-400">{subStatus}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}