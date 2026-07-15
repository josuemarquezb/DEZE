// components/HeroSection.jsx — landing page hero: headline, subhead, dual CTAs.

import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-28 sm:pt-36">
      {/* Ambient glow blobs — dark canvas with vibrant accent bleed */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-accent-purple/20 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 inline-block rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400">
          Now booking in your area
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Get Your Car Detailed.
          <br />
          <span className="text-accent">On Demand.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
          Connect with vetted detailers in your area. Book, message, pay—all in one app.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup?type=customer"
            className="w-full rounded-xl bg-accent px-8 py-3.5 text-center text-base font-semibold text-zinc-950 shadow-lg shadow-accent/20 transition-transform hover:scale-[1.03] hover:opacity-90 sm:w-auto"
          >
            I Need a Detail
          </Link>
          <Link
            to="/signup?type=detailer"
            className="w-full rounded-xl bg-accent-orange px-8 py-3.5 text-center text-base font-semibold text-zinc-950 shadow-lg shadow-accent-orange/20 transition-transform hover:scale-[1.03] hover:opacity-90 sm:w-auto"
          >
            I'm a Detailer
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
