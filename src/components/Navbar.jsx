import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/catalog?search=${encodeURIComponent(query.trim())}` : "/catalog");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700/60 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        {/* outline-none + focus-visible: keeps the gold ring for keyboard (Tab)
            navigation, but stops it lingering after a plain mouse click on an
            SPA route that doesn't trigger a full page reload. */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
        >
          <img src={logo} alt="Adyoolau" className="h-10 w-10 rounded-full" />
          <span className="font-display text-xl tracking-wide text-ivory">Adyoolau</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden flex-1 md:block">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, subjects..."
            className="w-full max-w-md rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
          />
        </form>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full border border-navy-700 p-2 text-ivory/70 hover:border-gold-500 hover:text-gold-400"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
              </svg>
            )}
          </button>
          <Link to="/catalog" className="text-ivory/80 hover:text-gold-400">
            Catalog
          </Link>
          {user && (
            <Link to="/library" className="text-ivory/80 hover:text-gold-400">
              My Library
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-ivory/80 hover:text-gold-400">
              Admin
            </Link>
          )}
          <Link to="/cart" className="relative text-ivory/80 hover:text-gold-400">
            Cart
            {items.length > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-gold-500 px-1.5 text-[11px] font-semibold text-ink">
                {items.length}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={logout} className="text-ivory/80 hover:text-gold-400">
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-gold-500 px-4 py-1.5 text-gold-400 hover:bg-gold-500 hover:text-ink"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}