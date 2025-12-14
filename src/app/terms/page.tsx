import type { Metadata } from 'next';
import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read Travody\'s Terms & Conditions to understand the rules and guidelines for using our platform as a traveler or guide.',
  keywords: [
    'terms and conditions',
    'user agreement',
    'terms of service',
    'platform rules',
    'legal terms',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms & Conditions | Travody',
    description: 'Read Travody\'s Terms & Conditions to understand the rules and guidelines for using our platform.',
    url: '/terms',
    siteName: 'Travody',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Travody Terms & Conditions',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Travody',
    description: 'Read Travody\'s Terms & Conditions to understand the rules for using our platform.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <FileText className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white/90">
              Last updated: November 19, 2024
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6 md:p-10">
                <div className="prose prose-lg max-w-none">
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 mb-4">
                      By accessing and using Travody ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
                    <p className="text-gray-600 mb-4">
                      Permission is granted to temporarily access the materials on Travody's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Modify or copy the materials</li>
                      <li>Use the materials for any commercial purpose or for any public display</li>
                      <li>Attempt to decompile or reverse engineer any software contained on Travody's website</li>
                      <li>Remove any copyright or other proprietary notations from the materials</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                    <p className="text-gray-600 mb-4">
                      To access certain features of the Platform, you must register for an account. You agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Provide accurate, current, and complete information during registration</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and identification</li>
                      <li>Accept all responsibility for activities that occur under your account</li>
                      <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Booking and Payment</h2>
                    <p className="text-gray-600 mb-4">
                      When you book a tour or experience through Travody:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>You enter into a contract directly with the guide, not with Travody</li>
                      <li>Full payment is required at the time of booking</li>
                      <li>Cancellation policies vary by tour and are clearly stated during booking</li>
                      <li>Refunds are subject to the cancellation policy of the specific tour</li>
                      <li>Travody acts as an intermediary and is not responsible for the services provided by guides</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Guide Responsibilities</h2>
                    <p className="text-gray-600 mb-4">
                      Guides using the Platform agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Provide accurate information about their tours and experiences</li>
                      <li>Honor all confirmed bookings</li>
                      <li>Maintain appropriate insurance coverage</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Treat all travelers with respect and professionalism</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Traveler Responsibilities</h2>
                    <p className="text-gray-600 mb-4">
                      Travelers using the Platform agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Provide accurate information during booking</li>
                      <li>Arrive on time for scheduled tours</li>
                      <li>Respect local customs and guidelines provided by guides</li>
                      <li>Follow safety instructions and guidelines</li>
                      <li>Treat guides and other travelers with respect</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cancellation and Refunds</h2>
                    <p className="text-gray-600 mb-4">
                      Cancellation policies are set by individual guides and vary by tour. Generally:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Full refunds are typically available if cancelled 48 hours in advance</li>
                      <li>Partial refunds may apply for cancellations made 24-48 hours in advance</li>
                      <li>No refunds for cancellations made less than 24 hours before the tour</li>
                      <li>Weather-related cancellations may be eligible for full refunds or rescheduling</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                    <p className="text-gray-600 mb-4">
                      Travody acts as an intermediary platform connecting travelers with guides. We are not responsible for:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>The quality, safety, or legality of tours provided by guides</li>
                      <li>The accuracy of information provided by guides</li>
                      <li>Any injuries, damages, or losses incurred during tours</li>
                      <li>Disputes between travelers and guides</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      Travelers participate in tours at their own risk and should ensure they have appropriate travel insurance.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
                    <p className="text-gray-600 mb-4">
                      All content on the Platform, including text, graphics, logos, images, and software, is the property of Travody or its content suppliers and is protected by copyright and other intellectual property laws.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications to Terms</h2>
                    <p className="text-gray-600 mb-4">
                      Travody reserves the right to modify these terms at any time. We will notify users of any significant changes. Continued use of the Platform after changes constitutes acceptance of the new terms.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about these Terms & Conditions, please contact us at:
                    </p>
                    <p className="text-gray-600">
                      Email: support@travody.com<br />
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}

