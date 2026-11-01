// Google Analytics 4, loaded only when it should be:
//  - in the production build (not on localhost),
//  - when VITE_GA_ID is set (your Measurement ID, like G-XXXXXXXXXX),
//  - and when the visitor has not asked not to be tracked (Do Not Track).
// To leave your own visits out, run this once in your browser console:
//   localStorage.setItem("adyoolau_no_track", "1")
const GA_ID = import.meta.env.VITE_GA_ID;
let ready = false;

const optedOut = () => {
  try {
    return localStorage.getItem("adyoolau_no_track") === "1" || navigator.doNotTrack === "1";
  } catch {
    return false;
  }
};

const enabled = () => Boolean(GA_ID) && import.meta.env.PROD && typeof window !== "undefined" && !optedOut();

export function initAnalytics() {
  if (ready || !enabled()) return;
  ready = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // Page views are sent by hand (see RouteTracker), because this is a
  // single-page app and the browser never reloads between pages.
  window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function trackPageView(path, title) {
  if (!ready) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title,
  });
}

// Safe to call anywhere: does nothing when analytics is off.
export function track(name, params = {}) {
  if (!ready) return;
  window.gtag("event", name, params);
}

// GA4's standard "add to cart" event, for a book or a template.
export function cartEvent(item, type) {
  const price = item?.isFree ? 0 : Number(item?.price) || 0;
  track("add_to_cart", {
    currency: "USD",
    value: price,
    items: [{ item_id: item?._id, item_name: item?.title, item_category: type, price, quantity: 1 }],
  });
}