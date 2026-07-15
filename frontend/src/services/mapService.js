// services/mapService.js — Mapbox GL JS map setup for JobsMap.jsx.
// Job points are rendered as native GL layers (not one React/DOM marker per
// job) because that's what makes clustering actually performant — Mapbox's
// clustering is a configuration on a GeoJSON source, not a per-marker
// concern. The one DOM marker we do create (mapboxgl.Marker) is the
// detailer's own "you are here" position, since there's only ever one.

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Mirrors locationService.isGeocodingConfigured() — the repo's .env.example
// ships a literal "pk.xxx" placeholder, which should read as "not configured".
export const isMapConfigured = () => Boolean(MAPBOX_TOKEN) && MAPBOX_TOKEN !== 'pk.xxx';

export const JOBS_SOURCE_ID = 'jobs';
const CLUSTER_LAYER_ID = 'job-clusters';
const CLUSTER_COUNT_LAYER_ID = 'job-cluster-count';
const UNCLUSTERED_LAYER_ID = 'job-points';

/** Budget → marker color, per the spec's tiers. */
export const colorForBudget = (budget) => {
  if (budget == null) return '#e34948'; // red — treat unknown as the lowest tier
  if (budget < 100) return '#e34948'; // red
  if (budget <= 200) return '#eb6834'; // orange
  return '#eda100'; // gold
};

/** Budget → marker radius, so bigger jobs are visually bigger on the map. */
export const radiusForBudget = (budget) => {
  if (budget == null) return 7;
  if (budget < 100) return 7;
  if (budget <= 200) return 9;
  return 11;
};

/** initializeMap(container, { lat, lng, zoom }) — creates the dark-themed map. Throws if VITE_MAPBOX_TOKEN isn't configured. */
export const initializeMap = (container, { lat, lng, zoom = 11 } = {}) => {
  if (!isMapConfigured()) {
    throw new Error('Map is not configured (missing VITE_MAPBOX_TOKEN).');
  }
  mapboxgl.accessToken = MAPBOX_TOKEN;

  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [lng, lat],
    zoom,
  });
};

/** Adds (or replaces) the detailer's blue "you are here" marker. Returns the marker so callers can .remove() it. */
export const addDetailerMarker = (map, lat, lng) => {
  const el = document.createElement('div');
  el.style.width = '18px';
  el.style.height = '18px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#2a78d6';
  el.style.border = '3px solid #ffffff';
  el.style.boxShadow = '0 0 0 4px rgba(42, 120, 214, 0.35)';

  return new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
};

/**
 * addJobMarkers(map, geojson) — adds/updates the clustered GeoJSON source
 * plus the unclustered-point layer (individual job circles, colored/sized by
 * budget). Safe to call repeatedly with new data (e.g. after a filter
 * change) — updates the existing source instead of re-adding layers.
 */
export const addJobMarkers = (map, geojson) => {
  const existing = map.getSource(JOBS_SOURCE_ID);
  if (existing) {
    existing.setData(geojson);
    return;
  }

  map.addSource(JOBS_SOURCE_ID, {
    type: 'geojson',
    data: geojson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  });

  map.addLayer({
    id: UNCLUSTERED_LAYER_ID,
    type: 'circle',
    source: JOBS_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'step',
        ['get', 'budget'],
        '#e34948', // < 100
        100,
        '#eb6834', // 100–200
        201,
        '#eda100', // > 200
      ],
      'circle-radius': ['step', ['get', 'budget'], 7, 100, 9, 201, 11],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#09090b',
    },
  });
};

/**
 * addClusterMarkers(map) — adds the cluster bubble layer + count label on
 * top of the source addJobMarkers() created. Must be called after addJobMarkers.
 */
export const addClusterMarkers = (map) => {
  if (map.getLayer(CLUSTER_LAYER_ID)) return;

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: JOBS_SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#00E5A0',
      'circle-opacity': 0.85,
      'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 15, 26],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#09090b',
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: JOBS_SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
      'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
    },
    paint: { 'text-color': '#09090b' },
  });

  // Clicking a cluster zooms in until it breaks apart.
  map.on('click', CLUSTER_LAYER_ID, (e) => {
    const [feature] = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] });
    const clusterId = feature.properties.cluster_id;
    map.getSource(JOBS_SOURCE_ID).getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;
      map.easeTo({ center: feature.geometry.coordinates, zoom });
    });
  });

  map.on('mouseenter', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });
};

/** Wires clicks on individual (unclustered) job points to a callback receiving that feature. */
export const onJobMarkerClick = (map, callback) => {
  map.on('click', UNCLUSTERED_LAYER_ID, (e) => {
    const feature = e.features?.[0];
    if (feature) callback(feature);
  });
  map.on('mouseenter', UNCLUSTERED_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', UNCLUSTERED_LAYER_ID, () => {
    map.getCanvas().style.cursor = '';
  });
};

// Thin re-exports so callers (pages/JobsMap.jsx) never need to import
// mapbox-gl directly just to build a one-off highlighted marker/popup.
export const mapboxglMarkerCtor = () => mapboxgl.Marker;
export const createPopup = (options) => new mapboxgl.Popup({ closeOnClick: true, offset: 12, ...options });

/** fitBounds(map, positions) — positions is an array of [lng, lat] pairs (include the detailer's own position). */
export const fitBounds = (map, positions) => {
  if (!positions.length) return;
  const bounds = positions.reduce(
    (b, pos) => b.extend(pos),
    new mapboxgl.LngLatBounds(positions[0], positions[0])
  );
  map.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 500 });
};
