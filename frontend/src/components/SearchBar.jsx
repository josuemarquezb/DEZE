// components/SearchBar.jsx — debounced text search input, used across admin pages.

import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

/** @param {string} value @param {(value: string) => void} onChange @param {string} [placeholder] */
function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) onChange(draft);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="relative">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">⌕</span>
    </div>
  );
}

export default SearchBar;
