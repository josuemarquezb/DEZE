// utils/geoUtils.js — GeoJSON formatting for map-based job discovery.
// Distance math itself lives in utils/geo.js; this file is purely about
// shaping already-computed job data into the GeoJSON Mapbox GL expects.

/**
 * formatJobsAsGeoJSON(jobs) — converts an array of public job objects (see
 * toPublicJob in controllers/jobs.controller.js, which already attaches
 * distanceMiles) into a GeoJSON FeatureCollection of Point features.
 *
 * @param {object[]} jobs - public job shapes, each with latitude/longitude
 *   and (for the nearby-jobs endpoint) a distanceMiles field already computed.
 * @returns {{type: 'FeatureCollection', features: object[]}}
 */
export const formatJobsAsGeoJSON = (jobs) => ({
  type: 'FeatureCollection',
  features: jobs.map((job) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [job.longitude, job.latitude] },
    properties: {
      jobId: job.id,
      title: job.jobTitle,
      serviceType: job.serviceType,
      budget: job.budget,
      distance: job.distanceMiles ?? null,
      customerName: job.customer ? `${job.customer.firstName} ${job.customer.lastName?.[0] || ''}.` : null,
      vehicleInfo: `${job.vehicleYear} ${job.vehicleMake} ${job.vehicleModel}`,
    },
  })),
});
