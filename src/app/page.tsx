import AppLayout from '@/components/layout/AppLayout';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedTours from '@/components/homepage/FeaturedTours';
import ExploreCategories from '@/components/homepage/ExploreCategories';
import VerifiedGuides from '@/components/homepage/VerifiedGuides';
import Testimonials from '@/components/homepage/Testimonials';

export default function Home() {
  return (
    <AppLayout>
      <div className="bg-white">
        <HeroSection />
        <FeaturedTours />
        <ExploreCategories />
        <VerifiedGuides />
        <Testimonials />
      </div>
    </AppLayout>
  );
}

