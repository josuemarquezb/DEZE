// components/NotificationItem.jsx — a single notification row, used by both
// NotificationDropdown (compact) and NotificationCenter (full list).

import { useNavigate } from 'react-router-dom';
import {
  NOTIFICATION_TYPE_COLOR_CLASSES,
  NOTIFICATION_TYPE_ICONS,
  notificationLinkFor,
} from '../constants/notificationTypes.js';

const formatRelativeTime = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/**
 * @param {object} notification
 * @param {(id: string) => void} onMarkRead
 * @param {(id: string) => void} [onDelete] - omit to hide the delete button (e.g. in the dropdown)
 * @param {() => void} [onAfterNavigate] - e.g. closes the dropdown after a click
 */
function NotificationItem({ notification, onMarkRead, onDelete, onAfterNavigate }) {
  const navigate = useNavigate();
  const link = notificationLinkFor(notification);

  const handleClick = () => {
    if (!notification.read) onMarkRead(notification.id);
    if (link) navigate(link);
    onAfterNavigate?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-zinc-800/60 ${
        !notification.read ? 'bg-zinc-900' : ''
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${NOTIFICATION_TYPE_COLOR_CLASSES[notification.type] || 'bg-zinc-800 text-zinc-300'}`}
      >
        {NOTIFICATION_TYPE_ICONS[notification.type] || '🔔'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{notification.title}</p>
          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
        </div>
        <p className="truncate text-sm text-zinc-400">{notification.message}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          aria-label="Delete notification"
          className="shrink-0 self-start text-zinc-600 hover:text-red-400"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
