import Header from '@/components/Header';
import FeaturedTours from '@/components/FeaturedTours';
import ExploreCategories from '@/components/ExploreCategories';
import Footer from '@/components/Footer';

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Amazing Tours
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover incredible experiences across India with our verified local guides
              </p>
            </div>
          </div>
        </div>
        <FeaturedTours />
        <ExploreCategories />
      </main>
      <Footer />
    </div>
  );
}

