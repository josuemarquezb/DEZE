// components/MapContainer.jsx — owns the Mapbox GL map's DOM node and
// lifecycle (create on mount, destroy on unmount). Deliberately dumb: it
// doesn't know about jobs, markers, or filters — it just builds the map and
// hands the instance to its parent via onMapReady once the style has loaded,
// so pages/JobsMap.jsx owns everything about what goes ON the map.

import { useEffect, useRef } from 'react';
import * as mapService from '../services/mapService.js';

/** @param {{lat: number, lng: number}} center @param {(map: import('mapbox-gl').Map) => void} onMapReady */
function MapContainer({ center, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map;

    // Deferred via requestAnimationFrame rather than created synchronously:
    // React 18 StrictMode (dev only) mounts, cleans up, and re-mounts every
    // effect once to surface non-idempotent effects — and Mapbox GL throws
    // ("Maximum call stack size exceeded") if a new map is created in the
    // same container in the same synchronous tick a previous one was
    // .remove()'d in. Deferring past that tick means only the real mount
    // (the one that survives to the next paint) ever actually builds a map.
    const rafId = requestAnimationFrame(() => {
      if (cancelled || !containerRef.current) return;
      map = mapService.initializeMap(containerRef.current, center);
      mapRef.current = map;
      map.on('load', () => onMapReady(map));
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
    // Only ever initialize once, on mount — recentering after that happens
    // via the map instance itself (see MapControls' recenter button), not by
    // tearing down and rebuilding the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}

export default MapContainer;
