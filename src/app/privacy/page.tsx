import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Shield className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                    <p className="text-gray-600 mb-4">
                      Travody ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                    <p className="text-gray-600 mb-4">
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Name, email address, phone number</li>
                      <li>Payment information (processed securely through third-party payment processors)</li>
                      <li>Profile information and preferences</li>
                      <li>Booking and transaction history</li>
                      <li>Communication preferences</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
                    <p className="text-gray-600 mb-4">
                      When you use our Platform, we automatically collect:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage data (pages visited, time spent, clicks)</li>
                      <li>Location data (with your permission)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process bookings and transactions</li>
                      <li>Send booking confirmations and updates</li>
                      <li>Communicate with you about our services</li>
                      <li>Personalize your experience</li>
                      <li>Detect and prevent fraud and abuse</li>
                      <li>Comply with legal obligations</li>
                      <li>Send marketing communications (with your consent)</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
                    <p className="text-gray-600 mb-4">
                      We may share your information in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>With Guides:</strong> When you book a tour, we share necessary information (name, contact details, booking requirements) with the guide to facilitate the experience.</li>
                      <li><strong>Service Providers:</strong> We share information with third-party service providers who perform services on our behalf (payment processing, email delivery, analytics).</li>
                      <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
                      <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your information may be transferred.</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      We do not sell your personal information to third parties.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                    <p className="text-gray-600 mb-4">
                      We implement appropriate technical and organizational measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Encryption of sensitive data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication</li>
                      <li>Secure payment processing</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
                    <p className="text-gray-600 mb-4">
                      We use cookies and similar technologies to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Remember your preferences and settings</li>
                      <li>Analyze how you use our Platform</li>
                      <li>Provide personalized content and advertisements</li>
                      <li>Improve our services</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      You can control cookies through your browser settings.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
                    <p className="text-gray-600 mb-4">
                      Depending on your location, you may have the following rights:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Access:</strong> Request a copy of your personal information</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                      <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                      <li><strong>Objection:</strong> Object to processing of your personal information</li>
                      <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      To exercise these rights, please contact us at privacy@travody.com.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                    <p className="text-gray-600 mb-4">
                      We retain your personal information for as long as necessary to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>Provide our services to you</li>
                      <li>Comply with legal obligations</li>
                      <li>Resolve disputes and enforce agreements</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      When we no longer need your information, we will securely delete or anonymize it.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                    <p className="text-gray-600 mb-4">
                      Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
                    <p className="text-gray-600 mb-4">
                      Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                    <p className="text-gray-600 mb-4">
                      We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                      If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
                    </p>
                    <p className="text-gray-600">
                      Email: privacy@travody.com<br />
                      Address: 123 Travel Street, Mumbai, Maharashtra 400001, India
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

