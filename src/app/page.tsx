import Navigation from '@/components/Navigation';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import HeroSection from '@/components/HeroSection';
import ProductMarquee from '@/components/ProductMarquee';
import ProductShowcase from '@/components/ProductShowcase';
import GlowSection from '@/components/GlowSection';
import StorySection from '@/components/StorySection';
import IngredientsSection from '@/components/IngredientsSection';
import Footer from '@/components/Footer';
import SectionReveal from '@/components/SectionReveal';

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <ScrollProgressBar />
      <Navigation />
      <SectionReveal mode="exit"><HeroSection /></SectionReveal>
      <SectionReveal><ProductMarquee /></SectionReveal>
      <SectionReveal><ProductShowcase /></SectionReveal>
      <SectionReveal><GlowSection /></SectionReveal>
      <SectionReveal><StorySection /></SectionReveal>
      <SectionReveal><IngredientsSection /></SectionReveal>
      <SectionReveal><Footer /></SectionReveal>
    </main>
  );
}
