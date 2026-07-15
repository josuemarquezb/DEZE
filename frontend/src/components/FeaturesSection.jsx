// components/FeaturesSection.jsx — 6-item feature grid: what the app actually does.

const FEATURES = [
  {
    icon: '💬',
    title: 'Real-Time Messaging',
    description: 'Chat with your customer or detailer before and during the job.',
  },
  {
    icon: '📍',
    title: 'Location-Based Matching',
    description: 'Find detailers near you, or customers in your service area.',
  },
  {
    icon: '⭐',
    title: 'Verified Reviews',
    description: 'See ratings and photos from real, completed jobs.',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: 'Pay and get paid safely, right in the app.',
  },
  {
    icon: '📸',
    title: 'Job Photos',
    description: 'Share before/after photos to show off the quality of the work.',
  },
  {
    icon: '📅',
    title: 'Scheduling',
    description: 'Accept jobs and manage your calendar in one place.',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Built for Real Detailers &amp; Car Owners</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
            >
              <div className="mb-4 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
