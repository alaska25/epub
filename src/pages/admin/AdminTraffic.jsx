import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../api/axios.js";

const GOLD = "#c9a24a";
const BLUE = "#6ea8fe";
const fmt = (n) => Number(n || 0).toLocaleString();

function Kpi({ label, visitors, views }) {
  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-900/40 p-5">
      <p className="text-sm text-ivory/60">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-ivory">{fmt(visitors)}</p>
      <p className="mt-1 text-sm text-ivory/60">
        visitors · {fmt(views)} page {views === 1 ? "view" : "views"}
      </p>
    </div>
  );
}

function BarList({ title, rows, format = (x) => x }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  return (
    <div className="rounded-2xl border border-navy-700/60 bg-navy-900/40 p-5">
      <h3 className="font-display text-lg font-semibold text-ivory">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ivory/60">Nothing yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ivory/85" title={r.label}>
                  {format(r.label)}
                </span>
                <span className="shrink-0 tabular-nums text-ivory/60">{fmt(r.views)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ivory/10">
                <div className="h-full rounded-full bg-gold-500" style={{ width: `${(r.views / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminTraffic() {
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    api
      .get("/stats/dashboard", { silent: true })
      .then(({ data }) => {
        if (!ignore) setTraffic(data?.traffic ?? null);
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
  }, []);

  if (loading) return <p role="status" className="text-ivory/60">Loading traffic…</p>;
  if (error) return <p role="alert" className="text-ivory/70">Couldn't load traffic. Please try again.</p>;
  if (!traffic) {
    return (
      <p className="max-w-xl text-ivory/70">
        The server isn't sending traffic numbers yet. Deploy the updated backend (statsController and the
        page-view tracking), then reload.
      </p>
    );
  }

  const { totals, byDay, topPages, topSources, devices } = traffic;
  const empty = totals.views30 === 0;
  const deviceTotal = devices.reduce((s, d) => s + d.views, 0) || 1;
  const deviceRows = devices.map((d) => ({
    label: `${d.label === "mobile" ? "Phones & tablets" : "Computers"} (${Math.round((d.views / deviceTotal) * 100)}%)`,
    views: d.views,
  }));

  return (
    <div className="space-y-6">
      {empty && (
        <p className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-5 py-4 text-sm text-ivory/80">
          No visits recorded yet. Counting starts once the updated site is live, and your own admin pages are
          never counted.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Today" visitors={totals.visitorsToday} views={totals.viewsToday} />
        <Kpi label="Last 7 days" visitors={totals.visitors7} views={totals.views7} />
        <Kpi label="Last 30 days" visitors={totals.visitors30} views={totals.views30} />
      </div>

      <div className="rounded-2xl border border-navy-700/60 bg-navy-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-ivory">Visits per day</h3>
          <p className="flex items-center gap-4 text-xs text-ivory/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: GOLD }} /> Visitors
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: BLUE }} /> Page views
            </span>
          </p>
        </div>
        <div className="mt-4 h-64 text-ivory/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.12} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => d.slice(5).replace("-", "/")}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid rgba(128,128,128,.3)", background: "#111827", color: "#fff" }}
                labelFormatter={(d) => d}
              />
              <Line type="monotone" dataKey="visitors" name="Visitors" stroke={GOLD} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="views" name="Page views" stroke={BLUE} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BarList title="Top pages" rows={topPages} />
        <BarList title="Where visitors come from" rows={topSources} />
        <BarList title="Devices" rows={deviceRows} />
      </div>

      <p className="text-xs text-ivory/50">
        Visitors are counted per day without cookies or stored IP addresses, so someone who returns on another day
        is counted again. Crawlers and people with Do Not Track on are left out. For detailed reports, use the
        Analytics tab.
      </p>
    </div>
  );
}