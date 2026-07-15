// pages/LandingPage.jsx — public marketing homepage. Only rendered for
// unauthenticated visitors; App.jsx sends logged-in users to their dashboard instead.

import LandingNavbar from '../components/LandingNavbar.jsx';
import HeroSection from '../components/HeroSection.jsx';
import BenefitsSection from '../components/BenefitsSection.jsx';
import HowItWorksSection from '../components/HowItWorksSection.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import PricingSection from '../components/PricingSection.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import CtaSection from '../components/CtaSection.jsx';
import Footer from '../components/Footer.jsx';

const CUSTOMER_BENEFITS = [
  { icon: 'search', title: 'Find Local Detailers', description: 'Browse nearby professionals with ratings.' },
  { icon: 'tag', title: 'Transparent Pricing', description: 'See prices upfront, no surprises.' },
  { icon: 'chat', title: 'Message & Coordinate', description: 'Chat directly with your detailer before booking.' },
  { icon: 'shield', title: 'Quality Guarantee', description: 'Read reviews and see photos of past work.' },
];

const DETAILER_BENEFITS = [
  { icon: 'users', title: 'Get More Customers', description: 'Jobs posted daily in your area.' },
  { icon: 'star', title: 'Build Your Reputation', description: 'Verified reviews boost credibility.' },
  { icon: 'bolt', title: 'Get Paid Fast', description: 'Secure payments, instant payouts.' },
  { icon: 'layout', title: 'Simple to Use', description: 'Manage schedule, messages, and earnings in one place.' },
];

function LandingPage() {
  return (
    <div id="top" className="scroll-smooth">
      <LandingNavbar />
      <HeroSection />

      <BenefitsSection
        id="for-customers"
        eyebrow="For Customers"
        headline="Why Choose DEZE?"
        benefits={CUSTOMER_BENEFITS}
        ctaLabel="Book a Detail Now"
        ctaTo="/signup?type=customer"
        accentClass="text-accent"
        ctaButtonClass="bg-accent shadow-accent/20"
      />

      <BenefitsSection
        id="for-detailers"
        eyebrow="For Detailers"
        headline="Grow Your Detailing Business"
        benefits={DETAILER_BENEFITS}
        ctaLabel="Start Detailing for Free"
        ctaTo="/signup?type=detailer"
        accentClass="text-accent-orange"
        ctaButtonClass="bg-accent-orange shadow-accent-orange/20"
        pricingNote="FREE for first 2 months. Then $75/month."
      />

      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

export default LandingPage;
