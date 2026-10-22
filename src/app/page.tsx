import Navigation from '@/components/Navigation';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import HeroSection from '@/components/HeroSection';
import ProductMarquee from '@/components/ProductMarquee';
import ProductShowcase from '@/components/ProductShowcase';
import GlowSection from '@/components/GlowSection';
import StorySection from '@/components/StorySection';
import IngredientsSection from '@/components/IngredientsSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <ScrollProgressBar />
      <Navigation />
      <HeroSection />
      <ProductMarquee />
      <ProductShowcase />
      <GlowSection />
      <StorySection />
      <IngredientsSection />
      <Footer />
    </main>
  );
}

