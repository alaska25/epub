import { useLayoutEffect, useRef, useState } from "react";

// Reusable scroll-reveal hook: returns a ref to attach, whether the element
// should be visible, and whether it should appear instantly (no animation).
// Fires once, then disconnects.
//
// - Already on screen when it mounts: shown immediately, no animation, so the
//   top of a page never waits on a fade-in.
// - Below the fold: fades in shortly before it scrolls into view.
// - Reduced motion, or no IntersectionObserver: shown immediately.
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [instant, setInstant] = useState(false);

  // useLayoutEffect runs before the first paint, so content that is already
  // on screen never flashes hidden first.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = (isInstant) => {
      setInstant(isInstant);
      setInView(true);
    };

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      show(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40 && rect.bottom > 0) {
      show(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show(false);
          observer.disconnect();
        }
      },
      // threshold 0 plus a small bottom margin: very tall elements can still
      // trigger (a 15% threshold can never be met by an element taller than
      // about six screens), and items start fading in just before they appear.
      { threshold: 0, rootMargin: "0px 0px -8% 0px", ...options }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView, instant];
}

// Wrapper that applies a short fade/slide-up based on inView state.
export default function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView, instant] = useInView();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView && !instant ? `${delay}ms` : "0ms" }}
      className={`${
        instant ? "transition-none" : "transition-[opacity,transform] duration-500 ease-out"
      } motion-reduce:transition-none ${
        inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}