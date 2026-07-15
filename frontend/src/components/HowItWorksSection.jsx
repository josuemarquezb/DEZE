// components/HowItWorksSection.jsx — numbered 3-step tracks for customers and detailers.

const CUSTOMER_STEPS = [
  { title: 'Post a Detail', description: 'Tell us what you need, where, and when.' },
  { title: 'Choose Your Detailer', description: 'Browse nearby pros with ratings and photos.' },
  { title: 'Get Your Car Detailed', description: 'Message, track progress, and pay securely.' },
];

const DETAILER_STEPS = [
  { title: 'Create Your Profile', description: 'Show your experience, services, and location.' },
  { title: 'Accept Jobs', description: 'See nearby requests and accept the ones you want.' },
  { title: 'Earn & Grow', description: 'Get paid, build reviews, and grow your business.' },
];

function StepTrack({ label, steps, accentClass }) {
  return (
    <div>
      <p className={`mb-6 text-center text-sm font-semibold uppercase tracking-widest ${accentClass}`}>{label}</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <span className={`text-4xl font-extrabold ${accentClass} opacity-40`}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Three Simple Steps</h2>
        </div>

        <div className="space-y-14">
          <StepTrack label="For Customers" steps={CUSTOMER_STEPS} accentClass="text-accent" />
          <StepTrack label="For Detailers" steps={DETAILER_STEPS} accentClass="text-accent-orange" />
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
