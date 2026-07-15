// components/UnreadBadge.jsx — small pill showing an unread message count.
// Renders nothing at 0 so it never shows up empty next to a nav link.

function UnreadBadge({ count }) {
  if (!count) return null;

  return (
    <span className="ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-zinc-950">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default UnreadBadge;
