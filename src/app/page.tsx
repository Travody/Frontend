import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedTours from '@/components/FeaturedTours';
import ExploreCategories from '@/components/ExploreCategories';
import VerifiedGuides from '@/components/VerifiedGuides';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <FeaturedTours />
        <ExploreCategories />
        <VerifiedGuides />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

