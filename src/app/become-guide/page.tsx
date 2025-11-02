import Header from '@/components/layout/Header';
import Link from 'next/link';
import { CheckCircle, Users, DollarSign, Star } from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: "Connect with Travelers",
    description: "Meet people from around the world and share your local knowledge"
  },
  {
    icon: DollarSign,
    title: "Earn Money",
    description: "Turn your passion for your city into a source of income"
  },
  {
    icon: Star,
    title: "Build Your Brand",
    description: "Establish yourself as a trusted local expert"
  }
];

export default function BecomeGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-primary-600 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Become a Local Guide
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Share your passion for your city and earn money by guiding travelers to amazing experiences
            </p>
            <Link
              href="/auth/guider/signup"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Your Journey
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Become a Guide?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-8 shadow-lg text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of guides who are already earning and sharing their passion
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/guider/signup"
                className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Sign Up as Guide
              </Link>
              <Link
                href="/auth/guider/login"
                className="border border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Already a Guide? Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

