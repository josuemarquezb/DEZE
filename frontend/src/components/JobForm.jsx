// components/JobForm.jsx — form to post a new detail job (PostJob.jsx).
// Location is resolved by LocationPicker (auto-detect or typed-address
// geocoding) — this form never asks for raw lat/lng.

import { useState } from 'react';
import ServiceTypeSelector from './ServiceTypeSelector.jsx';
import LocationPicker from './LocationPicker.jsx';

const todayIso = () => new Date().toISOString().slice(0, 10);

function JobForm({ onSubmit }) {
  const [values, setValues] = useState({
    jobTitle: '',
    serviceType: '',
    vehicleType: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    requestedDate: '',
    requestedTimeStart: '',
    requestedTimeEnd: '',
    budget: '',
    description: '',
  });
  const [location, setLocation] = useState({ address: '', latitude: null, longitude: null });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!values.jobTitle.trim()) next.jobTitle = 'Required';
    if (!values.serviceType) next.serviceType = 'Select a service type';
    if (!values.vehicleType.trim()) next.vehicleType = 'Required';
    if (!values.vehicleYear || Number(values.vehicleYear) < 1900 || Number(values.vehicleYear) > new Date().getFullYear() + 1)
      next.vehicleYear = 'Enter a valid year';
    if (!values.vehicleMake.trim()) next.vehicleMake = 'Required';
    if (!values.vehicleModel.trim()) next.vehicleModel = 'Required';
    if (location.latitude == null || location.longitude == null || !location.address.trim())
      next.location = 'Set a location — use current location or enter your address';
    if (!values.requestedDate) next.requestedDate = 'Required';
    if (!values.requestedTimeStart) next.requestedTimeStart = 'Required';
    if (!values.requestedTimeEnd) next.requestedTimeEnd = 'Required';
    if (values.requestedTimeStart && values.requestedTimeEnd && values.requestedTimeEnd <= values.requestedTimeStart)
      next.requestedTimeEnd = 'Must be after start time';
    if (!values.budget || Number(values.budget) <= 0) next.budget = 'Enter a budget greater than 0';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        jobTitle: values.jobTitle,
        serviceType: values.serviceType,
        vehicleType: values.vehicleType,
        vehicleYear: Number(values.vehicleYear),
        vehicleMake: values.vehicleMake,
        vehicleModel: values.vehicleModel,
        vehicleColor: values.vehicleColor || undefined,
        locationAddress: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        requestedDate: values.requestedDate,
        requestedTimeStart: values.requestedTimeStart,
        requestedTimeEnd: values.requestedTimeEnd,
        budget: Number(values.budget),
        description: values.description || undefined,
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Job title</label>
        <input
          type="text"
          value={values.jobTitle}
          onChange={set('jobTitle')}
          placeholder="e.g. Full detail before I sell my car"
          className={inputClass}
        />
        {errors.jobTitle && <p className="mt-1 text-sm text-red-400">{errors.jobTitle}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Service type</label>
        <ServiceTypeSelector
          value={values.serviceType ? [values.serviceType] : []}
          onChange={(next) => setValues((v) => ({ ...v, serviceType: next[next.length - 1] || '' }))}
        />
        {errors.serviceType && <p className="mt-1 text-sm text-red-400">{errors.serviceType}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Vehicle type</label>
          <input type="text" value={values.vehicleType} onChange={set('vehicleType')} placeholder="Sedan" className={inputClass} />
          {errors.vehicleType && <p className="mt-1 text-sm text-red-400">{errors.vehicleType}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Year</label>
          <input type="number" value={values.vehicleYear} onChange={set('vehicleYear')} placeholder="2020" className={inputClass} />
          {errors.vehicleYear && <p className="mt-1 text-sm text-red-400">{errors.vehicleYear}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Make</label>
          <input type="text" value={values.vehicleMake} onChange={set('vehicleMake')} placeholder="Honda" className={inputClass} />
          {errors.vehicleMake && <p className="mt-1 text-sm text-red-400">{errors.vehicleMake}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Model</label>
          <input type="text" value={values.vehicleModel} onChange={set('vehicleModel')} placeholder="Civic" className={inputClass} />
          {errors.vehicleModel && <p className="mt-1 text-sm text-red-400">{errors.vehicleModel}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Color (optional)</label>
        <input type="text" value={values.vehicleColor} onChange={set('vehicleColor')} placeholder="Black" className={`${inputClass} sm:w-48`} />
      </div>

      <LocationPicker value={location} onChange={setLocation} error={errors.location} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Date</label>
          <input type="date" min={todayIso()} value={values.requestedDate} onChange={set('requestedDate')} className={inputClass} />
          {errors.requestedDate && <p className="mt-1 text-sm text-red-400">{errors.requestedDate}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">Start time</label>
          <input type="time" value={values.requestedTimeStart} onChange={set('requestedTimeStart')} className={inputClass} />
          {errors.requestedTimeStart && <p className="mt-1 text-sm text-red-400">{errors.requestedTimeStart}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">End time</label>
          <input type="time" value={values.requestedTimeEnd} onChange={set('requestedTimeEnd')} className={inputClass} />
          {errors.requestedTimeEnd && <p className="mt-1 text-sm text-red-400">{errors.requestedTimeEnd}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Budget ($)</label>
        <input type="number" min="0" step="0.01" value={values.budget} onChange={set('budget')} placeholder="150" className={`${inputClass} sm:w-40`} />
        {errors.budget && <p className="mt-1 text-sm text-red-400">{errors.budget}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-300">Special notes (optional)</label>
        <textarea
          value={values.description}
          onChange={set('description')}
          rows={4}
          maxLength={2000}
          placeholder="Anything a detailer should know — parking instructions, trouble spots, etc."
          className={inputClass}
        />
      </div>

      {submitError && <p className="text-sm text-red-400">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post job'}
      </button>
    </form>
  );
}

export default JobForm;
