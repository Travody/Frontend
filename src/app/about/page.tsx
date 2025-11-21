import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, Heart, Award, Target, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About Travody
            </h1>
            <p className="text-xl text-white/90">
              Connecting travelers with authentic local experiences across India
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600">
                To make travel more meaningful by connecting travelers with verified local guides 
                who share authentic experiences, hidden gems, and cultural insights.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card>
                <CardContent className="p-6">
                  <Target className="h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
                  <p className="text-gray-600">
                    To become India's most trusted platform for authentic travel experiences, 
                    empowering local guides and enriching travelers' journeys.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 text-primary-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Our Values</h3>
                  <p className="text-gray-600">
                    Authenticity, trust, community, and sustainability guide everything we do. 
                    We believe in supporting local communities and preserving cultural heritage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      {/* What We Do */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Do
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Travody bridges the gap between travelers seeking authentic experiences 
              and local guides passionate about sharing their culture.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Verified Guides</h3>
                <p className="text-sm text-gray-600">
                  All our guides undergo a thorough verification process to ensure quality and safety.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Local Experiences</h3>
                <p className="text-sm text-gray-600">
                  Discover hidden gems and authentic experiences that only locals know about.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-gray-600">
                  Every experience is carefully curated and reviewed to maintain high standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lightbulb className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Custom Plans</h3>
                <p className="text-sm text-gray-600">
                  Create personalized travel plans tailored to your interests and preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Community Support</h3>
                <p className="text-sm text-gray-600">
                  Supporting local communities and preserving cultural heritage through tourism.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
                <p className="text-sm text-gray-600">
                  Simple, secure booking process with flexible cancellation policies.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Story Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-4">
                Travody was born from a simple observation: travelers often miss out on the most 
                authentic and meaningful experiences because they don't know where to look or who to ask.
              </p>
              <p className="text-gray-600 mb-4">
                We recognized that local guides possess invaluable knowledge about their communities, 
                culture, and hidden gems that can't be found in guidebooks. At the same time, many 
                passionate locals wanted to share their expertise but lacked a platform to connect 
                with travelers.
              </p>
              <p className="text-gray-600 mb-4">
                Today, Travody connects thousands of travelers with verified local guides across India, 
                creating memorable experiences while supporting local communities and preserving 
                cultural heritage.
              </p>
              <p className="text-gray-600">
                Join us in making travel more meaningful, one authentic experience at a time.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Explore?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start your journey with authentic local experiences today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/explore"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Explore Tours
              </a>
              <a
                href="/become-guide"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Become a Guide
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}

