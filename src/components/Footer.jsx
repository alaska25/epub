import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-navy-700/60 bg-navy-900">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ivory/50">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <p className="font-display text-lg text-ivory/80">Adyoolau</p>
            <p className="mt-2 max-w-md">
              A quiet shelf for serious readers — buy, download, or read your next book
              right in the browser.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            <Link to="/about" className="hover:text-gold-400">
              About
            </Link>
            <Link to="/contact" className="hover:text-gold-400">
              Contact
            </Link>
            <Link to="/refund-policy" className="hover:text-gold-400">
              Refund Policy
            </Link>
            <Link to="/terms" className="hover:text-gold-400">
              Terms of Service
            </Link>
          </nav>
        </div>

        <p className="mt-8">&copy; {new Date().getFullYear()} Adyoolau. All rights reserved.</p>
      </div>
    </footer>
  );
}