import { Shield, CheckCircle, Star, User, Phone, MapPin, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Heading } from '@/components/ui/heading';

const features = [
  {
    icon: User,
    title: "Identity Verification",
    items: [
      "Government ID verification",
      "Background checks",
      "Professional credentials",
      "Reference verification"
    ]
  },
  {
    icon: Shield,
    title: "Safety First",
    items: [
      "Insurance coverage included",
      "24/7 emergency support",
      "Real-time location tracking",
      "Safety training certified"
    ]
  },
  {
    icon: Star,
    title: "Quality Assured",
    items: [
      "Continuous rating monitoring",
      "Regular training updates",
      "Customer feedback system",
      "Performance-based rewards"
    ]
  }
];

export default function VerifiedGuides() {
  return (
    <Section variant="primary">
      <Container>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white mr-3" />
            <Heading as="h2" variant="section" className="text-white text-3xl md:text-4xl">
              Verified & Trusted Guides
            </Heading>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Every guide on our platform goes through a rigorous verification process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
