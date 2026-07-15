// components/MapLegend.jsx — static legend explaining marker colors.

const ENTRIES = [
  { color: '#2a78d6', label: 'Your location' },
  { color: '#e34948', label: 'Budget < $100' },
  { color: '#eb6834', label: 'Budget $100–200' },
  { color: '#eda100', label: 'Budget > $200' },
];

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 rounded-xl border border-zinc-700 bg-zinc-900/90 p-3 backdrop-blur">
      <ul className="space-y-1.5">
        {ENTRIES.map((entry) => (
          <li key={entry.label} className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MapLegend;
