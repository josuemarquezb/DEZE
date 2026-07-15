// components/NotificationDropdown.jsx — recent-5 notification list, opened from NotificationBell.

import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem.jsx';

/** @param {object[]} notifications @param {boolean} loading @param {(id: string) => void} onMarkRead @param {() => void} onClose */
function NotificationDropdown({ notifications, loading, onMarkRead, onClose }) {
  const recent = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Notifications</h3>
      </div>

      {loading ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">Loading...</p>
      ) : recent.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">No notifications</p>
      ) : (
        <div className="max-h-96 divide-y divide-zinc-800 overflow-y-auto">
          {recent.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} onAfterNavigate={onClose} />
          ))}
        </div>
      )}

      <Link
        to="/notifications"
        onClick={onClose}
        className="block border-t border-zinc-800 px-4 py-2.5 text-center text-sm text-accent hover:bg-zinc-800/60"
      >
        View all
      </Link>
    </div>
  );
}

export default NotificationDropdown;
