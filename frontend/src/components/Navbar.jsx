// components/Navbar.jsx — top navigation, adapts to auth state.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import UnreadBadge from './UnreadBadge.jsx';
import NotificationBell from './NotificationBell.jsx';
import * as messageService from '../services/messageService.js';

const UNREAD_POLL_INTERVAL_MS = 15000;

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    const refresh = () => {
      messageService
        .getUnreadCount()
        .then((count) => {
          if (!cancelled) setUnreadCount(count);
        })
        .catch(() => {});
    };

    refresh();
    const interval = setInterval(refresh, UNREAD_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
      <Link to="/" className="font-bold text-white">
        DEZE
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user?.userType === 'DETAILER' && (
          <>
            <Link to="/jobs" className="text-zinc-300 hover:text-white">
              Browse jobs
            </Link>
            <Link to="/detailer/jobs" className="flex items-center text-zinc-300 hover:text-white">
              My jobs
              <UnreadBadge count={unreadCount} />
            </Link>
            <Link to="/detailer/dashboard" className="text-zinc-300 hover:text-white">
              Dashboard
            </Link>
          </>
        )}
        {user?.userType === 'CUSTOMER' && (
          <>
            <Link to="/customer/jobs" className="flex items-center text-zinc-300 hover:text-white">
              My jobs
              <UnreadBadge count={unreadCount} />
            </Link>
            <Link to="/jobs/new" className="rounded-lg bg-accent px-3 py-1.5 font-medium text-zinc-950 hover:opacity-90">
              Post a job
            </Link>
          </>
        )}
        {user?.isAdmin && (
          <Link to="/admin" className="text-zinc-300 hover:text-white">
            Admin
          </Link>
        )}
        {user && <NotificationBell />}
        {user ? (
          <button onClick={handleLogout} className="text-zinc-300 hover:text-white">
            Log out
          </button>
        ) : (
          <>
            <Link to="/login" className="text-zinc-300 hover:text-white">
              Log in
            </Link>
            <Link to="/signup" className="rounded-lg bg-accent px-3 py-1.5 font-medium text-zinc-950 hover:opacity-90">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
