// components/MessageBubble.jsx — a single chat message. Own messages align
// right in accent color; the other party's align left in neutral zinc.

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <span className="mb-1 px-1 text-xs text-zinc-500">
        {message.sender.firstName} · {formatTime(message.createdAt)}
      </span>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isOwn ? 'rounded-br-sm bg-accent text-zinc-950' : 'rounded-bl-sm bg-zinc-800 text-zinc-100'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.messageText}</p>
      </div>
      {isOwn && (
        <span className="mt-1 px-1 text-xs text-zinc-500">{message.readAt ? 'Seen' : 'Delivered'}</span>
      )}
    </div>
  );
}

export default MessageBubble;
