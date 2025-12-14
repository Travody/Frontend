import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about Travody - booking tours, becoming a guide, payment methods, cancellation policies, and more.',
  keywords: [
    'Travody FAQ',
    'travel questions',
    'tour booking FAQ',
    'guide FAQ',
    'travel help',
    'customer support',
  ],
  openGraph: {
    title: 'Frequently Asked Questions | Travody',
    description: 'Find answers to common questions about Travody - booking tours, becoming a guide, and more.',
    url: '/faq',
    siteName: 'Travody',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Travody FAQ',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Travody',
    description: 'Find answers to common questions about Travody.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/faq',
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

