// components/ProfileForm.jsx — reusable form to create/edit a detailer profile.
// Used by DetailerDashboard's "Edit Profile" mode. DetailerOnboarding uses its
// own step-by-step wizard (see pages/DetailerOnboarding.jsx) but shares
// ServiceTypeSelector/PhotoUpload with this form.

import { useState } from 'react';
import ServiceTypeSelector from './ServiceTypeSelector.jsx';

const emptyErrors = {};

/**
 * @param {object} initialValues - { bio, yearsExperience, serviceTypes, hourlyRate, latitude, longitude, serviceAreaRadius }
 * @param {(data: object) => Promise<void>} onSubmit
 * @param {() => void} [onCancel]
 */
function ProfileForm({ initialValues, onSubmit, onCancel, submitLabel = 'Save changes' }) {
  const [values, setValues] = useState({
    bio: initialValues.bio || '',
    yearsExperience: initialValues.yearsExperience ?? '',
    serviceTypes: initialValues.serviceTypes || [],
    hourlyRate: initialValues.hourlyRate ?? '',
    latitude: initialValues.latitude ?? '',
    longitude: initialValues.longitude ?? '',
    serviceAreaRadius: initialValues.serviceAreaRadius ?? 25,
  });
  const [errors, setErrors] = useState(emptyErrors);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (values.serviceTypes.length === 0) next.serviceTypes = 'Select at least one service type';
    if (values.hourlyRate !== '' && Number(values.hourlyRate) <= 0) next.hourlyRate = 'Must be greater than 0';
    if (values.latitude !== '' && (Number(values.latitude) < -90 || Number(values.latitude) > 90))
      next.latitude = 'Must be between -90 and 90';
    if (values.longitude !== '' && (Number(values.longitude) < -180 || Number(values.longitude) > 180))
      next.longitude = 'Must be between -180 and 180';
    if (Number(values.serviceAreaRadius) <= 0) next.serviceAreaRadius = 'Must be greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit({
        bio: values.bio,
        serviceTypes: values.serviceTypes,
        hourlyRate: values.hourlyRate === '' ? null : Number(values.hourlyRate),
        yearsExperience: values.yearsExperience === '' ? null : Number(values.yearsExperience),
        latitude: values.latitude === '' ? undefined : Number(values.latitude),
        longitude: values.longitude === '' ? undefined : Number(values.longitude),
        serviceAreaRadius: Number(values.serviceAreaRadius),
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Bio</label>
        <textarea
          value={values.bio}
          onChange={set('bio')}
          maxLength={2000}
          rows={4}
          placeholder="Tell customers about your experience and specialties..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Years of experience</label>
        <input
          type="number"
          min="0"
          value={values.yearsExperience}
          onChange={set('yearsExperience')}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-accent focus:outline-none sm:w-40"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Service types</label>
        <ServiceTypeSelector
          value={values.serviceTypes}
          onChange={(next) => setValues((v) => ({ ...v, serviceTypes: next }))}
        />
        {errors.serviceTypes && <p className="mt-1 text-sm text-red-400">{errors.serviceTypes}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Hourly rate ($, optional)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={values.hourlyRate}
          onChange={set('hourlyRate')}
          placeholder="e.g. 45"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none sm:w-40"
        />
        {errors.hourlyRate && <p className="mt-1 text-sm text-red-400">{errors.hourlyRate}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Latitude</label>
          <input
            type="number"
            step="any"
            value={values.latitude}
            onChange={set('latitude')}
            placeholder="30.2672"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          />
          {errors.latitude && <p className="mt-1 text-sm text-red-400">{errors.latitude}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Longitude</label>
          <input
            type="number"
            step="any"
            value={values.longitude}
            onChange={set('longitude')}
            placeholder="-97.7431"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          />
          {errors.longitude && <p className="mt-1 text-sm text-red-400">{errors.longitude}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Service radius (mi)</label>
          <input
            type="number"
            min="1"
            value={values.serviceAreaRadius}
            onChange={set('serviceAreaRadius')}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-accent focus:outline-none"
          />
          {errors.serviceAreaRadius && <p className="mt-1 text-sm text-red-400">{errors.serviceAreaRadius}</p>}
        </div>
      </div>
      <p className="-mt-3 text-xs text-zinc-500">
        You can find your coordinates by right-clicking your location on Google Maps.
      </p>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-700 px-5 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ProfileForm;
