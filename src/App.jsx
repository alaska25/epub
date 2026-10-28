import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ProtectedRoute, AdminRoute } from "./components/RouteGuards.jsx";
import { AuthModalProvider } from "./context/AuthModalContext.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ToastContainer from "./components/ToastContainer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

// Pages visitors land on first (including from shared social links) load
// eagerly, so there's no "Loading…" flash after the page opens. Heavy or
// rarely-visited pages stay lazy so they don't slow down the first load.
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import Templates from "./pages/Templates.jsx";
import TemplateDetail from "./pages/TemplateDetail.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess.jsx"));
const MyLibrary = lazy(() => import("./pages/MyLibrary.jsx"));
const Reader = lazy(() => import("./pages/Reader.jsx")); // pulls in epubjs / react-pdf
const SampleReader = lazy(() => import("./pages/SampleReader.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx")); // pulls in recharts
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const Account = lazy(() => import("./pages/Account.jsx"));
const Receipt = lazy(() => import("./pages/Receipt.jsx"));

// Shown only while a lazy chunk is fetching.
function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-ivory/40">Loading…</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthModalProvider>
      <div className="flex min-h-screen flex-col bg-ink">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/template/:id" element={<TemplateDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />

              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <MyLibrary />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/orders/:id/receipt"
                element={
                  <ProtectedRoute>
                    <Receipt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/read/:id"
                element={
                  <ProtectedRoute>
                    <Reader />
                  </ProtectedRoute>
                }
              />
              {/* Public: no login required, matching the KDP "read sample" pattern */}
              <Route path="/sample/:id" element={<SampleReader />} />
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <ChatWidget />
        <AuthModal />
        <ToastContainer />
      </div>
    </AuthModalProvider>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Page not found</h1>
      <p className="mt-4 text-ivory/60">The page you're looking for doesn't exist.</p>
    </div>
  );
}