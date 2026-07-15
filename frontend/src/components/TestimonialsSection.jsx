// components/TestimonialsSection.jsx — social proof from beta testers.

const TESTIMONIALS = [
  {
    quote:
      "I posted a job on my lunch break and had three detailers messaging me within the hour. Booked, paid, done by the weekend.",
    name: 'Maria S.',
    role: 'Car owner, Austin TX',
  },
  {
    quote:
      "DEZE fills my calendar without me spending a dime on ads. The free trial paid for itself in the first week.",
    name: 'Jordan P.',
    role: 'Mobile detailer, Dallas TX',
  },
  {
    quote:
      'Being able to message the customer before I even quote the job saves me so much back-and-forth.',
    name: 'Devon R.',
    role: 'Detailer, Phoenix AZ',
  },
];

function Stars() {
  return (
    <div className="mb-3 flex gap-0.5 text-accent">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 17.3l-6.16 3.6 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.48 4.63 1.64 7.03z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Trusted by Detailers &amp; Car Owners</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <Stars />
              <p className="text-sm leading-relaxed text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
