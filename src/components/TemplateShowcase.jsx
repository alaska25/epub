import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Reveal from "./Reveal.jsx";

export default function TemplateShowcase() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/templates", { params: { limit: 3 } })
      .then(({ data }) => setTemplates(data.templates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || templates.length === 0) return null;

  return (
    <section className="border-t border-navy-700/60 bg-navy-900/40">
      <Reveal className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-ivory/80">
            For developers
          </p>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-ivory sm:text-4xl">
            Ship your next project faster
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ivory/70">
            Production-ready starter templates with auth, billing, and admin panels already wired up.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {templates.map((t) => (
            <Link
              key={t._id}
              to={`/template/${t._id}`}
              className="group overflow-hidden rounded-xl border border-navy-700/60 bg-navy-900/60 transition hover:border-gold-500/50"
            >
              <img src={t.coverUrl} alt={t.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-lg text-ivory">{t.title}</p>
                {t.tagline && <p className="mt-1 text-sm text-ivory/60">{t.tagline}</p>}
                <p className="mt-3 text-sm font-semibold text-gold-400">
                  {t.isFree ? "Free" : `$${t.price.toFixed(2)}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}