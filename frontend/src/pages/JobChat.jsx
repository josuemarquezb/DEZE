// pages/JobChat.jsx — chat between a job's customer and assigned detailer.
// Polls for new messages every 3s (no websockets yet) and marks the thread
// read whenever the page is open and messages are fetched.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import * as jobService from '../services/jobService.js';
import * as messageService from '../services/messageService.js';
import * as notificationService from '../services/notificationService.js';
import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

const POLL_INTERVAL_MS = 3000;

function JobChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const refreshMessages = useCallback(async () => {
    try {
      const data = await messageService.getJobMessages(id);
      setMessages(data);
      messageService.markAsRead(id).catch(() => {});
      notificationService.markJobNotificationsAsRead(id).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.');
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobData = await jobService.getJobById(id);
        if (cancelled) return;
        setJob(jobData);
        await refreshMessages();
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load this chat.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    pollRef.current = setInterval(refreshMessages, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, [id, refreshMessages]);

  const handleSend = async (text) => {
    const message = await messageService.sendMessage(id, text);
    setMessages((prev) => [...prev, message]);
  };

  if (loading) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading...</main>;
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  const otherParty = user?.userType === 'CUSTOMER' ? job.detailer : job.customer;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/jobs/${id}`} className="mb-4 inline-block text-sm text-accent hover:underline">
        ← Back to job
      </Link>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div>
          <h1 className="font-semibold text-white">
            {otherParty ? `${otherParty.firstName} ${otherParty.lastName?.[0] || ''}.` : 'Chat'}
          </h1>
          <p className="text-sm text-zinc-400">
            {job.jobTitle} · {SERVICE_TYPE_LABELS[job.serviceType] || job.serviceType} · {job.vehicleYear}{' '}
            {job.vehicleMake} {job.vehicleModel}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <ChatWindow messages={messages} currentUserId={user.id} onSend={handleSend} />
    </main>
  );
}

export default JobChat;
