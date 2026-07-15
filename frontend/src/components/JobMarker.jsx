// components/JobMarker.jsx — the highlighted marker overlay for whichever
// job is currently selected. Individual (non-selected) job points are
// rendered as native Mapbox GL circle layers for clustering performance
// (see services/mapService.js) — this is the one-off DOM marker (mounted via
// mapboxgl.Marker + ReactDOM createRoot in pages/JobsMap.jsx) that pulses on
// top of the selected job's point.

import { colorForBudget } from '../services/mapService.js';

function JobMarker({ budget }) {
  const color = colorForBudget(budget);

  return (
    <div
      className="animate-pulse rounded-full border-[3px] border-white"
      style={{ width: 26, height: 26, backgroundColor: color, boxShadow: `0 0 0 6px ${color}55` }}
    />
  );
}

export default JobMarker;
