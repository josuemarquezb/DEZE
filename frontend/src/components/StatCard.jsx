// components/StatCard.jsx — a single metric card for admin overview pages.
// Optionally links elsewhere, and can be highlighted (e.g. pending actions).

import { Link } from 'react-router-dom';

function StatCard({ label, value, sublabel, to, highlight = false }) {
  const cardClasses = `rounded-xl border p-4 transition-colors ${
    highlight ? 'border-red-500/40 bg-red-500/5' : 'border-zinc-800 bg-zinc-900'
  } ${to ? 'hover:border-accent/60' : ''}`;

  const content = (
    <div className={cardClasses}>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
      <p className="text-sm text-zinc-500">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-zinc-600">{sublabel}</p>}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}

export default StatCard;
