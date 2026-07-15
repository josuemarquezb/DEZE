// pages/Signup.jsx — minimal signup screen. New detailers land on /onboarding
// since auth.controller.js creates them a blank DetailerProfile automatically.

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUserType = searchParams.get('type')?.toUpperCase() === 'DETAILER' ? 'DETAILER' : 'CUSTOMER';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: initialUserType,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signup(form);
      navigate(user.userType === 'DETAILER' ? '/onboarding' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-3xl font-bold text-white">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            required
            placeholder="First name"
            value={form.firstName}
            onChange={set('firstName')}
            className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          />
          <input
            required
            placeholder="Last name"
            value={form.lastName}
            onChange={set('lastName')}
            className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
          />
        </div>
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={set('email')}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="Password (min. 8 characters)"
          value={form.password}
          onChange={set('password')}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-600 focus:border-accent focus:outline-none"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-300">I am a...</p>
          <div className="flex gap-3">
            {['CUSTOMER', 'DETAILER'].map((type) => (
              <label
                key={type}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                  form.userType === type
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <input
                  type="radio"
                  name="userType"
                  value={type}
                  checked={form.userType === type}
                  onChange={set('userType')}
                  className="hidden"
                />
                {type === 'CUSTOMER' ? 'Customer' : 'Detailer'}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-5 py-2 font-medium text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-500">
        Already have an account? <Link to="/login" className="text-accent">Log in</Link>
      </p>
    </main>
  );
}

export default Signup;
