import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Loads the Google Identity Services script once (safe to call from
// multiple mounted instances — it no-ops if the script is already present
// or already loading) and resolves once `window.google` is ready.
let scriptPromise = null;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Renders the official "Sign in with Google" button and completes login
 * through the same AuthContext flow as the email/password form — on
 * success it calls onSuccess() just like LoginForm does.
 *
 * Requires VITE_GOOGLE_CLIENT_ID to be set in the frontend's .env file,
 * matching the OAuth Client ID configured in Google Cloud Console.
 */
export default function GoogleLoginButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const { googleLogin } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is not set — Google sign-in button will not render."
      );
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              await googleLogin(response.credential);
              onSuccess?.();
            } catch (err) {
              onError?.(err.response?.data?.message || "Could not sign in with Google.");
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
        });
      })
      .catch(() => {
        if (!cancelled) onError?.("Could not load Google sign-in. Please try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, googleLogin, onSuccess, onError]);

  if (!clientId) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}