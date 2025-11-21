'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is Travody?',
    answer: 'Travody is a platform that connects travelers with verified local guides across India. We help you discover authentic experiences, hidden gems, and cultural insights through personalized tours and travel plans.',
  },
  {
    category: 'General',
    question: 'How do I book a tour?',
    answer: 'Browse available tours on our Explore page, select a tour that interests you, choose your preferred date and time, and complete the booking. You\'ll receive a confirmation email with all the details.',
  },
  {
    category: 'General',
    question: 'Are the guides verified?',
    answer: 'Yes, all our guides undergo a thorough verification process including identity verification, background checks, and skill assessments. We ensure quality and safety for all travelers.',
  },
  {
    category: 'Booking',
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel your booking. Cancellation policies vary by tour and are clearly stated during booking. Most tours offer full refunds if cancelled 48 hours in advance.',
  },
  {
    category: 'Booking',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, UPI, and net banking. All payments are processed securely through our payment gateway.',
  },
  {
    category: 'Booking',
    question: 'Do I need to pay in advance?',
    answer: 'Yes, full payment is required at the time of booking to secure your spot. This ensures availability and helps guides prepare for your experience.',
  },
  {
    category: 'Guides',
    question: 'How do I become a guide?',
    answer: 'Visit our "Become a Guide" page and complete the registration process. You\'ll need to provide personal information, verification documents, and details about your expertise. Once verified, you can start creating tours.',
  },
  {
    category: 'Guides',
    question: 'What are the requirements to become a guide?',
    answer: 'You need to be at least 18 years old, have knowledge of local areas, be able to communicate in English (and preferably local languages), and pass our verification process.',
  },
  {
    category: 'Guides',
    question: 'How do guides get paid?',
    answer: 'Guides receive payment after the tour is completed. Payments are processed securely through our platform, typically within 3-5 business days after tour completion.',
  },
  {
    category: 'Travelers',
    question: 'What should I bring on a tour?',
    answer: 'We recommend bringing comfortable walking shoes, weather-appropriate clothing, a water bottle, camera, and any personal items you might need. Specific requirements are mentioned in each tour description.',
  },
  {
    category: 'Travelers',
    question: 'Are tours suitable for children?',
    answer: 'Many tours are family-friendly, but it depends on the specific tour. Check the tour description for age recommendations and suitability. Some tours may have minimum age requirements.',
  },
  {
    category: 'Travelers',
    question: 'What if I have special needs or accessibility requirements?',
    answer: 'Please mention any special needs or accessibility requirements during booking. Many guides can accommodate special requests, and we\'ll work to find a suitable experience for you.',
  },
  {
    category: 'Safety',
    question: 'Is it safe to book tours through Travody?',
    answer: 'Yes, safety is our top priority. All guides are verified, we have a review system, and we provide 24/7 support. We also have insurance coverage for all bookings.',
  },
  {
    category: 'Safety',
    question: 'What happens in case of an emergency?',
    answer: 'All guides have emergency contact information, and we provide 24/7 support. In case of any emergency, contact the guide immediately and reach out to our support team.',
  },
];

const categories = ['All', 'General', 'Booking', 'Guides', 'Travelers', 'Safety'];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFAQs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <Section variant="primary" className="py-12 md:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <HelpCircle className="h-16 w-16 text-white mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-white/90">
              Find answers to common questions about Travody
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setOpenIndex(0);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 pr-8">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0">
                          {openIndex === index ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Still Have Questions */}
            <Card className="mt-12 bg-primary-50 border-primary-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6">
                  Can't find the answer you're looking for? Please get in touch with our friendly team.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Contact Us
                </a>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </AppLayout>
  );
}

