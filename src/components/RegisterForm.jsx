import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useBotGuard } from "../hooks/useBotGuard.js";
import HoneypotField from "./HoneypotField.jsx";
import PasswordInput from "./PasswordInput.jsx";

/**
 * The registration form itself, with no page chrome around it, so it can be
 * dropped into a full page (Register.jsx) or into AuthModal.jsx.
 *
 * onSuccess: called right after a successful registration (e.g. to close
 *   the modal)
 * onSwitchToLogin: if provided, "Sign in" opens the login modal instead of
 *   navigating to /login.
 */
export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { honeypot, setHoneypot, isBot } = useBotGuard();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isBot()) {
      setError("Could not create account. Please try again.");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      onSuccess?.();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <HoneypotField value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ivory/60">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-ivory focus:border-gold-500"
        />
      </div>

      <PasswordInput
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-ivory/50">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-gold-400 hover:text-gold-300"
          >
            Sign in
          </button>
        ) : (
          <Link to="/login" className="text-gold-400 hover:text-gold-300">
            Sign in
          </Link>
        )}
      </p>
    </form>
  );
}