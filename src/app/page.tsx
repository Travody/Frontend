import type { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedTours from '@/components/homepage/FeaturedTours';
import ExploreCategories from '@/components/homepage/ExploreCategories';
import VerifiedGuides from '@/components/homepage/VerifiedGuides';
import Testimonials from '@/components/homepage/Testimonials';
import StructuredData from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Discover India with Local Experts',
  description: 'Connect with verified local guides and discover authentic travel experiences across India. Book unique tours, explore hidden gems, and create unforgettable memories with Travody.',
  keywords: [
    'travel India',
    'local guides India',
    'India tours',
    'authentic travel experiences',
    'book tour guide',
    'India travel guide',
    'cultural tours India',
    'local experts India',
  ],
  openGraph: {
    title: 'Travody - Discover India with Local Experts',
    description: 'Connect with verified local guides and discover authentic travel experiences across India.',
    url: '/',
    siteName: 'Travody',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Travody - Discover India with Local Experts',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travody - Discover India with Local Experts',
    description: 'Connect with verified local guides and discover authentic travel experiences across India.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <AppLayout>
        <div className="bg-white">
          <HeroSection />
          <FeaturedTours />
          <ExploreCategories />
          <VerifiedGuides />
          {/* <Testimonials /> */}
        </div>
      </AppLayout>
    </>
  );
}

