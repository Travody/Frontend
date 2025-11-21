import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Cookie className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cookie Policy
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                    <p className="text-gray-600 mb-4">
                      Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                    </p>
                    <p className="text-gray-600 mb-4">
                      Travody uses cookies and similar technologies to enhance your experience, analyze site usage, and assist in our marketing efforts.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Essential Cookies</h3>
                    <p className="text-gray-600 mb-4">
                      These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                      <li><strong>Authentication Cookies:</strong> Used to keep you logged in during your session</li>
                      <li><strong>Security Cookies:</strong> Help protect against fraud and unauthorized access</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Functional Cookies</h3>
                    <p className="text-gray-600 mb-4">
                      These cookies allow the website to remember choices you make (such as your language preference) and provide enhanced, personalized features.
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                      <li><strong>Language Cookies:</strong> Remember your language selection</li>
                      <li><strong>Location Cookies:</strong> Remember your location preferences (with permission)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Analytics Cookies</h3>
                    <p className="text-gray-600 mb-4">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Google Analytics:</strong> Tracks website usage and performance</li>
                      <li><strong>User Behavior:</strong> Understands how users navigate our site</li>
                      <li><strong>Performance Metrics:</strong> Measures page load times and errors</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Marketing Cookies</h3>
                    <p className="text-gray-600 mb-4">
                      These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Advertising Cookies:</strong> Track your browsing to show relevant ads</li>
                      <li><strong>Social Media Cookies:</strong> Enable social media sharing and tracking</li>
                      <li><strong>Retargeting Cookies:</strong> Show you ads for products you've viewed</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Third-Party Cookies</h2>
                    <p className="text-gray-600 mb-4">
                      In addition to our own cookies, we may also use various third-party cookies to report usage statistics and deliver advertisements. These include:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                      <li><strong>Payment Processors:</strong> For secure payment processing</li>
                      <li><strong>Social Media Platforms:</strong> For social sharing and login features</li>
                      <li><strong>Advertising Networks:</strong> For targeted advertising</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Manage Cookies</h2>
                    <p className="text-gray-600 mb-4">
                      You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
                    </p>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Browser Settings</h3>
                    <p className="text-gray-600 mb-4">
                      You can control cookies through your browser settings. Here's how for popular browsers:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies and other site data</li>
                      <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                      <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                      <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Cookie Preferences</h3>
                    <p className="text-gray-600 mb-4">
                      You can also manage your cookie preferences directly on our website through our cookie consent banner, which appears when you first visit our site.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Impact of Disabling Cookies</h2>
                    <p className="text-gray-600 mb-4">
                      If you choose to disable cookies, some features of our website may not function properly:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li>You may need to re-enter information more frequently</li>
                      <li>Some personalized features may not work</li>
                      <li>Your preferences may not be saved</li>
                      <li>Some parts of the website may not load correctly</li>
                    </ul>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie Duration</h2>
                    <p className="text-gray-600 mb-4">
                      Cookies can be either "session" or "persistent" cookies:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                      <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                      <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them</li>
                    </ul>
                    <p className="text-gray-600 mb-4">
                      The duration of persistent cookies varies depending on their purpose, typically ranging from a few days to two years.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates to This Policy</h2>
                    <p className="text-gray-600 mb-4">
                      We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes by posting the new policy on this page.
                    </p>
                  </section>

                  <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                      If you have any questions about our use of cookies, please contact us at:
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

