import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import BookCard from "../components/BookCard.jsx";

const FEATURES = [
  {
    title: "High-Quality Content",
    description: "Well-researched and professionally written ebooks.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    ),
  },
  {
    title: "Read Anywhere",
    description: "On your device, anytime, anywhere.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
      />
    ),
  },
  {
    title: "Secure Purchase",
    description: "Safe and reliable payment methods.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
  },
  {
    title: "Instant Access",
    description: "Get your book immediately after purchase.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    ),
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    api
      .get("/books", { params: { limit: 4 } })
      .then(({ data }) => setFeatured(data.books))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    setSubStatus("");
    try {
      const { data } = await api.post("/newsletter/subscribe", { email: email.trim() });
      setSubStatus(data.message);
      setEmail("");
    } catch (err) {
      setSubStatus(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-navy-700/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.2fr,1fr] md:py-28">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-gold-500/80">
              Digital Products &bull; Ebooks &bull; Templates &bull; Tools
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.1] text-ivory md:text-6xl">
              A library that fits in your{" "}
              <span className="text-gold-400">pocket.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-ivory/60">
              Adyoolau brings together fiction, nonfiction, and reference titles
              you can buy once and read anywhere — in the browser or downloaded
              for offline reading.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
              >
                Browse the Catalog
              </Link>
              <Link
                to="/catalog?search=free"
                className="rounded-full border border-navy-700 px-6 py-3 text-sm font-medium text-ivory/80 hover:border-gold-500 hover:text-gold-400"
              >
                Start with a Free Title
              </Link>
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
      </section>

      {/* Featured books */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-gold-500/80">
              Featured Books
            </p>
            <h2 className="mt-1 font-display text-3xl text-ivory">Popular titles</h2>
          </div>
          <Link to="/catalog" className="text-sm text-gold-400 hover:text-gold-300">
            View all books &rarr;
          </Link>
        </div>

        {loading ? (
          <p className="text-ivory/50">Loading books…</p>
        ) : featured.length === 0 ? (
          <p className="text-ivory/50">No books yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((book) => (
              <BookCard key={book._id} book={book} showAddToCart />
            ))}
          </div>
        )}
      </section>

      {/* Trust features */}
      <section className="border-t border-navy-700/60 bg-navy-900/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-navy-700/60 p-5 text-center"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto h-8 w-8 text-gold-400"
              >
                {f.icon}
              </svg>
              <p className="mt-3 font-display text-base text-ivory">{f.title}</p>
              <p className="mt-1 text-sm text-ivory/50">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-navy-700/60">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gold-500/80">
            Stay Updated
          </p>
          <h2 className="mt-2 font-display text-3xl text-ivory">
            Get the latest books and offers
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ivory/60">
            Subscribe to our newsletter and be the first to know about new
            releases, exclusive deals, and special offers from Adyoolau.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-full border border-navy-700 bg-navy-900 px-5 py-3 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
            >
              {subscribing ? "Subscribing…" : "Subscribe"}
            </button>
          </form>

          {subStatus && <p className="mt-3 text-sm text-gold-400">{subStatus}</p>}
        </div>
      </section>
    </div>
  );
}