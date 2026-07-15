// components/PricingSection.jsx — pricing cards for customers (always free) and detailers.

import { Link } from 'react-router-dom';

function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Pricing That Works for Everyone</h2>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Enough jobs to pay for your subscription within the first month.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Customer plan */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Customers</p>
            <p className="mt-3 text-4xl font-extrabold text-white">
              Always Free
            </p>
            <p className="mt-3 text-sm text-zinc-400">Post jobs, message detailers, and book at no cost.</p>
            <Link
              to="/signup?type=customer"
              className="mt-8 block rounded-xl bg-accent px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              I Need a Detail
            </Link>
          </div>

          {/* Detailer plan */}
          <div className="relative rounded-2xl border border-accent-orange/40 bg-zinc-900/60 p-8">
            <span className="absolute -top-3 right-6 rounded-full bg-accent-orange px-3 py-1 text-xs font-semibold text-zinc-950">
              Cancel anytime
            </span>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent-orange">Detailers</p>
            <p className="mt-3 text-4xl font-extrabold text-white">
              Free for 2 Months
            </p>
            <p className="mt-3 text-sm text-zinc-400">Then just $75/month to keep accepting jobs.</p>
            <Link
              to="/signup?type=detailer"
              className="mt-8 block rounded-xl bg-accent-orange px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition-transform hover:scale-[1.02] hover:opacity-90"
            >
              Start Detailing for Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
