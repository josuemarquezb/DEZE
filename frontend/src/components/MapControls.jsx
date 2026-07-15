// components/MapControls.jsx — non-intrusive floating controls overlaid on the map:
// zoom, recenter on the detailer's own location, service-type filter, distance radius.

import { SERVICE_TYPES, SERVICE_TYPE_LABELS } from '../constants/serviceTypes.js';

const MIN_RADIUS = 1;
const MAX_RADIUS = 50;

/**
 * @param {() => void} onZoomIn @param {() => void} onZoomOut @param {() => void} onRecenter
 * @param {string} serviceType @param {(type: string) => void} onServiceTypeChange
 * @param {number} radius @param {(radius: number) => void} onRadiusChange
 */
function MapControls({ onZoomIn, onZoomOut, onRecenter, serviceType, onServiceTypeChange, radius, onRadiusChange }) {
  return (
    <>
      <div className="absolute right-4 top-4 flex flex-col gap-2">
        <button
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-lg font-medium text-white backdrop-blur hover:bg-zinc-800"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-lg font-medium text-white backdrop-blur hover:bg-zinc-800"
        >
          −
        </button>
        <button
          onClick={onRecenter}
          aria-label="Recenter on my location"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/90 text-base text-white backdrop-blur hover:bg-zinc-800"
        >
          ◎
        </button>
      </div>

      <div className="absolute left-4 top-4 w-56 space-y-3 rounded-xl border border-zinc-700 bg-zinc-900/90 p-3 backdrop-blur">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Service type</label>
          <select
            value={serviceType}
            onChange={(e) => onServiceTypeChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
          >
            <option value="">All services</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SERVICE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-400">
            <span>Radius</span>
            <span className="text-zinc-300">{radius} mi</span>
          </label>
          <input
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </div>
    </>
  );
}

export default MapControls;
