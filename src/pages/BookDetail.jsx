import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import StarRating from "../components/StarRating.jsx";
import BackButton from "../components/BackButton.jsx";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400";
const BTN_PRIMARY = `inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-400 to-gold-500 px-7 py-4 text-base font-bold text-ink shadow-[0_12px_40px_-8px] shadow-gold-500/50 ring-1 ring-gold-500/40 transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 ${FOCUS_RING}`;
const BTN_BAR = BTN_PRIMARY.replace("w-full", "w-auto shrink-0").replace("px-7 py-4 text-base", "px-6 py-3 text-sm");
const BTN_SAMPLE = `inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold-500/60 px-7 py-3.5 text-sm font-semibold text-gold-400 transition-colors hover:bg-gold-500/10 ${FOCUS_RING}`;
const BTN_SMALL = `rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50 ${FOCUS_RING}`;

export default function BookDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [claimingFree, setClaimingFree] = useState(false);
  const [claimError, setClaimError] = useState("");
  const { user } = useAuth();
  const { items, addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Without this, navigating here from a scrolled-down position on the
    // catalog or a home carousel (common on mobile) leaves this page
    // rendered at that same scroll offset.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    api
      .get(`/books/${id}`)
      .then(({ data }) => setBook(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    api
      .get("/auth/library")
      .then(({ data }) => setOwned(data.some((b) => b._id === id)))
      .catch(() => {});
  }, [user, id]);

  const loadReviews = () => {
    api
      .get(`/books/${id}/reviews`)
      .then(({ data }) => setReviews(data))
      .catch(() => {});
  };

  useEffect(loadReviews, [id]);

  const myReview = reviews.find((r) => user && r.user === user._id);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (myRating < 1) {
      setReviewError(t("bookDetail.errors.chooseRating"));
      return;
    }
    if (!myComment.trim()) {
      setReviewError(t("bookDetail.errors.writeReviewSubmit"));
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/books/${id}/reviews`, { rating: myRating, comment: myComment.trim() });
      setMyRating(0);
      setMyComment("");
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || t("bookDetail.errors.submitFailed"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setReviewError("");
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleUpdateReview = async (reviewId) => {
    setReviewError("");
    if (editRating < 1) {
      setReviewError(t("bookDetail.errors.chooseRating"));
      return;
    }
    if (!editComment.trim()) {
      setReviewError(t("bookDetail.errors.writeReviewSave"));
      return;
    }
    setSubmittingReview(true);
    try {
      await api.put(`/books/${id}/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment.trim(),
      });
      cancelEditing();
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || t("bookDetail.errors.saveFailed"));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm(t("bookDetail.confirmDeleteReview"))) return;
    try {
      await api.delete(`/books/${id}/reviews/${reviewId}`);
      loadReviews();
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      setReviewError(err.response?.data?.message || t("bookDetail.errors.deleteFailed"));
    }
  };

  if (loading) return <p role="status" className="mx-auto max-w-6xl px-6 py-16 text-ivory/60">{t("bookDetail.loading")}</p>;
  if (!book) return <p className="mx-auto max-w-6xl px-6 py-16 text-ivory/60">{t("bookDetail.notFound")}</p>;

  // A book with no reviews may come back without avgRating; treat that as 0
  // so toFixed() and the star display can't crash the page.
  const avgRating = book.avgRating ?? 0;

  const inCart = items.some((b) => b._id === book._id);
  const handleRead = () => navigate(`/read/${book._id}`);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      // Tag the item as a book so the cart never has to guess its type.
      await addItem({ ...book, itemType: "book" });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleGetFree = async () => {
    if (!user) return navigate("/login");
    setClaimError("");
    setClaimingFree(true);
    try {
      await api.post(`/books/${book._id}/claim`);
      setOwned(true);
    } catch (err) {
      setClaimError(
        err.response?.data?.message || t("bookDetail.errors.claimFailed", "Could not claim this book.")
      );
    } finally {
      setClaimingFree(false);
    }
  };

  // One buy action, used by the card and the phone bar so they always agree.
  const renderCta = (cls) =>
    owned ? (
      <button onClick={handleRead} className={cls}>
        {t("bookDetail.readNow")}
      </button>
    ) : book.isFree ? (
      <button onClick={handleGetFree} disabled={claimingFree} className={cls}>
        {claimingFree ? t("bookDetail.gettingFree") : t("bookDetail.getForFree")}
      </button>
    ) : inCart ? (
      <Link to="/cart" className={cls}>
        {t("bookDetail.viewCart", "View cart & checkout")}
      </Link>
    ) : (
      <button onClick={handleAddToCart} disabled={addingToCart} className={cls}>
        {addingToCart ? t("bookDetail.addingToCart") : t("bookDetail.addToCart")}
      </button>
    );

  const hasSample = !owned && book.sampleFileType;
  const priceText = book.isFree ? t("bookDetail.free") : `$${(book.price ?? 0).toFixed(2)}`;

  const facts = [
    book.fileType && { label: t("bookDetail.format"), value: book.fileType.toUpperCase() },
    book.pageCount && { label: t("bookDetail.length"), value: t("bookDetail.pages", { count: book.pageCount }) },
    book.category && { label: t("bookDetail.category"), value: book.category },
    book.publishedAt && { label: t("bookDetail.published"), value: new Date(book.publishedAt).getFullYear() },
  ].filter(Boolean);

  return (
    <div className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-gold-500/10 blur-3xl" />

      <div className="mx-auto max-w-5xl px-6 pb-28 pt-8 lg:pb-16">
        {/* Back goes to wherever the visitor came from, falling back to the
            catalog if the page was opened directly. Home is a second, explicit
            way out that's always the same destination. */}
        <div className="mb-8 flex items-center justify-between">
          <BackButton fallback="/catalog" />
          <Link
            to="/"
            aria-label={t("bookDetail.home", "Home")}
            title={t("bookDetail.home", "Home")}
            className={`-mr-2 inline-flex h-10 items-center gap-2 rounded-full px-2 text-ivory/70 transition-colors hover:bg-ivory/5 hover:text-gold-500 sm:px-3 ${FOCUS_RING}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-[18px] w-[18px]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10v9a1 1 0 0 0 1 1h3.5v-5.5h4V20H17.5a1 1 0 0 0 1-1v-9" />
            </svg>
            <span className="hidden text-sm sm:inline">{t("bookDetail.home", "Home")}</span>
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-[280px,1fr] md:gap-14">
          {/* Cover with a soft gold glow */}
          <div className="relative mx-auto w-full max-w-[280px] md:mx-0">
            <div aria-hidden="true" className="absolute inset-4 rounded-full bg-gold-500/25 blur-3xl" />
            <img
              src={book.coverUrl}
              alt={t("bookDetail.coverAlt", { title: book.title, defaultValue: `Cover of ${book.title}` })}
              className="relative aspect-[2/3] w-full rounded-xl object-cover shadow-2xl shadow-black/60 ring-1 ring-gold-300/30"
            />
          </div>

          <div>
            {book.category && (
              <span className="inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-300">
                {book.category}
              </span>
            )}
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ivory [text-wrap:balance] sm:text-5xl">
              {book.title}
            </h1>
            {book.subtitle && <p className="mt-3 text-xl leading-snug text-ivory/70">{book.subtitle}</p>}
            <p className="mt-3 text-lg text-ivory/65">{t("bookDetail.byAuthor", { author: book.author })}</p>

            <div className="mt-3 flex items-center gap-2">
              <StarRating value={avgRating} />
              <span className="text-sm text-ivory/60">
                {book.reviewCount > 0
                  ? t("bookDetail.ratingSummary", { rating: avgRating.toFixed(1), count: book.reviewCount })
                  : t("bookDetail.noReviewsYet")}
              </span>
            </div>

            {/* Buy card: price, one clear action, and the free sample */}
            <div className="mt-8 max-w-md rounded-3xl bg-gradient-to-br from-gold-300/60 via-gold-500/15 to-ivory/10 p-px shadow-[0_30px_70px_-25px] shadow-black/60">
              <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-navy-900 to-ink p-6">
                <p className="font-serif text-5xl font-semibold tracking-tight text-gold-400">{priceText}</p>

                <div className="mt-5 space-y-3">
                  {renderCta(BTN_PRIMARY)}
                  {hasSample && (
                    <button onClick={() => navigate(`/sample/${book._id}`)} className={BTN_SAMPLE}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-[18px] w-[18px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                      {t("bookDetail.readSample")}
                    </button>
                  )}
                </div>

                {hasSample && (
                  <p className="mt-3 text-center text-xs text-ivory/60">
                    {t("bookDetail.sampleHint", "Read a free sample before you decide.")}
                  </p>
                )}
                {claimError && (
                  <p role="alert" className="mt-3 text-sm text-red-400">
                    {claimError}
                  </p>
                )}
                {!owned && !book.isFree && (
                  <p className="mt-4 border-t border-navy-700/60 pt-4 text-sm text-ivory/60">
                    {t("bookDetail.trustLine", "Instant access after payment. Secure checkout.")}{" "}
                    <Link to="/refund-policy" className="underline underline-offset-4 hover:text-ivory/90">
                      {t("bookDetail.refundPolicy", "Refund policy")}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            {/* Quick facts */}
            {facts.length > 0 && (
              <dl className="mt-8 grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-navy-700/60 ring-1 ring-navy-700/60 sm:grid-cols-4">
                {facts.map((f) => (
                  <div key={f.label} className="bg-ink px-4 py-3.5">
                    <dt className="text-xs text-ivory/50">{f.label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-semibold text-ivory/90">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <p className="mt-8 max-w-[65ch] whitespace-pre-line text-base leading-relaxed text-ivory/80">
              {book.description}
            </p>

            {!user && (
              <p className="mt-6 text-sm text-ivory/60">
                <Link to="/login" className="text-gold-400 hover:text-gold-300">
                  {t("bookDetail.signInPrompt")}
                </Link>{" "}
                {t("bookDetail.orCreateAccount")}{" "}
                <Link to="/register" className="text-gold-400 hover:text-gold-300">
                  {t("bookDetail.createAccount")}
                </Link>{" "}
                {t("bookDetail.toAddToLibrary")}
              </p>
            )}
          </div>
        </div>

        {/* Customer reviews */}
        <div className="mt-16 border-t border-navy-700/60 pt-10">
          <h2 className="font-serif text-3xl font-semibold text-ivory">{t("bookDetail.reviewsHeading")}</h2>

          {owned && !myReview && (
            <form onSubmit={handleSubmitReview} className="mt-6 max-w-xl space-y-3">
              <StarRating value={myRating} onChange={setMyRating} size={22} />
              <textarea
                rows={3}
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                placeholder={t("bookDetail.reviewPlaceholder")}
                className={`w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-ivory placeholder:text-ivory/40 focus:border-gold-500 ${FOCUS_RING}`}
              />
              {reviewError && <p role="alert" className="text-sm text-red-400">{reviewError}</p>}
              <button type="submit" disabled={submittingReview} className={BTN_SMALL}>
                {submittingReview ? t("bookDetail.postingReview") : t("bookDetail.postReview")}
              </button>
            </form>
          )}

          {user && !owned && <p className="mt-6 text-sm text-ivory/50">{t("bookDetail.onlyOwnersCanReview")}</p>}

          <div className="mt-8 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-ivory/60">{t("bookDetail.noReviewsMessage")}</p>
            ) : (
              reviews.map((r) => {
                const isMine = user && r.user === user._id;
                const isEditing = editingReviewId === r._id;

                return (
                  <div key={r._id} className="border-b border-navy-700/40 pb-6">
                    {isEditing ? (
                      <div className="max-w-xl space-y-3">
                        <StarRating value={editRating} onChange={setEditRating} size={22} />
                        <textarea
                          rows={3}
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className={`w-full rounded-xl border border-navy-700 bg-navy-900 px-4 py-3 text-ivory focus:border-gold-500 ${FOCUS_RING}`}
                        />
                        {reviewError && <p role="alert" className="text-sm text-red-400">{reviewError}</p>}
                        <div className="flex gap-3">
                          <button onClick={() => handleUpdateReview(r._id)} disabled={submittingReview} className={BTN_SMALL}>
                            {submittingReview ? t("bookDetail.saving") : t("bookDetail.save")}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className={`rounded-full border border-navy-700 px-5 py-2 text-sm font-medium text-ivory/70 hover:text-ivory ${FOCUS_RING}`}
                          >
                            {t("bookDetail.cancel")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-ivory">{r.userName}</p>
                            <StarRating value={r.rating} size={16} />
                          </div>
                          <span className="text-xs text-ivory/50">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-ivory/75">{r.comment}</p>
                        {isMine && (
                          <div className="mt-2 flex gap-4">
                            <button onClick={() => startEditing(r)} className="text-xs text-gold-400 hover:text-gold-300">
                              {t("bookDetail.edit")}
                            </button>
                            <button onClick={() => handleDeleteReview(r._id)} className="text-xs text-ivory/50 hover:text-red-400">
                              {t("bookDetail.delete")}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Phones: price and main action stay in reach while reading */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-700/70 bg-ink/95 px-4 pt-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-serif text-2xl font-semibold leading-none text-gold-400">{owned ? "" : priceText}</p>
            <p className="mt-1 truncate text-xs text-ivory/60">{book.title}</p>
          </div>
          {renderCta(BTN_BAR)}
        </div>
      </div>
    </div>
  );
}