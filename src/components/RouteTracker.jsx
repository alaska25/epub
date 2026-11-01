import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, trackPageView } from "../utils/analytics.js";

// Put this once inside <BrowserRouter>. It starts analytics and reports a page
// view every time the route changes. Admin pages are never reported.
export default function RouteTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    // Wait a moment so the page title (set by react-helmet) is the new one.
    const id = setTimeout(() => trackPageView(pathname + search, document.title), 300);
    return () => clearTimeout(id);
  }, [pathname, search]);

  return null;
}