import Link from 'next/link';
import { CheckCircle, Users, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import AppLayout from '@/components/layout/AppLayout';

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
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Become a Local Guide
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Share your passion for your city and earn money by guiding travelers to amazing experiences
            </p>
            <Link href="/auth/guider/signup">
              <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-50 h-12 px-8">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Benefits Section */}
      <Section variant="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Become a Guide?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join a community of passionate local experts making a difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary-600" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section>
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of guides who are already earning and sharing their passion
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/guider/signup">
                  <Button size="lg" className="h-12 px-8">
                    Sign Up as Guide
                  </Button>
                </Link>
                <Link href="/auth/guider/login">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    Already a Guide? Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}
