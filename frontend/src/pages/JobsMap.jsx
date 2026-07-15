// pages/JobsMap.jsx — map view of nearby jobs (detailer only). Fetches
// nearby jobs once (at the max slider radius) as GeoJSON, then filters by
// service type / a smaller radius entirely client-side so the distance
// slider and dropdown feel instant — no refetch per tweak.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import MapContainer from '../components/MapContainer.jsx';
import MapControls from '../components/MapControls.jsx';
import MapLegend from '../components/MapLegend.jsx';
import JobPopup from '../components/JobPopup.jsx';
import JobMarker from '../components/JobMarker.jsx';
import * as jobService from '../services/jobService.js';
import * as detailerService from '../services/detailerService.js';
import * as mapService from '../services/mapService.js';
import { getCurrentLocation } from '../services/locationService.js';

const MAX_RADIUS = 50;
const DEFAULT_RADIUS = 25;

function JobsMap() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [locationNote, setLocationNote] = useState(null);
  const [allFeatures, setAllFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [serviceType, setServiceType] = useState('');

  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const highlightMarkerRef = useRef(null);

  // --- 1. Resolve the detailer's own location (geolocation, falling back to their saved profile location) ---
  useEffect(() => {
    let cancelled = false;

    const resolveLocation = async () => {
      try {
        const coords = await getCurrentLocation();
        if (!cancelled) setLocation(coords);
      } catch {
        try {
          const profile = await detailerService.getMyProfile();
          if (profile.latitude != null && profile.longitude != null) {
            if (!cancelled) {
              setLocation({ latitude: profile.latitude, longitude: profile.longitude });
              setLocationNote('Using your saved profile location — enable location access for more accurate results.');
            }
          } else if (!cancelled) {
            setError('We need your location to show nearby jobs. Enable location access, or set one on your profile.');
            setLoading(false);
          }
        } catch (err) {
          if (!cancelled) {
            setError(err.response?.data?.message || 'Failed to resolve your location.');
            setLoading(false);
          }
        }
      }
    };

    resolveLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- 2. Once we have a location, fetch nearby jobs (at the max radius) as GeoJSON ---
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    jobService
      .getNearbyJobsGeoJSON(location.latitude, location.longitude, MAX_RADIUS)
      .then((geojson) => {
        if (!cancelled) setAllFeatures(geojson.features);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load nearby jobs.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  // --- 3. Client-side filtering by radius + service type ---
  const filteredFeatures = useMemo(
    () =>
      allFeatures.filter((f) => {
        if (serviceType && f.properties.serviceType !== serviceType) return false;
        if (typeof f.properties.distance === 'number' && f.properties.distance > radius) return false;
        return true;
      }),
    [allFeatures, radius, serviceType]
  );

  const filteredGeoJSON = useMemo(
    () => ({ type: 'FeatureCollection', features: filteredFeatures }),
    [filteredFeatures]
  );

  // Split in two so the popup's own 'close' event (which fires whenever it
  // closes for ANY reason — outside click, or the map itself tearing down on
  // unmount) can't recurse: calling popup.remove() from inside a handler
  // wired to that same popup's 'close' event would re-fire 'close' and
  // recurse until the stack overflows. handlePopupClosed only ever reacts
  // (clears refs + the separate highlight marker); closeSelection is the one
  // that actively calls .remove(), and only when opening a NEW selection.
  const clearHighlightMarker = useCallback(() => {
    highlightMarkerRef.current?.remove();
    highlightMarkerRef.current = null;
  }, []);

  const handlePopupClosed = useCallback(() => {
    popupRef.current = null;
    clearHighlightMarker();
  }, [clearHighlightMarker]);

  const closeSelection = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove(); // triggers 'close' -> handlePopupClosed, which clears the rest
    } else {
      clearHighlightMarker();
    }
  }, [clearHighlightMarker]);

  const handleFeatureClick = useCallback(
    (feature) => {
      const map = mapRef.current;
      if (!map) return;
      closeSelection();

      const coords = feature.geometry.coordinates;

      const markerEl = document.createElement('div');
      createRoot(markerEl).render(<JobMarker budget={feature.properties.budget} />);
      highlightMarkerRef.current = new (mapService.mapboxglMarkerCtor())({ element: markerEl })
        .setLngLat(coords)
        .addTo(map);

      const popupEl = document.createElement('div');
      createRoot(popupEl).render(
        <JobPopup properties={feature.properties} onViewDetails={(jobId) => navigate(`/jobs/${jobId}`)} />
      );

      const popup = mapService
        .createPopup()
        .setLngLat(coords)
        .setDOMContent(popupEl)
        .addTo(map);
      popup.on('close', handlePopupClosed);
      popupRef.current = popup;
    },
    [closeSelection, handlePopupClosed, navigate]
  );

  const [mapReady, setMapReady] = useState(false);

  // onMapReady only ever needs to flip a flag — it must NOT close over
  // location/filteredGeoJSON/etc. directly (those are only known once
  // async geolocation + the jobs fetch resolve, well after this callback is
  // created), so the actual marker/layer setup lives in the effect below,
  // which re-runs with fresh values on every dependency change instead.
  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  // Adds the detailer marker + job layers once the map first becomes ready,
  // then keeps the job source in sync on every subsequent filter change.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !location) return;

    if (!map.getSource(mapService.JOBS_SOURCE_ID)) {
      mapService.addDetailerMarker(map, location.latitude, location.longitude);
      mapService.addJobMarkers(map, filteredGeoJSON);
      mapService.addClusterMarkers(map);
      mapService.onJobMarkerClick(map, handleFeatureClick);

      const positions = [[location.longitude, location.latitude], ...filteredFeatures.map((f) => f.geometry.coordinates)];
      mapService.fitBounds(map, positions);
    } else {
      mapService.addJobMarkers(map, filteredGeoJSON);
    }
  }, [mapReady, location, filteredGeoJSON, filteredFeatures, handleFeatureClick]);

  const handleRecenter = () => {
    if (mapRef.current && location) {
      mapRef.current.flyTo({ center: [location.longitude, location.latitude], zoom: 11 });
    }
  };

  if (!mapService.isMapConfigured()) {
    return (
      <main className="px-4 py-16 text-center">
        <p className="text-zinc-400">
          Map view isn't available — <code className="text-zinc-500">VITE_MAPBOX_TOKEN</code> isn't configured.
        </p>
        <Link to="/jobs" className="mt-4 inline-block text-accent hover:underline">
          Switch to list view
        </Link>
      </main>
    );
  }

  if (error) {
    return <main className="px-4 py-16 text-center text-red-400">{error}</main>;
  }

  return (
    <main className="relative h-[calc(100vh-73px)] w-full">
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-zinc-700 bg-zinc-900/90 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur">
        {loading
          ? 'Loading nearby jobs...'
          : `${filteredFeatures.length} job${filteredFeatures.length === 1 ? '' : 's'} within ${radius} mi`}
      </div>

      <Link
        to="/jobs"
        className="absolute right-4 bottom-4 z-10 rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-sm text-zinc-300 backdrop-blur hover:bg-zinc-800"
      >
        List view
      </Link>

      {locationNote && (
        <div className="absolute left-1/2 top-16 z-10 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur">
          {locationNote}
        </div>
      )}

      {location && (
        <MapContainer center={{ lat: location.latitude, lng: location.longitude }} onMapReady={handleMapReady} />
      )}

      {location && (
        <MapControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onRecenter={handleRecenter}
          serviceType={serviceType}
          onServiceTypeChange={setServiceType}
          radius={radius}
          onRadiusChange={setRadius}
        />
      )}

      <MapLegend />
    </main>
  );
}

export default JobsMap;
