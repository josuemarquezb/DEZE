// components/JobPopup.jsx — content shown inside a mapboxgl.Popup when a job
// marker is clicked. Mounted via ReactDOM createRoot + Popup.setDOMContent
// (see pages/JobsMap.jsx) since native Mapbox popups sit outside the app's
// normal React tree.

import { SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

/** @param {object} properties - a GeoJSON job feature's `properties` (see backend utils/geoUtils.js) */
function JobPopup({ properties, onViewDetails }) {
  const { jobId, title, serviceType, budget, distance, customerName, vehicleInfo } = properties;

  const initials = customerName
    ? customerName
        .split(' ')
        .map((s) => s[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="w-56 text-sm">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300">
          {initials}
        </div>
        <p className="truncate font-semibold text-white">{title}</p>
      </div>
      <p className="text-zinc-400">{SERVICE_TYPE_LABELS[serviceType] || serviceType}</p>
      <p className="text-zinc-400">{vehicleInfo}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-semibold text-accent">${budget}</span>
        {distance != null && <span className="text-xs text-zinc-500">{distance} mi away</span>}
      </div>
      <button
        onClick={() => onViewDetails(jobId)}
        className="mt-3 w-full rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-zinc-950 hover:opacity-90"
      >
        View Details
      </button>
    </div>
  );
}

export default JobPopup;
