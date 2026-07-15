// components/BenefitsSection.jsx — reusable benefit-card grid, used once for
// customers ("Why Choose DEZE?") and once for detailers ("Grow Your Business").

import { Link } from 'react-router-dom';

const ICONS = {
  search: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
    />
  ),
  tag: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7 7h.01M3 7.5V4a1 1 0 011-1h3.5a1 1 0 01.7.3l10.5 10.5a1 1 0 010 1.4l-6.5 6.5a1 1 0 01-1.4 0L.3 11.2a1 1 0 01-.3-.7V7.5z"
    />
  ),
  chat: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M20 12a8 8 0 10-3.35 6.5L21 20l-1.3-3.9A7.96 7.96 0 0020 12z"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-5.13a4 4 0 100-8 4 4 0 000 8zm6 1a4 4 0 00-4 4v0"
    />
  ),
  star: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M12 17.3l-6.16 3.6 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.48 4.63 1.64 7.03z"
    />
  ),
  bolt: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
  ),
  layout: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM3 10h18M9 10v11"
    />
  ),
};

function Icon({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      {ICONS[name]}
    </svg>
  );
}

function BenefitsSection({
  id,
  eyebrow,
  headline,
  benefits,
  ctaLabel,
  ctaTo,
  accentClass = 'text-accent',
  ctaButtonClass = 'bg-accent shadow-accent/20',
  pricingNote,
}) {
  return (
    <section id={id} className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          {eyebrow && (
            <p className={`mb-2 text-sm font-semibold uppercase tracking-widest ${accentClass}`}>{eyebrow}</p>
          )}
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{headline}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 ${accentClass}`}
              >
                <Icon name={b.icon} className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{b.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{b.description}</p>
            </div>
          ))}
        </div>

        {ctaLabel && (
          <div className="mt-12 text-center">
            {pricingNote && <p className="mb-4 text-sm text-zinc-400">{pricingNote}</p>}
            <Link
              to={ctaTo}
              className={`inline-block rounded-xl px-8 py-3.5 text-base font-semibold text-zinc-950 shadow-lg transition-transform hover:scale-[1.03] hover:opacity-90 ${ctaButtonClass}`}
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default BenefitsSection;
