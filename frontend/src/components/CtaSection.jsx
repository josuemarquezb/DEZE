// components/CtaSection.jsx — final full-width call-to-action before the footer.

import { Link } from 'react-router-dom';

function CtaSection() {
  return (
    <section id="cta" className="scroll-mt-20 px-4 py-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-accent/20 blur-[100px]" />
          <div className="absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-accent-orange/20 blur-[100px]" />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-md text-zinc-400">Join the detailing community.</p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/signup?type=customer"
              className="w-full rounded-xl bg-accent px-8 py-3.5 text-center text-base font-semibold text-zinc-950 transition-transform hover:scale-[1.03] hover:opacity-90 sm:w-auto"
            >
              Post a Detail
            </Link>
            <Link
              to="/signup?type=detailer"
              className="w-full rounded-xl border border-zinc-700 px-8 py-3.5 text-center text-base font-semibold text-white transition-colors hover:border-zinc-500 hover:bg-zinc-800 sm:w-auto"
            >
              Become a Detailer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
