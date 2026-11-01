import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { track } from "../utils/analytics.js";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const { items } = useCart();

  // Cart.jsx already removes purchased items after payment, so anything still
  // here was saved for later. We must NOT call clearCart() or we'd delete it.
  const savedCount = items.length;

  // Report the sale to analytics, once per order. Reloading this page does not
  // count it again. The customer's orders are read so the total can be reported; if that
  // fails, the sale is still counted, just without its amount.
  useEffect(() => {
    if (!orderId) return;
    const key = `ga_purchase_${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* storage unavailable: carry on */
    }

    let ignore = false;
    const send = (order) => {
      if (ignore) return;
      // Only count orders that are actually paid. Orders still under review
      // (or failed) are not sales yet.
      if (order && order.status !== "paid") return;

      // The server fills in the book/template (or a title-only copy when it was
      // deleted), so the id is read from there, falling back to the title.
      const idOf = (ref, item) => String(ref?._id || item.title || "unknown");
      const gaItems = [
        ...(order?.books || []).map((i) => ({
          item_id: idOf(i.book, i),
          item_name: i.title,
          item_category: "book",
          price: Number(i.price) || 0,
          quantity: 1,
        })),
        ...(order?.templates || []).map((i) => ({
          item_id: idOf(i.template, i),
          item_name: i.title,
          item_category: "template",
          price: Number(i.price) || 0,
          quantity: 1,
        })),
      ];
      track("purchase", {
        transaction_id: orderId,
        currency: order?.currency || "USD",
        value: Number(order?.totalAmount) || 0,
        items: gaItems,
      });
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    };

    // There is no "get one order" endpoint, so read the customer's own orders
    // (GET /orders/my) and pick the one that was just paid.
    api
      .get("/orders/my", { silent: true })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.orders ?? [];
        send(list.find((o) => String(o._id) === String(orderId)) || null);
      })
      .catch(() => send(null));

    return () => {
      ignore = true;
    };
  }, [orderId]);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Thank you for your order</h1>
      <p className="mt-4 text-ivory/60">
        Your payment was successful. Your purchase is now in your library.
      </p>

      <Link
        to="/library"
        className="mt-8 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
      >
        Start reading
      </Link>

      {orderId && (
        <p className="mt-6 text-sm text-ivory/40">
          Order reference: {orderId}
          {" · "}
          <Link
            to={`/account/orders/${orderId}/receipt`}
            className="underline underline-offset-4 hover:text-ivory/70"
          >
            View receipt
          </Link>
        </p>
      )}

      <div className="mt-12 border-t border-navy-700/60 pt-8">
        {savedCount > 0 && (
          <p className="mb-4 text-sm text-ivory/60">
            You still have {savedCount} {savedCount === 1 ? "item" : "items"} saved in your cart.{" "}
            <Link to="/cart" className="text-gold-400 hover:text-gold-300">
              Review cart
            </Link>
          </p>
        )}
        <p className="text-ivory/70">Looking for something else?</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            to="/catalog"
            className="rounded-full border border-gold-500/60 px-5 py-2.5 text-sm font-medium text-gold-400 hover:bg-gold-500/10"
          >
            Browse more books
          </Link>
          <Link
            to="/templates"
            className="rounded-full border border-navy-700 px-5 py-2.5 text-sm font-medium text-ivory/70 hover:text-ivory"
          >
            See templates
          </Link>
        </div>
      </div>
    </div>
  );
}