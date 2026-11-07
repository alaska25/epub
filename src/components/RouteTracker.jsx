import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { initAnalytics, setTrackingPaused, trackPageView, trackingAllowed } from "../utils/analytics.js";

// Only the first page of a visit has a real "came from" site. Later pages move
// around inside the app, where the browser keeps reporting the original one.
let firstView = true;

// Records the page view in our own database (for the admin Traffic tab). It is
// anonymous, works even if Google Analytics is blocked, and never affects the page.
function recordOwnPageView(path, search) {
  if (!trackingAllowed()) return;
  const utm = new URLSearchParams(search).get("utm_source") || undefined;
  const referrer = firstView ? document.referrer || undefined : undefined;
  firstView = false;
  api.post("/traffic/collect", { path, referrer, utm }, { silent: true }).catch(() => {});
}

// Put this once inside <BrowserRouter>. It starts analytics and reports a page
// view every time the route changes. Admin pages, and everything a signed-in
// admin does, are never reported.
export default function RouteTracker() {
  const { pathname, search } = useLocation();
  // Signed-in admins are never counted, on any page, so your own testing and
  // browsing do not inflate the numbers.
  const { isAdmin } = useAuth();

  useEffect(() => {
    initAnalytics();
  }, []);

  // While a signed-in admin is browsing, nothing is counted (page views or add-to-cart).
  useEffect(() => {
    setTrackingPaused(isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    if (pathname.startsWith("/admin") || isAdmin) return;
    // Wait a moment so the page title (set by react-helmet) is the new one.
    const id = setTimeout(() => {
      trackPageView(pathname + search, document.title);
      recordOwnPageView(pathname, search);
    }, 300);
    return () => clearTimeout(id);
  }, [pathname, search, isAdmin]);

  return null;
}