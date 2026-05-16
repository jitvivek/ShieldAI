import Hero from '@/components/Hero';
import StatsBanner from '@/components/StatsBanner';
import LanguageShowcase from '@/components/LanguageShowcase';
import PlaygroundWidget from '@/components/PlaygroundWidget';
import ComparisonTable from '@/components/ComparisonTable';
import IntegrationSnippets from '@/components/IntegrationSnippets';
import PricingCards from '@/components/PricingCards';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBanner />
      <LanguageShowcase />
      <PlaygroundWidget />
      <ComparisonTable />
      <IntegrationSnippets />
      <PricingCards />
      <Footer />
    </main>
  );
}
