import PricingCards from '@/components/PricingCards';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Pricing — ShieldAI',
  description: 'Simple, transparent pricing with INR and USD options. Free tier included.',
};

export default function PricingPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-shield-900 to-shield-700 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 text-shield-100">Start free. Scale as you grow. India-first pricing.</p>
      </section>
      <PricingCards />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="font-semibold">What payment methods do you accept?</h3>
            <p className="mt-1 text-gray-600">Indian credit/debit cards, UPI, net banking, and international cards (Visa, Mastercard). All prices include GST.</p>
          </div>
          <div>
            <h3 className="font-semibold">Can I switch between INR and USD billing?</h3>
            <p className="mt-1 text-gray-600">Yes, you can switch at any time from your billing settings. Indian companies are billed in INR by default.</p>
          </div>
          <div>
            <h3 className="font-semibold">What happens if I exceed my scan limit?</h3>
            <p className="mt-1 text-gray-600">We&apos;ll notify you at 80% usage. Overages are billed at ₹0.15 per scan (Starter) or ₹0.05 per scan (Growth).</p>
          </div>
          <div>
            <h3 className="font-semibold">Is there a free trial for paid plans?</h3>
            <p className="mt-1 text-gray-600">Yes, Growth plan includes a 14-day free trial with full features. No credit card required.</p>
          </div>
          <div>
            <h3 className="font-semibold">Do you offer discounts for Indian startups?</h3>
            <p className="mt-1 text-gray-600">Yes! DPIIT-recognized startups get 50% off the first year. Contact us with your DPIIT certificate.</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
