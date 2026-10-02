// Shows the user's photo, or their initials when they have none.
export default function Avatar({ user, size = 64, className = "" }) {
  const label = (user?.name || user?.email || "?").trim();
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        style={style}
        className={`shrink-0 rounded-full border border-navy-700 object-cover ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gold-500/15 font-display font-semibold text-gold-400 ${className}`}
    >
      {initials}
    </div>
  );
}
