// components/ChatInput.jsx — auto-growing text input + send button.
// Send is disabled while the message is empty/whitespace-only or a send is
// already in flight; Enter submits, Shift+Enter inserts a newline.

import { useRef, useState } from 'react';

const MAX_LENGTH = 500;

function ChatInput({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const autoGrow = (el) => {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleChange = (e) => {
    setText(e.target.value);
    autoGrow(e.target);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError(null);
    try {
      await onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 p-3">
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_LENGTH}
          placeholder="Type a message..."
          className="max-h-40 flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-zinc-950 hover:opacity-90 disabled:opacity-40"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
