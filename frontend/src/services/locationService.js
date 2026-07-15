// services/locationService.js — browser geolocation + Mapbox geocoding.
// Used by LocationPicker.jsx (job posting) and JobsList.jsx (nearby browsing).

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// The repo's .env.example ships a literal "pk.xxx" placeholder — treat that
// as "not configured" rather than firing real requests at Mapbox with it.
export const isGeocodingConfigured = () => Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'pk.xxx';

const GEOLOCATION_ERROR_MESSAGES = {
  1: 'Location access was denied.', // PERMISSION_DENIED
  2: 'Your location could not be determined.', // POSITION_UNAVAILABLE
  3: 'Location detection timed out.', // TIMEOUT
};

/**
 * Resolves the browser's current position via the Geolocation API.
 * Rejects with a short, user-facing message on denial/timeout/unsupported.
 */
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location detection is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (err) => reject(new Error(GEOLOCATION_ERROR_MESSAGES[err.code] || 'Could not detect your location.')),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

/** Forward geocode: a typed address -> { latitude, longitude, formattedAddress }. */
export const geocodeAddress = async (address) => {
  if (!isGeocodingConfigured()) {
    throw new Error('Address lookup is not configured (missing VITE_MAPBOX_TOKEN).');
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox geocoding request failed (${res.status})`);
  }
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) {
    throw new Error('No matching address found. Try a different address.');
  }
  const [longitude, latitude] = feature.center;
  return { latitude, longitude, formattedAddress: feature.place_name };
};

/** Reverse geocode: lat/lng -> a formatted address string, or null if none found. */
export const reverseGeocode = async (latitude, longitude) => {
  if (!isGeocodingConfigured()) {
    throw new Error('Address lookup is not configured (missing VITE_MAPBOX_TOKEN).');
  }
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Mapbox reverse geocoding request failed (${res.status})`);
  }
  const data = await res.json();
  return data.features?.[0]?.place_name || null;
};
