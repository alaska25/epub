import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Modal from "./Modal.jsx";

// Adjust these import paths and filenames to match your project. Each page
// must be the default export of its file. They load only when first opened.
const About = lazy(() => import("../pages/About.jsx"));
const Contact = lazy(() => import("../pages/Contact.jsx"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy.jsx"));
const Terms = lazy(() => import("../pages/Terms.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy.jsx"));

const LINK_GROUPS = [
  {
    heading: "Company",
    links: [
      { label: "About", to: "/about", component: About },
      { label: "Contact", to: "/contact", component: Contact },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Refund Policy", to: "/refund-policy", component: RefundPolicy },
      { label: "Terms of Service", to: "/terms", component: Terms },
      { label: "Privacy Policy", to: "/privacy-policy", component: PrivacyPolicy },
    ],
  },
];

export default function Footer() {
  // `active` keeps the last opened item so its title and content stay
  // visible while the modal animates out; `open` controls visibility.
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // If something inside the modal navigates elsewhere, close it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = () => setOpen(false);

  const handleClick = (e, link) => {
    // Let ctrl/cmd/shift/middle-click open the real page in a new tab.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setActive(link);
    setOpen(true);
  };

  const ActiveContent = active?.component;

  return (
    <footer
      className="relative mt-24 overflow-hidden border-t border-navy-700/60 bg-navy-900 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/29004.jpg')" }}
    >
      {/* Flat, even scrim — dark enough for text contrast everywhere,
          but consistent so the image doesn't wash out near the top */}
      <div className="absolute inset-0 bg-navy-900/80" />

      {/* Thin gold accent line at the very top of the footer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 text-sm text-ivory/70">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <p className="font-display text-2xl text-ivory">Adyoolau</p>
            <p className="mt-3 max-w-sm leading-relaxed text-ivory/60">
              A quiet shelf for serious readers — buy, download, or read your
              next book right in the browser.
            </p>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="font-display text-xs uppercase tracking-widest text-gold-400">
                {group.heading}
              </p>
              <nav className="mt-4 flex flex-col gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={(e) => handleClick(e, link)}
                    className="text-ivory/70 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start gap-4 border-t border-navy-700/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ivory/50">
            &copy; {new Date().getFullYear()} Adyoolau. All rights reserved.
          </p>
        </div>
      </div>

      <Modal open={open} onClose={close} title={active?.label}>
        <Suspense fallback={<p className="text-ivory/60">Loading…</p>}>
          {ActiveContent && <ActiveContent />}
        </Suspense>
      </Modal>
    </footer>
  );
}