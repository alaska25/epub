// Fly-to-cart animation. No dependencies: uses the Web Animations API.
//
// Usage:
//   flyToCart(imgElement)            // imgElement = the book cover <img>
//
// The target is any element with a `data-cart-target` attribute (put it on
// your Cart link/icon in the navbar). If several exist (desktop + mobile
// nav), the first visible one is used.

const THUMB_SIZE = 72; // size of the flying thumbnail in px

function findCartTarget() {
  const candidates = document.querySelectorAll("[data-cart-target]");
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

function bump(target) {
  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.3)" },
      { transform: "scale(0.95)" },
      { transform: "scale(1)" },
    ],
    { duration: 350, easing: "ease-out" }
  );
}

export function flyToCart(sourceImg, { duration = 750 } = {}) {
  const target = findCartTarget();
  if (!sourceImg || !target) return;

  // Respect reduced-motion: skip the flight, keep the small bump.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    bump(target);
    return;
  }

  const from = sourceImg.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const startX = from.left + from.width / 2 - THUMB_SIZE / 2;
  const startY = from.top + from.height / 2 - THUMB_SIZE / 2;
  const endX = to.left + to.width / 2 - THUMB_SIZE / 2;
  const endY = to.top + to.height / 2 - THUMB_SIZE / 2;

  // Control point for a curved (quadratic Bezier) path: an arc above both points.
  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - 140;

  const ghost = sourceImg.cloneNode(false);
  ghost.removeAttribute("class");
  ghost.removeAttribute("id");
  ghost.removeAttribute("srcset");
  ghost.removeAttribute("loading");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${THUMB_SIZE}px`,
    height: `${THUMB_SIZE}px`,
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    pointerEvents: "none",
    zIndex: "9999",
    willChange: "transform, opacity",
  });
  document.body.appendChild(ghost);

  // Build keyframes along the curve.
  const steps = 18;
  const frames = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const x = inv * inv * startX + 2 * inv * t * ctrlX + t * t * endX;
    const y = inv * inv * startY + 2 * inv * t * ctrlY + t * t * endY;
    const scale = 1 - 0.65 * t;
    const rotate = 20 * t;
    frames.push({
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: t > 0.85 ? 1 - (t - 0.85) / 0.15 * 0.6 : 1,
    });
  }

  const anim = ghost.animate(frames, {
    duration,
    easing: "cubic-bezier(0.45, 0, 0.55, 1)",
    fill: "forwards",
  });

  const done = () => {
    ghost.remove();
    bump(target);
  };
  anim.onfinish = done;
  anim.oncancel = () => ghost.remove();
}