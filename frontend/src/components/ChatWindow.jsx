// components/ChatWindow.jsx — scrollable message list + input, auto-scrolls
// to the latest message whenever the list grows.

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';

function ChatWindow({ messages, currentUserId, onSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">No messages yet — say hello.</p>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUserId} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={onSend} />
    </div>
  );
}

export default ChatWindow;
