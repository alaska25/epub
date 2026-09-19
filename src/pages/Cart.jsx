import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useEffect, useRef, useState } from "react";

// PayPal's JS SDK is loaded once and reused; this guards against loading
// it twice if the Cart page mounts more than once in a session.
let paypalScriptPromise = null;
const loadPaypalScript = (clientId) => {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
};

export default function Cart() {
  const { items, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [paypalReady, setPaypalReady] = useState(false);
  const buttonsContainerRef = useRef(null);

  useEffect(() => {
    if (!user || items.length === 0) return;

    let cancelled = false;

    loadPaypalScript(import.meta.env.VITE_PAYPAL_CLIENT_ID)
      .then((paypal) => {
        if (cancelled || !buttonsContainerRef.current) return;

        buttonsContainerRef.current.innerHTML = "";

        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },

            createOrder: async () => {
              setError("");
              try {
                const { data } = await api.post("/orders/paypal/create-order", {
                  bookIds: items.map((b) => b._id),
                });
                return data.paypalOrderId;
              } catch (err) {
                setError(err.response?.data?.message || "Could not start checkout.");
                throw err;
              }
            },

            onApprove: async (data) => {
              try {
                const { data: result } = await api.post("/orders/paypal/capture-order", {
                  paypalOrderId: data.orderID,
                });
                clearCart();
                navigate(`/checkout/success?order=${result.orderId}`);
              } catch (err) {
                setError(err.response?.data?.message || "Payment could not be completed.");
              }
            },

            onError: () => {
              setError("Something went wrong with PayPal. Please try again.");
            },
          })
          .render(buttonsContainerRef.current);

        setPaypalReady(true);
      })
      .catch(() => setError("Could not load PayPal. Please refresh and try again."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, items.length]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ivory">Your cart</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-ivory/50">Your cart is empty.</p>
      ) : (
        <div className="mt-8 divide-y divide-navy-700/60">
          {items.map((book) => (
            <div key={book._id} className="flex items-center gap-4 py-4">
              <img src={book.coverUrl} alt="" className="h-20 w-14 rounded object-cover" />
              <div className="flex-1">
                <p className="font-display text-lg text-ivory">{book.title}</p>
                <p className="text-sm text-ivory/50">{book.author}</p>
              </div>
              <span className="text-gold-400">${book.price.toFixed(2)}</span>
              <button
                onClick={() => removeItem(book._id)}
                className="text-sm text-ivory/40 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 border-t border-navy-700/60 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-xl text-ivory">Total: ${total.toFixed(2)}</span>
          </div>

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
            >
              Sign in to check out
            </button>
          ) : (
            <div className="max-w-xs">
              <div ref={buttonsContainerRef} />
              {!paypalReady && <p className="text-sm text-ivory/40">Loading PayPal…</p>}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}