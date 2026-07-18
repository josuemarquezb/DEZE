// components/LocationPicker.jsx — resolves a job's location without ever
// asking the user to type raw lat/lng. Tries the browser's Geolocation API
// first (reverse-geocoded to a readable address via Mapbox when configured);
// falls back to a typed address forward-geocoded to coordinates.

import { useCallback, useEffect, useState } from 'react';
import * as locationService from '../services/locationService.js';

// 'detecting'    — geolocation prompt/lookup in flight (on mount)
// 'detected'     — geolocation succeeded, value has coordinates
// 'needs-manual' — geolocation denied/failed/timed out, or user asked to change it
// 'geocoding'    — typed address is being resolved
// 'resolved'     — typed address successfully resolved to coordinates
const STATUS = {
  DETECTING: 'detecting',
  DETECTED: 'detected',
  NEEDS_MANUAL: 'needs-manual',
  GEOCODING: 'geocoding',
  RESOLVED: 'resolved',
};

function LocationPicker({ value, onChange, error }) {
  const [status, setStatus] = useState(STATUS.DETECTING);
  const [detectError, setDetectError] = useState(null);
  const [addressInput, setAddressInput] = useState('');
  const [geocodeError, setGeocodeError] = useState(null);

  const detect = useCallback(async () => {
    setStatus(STATUS.DETECTING);
    setDetectError(null);
    try {
      const { latitude, longitude } = await locationService.getCurrentLocation();

      let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      if (locationService.isGeocodingConfigured()) {
        try {
          const formatted = await locationService.reverseGeocode(latitude, longitude);
          if (formatted) address = formatted;
        } catch (err) {
          // A failed reverse-lookup shouldn't block using the coordinates we
          // already have — just fall back to showing raw coordinates.
          console.error('[LocationPicker] reverse geocode failed:', err);
        }
      }

      onChange({ latitude, longitude, address });
      setStatus(STATUS.DETECTED);
    } catch (err) {
      console.error('[LocationPicker] geolocation failed:', err);
      setDetectError(err.message);
      setStatus(STATUS.NEEDS_MANUAL);
    }
  }, [onChange]);

  useEffect(() => {
    detect();
    // Only ever auto-run once, on mount — re-detection is user-initiated after this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFindAddress = async (e) => {
    e?.preventDefault();
    if (!addressInput.trim()) return;

    setStatus(STATUS.GEOCODING);
    setGeocodeError(null);
    try {
      const { latitude, longitude, formattedAddress } = await locationService.geocodeAddress(addressInput.trim());
      onChange({ latitude, longitude, address: formattedAddress });
      setStatus(STATUS.RESOLVED);
    } catch (err) {
      console.error('[LocationPicker] geocoding failed:', err);
      setGeocodeError(err.message || 'Could not find that address. Try a different one.');
      setStatus(STATUS.NEEDS_MANUAL);
    }
  };

  const handleUseDifferentLocation = () => {
    onChange({ latitude: null, longitude: null, address: '' });
    setAddressInput('');
    setGeocodeError(null);
    setStatus(STATUS.NEEDS_MANUAL);
  };

  const hasLocation = value?.latitude != null && value?.longitude != null;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-zinc-300">Location</label>

      {status === STATUS.DETECTING && (
        <p className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
          Detecting your location...
        </p>
      )}

      {hasLocation && (status === STATUS.DETECTED || status === STATUS.RESOLVED) && (
        <div>
          <p className="flex items-center gap-2 text-sm text-white">
            <span aria-hidden>📍</span> {value.address}
          </p>
          <p className="mt-1 text-xs text-green-400">
            {status === STATUS.DETECTED ? 'Location detected ✓' : 'Address found ✓'}
          </p>
          <button
            type="button"
            onClick={handleUseDifferentLocation}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Use a different location
          </button>
        </div>
      )}

      {status === STATUS.NEEDS_MANUAL && (
        <div>
          {detectError && <p className="mb-2 text-sm text-yellow-400">{detectError} Enter your address below instead.</p>}
          {/* Not a <form> — this can be nested inside a caller's own <form> (e.g.
              JobForm, ProfileForm), and a nested <form> submit would bubble up and
              trigger the outer form's native submission instead of this lookup. */}
          <div className="flex flex-wrap items-start gap-3">
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindAddress(e);
              }}
              placeholder="Enter your address"
              className="min-w-[16rem] flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleFindAddress}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Find address
            </button>
          </div>
          {geocodeError && <p className="mt-2 text-sm text-red-400">{geocodeError}</p>}
          <button type="button" onClick={detect} className="mt-2 text-sm text-accent hover:underline">
            Try auto-detecting my location again
          </button>
        </div>
      )}

      {status === STATUS.GEOCODING && (
        <p className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
          Looking up address...
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default LocationPicker;
