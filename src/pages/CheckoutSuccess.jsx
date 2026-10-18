import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const { items } = useCart();

  // Cart.jsx already removes purchased items after payment, so anything still
  // here was saved for later. We must NOT call clearCart() or we'd delete it.
  const savedCount = items.length;

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