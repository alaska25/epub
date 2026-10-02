import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import BackButton from "../components/BackButton.jsx";

const TABS = [
  ["profile", "Profile"],
  ["orders", "Orders"],
  ["security", "Security"],
];

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const inputCls =
  "h-12 w-full rounded-xl border border-navy-700 bg-navy-900 px-4 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500 focus:outline-none focus:ring-4 focus:ring-gold-500/15";
const btnPrimary =
  "rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "rounded-full border border-navy-700 px-5 py-2.5 text-sm font-medium text-ivory/80 hover:border-gold-500/60 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50";

function Message({ msg }) {
  if (!msg.text) return null;
  return (
    <p role="status" className={`mt-4 text-sm ${msg.type === "ok" ? "text-gold-400" : "text-red-400"}`}>
      {msg.text}
    </p>
  );
}

/* ------------------------------ Profile ------------------------------ */

function ProfileTab({ me, onChange }) {
  const [name, setName] = useState(me.name || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const fileRef = useRef(null);
  const flash = (type, text) => setMsg({ type, text });

  const saveName = async (e) => {
    e.preventDefault();
    setBusy(true);
    flash("", "");
    try {
      const { data } = await api.patch("/account/profile", { name });
      onChange(data);
      flash("ok", "Profile saved.");
    } catch (err) {
      flash("err", err.response?.data?.message || "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  };

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return flash("err", "Use a JPG, PNG or WebP image.");
    if (file.size > 2 * 1024 * 1024) return flash("err", "Image must be 2 MB or smaller.");

    const form = new FormData();
    form.append("avatar", file);
    setBusy(true);
    flash("", "");
    try {
      const { data } = await api.post("/account/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data);
      flash("ok", "Photo updated.");
    } catch (err) {
      flash("err", err.response?.data?.message || "Could not upload the photo.");
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    setBusy(true);
    flash("", "");
    try {
      const { data } = await api.delete("/account/avatar");
      onChange(data);
      flash("ok", "Photo removed.");
    } catch (err) {
      flash("err", err.response?.data?.message || "Could not remove the photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-5">
        <Avatar user={me} size={88} />
        <div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnGhost} disabled={busy} onClick={() => fileRef.current?.click()}>
              {me.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {me.avatarUrl && (
              <button type="button" className={btnGhost} disabled={busy} onClick={removePhoto}>
                Remove
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-ivory/50">JPG, PNG or WebP, up to 2 MB.</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />
        </div>
      </div>

      <form onSubmit={saveName} className="max-w-md space-y-4">
        <div>
          <label htmlFor="acc-name" className="mb-1.5 block text-sm text-ivory/70">Name</label>
          <input id="acc-name" className={inputCls} value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="acc-email" className="mb-1.5 block text-sm text-ivory/70">Email</label>
          <input id="acc-email" className={`${inputCls} opacity-60`} value={me.email} disabled readOnly />
        </div>
        <button type="submit" className={btnPrimary} disabled={busy || !name.trim()}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
      <Message msg={msg} />
    </div>
  );
}

/* ------------------------------ Orders ------------------------------- */

function OrdersTab() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/account/orders")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Could not load your orders."));
  }, []);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!orders) return <p className="text-sm text-ivory/50">Loading…</p>;
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-navy-700 px-6 py-12 text-center">
        <p className="font-display text-lg text-ivory">No orders yet</p>
        <p className="mt-1 text-sm text-ivory/60">Your purchases will show up here.</p>
        <Link to="/catalog" className={`${btnPrimary} mt-5 inline-block`}>Browse the catalog</Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o._id} className="rounded-2xl border border-navy-700/60 bg-navy-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-ivory/60">
              {fmtDate(o.createdAt)} · Order #{o.receiptNo}
            </span>
            <span className="font-display text-lg text-ivory">{money(o.totalAmount)}</span>
          </div>
          {o.status === "pending_review" && (
            <p className="mt-2 text-xs text-gold-400">Payment is being reviewed by PayPal.</p>
          )}
          <ul className="mt-3 divide-y divide-navy-700/60">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                {it.coverUrl ? (
                  <img src={it.coverUrl} alt="" className="h-12 w-9 shrink-0 rounded object-cover" />
                ) : (
                  <div className="h-12 w-9 shrink-0 rounded bg-navy-800" />
                )}
                <span className="min-w-0 flex-1 truncate text-ivory">{it.title}</span>
                {it.kind === "template" && (
                  <span className="shrink-0 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-400">
                    Template
                  </span>
                )}
                <span className="shrink-0 text-sm text-ivory/60">{money(it.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-4 text-sm">
            <Link to={`/account/orders/${o._id}/receipt`} className="text-gold-400 hover:text-gold-300">
              View receipt
            </Link>
            <Link to="/library" className="text-ivory/60 hover:text-ivory">Go to My Library</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ----------------------------- Security ------------------------------ */

function SecurityTab({ me }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!me.hasPassword) {
    return (
      <p className="max-w-md text-sm text-ivory/70">
        This account signs in with Google, so there is no password to manage here.
      </p>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setMsg({ type: "err", text: "The new passwords do not match." });
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      await api.post("/account/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setMsg({ type: "ok", text: "Password updated." });
    } catch (err) {
      setMsg({ type: "err", text: err.response?.data?.message || "Could not update your password." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="pw-cur" className="mb-1.5 block text-sm text-ivory/70">Current password</label>
        <input id="pw-cur" type="password" autoComplete="current-password" className={inputCls} value={form.currentPassword} onChange={set("currentPassword")} required />
      </div>
      <div>
        <label htmlFor="pw-new" className="mb-1.5 block text-sm text-ivory/70">New password</label>
        <input id="pw-new" type="password" autoComplete="new-password" minLength={8} className={inputCls} value={form.newPassword} onChange={set("newPassword")} required />
        <p className="mt-1 text-xs text-ivory/50">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="pw-conf" className="mb-1.5 block text-sm text-ivory/70">Confirm new password</label>
        <input id="pw-conf" type="password" autoComplete="new-password" className={inputCls} value={form.confirm} onChange={set("confirm")} required />
      </div>
      <button type="submit" className={btnPrimary} disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </button>
      <Message msg={msg} />
    </form>
  );
}

/* ------------------------------- Page -------------------------------- */

export default function Account() {
  const auth = useAuth();
  const { user } = auth;
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([id]) => id === params.get("tab")) ? params.get("tab") : "profile";
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api
      .get("/account/me")
      .then(({ data }) => setMe(data))
      .catch(() => setError("Could not load your account."));
  }, [user]);

  // Update this page and the navbar/AuthContext after a change.
  // ASSUMPTION: useAuth() exposes setUser. If it does not, the navbar updates on next refresh.
  const applyChange = (patch) => {
    setMe((m) => ({ ...m, ...patch }));
    if (typeof auth.setUser === "function") auth.setUser({ ...auth.user, ...patch });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-ivory">Your account</h1>
        <p className="mt-3 text-ivory/60">Please sign in to see your account.</p>
        <Link to="/login" className={`${btnPrimary} mt-6 inline-block`}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <BackButton fallback="/" className="mb-6" />
      <h1 className="font-display text-3xl text-ivory">Your account</h1>

      <div role="tablist" className="mt-6 flex gap-2 border-b border-navy-700/60">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setParams({ tab: id })}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === id ? "border-gold-500 text-gold-400" : "border-transparent text-ivory/60 hover:text-ivory"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8" role="tabpanel">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : !me ? (
          <p className="text-sm text-ivory/50">Loading…</p>
        ) : tab === "profile" ? (
          <ProfileTab me={me} onChange={applyChange} />
        ) : tab === "orders" ? (
          <OrdersTab />
        ) : (
          <SecurityTab me={me} />
        )}
      </div>
    </div>
  );
}
