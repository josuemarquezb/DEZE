// pages/NotificationCenter.jsx — full notification history: filter, bulk actions, grouped by date.

import { useEffect, useMemo, useState } from 'react';
import NotificationItem from '../components/NotificationItem.jsx';
import * as notificationService from '../services/notificationService.js';
import { NOTIFICATION_TYPES } from '../constants/notificationTypes.js';

const READ_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'READ', label: 'Read' },
];

const dateGroupLabel = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) => a.toDateString() === b.toDateString();

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
};

function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');

  const load = () => {
    setLoading(true);
    setError(null);
    notificationService
      .getUserNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    notificationService.markAsRead(id).catch(() => {});
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationService.deleteNotification(id).catch(load);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationService.markAllAsRead().catch(load);
  };

  const handleDeleteAll = () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    setNotifications([]);
    notificationService.deleteAllNotifications().catch(load);
  };

  // Already newest-first from the API; filtering preserves that order.
  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
        if (readFilter === 'UNREAD' && n.read) return false;
        if (readFilter === 'READ' && !n.read) return false;
        return true;
      }),
    [notifications, typeFilter, readFilter]
  );

  const groups = useMemo(() => {
    const map = new Map();
    for (const n of filtered) {
      const label = dateGroupLabel(n.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading notifications...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <div className="flex gap-3 text-sm">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-accent hover:underline disabled:cursor-not-allowed disabled:text-zinc-600 disabled:no-underline"
          >
            Mark all read
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="text-red-400 hover:underline disabled:cursor-not-allowed disabled:text-zinc-600 disabled:no-underline"
          >
            Delete all
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
        >
          <option value="ALL">All types</option>
          {NOTIFICATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {READ_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setReadFilter(f.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                readFilter === f.value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-zinc-500">No notifications.</p>
      ) : (
        <div className="space-y-6">
          {groups.map(([label, items]) => (
            <div key={label}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h2>
              <div className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
                {items.map((n) => (
                  <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default NotificationCenter;
