// pages/DetailerOnboarding.jsx — step-by-step profile creation for new detailers.
// Only reachable by DETAILER accounts; redirects away once a profile looks
// "complete" (has a bio and at least one service type) — see App.jsx guard.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceTypeSelector from '../components/ServiceTypeSelector.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import * as detailerService from '../services/detailerService.js';
import * as photoService from '../services/photoService.js';

const STEPS = ['Basic info', 'Service types', 'Pricing', 'Location', 'Equipment photo'];

/** A profile counts as "already onboarded" once it has a bio and at least one service type. */
const isProfileComplete = (profile) => Boolean(profile.bio) && profile.serviceTypes.length > 0;

function DetailerOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [form, setForm] = useState({
    bio: '',
    yearsExperience: '',
    serviceTypes: [],
    hourlyRate: '',
    latitude: null,
    longitude: null,
    address: '',
    serviceAreaRadius: 25,
  });

  useEffect(() => {
    detailerService
      .getMyProfile()
      .then((profile) => {
        if (isProfileComplete(profile)) {
          navigate('/detailer/dashboard', { replace: true });
        } else {
          setCheckingExisting(false);
        }
      })
      .catch(() => setCheckingExisting(false));
  }, [navigate]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setLocation = (loc) =>
    setForm((f) => ({ ...f, latitude: loc.latitude, longitude: loc.longitude, address: loc.address }));

  const canAdvance = () => {
    if (step === 1) return form.serviceTypes.length > 0;
    if (step === 3) return form.latitude != null && form.longitude != null;
    return true;
  };

  const next = () => {
    if (!canAdvance()) {
      setError('Please complete this step before continuing.');
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleFinish = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await detailerService.createProfile({
        bio: form.bio,
        serviceTypes: form.serviceTypes,
        hourlyRate: form.hourlyRate === '' ? null : Number(form.hourlyRate),
        yearsExperience: form.yearsExperience === '' ? null : Number(form.yearsExperience),
        latitude: form.latitude,
        longitude: form.longitude,
        serviceAreaRadius: Number(form.serviceAreaRadius),
      });

      navigate('/detailer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none';

  if (checkingExisting) {
    return <main className="px-4 py-16 text-center text-zinc-400">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Set up your detailer profile</h1>
      <p className="mt-1 text-zinc-400">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      <div className="mt-3 flex gap-1.5">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Bio</label>
              <textarea
                rows={4}
                placeholder="Tell customers about your experience and specialties..."
                value={form.bio}
                onChange={set('bio')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Years of experience</label>
              <input type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} className={`${inputClass} sm:w-40`} />
            </div>
          </>
        )}

        {step === 1 && (
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-300">Which services do you offer?</p>
            <ServiceTypeSelector
              value={form.serviceTypes}
              onChange={(next) => setForm((f) => ({ ...f, serviceTypes: next }))}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Hourly rate ($, optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 45"
              value={form.hourlyRate}
              onChange={set('hourlyRate')}
              className={`${inputClass} sm:w-40`}
            />
            <p className="mt-2 text-xs text-zinc-500">You can leave this blank and set pricing per-job later.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <LocationPicker
              value={{ latitude: form.latitude, longitude: form.longitude, address: form.address }}
              onChange={setLocation}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">Service area radius (miles)</label>
              <input type="number" min="1" value={form.serviceAreaRadius} onChange={set('serviceAreaRadius')} className={`${inputClass} sm:w-40`} />
            </div>
          </div>
        )}

        {step === 4 && (
          <PhotoUpload
            label="Equipment photo (optional)"
            onUpload={(file, onProgress) => photoService.uploadEquipmentPhoto(file, onProgress)}
          />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button onClick={back} className="rounded-lg border border-zinc-700 px-5 py-2 font-medium text-zinc-300 hover:bg-zinc-800">
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 hover:opacity-90">
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={submitting}
            className="rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating profile...' : 'Finish & create profile'}
          </button>
        )}
      </div>
    </main>
  );
}

export default DetailerOnboarding;
